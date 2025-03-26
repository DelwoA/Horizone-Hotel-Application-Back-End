import { Request, Response, NextFunction } from "express";
import Hotel from "../infrastructure/schemas/Hotel";
import { OpenAIEmbeddings } from "@langchain/openai";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import mongoose from "mongoose";

// Semantic search handler for hotels using vector embeddings
export const retrieve = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req.query;

    // If no query is provided, return all hotels
    if (!query || query === "") {
      const hotels = (await Hotel.find()).map((hotel) => {
        hotel: hotel;
        confidence: 1;
      });
      res.status(200).json(hotels);
    }

    // Initialize same embedding model used for creating vectors
    const embeddingsModel = new OpenAIEmbeddings({
      model: "text-embedding-ada-002",
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Connect to the vector database with the specific index name
    const vectorIndex = new MongoDBAtlasVectorSearch(embeddingsModel, {
      collection: mongoose.connection.collection("hotelVectors"),
      indexName: "vector_index",
    });

    // Perform similarity search on the query text
    // This converts the query to a vector and finds similar document vectors
    const results = await vectorIndex.similaritySearchWithScore(
      query as string
    );

    console.log(results);

    // Map vector search results back to actual hotel objects
    // Each result contains [document, similarity_score]
    const matchedHotels = await Promise.all(
      results.map(async (result) => {
        const hotel = await Hotel.findById(result[0].metadata._id);
        return {
          hotel: hotel,
          confidence: result[1], // Similarity score (higher = more relevant)
        };
      })
    );

    // Return top 4 results, or all if less than 4
    res
      .status(200)
      .json(
        matchedHotels.length > 3 ? matchedHotels.slice(0, 4) : matchedHotels
      );
    return;
  } catch (error) {
    next(error);
  }
};
