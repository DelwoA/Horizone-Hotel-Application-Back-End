import { Request, Response, NextFunction } from "express";

import Hotel from "../infrastructure/schemas/Hotel";
import NotFoundError from "../domain/errors/not-found-error";
import ValidationError from "../domain/errors/validation-error";
import { createHotelDTO, updateHotelDTO } from "../domain/dtos/hotel";

import OpenAI from "openai";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const getAllHotels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotels = await Hotel.find();
    res.status(200).json(hotels);
    return;
  } catch (error) {
    next(error);
  }
};

export const getFilteredSortedHotels = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("Filter query params:", req.query);

    // Extract query parameters
    const { location, sortBy, sortOrder } = req.query;

    // Build query object for filtering
    let query = {};

    // Add location filter if provided
    if (location) {
      // Handle multiple locations (passed as comma-separated string)
      if (typeof location === "string" && location.includes(",")) {
        const locations = location.split(",");
        console.log("Filtering by multiple locations:", locations);
        query = {
          location: {
            $regex: new RegExp(locations.join("|"), "i"), // Regular expression OR operator | to match any of the locations
          },
        };
      }
      // Handle single location
      else if (location !== "All") {
        console.log("Filtering by single location:", location);
        query = { location: { $regex: new RegExp(location as string, "i") } };
      }
    }

    // Build sort options
    let sortOptions = {};

    // Add sorting by price if provided
    if (sortBy === "price" && sortOrder) {
      // Only apply sorting if both sortBy and sortOrder are provided
      // and sortOrder is not 'none'
      if (sortOrder === "asc" || sortOrder === "desc") {
        sortOptions = { price: sortOrder === "asc" ? 1 : -1 };
      }
    }

    console.log("MongoDB query:", JSON.stringify(query));
    console.log("MongoDB sort options:", JSON.stringify(sortOptions));

    // Execute query with filters and sorting
    const hotels = await Hotel.find(query).sort(sortOptions);

    console.log(`Found ${hotels.length} hotels after filtering and sorting`);

    res.status(200).json(hotels);
    return;
  } catch (error) {
    console.error("Error in getFilteredSortedHotels:", error);
    next(error);
  }
};

export const getHotelById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotelId = req.params.id;
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      throw new NotFoundError("Hotel not found");
    }
    res.status(200).json(hotel);
    return;
  } catch (error) {
    next(error);
  }
};

// OpenAI API call
export const generateResponse = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { prompt } = req.body;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const completion = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      // {
      //   role: "system",
      //   content: `You are a assistant that will categorize the words that a user gives and give them labels and show an output.
      //             Return this response as the following examples:
      //             user: Lake, Cat, Dog, BMW, Benz, Tree; response: [{Label: Nature, words:['Lake', 'Tree']}, {Label: Animals, words:['Cat', 'Dog']}]`,
      // },
      { role: "user", content: prompt },
    ],
    store: true,
  });

  res.status(200).json({
    message: {
      role: "assistant",
      content: completion.choices[0].message.content,
    },
  });
  return;
};

export const createHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    /*
     * When createHotel function is getting executed, the 'safeParse' will check if the req.body is in the shape of 'createHotelDTO'.
     * In a nutshell, our zod validator which is 'createHotelDTO', is safeParsing the req.body.
     *
     * If the data is in the shape of the validator, it will return a object with the data and a success property.
     */
    const hotel = createHotelDTO.safeParse(req.body);

    // Validate the request data, by checking if the hotel is in the shape of 'createHotelDTO'
    if (!hotel.success) {
      throw new ValidationError(hotel.error.message);
    }

    // Add the hotel
    await Hotel.create({
      name: hotel.data.name,
      location: hotel.data.location,
      image: hotel.data.image,
      price: hotel.data.price,
      description: hotel.data.description,
    });

    // Return the response
    res.status(201).send();
    return;
  } catch (error) {
    next(error);
  }
};

export const deleteHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotelId = req.params.id;
    // Delete the hotel
    await Hotel.findByIdAndDelete(hotelId);
    // Return the response
    res.status(200).send();
    return;
  } catch (error) {
    next(error);
  }
};

export const updateHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotelId = req.params.hotelId;

    // Zod validator 'updateHotelDTO' used.
    const updatedHotel = updateHotelDTO.safeParse(req.body);

    // Checking if the updated hotel is in the shape of 'updateHotelDTO'
    if (!updatedHotel.success) {
      throw new ValidationError("Invalid hotel data");
    }

    // Update the hotel
    await Hotel.findByIdAndUpdate(hotelId, updatedHotel.data);

    // Return the response
    res.status(200).send();
    return;
  } catch (error) {
    next(error);
  }
};
