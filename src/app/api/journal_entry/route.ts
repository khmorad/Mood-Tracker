import { pool } from "../../lib/mysql";
import { NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";

// GET Request Handler for all journal entries
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    let query = "SELECT * FROM journal_entry";
    const params: string[] = [];

    if (userId) {
      query += " WHERE user_id = ?";
      params.push(userId);
    }

    const [entries] = await pool.query(query, params);
    return NextResponse.json(entries);
  } catch (error: unknown) {
    return error instanceof Error
      ? NextResponse.json({ error: error.message }, { status: 500 })
      : NextResponse.json(
          { error: "Unknown error occurred." },
          { status: 500 }
        );
  }
}

// POST Request Handler to add a new journal entry
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, entry_text, AI_response, journal_date, episode_flag } =
      body;

    if (!user_id || !entry_text || !journal_date) {
      return NextResponse.json(
        { error: "Missing required fields: user_id, entry_text, journal_date" },
        { status: 400 }
      );
    }

    const [result] = await pool.execute<ResultSetHeader>(
      "INSERT INTO journal_entry (user_id, entry_text, AI_response, journal_date, episode_flag) VALUES (?, ?, ?, ?, ?)",
      [user_id, entry_text, AI_response, journal_date, episode_flag || 0]
    );

    return NextResponse.json(
      {
        entry_id: result.insertId,
        user_id,
        entry_text,
        AI_response,
        journal_date,
        episode_flag,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    return error instanceof Error
      ? NextResponse.json({ error: error.message }, { status: 500 })
      : NextResponse.json(
          { error: "Unknown error occurred." },
          { status: 500 }
        );
  }
}
