import { Request, Response, NextFunction } from "express";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Document } from "@langchain/core/documents";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import mongoose from "mongoose";
import Hotel from "../infrastructure/schemas/Hotel";

/*
 * Creates vector embeddings for hotel data to enable semantic search
 * This function converts hotel text into numerical vectors that represent semantic meaning
 */
export const createEmbeddings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Initialize OpenAI embeddings model with API key
    // This model converts text into high-dimensional vectors (embeddings)
    const embeddingsModel = new OpenAIEmbeddings({
      model: "text-embedding-ada-002", // OpenAI's embedding model
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Initialize MongoDB Atlas Vector Search for storing embeddings
    // This creates a connection to the vector collection in your MongoDB
    const vectorIndex = new MongoDBAtlasVectorSearch(embeddingsModel, {
      collection: mongoose.connection.collection("hotelVectors"),
      indexName: "vector_index",
    });

    const hotels = await Hotel.find();

    // Transform each hotel into a Document object with content and metadata
    // This prepares the data for embedding generation
    const docs = hotels.map((hotel) => {
      const { _id, location, price, description } = hotel;

      // Create a document with text content that combines hotel details
      // The text content is what gets converted to vector embeddings
      const doc = new Document({
        pageContent: `${description} located in ${location}. Price per night: ${price}`,
        metadata: {
          _id, // Store the original hotel ID for reference
        },
      });

      return doc;
    });

    /*
     Add documents to vector index, which:
     * 1. Generates embeddings for each document using OpenAI
     * 2. Stores both the text and embeddings in MongoDB
     * 
     * This enables semantic similarity search later
     */
    await vectorIndex.addDocuments(docs);

    // Return success response
    res.status(200).json({
      message: "Embeddings created successfully",
    });
  } catch (error) {
    // Pass any errors to the global error handler
    next(error);
  }
};
