import request from "supertest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/database";
import { Property } from "../../src/entities/Property";
import { Booking } from "../../src/entities/Booking";

describe("Bookings Routes", () => {
  let testProperty: Property;

  beforeEach(async () => {
    const propertyRepository = AppDataSource.getRepository(Property);
    testProperty = propertyRepository.create({
      title: "Test Property",
      description: "Test description",
      price_per_night: 100,
      available_from: "2024-01-01",
      available_to: "2024-12-31",
    });
    await propertyRepository.save(testProperty);
  });

  describe("POST /api/v1/bookings", () => {
    it("should create a booking successfully", async () => {
      const bookingData = {
        property_id: testProperty.id,
        user_name: "John Doe",
        start_date: "2024-03-01",
        end_date: "2024-03-05",
      };

      const response = await request(app)
        .post("/api/v1/bookings")
        .send(bookingData)
        .expect(201);

      expect(response.body.property_id).toBe(testProperty.id);
      expect(response.body.user_name).toBe("John Doe");
      expect(response.body.start_date).toBe("2024-03-01");
      expect(response.body.end_date).toBe("2024-03-05");
    });

    it("should validate required fields", async () => {
      const response = await request(app)
        .post("/api/v1/bookings")
        .send({
          property_id: testProperty.id,
          // missing required fields
        })
        .expect(400);

      expect(response.body.error).toBe("Validation failed");
    });

    it("should prevent overlapping bookings", async () => {
      const bookingData = {
        property_id: testProperty.id,
        user_name: "John Doe",
        start_date: "2024-03-01",
        end_date: "2024-03-05",
      };

      // create first booking
      await request(app).post("/api/v1/bookings").send(bookingData).expect(201);

      // try to create overlapping booking
      const overlappingBooking = {
        ...bookingData,
        user_name: "Jane Smith",
        start_date: "2024-03-03",
        end_date: "2024-03-07",
      };

      const response = await request(app)
        .post("/api/v1/bookings")
        .send(overlappingBooking)
        .expect(400);

      console.log("Error response:", response.body);

      expect(response.body.message).toContain("overlap");
    });
  });

  describe("PUT /api/v1/bookings/:id", () => {
    it("should update a booking successfully", async () => {
      // create initial booking
      const bookingRepository = AppDataSource.getRepository(Booking);
      const booking = bookingRepository.create({
        property_id: testProperty.id,
        user_name: "John Doe",
        start_date: "2024-03-01",
        end_date: "2024-03-05",
      });
      await bookingRepository.save(booking);

      const updateData = {
        user_name: "Jane Smith",
      };

      const response = await request(app)
        .put(`/api/v1/bookings/${booking.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.user_name).toBe("Jane Smith");
    });

    it("should return 404 for non-existent booking", async () => {
      const response = await request(app)
        .put("/api/v1/bookings/999")
        .send({ user_name: "Jane Smith" })
        .expect(404);

      expect(response.body.error).toContain("not found");
    });
  });

  describe("DELETE /api/v1/bookings/:id", () => {
    it("should delete a booking successfully", async () => {
      // create booking
      const bookingRepository = AppDataSource.getRepository(Booking);
      const booking = bookingRepository.create({
        property_id: testProperty.id,
        user_name: "John Doe",
        start_date: "2024-03-01",
        end_date: "2024-03-05",
      });
      await bookingRepository.save(booking);

      await request(app).delete(`/api/v1/bookings/${booking.id}`).expect(204);

      // verify booking is deleted
      const deletedBooking = await bookingRepository.findOneBy({
        id: booking.id,
      });
      expect(deletedBooking).toBeNull();
    });

    it("should return 404 for non-existent booking", async () => {
      const response = await request(app)
        .delete("/api/v1/bookings/999")
        .expect(404);

      expect(response.body.error).toContain("not found");
    });
  });
});
