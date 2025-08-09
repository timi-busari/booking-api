import { BookingService } from '../../src/services/BookingService';
import { PropertyService } from '../../src/services/PropertyService';
import { AppDataSource } from '../../src/config/database';
import { Property } from '../../src/entities/Property';

describe('BookingService', () => {
  let bookingService: BookingService;
  let propertyService: PropertyService;
  let testProperty: Property;

  beforeEach(async () => {
    bookingService = new BookingService();
    propertyService = new PropertyService();

    // create test property
    const propertyRepository = AppDataSource.getRepository(Property);
    testProperty = propertyRepository.create({
      title: 'Test Property',
      description: 'Test description',
      price_per_night: 100,
      available_from: '2024-01-01',
      available_to: '2024-12-31'
    });
    await propertyRepository.save(testProperty);
  });

  describe('checkAvailability', () => {
    it('should return true for available dates', async () => {
      const result = await bookingService.checkAvailability(
        testProperty.id,
        '2024-03-01',
        '2024-03-05'
      );
      expect(result).toBe(true);
    });

    it('should throw error for property not found', async () => {
      await expect(
        bookingService.checkAvailability(999, '2024-03-01', '2024-03-05')
      ).rejects.toThrow('Property not found');
    });

    it('should throw error for dates outside availability range', async () => {
      await expect(
        bookingService.checkAvailability(testProperty.id, '2023-12-01', '2023-12-05')
      ).rejects.toThrow('Dates are outside property availability range');
    });

    it('should throw error for overlapping bookings', async () => {
      // create first booking
      await bookingService.createBooking({
        property_id: testProperty.id,
        user_name: 'John Doe',
        start_date: '2024-03-01',
        end_date: '2024-03-05'
      });

      // try to create overlapping booking
      await expect(
        bookingService.checkAvailability(testProperty.id, '2024-03-03', '2024-03-07')
      ).rejects.toThrow('Dates overlap with existing booking');
    });
  });

  describe('createBooking', () => {
    it('should create a booking successfully', async () => {
      const bookingData = {
        property_id: testProperty.id,
        user_name: 'John Doe',
        start_date: '2024-03-01',
        end_date: '2024-03-05'
      };

      const booking = await bookingService.createBooking(bookingData);
      
      expect(booking.id).toBeDefined();
      expect(booking.property_id).toBe(testProperty.id);
      expect(booking.user_name).toBe('John Doe');
      expect(booking.start_date).toBe('2024-03-01');
      expect(booking.end_date).toBe('2024-03-05');
    });
  });

  describe('updateBooking', () => {
    it('should update a booking successfully', async () => {
      // create initial booking
      const booking = await bookingService.createBooking({
        property_id: testProperty.id,
        user_name: 'John Doe',
        start_date: '2024-03-01',
        end_date: '2024-03-05'
      });

      // update booking
      const updatedBooking = await bookingService.updateBooking(booking.id, {
        user_name: 'Jane Smith'
      });

      expect(updatedBooking.user_name).toBe('Jane Smith');
      expect(updatedBooking.start_date).toBe('2024-03-01');
    });

    it('should throw error for non-existent booking', async () => {
      await expect(
        bookingService.updateBooking(999, { user_name: 'Jane Smith' })
      ).rejects.toThrow('Booking not found');
    });
  });

  describe('deleteBooking', () => {
    it('should delete a booking successfully', async () => {
      const booking = await bookingService.createBooking({
        property_id: testProperty.id,
        user_name: 'John Doe',
        start_date: '2024-03-01',
        end_date: '2024-03-05'
      });

      await expect(bookingService.deleteBooking(booking.id)).resolves.not.toThrow();
      
      const deletedBooking = await bookingService.getBookingById(booking.id);
      expect(deletedBooking).toBeNull();
    });
  });

  describe('getAvailableDateRanges', () => {
    it('should return full availability when no bookings exist', async () => {
      const ranges = await bookingService.getAvailableDateRanges(testProperty.id);
      
      expect(ranges).toHaveLength(1);
      expect(ranges[0].start_date).toBe('2024-01-01');
      expect(ranges[0].end_date).toBe('2024-12-31');
    });

    it('should return correct ranges with existing bookings', async () => {
      // create a booking in the middle of availability period
      await bookingService.createBooking({
        property_id: testProperty.id,
        user_name: 'John Doe',
        start_date: '2024-06-01',
        end_date: '2024-06-05'
      });

      const ranges = await bookingService.getAvailableDateRanges(testProperty.id);
      
      expect(ranges).toHaveLength(2);
      expect(ranges[0].start_date).toBe('2024-01-01');
      expect(ranges[0].end_date).toBe('2024-05-31');
      expect(ranges[1].start_date).toBe('2024-06-06');
      expect(ranges[1].end_date).toBe('2024-12-31');
    });
  });
});
