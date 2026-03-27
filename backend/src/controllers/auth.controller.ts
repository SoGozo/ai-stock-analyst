import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { createUser, findUserByEmail, findUserById } from "../models/user.model";
import { redis, CacheKeys, CacheTTL } from "../config/redis";
import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function signTokens(userId: string, email: string) {
  const accessToken = jwt.sign({ userId, email }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
  const refreshToken = jwt.sign({ userId, email }, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });
  return { accessToken, refreshToken };
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { email, name, password } = registerSchema.parse(req.body);

  const existing = await findUserByEmail(email);
  if (existing) throw ApiError.badRequest("Email already registered");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await createUser(email, name, passwordHash);

  const { accessToken, refreshToken } = signTokens(user.id, user.email);
  await redis.setex(CacheKeys.refreshToken(user.id), CacheTTL.refreshToken, refreshToken);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.status(201).json({
    success: true,
    data: {
      accessToken,
      user: { id: user.id, email: user.email, name: user.name },
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);

  const user = await findUserByEmail(email);
  if (!user) throw ApiError.unauthorized("Invalid email or password");

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw ApiError.unauthorized("Invalid email or password");

  const { accessToken, refreshToken } = signTokens(user.id, user.email);
  await redis.setex(CacheKeys.refreshToken(user.id), CacheTTL.refreshToken, refreshToken);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    data: {
      accessToken,
      user: { id: user.id, email: user.email, name: user.name },
    },
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) throw ApiError.unauthorized("No refresh token");

  let payload: { userId: string; email: string };
  try {
    payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as typeof payload;
  } catch {
    throw ApiError.unauthorized("Invalid refresh token");
  }

  const stored = await redis.get(CacheKeys.refreshToken(payload.userId));
  if (stored !== token) throw ApiError.unauthorized("Refresh token revoked");

  const { accessToken } = signTokens(payload.userId, payload.email);
  res.json({ success: true, data: { accessToken } });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string };
      await redis.del(CacheKeys.refreshToken(payload.userId));
    } catch {}
  }
  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out" });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const user = await findUserById(req.user!.userId);
  if (!user) throw ApiError.notFound("User not found");
  res.json({
    success: true,
    data: { id: user.id, email: user.email, name: user.name, createdAt: user.created_at },
  });
});
