import { AppDataSource } from "./config/data-source";
import app from "./app";
import { seedAdmin } from "./seed-admin";

const PORT = process.env.PORT || 4000;

AppDataSource.initialize()
  .then(async () => {
    console.log("✅ Database connected");

    await seedAdmin();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Database connection error:", err);
  });
