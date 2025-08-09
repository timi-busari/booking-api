import { DataSource } from 'typeorm';
import { Property } from '../entities/Property';
import { Booking } from '../entities/Booking';
import dotenv from 'dotenv';

dotenv.config({ path: ".env" });

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Property, Booking],
  migrations: ['src/migrations/*.ts'],
});
