import { Request, Response, NextFunction } from "express";
import Booking from "../infrastructure/schemas/Booking";
import { createBookingDTO } from "../domain/dtos/booking";

export const createBooking = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Zod validator 'createBookingDTO' used.
    const booking = createBookingDTO.safeParse(req.body);

    // Checking if the updated hotel is in the shape of 'updateHotelDTO'
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

export const getAllBookingsForHotel = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const hotelId = req.params.hotelId;
    const bookings = await Booking.find({ hotelId: hotelId }).populate(
      "userId"
    );
    res.status(200).json(bookings);
    return;
  } catch (error) {
    next(error);
  }
};
