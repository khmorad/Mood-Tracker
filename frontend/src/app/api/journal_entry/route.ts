import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    let url = `${BACKEND_URL}/journal-entries`;
    if (userId) {
      url += `?user_id=${encodeURIComponent(userId)}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Failed to fetch journal entries" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    return error instanceof Error
      ? NextResponse.json({ error: error.message }, { status: 500 })
      : NextResponse.json(
          { error: "Unknown error occurred." },
          { status: 500 }
        );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.user_id || !body.entry_text || !body.journal_date) {
      return NextResponse.json(
        { error: "Missing required fields: user_id, entry_text, journal_date" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/journal-entries`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Failed to create journal entry" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: unknown) {
    return error instanceof Error
      ? NextResponse.json({ error: error.message }, { status: 500 })
      : NextResponse.json(
          { error: "Unknown error occurred." },
          { status: 500 }
        );
  }
}
