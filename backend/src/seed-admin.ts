import bcrypt from "bcrypt";
import { AppDataSource } from "./config/data-source";
import { User } from "./modules/users/user.entity";

export async function seedAdmin() {
  const repo = AppDataSource.getRepository(User);

  const adminEmail = "mdelever77@gmail.com";
  const adminPassword = "13771220";

  const exists = await repo.findOne({ where: { email: adminEmail } });
  if (exists) {
    console.log("✅ Admin user already exists");
    return;
  }

  const hashed = await bcrypt.hash(adminPassword, 10);

  const admin = repo.create({
    email: adminEmail,
    password: hashed,
    role: "admin"
  });

  await repo.save(admin);
  console.log("✅ Admin user created");
}
