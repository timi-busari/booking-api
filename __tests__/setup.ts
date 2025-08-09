import "reflect-metadata";
import { AppDataSource } from "../src/config/database";

beforeAll(async () => {
  await AppDataSource.initialize();
});

beforeEach(async () => {
  // clear database before each test
  await AppDataSource.query("TRUNCATE TABLE properties CASCADE");
});

afterAll(async () => {
  await AppDataSource.destroy();
});
