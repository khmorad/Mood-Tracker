import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    console.log("[API] GET journal entries for userId:", userId);

    let url = `${BACKEND_URL}/journal-entries/`;
    if (userId && userId !== "anonymous") {
      url += `?user_id=${encodeURIComponent(userId)}`;
    }

    console.log("[API] Fetching from:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[API] Backend error:", data);
      return NextResponse.json(
        { error: data.detail || "Failed to fetch journal entries" },
        { status: response.status }
      );
    }

    console.log("[API] Successfully fetched", data.length || 0, "entries");
    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    console.error("[API] GET error:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Unknown error occurred while fetching journal entries." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    console.log("[API] POST journal entry:", body);

    // Validate required fields
    const requiredFields = ["user_id", "entry_text", "journal_date"];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(", ")}` },
        { status: 400 }
      );
    }

    // Ensure default values for optional fields
    const journalData = {
      user_id: body.user_id,
      entry_text: body.entry_text,
      AI_response: body.AI_response || "",
      journal_date: body.journal_date,
      episode_flag: body.episode_flag || 0,
    };

    console.log("[API] Sending to backend:", journalData);

    const response = await fetch(`${BACKEND_URL}/journal-entries/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(journalData),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[API] Backend error:", data);
      return NextResponse.json(
        { error: data.detail || "Failed to create journal entry" },
        { status: response.status }
      );
    }

    console.log("[API] Successfully created journal entry:", data);
    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    console.error("[API] POST error:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: "Unknown error occurred while creating journal entry." },
      { status: 500 }
    );
  }
}
