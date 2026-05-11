import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { AuthRequest } from "../../middlewares/auth.types";



export class AuthController {

    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return res.status(400).json({
                    message: "Email and password required"
                });
            }

            const result = await AuthService.login(email, password);

            res.json(result);
        } catch (err) {
            res.status(401).json({
                message: "Invalid email or password"
            });
        }
    }

    static async changePassword(req: AuthRequest, res: Response) {
        try {
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    message: "Current password and new password required"
                });
            }

            const result = await AuthService.changePassword(
                req.user!.userId,
                currentPassword,
                newPassword
            );

            res.json(result);
        } catch (err: any) {
            res.status(400).json({
                message: err.message || "Failed to change password"
            });
        }
    }

    static async logout(req: Request, res: Response) {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader) {
                return res.status(400).json({
                    message: "Authorization header missing"
                });
            }

            const token = authHeader.split(" ")[1];

            if (!token) {
                return res.status(400).json({
                    message: "Token missing"
                });
            }

            const result = await AuthService.logout(token);

            res.json(result);
        } catch (err) {
            res.status(400).json({
                message: "Logout failed"
            });
        }
    }
}
