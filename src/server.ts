import "reflect-metadata";
import dotenv from "dotenv";
import app from "./app";
import { AppDataSource } from "./config/database";

dotenv.config({ path: ".env" });

const PORT = process.env.PORT || 3000;

async function startServer(): Promise<void> {
  try {
    await AppDataSource.initialize();
    console.log("Database connection established successfully.");

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`Health Check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("Unable to start server:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

export { app, startServer };
