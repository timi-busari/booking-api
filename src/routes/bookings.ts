import { Router, Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/BookingService';
import { validateDto } from '../middleware/validation';
import { CreateBookingDto } from '../dto/CreateBookingDto';
import { UpdateBookingDto } from '../dto/UpdateBookingDto';

const router = Router();
const bookingService = new BookingService();

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Create a new booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               property_id:
 *                 type: integer
 *               user_name:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', validateDto(CreateBookingDto), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const booking = await bookingService.createBooking(req.body);
    const bookingWithProperty = await bookingService.getBookingById(booking.id);
    res.status(201).json(bookingWithProperty);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /bookings/{id}:
 *   put:
 *     summary: Update a booking
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_name:
 *                 type: string
 *               start_date:
 *                 type: string
 *                 format: date
 *               end_date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Booking updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Booking not found
 */
router.put('/:id', validateDto(UpdateBookingDto, true), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookingId = parseInt(req.params.id);
    const updatedBooking = await bookingService.updateBooking(bookingId, req.body);
    const bookingWithProperty = await bookingService.getBookingById(updatedBooking.id);
    res.json(bookingWithProperty);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /bookings/{id}:
 *   delete:
 *     summary: Cancel a booking
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Booking cancelled successfully
 *       404:
 *         description: Booking not found
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookingId = parseInt(req.params.id);
    await bookingService.deleteBooking(bookingId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;