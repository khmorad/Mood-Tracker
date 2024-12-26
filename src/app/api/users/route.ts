import { pool } from "../../lib/mysql";
import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";

// GET Request Handler for all users
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    let query = "SELECT * FROM User";
    const params: string[] = [];

    if (email) {
      query += " WHERE email = ?";
      params.push(email);
    }

    const [users] = await pool.query(query, params);
    return NextResponse.json(users);
  } catch (error: unknown) {
    return error instanceof Error
      ? NextResponse.json({ error: error.message }, { status: 500 })
      : NextResponse.json({ error: "Unknown error occurred." }, { status: 500 });
  }
}

// POST Request Handler to add a new user
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      user_id,
      email,
      password,
      profile_picture,
      gender,
      preferred_language,
      phone_number,
      date_of_birth,
      first_name,
      middle_name,
      last_name,
      diagnosis_status,
    } = body;

    if (!user_id || !email || !password) {
      return NextResponse.json(
        { error: "Missing required fields: user_id, email, password" },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO User (user_id, email, password, profile_picture, gender, preferred_language, phone_number, date_of_birth, first_name, middle_name, last_name, diagnosis_status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        user_id,
        email,
        password,
        profile_picture || null,
        gender || null,
        preferred_language || null,
        phone_number || null,
        date_of_birth || null,
        first_name || null,
        middle_name || null,
        last_name || null,
        diagnosis_status || null,
      ]
    );

    return NextResponse.json(
      { user_id, email, password, ...body, id: result.insertId },
      { status: 201 }
    );
  } catch (error: unknown) {
    return error instanceof Error
      ? NextResponse.json({ error: error.message }, { status: 500 })
      : NextResponse.json({ error: "Unknown error occurred." }, { status: 500 });
  }
}
