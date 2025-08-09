import "reflect-metadata";
import { AppDataSource } from "../config/database";
import { Property } from "../entities/Property";

const propertySeedData: Partial<Property>[] = [
  {
    title: "Lagos Island Apartment",
    description:
      "A beautiful 2-bedroom apartment in the heart of Lagos with modern amenities.",
    price_per_night: 120.0,
    available_from: "2025-01-01",
    available_to: "2025-12-31",
  },
  {
    title: "Ajah Apartment",
    description:
      "Stunning ocean-view apartment with private beach access and pool.",
    price_per_night: 350.0,
    available_from: "2025-03-01",
    available_to: "2025-10-31",
  },
  {
    title: "Mountain Zion Cabin Retreat",
    description:
      "Peaceful cabin surrounded by nature, perfect for a weekend getaway.",
    price_per_night: 85.0,
    available_from: "2025-01-15",
    available_to: "2025-11-30",
  },
  {
    title: "Luxury City Penthouse",
    description:
      "Spacious penthouse with panoramic city views and premium amenities.",
    price_per_night: 450.0,
    available_from: "2025-02-01",
    available_to: "2025-12-15",
  },
  {
    title: "Ibadan Film House Cottage",
    description:
      "Charming historic cottage with traditional architecture and modern comforts.",
    price_per_night: 95.0,
    available_from: "2025-01-10",
    available_to: "2025-11-20",
  },
];

/**
 * Seeds the database with initial data.
 */
async function seedData(): Promise<void> {
  await AppDataSource.initialize();
  console.log("📦 Database connection established. Starting seed...");

  const propertyRepository = AppDataSource.getRepository(Property);

  console.log("🧹 Clearing existing data...");
  await propertyRepository.query(
    `TRUNCATE TABLE "properties" RESTART IDENTITY CASCADE;`
  );

  // insert properties
  console.log("🌱 Inserting properties...");
  await propertyRepository.save(propertySeedData);

  console.log(
    `✅ Seed completed successfully with ${propertySeedData.length} properties.`
  );
  await AppDataSource.destroy();
}

// only run if executed directly via `ts-node src/seeds/seed.ts`
if (require.main === module) {
  seedData().catch((err) => {
    console.error("❌ Error seeding data:", err);
    process.exit(1);
  });
}

export { seedData };
