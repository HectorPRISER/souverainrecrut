import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { User } from "@prisma/client";

import { env } from "../config/env";

import { AppError } from "../errors/app.error";

import { UserRepository } from "../repositories/user.repository";

export class AuthService {
  private readonly repository = new UserRepository();

  /**
   * Authentifie un utilisateur.
   */
  async login(email: string, password: string): Promise<{
    user: Omit<User, "password">;
    token: string;
  }> {
    const user = await this.repository.findByEmail(email);

    if (!user) {
      throw new AppError("Email ou mot de passe invalide.", 401);
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      throw new AppError("Email ou mot de passe invalide.", 401);
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      env.jwtSecret,
      {
        expiresIn: "1d",
      }
    );

    const { password: _, ...safeUser } = user;

    return {
      user: safeUser,
      token,
    };
  }
}