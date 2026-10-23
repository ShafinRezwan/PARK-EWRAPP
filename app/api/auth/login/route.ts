
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { pool } from "@/lib/db";
import { createSession } from "@/lib/auth";

export const runtime = "nodejs";

interface LoginUser {
  id: string;
  password: string;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = String(body.email ?? "")
      .trim()
      .toLowerCase();

    const password = String(body.password ?? "");

    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Email and password are required.",
        },
        {
          status: 400,
        }
      );
    }

    // Find the user directly in PostgreSQL
    const result = await pool.query<LoginUser>(
      `SELECT "id", "password"
       FROM "User"
       WHERE "email" = $1
       LIMIT 1`,
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json(
        {
          error: "Invalid email or password.",
        },
        {
          status: 401,
        }
      );
    }

    // Verify the existing bcrypt password hash
    const passwordMatches = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatches) {
      return NextResponse.json(
        {
          error: "Invalid email or password.",
        },
        {
          status: 401,
        }
      );
    }

    // Create the login session
    await createSession(user.id);

    return NextResponse.json({
      message: "Login successful.",
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        error: "Unable to log in.",
      },
      {
        status: 500,
      }
    );
  }
}
