import request from "supertest";
import app from "../../src/app";
import { AppDataSource } from "../../src/config/database";
import { Property } from "../../src/entities/Property";

describe("Properties Routes", () => {
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

  describe("GET /api/v1/properties", () => {
    it("should return properties with pagination", async () => {
      const response = await request(app).get("/api/v1/properties").expect(200);

      expect(response.body).toHaveProperty("data");
      expect(response.body).toHaveProperty("pagination");
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].title).toBe("Test Property");
    });

    it("should filter properties by availability dates", async () => {
      const response = await request(app)
        .get(
          "/api/v1/properties?available_from=2024-01-01&available_to=2024-06-01"
        )
        .expect(200);

      expect(response.body.data).toHaveLength(1);
    });

    it("should handle pagination parameters", async () => {
      const response = await request(app)
        .get("/api/v1/properties?page=1&limit=5")
        .expect(200);

      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });
  });

  describe("GET /api/v1/properties/:id/availability", () => {
    it("should return availability ranges for existing property", async () => {
      const response = await request(app)
        .get(`/api/v1/properties/${testProperty.id}/availability`)
        .expect(200);

      expect(response.body).toHaveProperty("property_id");
      expect(response.body).toHaveProperty("available_ranges");
      expect(response.body.property_id).toBe(testProperty.id);
      expect(response.body.available_ranges).toHaveLength(1);
    });

    it("should return 404 for non-existent property", async () => {
      const response = await request(app)
        .get("/api/v1/properties/999/availability")
        .expect(404);

      expect(response.body.error).toContain("Resource not found");
    });
  });
});
