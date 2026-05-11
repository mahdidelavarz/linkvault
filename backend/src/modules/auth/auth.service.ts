import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../../config/data-source";
import { User } from "../users/user.entity";
import { BlacklistedToken } from "./token.entity";


const userRepo = AppDataSource.getRepository(User);
const blacklistRepo = AppDataSource.getRepository(BlacklistedToken);

export class AuthService {

  static async login(email: string, password: string) {
    const user = await userRepo.findOne({ where: { email } });

    if (!user) {
      throw new Error("Invalid credentials");
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      }
    );

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    };
  }

  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {
    const user = await userRepo.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const isValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isValid) {
      throw new Error("Current password incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await userRepo.save(user);

    return {
      message: "Password updated successfully",
    };
  }

  static async logout(token: string) {
    const blacklisted = blacklistRepo.create({
      token,
    });

    await blacklistRepo.save(blacklisted);

    return {
      message: "Logged out successfully",
    };
  }
}
