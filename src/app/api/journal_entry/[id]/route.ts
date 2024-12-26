import { pool } from "../../../lib/mysql";
import { NextResponse } from "next/server";
import type { RowDataPacket, ResultSetHeader } from "mysql2";

// GET Request Handler for a specific journal entry
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const [entry] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM journal_entry WHERE entry_id = ?",
      [id]
    );

    if (entry.length === 0) {
      return NextResponse.json(
        { error: "Journal entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(entry[0]);
  } catch (error: unknown) {
    return error instanceof Error
      ? NextResponse.json({ error: error.message }, { status: 500 })
      : NextResponse.json(
          { error: "Unknown error occurred." },
          { status: 500 }
        );
  }
}

// PUT Request Handler to update a specific journal entry
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await req.json();
  const { entry_text, AI_response, episode_flag } = body;

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      "UPDATE journal_entry SET entry_text = ?, AI_response = ?, episode_flag = ? WHERE entry_id = ?",
      [entry_text, AI_response, episode_flag, id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Journal entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Journal entry updated successfully" });
  } catch (error: unknown) {
    return error instanceof Error
      ? NextResponse.json({ error: error.message }, { status: 500 })
      : NextResponse.json(
          { error: "Unknown error occurred." },
          { status: 500 }
        );
  }
}

// DELETE Request Handler to delete a specific journal entry
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const [result] = await pool.execute<ResultSetHeader>(
      "DELETE FROM journal_entry WHERE entry_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Journal entry not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Journal entry deleted successfully" });
  } catch (error: unknown) {
    return error instanceof Error
      ? NextResponse.json({ error: error.message }, { status: 500 })
      : NextResponse.json(
          { error: "Unknown error occurred." },
          { status: 500 }
        );
  }
}
