import { pool } from "../../../lib/mysql";
import { NextResponse } from "next/server";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

// GET Request Handler for a specific user
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const [user] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM User WHERE user_id = ?",
      [id]
    );

    if (user.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(user[0]);
  } catch (error: unknown) {
    return error instanceof Error
      ? NextResponse.json({ error: error.message }, { status: 500 })
      : NextResponse.json(
          { error: "Unknown error occurred." },
          { status: 500 }
        );
  }
}

// PUT Request Handler to update a specific user
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await req.json();
  const {
    email,
    gender,
    preferred_language,
    phone_number,
    date_of_birth,
    first_name,
    middle_name,
    last_name,
    diagnosis_status,
  } = body;

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE User SET email = ?, gender = ?, preferred_language = ?, phone_number = ?, date_of_birth = ?, first_name = ?, middle_name = ?, last_name = ?, diagnosis_status = ? WHERE user_id = ?",
      [
        email,
        gender,
        preferred_language,
        phone_number,
        date_of_birth,
        first_name,
        middle_name,
        last_name,
        diagnosis_status,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "User updated successfully" });
  } catch (error: unknown) {
    return error instanceof Error
      ? NextResponse.json({ error: error.message }, { status: 500 })
      : NextResponse.json(
          { error: "Unknown error occurred." },
          { status: 500 }
        );
  }
}

// DELETE Request Handler to delete a specific user
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM User WHERE user_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "User deleted successfully" });
  } catch (error: unknown) {
    return error instanceof Error
      ? NextResponse.json({ error: error.message }, { status: 500 })
      : NextResponse.json(
          { error: "Unknown error occurred." },
          { status: 500 }
        );
  }
}
