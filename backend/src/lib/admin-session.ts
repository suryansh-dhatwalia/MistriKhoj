import { createHash, randomBytes } from "node:crypto";
import type { CookieOptions, Request, Response } from "express";
import { env } from "../config/env.js";

export const ADMIN_SESSION_COOKIE = "mistrikhoj_admin_session";

export function createSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function readSessionToken(request: Request): string | null {
  const value = request.cookies?.[ADMIN_SESSION_COOKIE];
  return typeof value === "string" && value.length > 0 ? value : null;
}

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: env.ADMIN_SESSION_DAYS * 24 * 60 * 60 * 1000,
  };
}

export function setSessionCookie(response: Response, token: string): void {
  response.cookie(ADMIN_SESSION_COOKIE, token, cookieOptions());
}

export function clearSessionCookie(response: Response): void {
  const { maxAge: _maxAge, ...options } = cookieOptions();
  response.clearCookie(ADMIN_SESSION_COOKIE, options);
}
