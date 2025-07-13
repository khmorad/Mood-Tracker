import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

// GET Request Handler for all users
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    let url = `${BACKEND_URL}/users`;
    if (email) {
      url += `?email=${encodeURIComponent(email)}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Failed to fetch users" },
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

// POST Request Handler to add a new user
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body.user_id || !body.email || !body.password) {
      return NextResponse.json(
        { error: "Missing required fields: user_id, email, password" },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Failed to create user" },
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
