

import "server-only";

import { cookies } from "next/headers";
import { randomBytes, createHash, randomUUID } from "crypto";
import { pool } from "@/lib/db";

const SESSION_COOKIE = "ewr_session";

const SESSION_DURATION = 1000 * 60 * 60 * 24 * 7; // 7 days

function hashToken(token: string): string {
  return createHash("sha256")
    .update(token)
    .digest("hex");
}

export type UserRole =
  | "ADMIN"
  | "CONTRACTS"
  | "SUPERINTENDENT"
  | "ACCOUNTING"
  | "PROJECT_MANAGER"
  | "MASTER_USER";

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);

  const expiresAt = new Date(
    Date.now() + SESSION_DURATION
  );

  await pool.query(
    `INSERT INTO "Session"
      ("id", "tokenHash", "expiresAt", "userId", "createdAt")
     VALUES ($1, $2, $3, $4, NOW())`,
    [
      randomUUID(),
      tokenHash,
      expiresAt,
      userId,
    ]
  );

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);

  const result = await pool.query<AuthUser>(
    `SELECT
       u."id",
       u."firstName",
       u."lastName",
       u."email",
       u."role",
       u."createdAt",
       u."updatedAt"
     FROM "Session" s
     INNER JOIN "User" u
       ON s."userId" = u."id"
     WHERE s."tokenHash" = $1
       AND s."expiresAt" > NOW()
     LIMIT 1`,
    [tokenHash]
  );

  return result.rows[0] ?? null;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    const tokenHash = hashToken(token);

    await pool.query(
      `DELETE FROM "Session"
       WHERE "tokenHash" = $1`,
      [tokenHash]
    );
  }

  cookieStore.delete(SESSION_COOKIE);
}
