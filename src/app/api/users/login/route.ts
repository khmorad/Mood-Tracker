import { pool } from "../../../lib/mysql";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import type { RowDataPacket } from "mysql2";

const JWT_SECRET = process.env.JWT_SECRET || "your-very-secure-secret"; 

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Specify the type for the query result
    const [user] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM User WHERE email = ?",
      [email]
    );

    if (user.length === 0) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    const matchedUser = user[0];

    // Placeholder for password hashing/validation
    if (matchedUser.password !== password) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate a JWT
    const token = jwt.sign(
      {
        user_id: matchedUser.user_id,
        email: matchedUser.email,
        first_name: matchedUser.first_name,
        last_name: matchedUser.last_name,
      },
      JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // Respond with the token and user details
    return NextResponse.json({
      message: "Login successful",
      token, // Return the JWT token
      user: {
        user_id: matchedUser.user_id,
        email: matchedUser.email,
        first_name: matchedUser.first_name,
        last_name: matchedUser.last_name,
      },
    });
  } catch (error: unknown) {
    return error instanceof Error
      ? NextResponse.json({ error: error.message }, { status: 500 })
      : NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
  }
}
