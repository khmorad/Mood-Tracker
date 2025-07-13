import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// GET Request Handler for a specific journal entry
export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const response = await fetch(`${BACKEND_URL}/journal-entries/${id}`);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Journal entry not found" },
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

// PUT Request Handler to update a specific journal entry
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await req.json();

  try {
    const response = await fetch(`${BACKEND_URL}/journal-entries/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Failed to update journal entry" },
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

// DELETE Request Handler to delete a specific journal entry
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const response = await fetch(`${BACKEND_URL}/journal-entries/${id}`, {
      method: "DELETE",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Failed to delete journal entry" },
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
