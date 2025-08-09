import { Repository, Between, LessThanOrEqual, MoreThanOrEqual, Not } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Property } from '../entities/Property';
import { Booking } from '../entities/Booking';
import { AvailabilityRange } from '../types';

export class BookingService {
  private propertyRepository: Repository<Property>;
  private bookingRepository: Repository<Booking>;

  constructor() {
    this.propertyRepository = AppDataSource.getRepository(Property);
    this.bookingRepository = AppDataSource.getRepository(Booking);
  }

  async checkAvailability(
    propertyId: number,
    startDate: string,
    endDate: string,
    excludeBookingId?: number
  ): Promise<boolean> {
    const property = await this.propertyRepository.findOneBy({ id: propertyId });
    if (!property) {
      throw new Error('Property not found');
    }

    // checking if dates are within property availability
    if (startDate < property.available_from || endDate > property.available_to) {
      throw new Error('Dates are outside property availability range');
    }

    // check for overlapping bookings
    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.property_id = :propertyId', { propertyId })
      .andWhere(
        '(booking.start_date <= :endDate AND booking.end_date >= :startDate)',
        { startDate, endDate }
      );

    if (excludeBookingId) {
      queryBuilder.andWhere('booking.id != :excludeBookingId', { excludeBookingId });
    }

    const conflictingBookings = await queryBuilder.getMany();

    if (conflictingBookings.length > 0) {
      throw new Error('Dates overlap with existing booking');
    }

    return true;
  }

  async getAvailableDateRanges(propertyId: number): Promise<AvailabilityRange[]> {
    const property = await this.propertyRepository.findOne({
      where: { id: propertyId },
      relations: ['bookings']
    });

    if (!property) {
      throw new Error('Property not found');
    }

    const availableRanges: AvailabilityRange[] = [];
    let currentStart = new Date(property.available_from);
    const propertyEnd = new Date(property.available_to);

    // sort bookings by start date
    const sortedBookings = property.bookings
      .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());

    for (const booking of sortedBookings) {
      const bookingStart = new Date(booking.start_date);
      const bookingEnd = new Date(booking.end_date);

      // checking if there's a gap before this booking
      if (currentStart < bookingStart) {
        const rangeEnd = new Date(bookingStart);
        rangeEnd.setDate(rangeEnd.getDate() - 1);
        
        availableRanges.push({
          start_date: currentStart.toISOString().split('T')[0],
          end_date: rangeEnd.toISOString().split('T')[0]
        });
      }

      // move current start to after this booking
      currentStart = new Date(bookingEnd);
      currentStart.setDate(currentStart.getDate() + 1);
    }

    // add final range if there's availability after the last booking
    if (currentStart <= propertyEnd) {
      availableRanges.push({
        start_date: currentStart.toISOString().split('T')[0],
        end_date: propertyEnd.toISOString().split('T')[0]
      });
    }

    return availableRanges;
  }

  async createBooking(bookingData: {
    property_id: number;
    user_name: string;
    start_date: string;
    end_date: string;
  }): Promise<Booking> {
    await this.checkAvailability(
      bookingData.property_id,
      bookingData.start_date,
      bookingData.end_date
    );

    const booking = this.bookingRepository.create(bookingData);
    return await this.bookingRepository.save(booking);
  }

  async updateBooking(
    id: number,
    updateData: Partial<{ user_name: string; start_date: string; end_date: string }>
  ): Promise<Booking> {
    const booking = await this.bookingRepository.findOneBy({ id });
    if (!booking) {
      throw new Error('Booking not found');
    }

    // if dates are being updated, check availability
    if (updateData.start_date || updateData.end_date) {
      const newStartDate = updateData.start_date || booking.start_date;
      const newEndDate = updateData.end_date || booking.end_date;
      
      await this.checkAvailability(booking.property_id, newStartDate, newEndDate, id);
    }

    Object.assign(booking, updateData);
    return await this.bookingRepository.save(booking);
  }

  async deleteBooking(id: number): Promise<void> {
    const result = await this.bookingRepository.delete(id);
    if (result.affected === 0) {
      throw new Error('Booking not found');
    }
  }

  async getBookingById(id: number): Promise<Booking | null> {
    return await this.bookingRepository.findOne({
      where: { id },
      relations: ['property']
    });
  }
}