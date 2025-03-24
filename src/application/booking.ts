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

    // Checking if the updated hotel request body is in the shape of 'createBookingDTO'
    if (!booking.success) {
      throw new Error(booking.error.message);
    }

    // Get the user
    const user = req.auth;

    // Add the booking
    await Booking.create({
      hotelId: booking.data.hotelId,
      userId: user.userId,
      checkIn: booking.data.checkIn,
      checkOut: booking.data.checkOut,
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
