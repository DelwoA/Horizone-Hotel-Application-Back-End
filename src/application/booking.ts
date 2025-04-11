import { Request, Response, NextFunction } from "express";
import Booking from "../infrastructure/schemas/Booking";
import { createBookingDTO } from "../domain/dtos/booking";
import { clerkClient } from "@clerk/express";

export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Zod validator 'createBookingDTO' used.
    const booking = createBookingDTO.safeParse(req.body);

    console.log(booking);
    // Checking if the updated hotel request body is in the shape of 'createBookingDTO'
    if (!booking.success) {
      throw new Error(booking.error.message);
    }

    console.log(req.auth);
    // TODO: Find out why sending the userId in the request body is not a good idea.
    // Get the user
    const userId = req.auth?.userId;

    // Add the booking
    await Booking.create({
      hotelId: booking.data.hotelId,
      userId: userId,
      checkIn: booking.data.checkIn,
      checkOut: booking.data.checkOut,
      firstName: booking.data.firstName,
      lastName: booking.data.lastName,
      email: booking.data.email,
      phoneNumber: booking.data.phoneNumber,
      roomNumber: booking.data.roomNumber,
    });

    // Return the response
    res.status(201).send();
    return;
  } catch (error) {
    next(error);
  }
};

// Get all bookings
export const getAllBookings = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const bookings = await Booking.find();
    res.status(200).json(bookings);
    return;
  } catch (error) {
    next(error);
  }
};

// Get all bookings for a specific hotel
export const getAllBookingsForHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotelId = req.params.hotelId;
    const bookings = await Booking.find({ hotelId: hotelId });
    const bookingsWithUser = await Promise.all(
      bookings.map(async (el) => {
        const user = await clerkClient.users.getUser(el.userId);
        console.log(user);
        return {
          _id: el._id,
          hotelId: el.hotelId,
          checkIn: el.checkIn,
          checkOut: el.checkOut,
          roomNumber: el.roomNumber,
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
          },
        };
      })
    );

    res.status(200).json(bookingsWithUser);
    return;
  } catch (error) {
    next(error);
  }
};

// Get all bookings for a specific user
export const getAllBookingsForUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get userId from auth or from params (if admin is accessing)
    const userId = req.params.userId || req.auth?.userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Find all bookings for the user
    const bookings = await Booking.find({ userId: userId }).populate({
      path: "hotelId",
      model: "Hotel",
    });

    // Format the response to include hotel information
    const formattedBookings = bookings.map((booking) => {
      // Access the hotel document after population
      const hotel = booking.hotelId as any; // Type assertion for accessing populated fields

      return {
        _id: booking._id,
        hotelId: booking.hotelId,
        hotelName: hotel?.name || "Unknown Hotel", // Access name from populated hotel
        firstName: booking.firstName,
        lastName: booking.lastName,
        checkIn: booking.checkIn,
        checkOut: booking.checkOut,
        email: booking.email,
        phoneNumber: booking.phoneNumber,
        roomNumber: booking.roomNumber,
      };
    });

    res.status(200).json(formattedBookings);
    return;
  } catch (error) {
    next(error);
  }
};
