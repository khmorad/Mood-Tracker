import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

function getAuthHeaders(request: NextRequest) {
  const accessToken = request.cookies.get("access_token")?.value;

  if (!accessToken) {
    return null;
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

export async function GET(request: NextRequest) {
  try {
    const headers = getAuthHeaders(request);
    if (!headers) {
      return NextResponse.json(
        { error: "No authentication token" },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/account/settings`, {
      method: "GET",
      headers,
    });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Failed to load account settings" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    return error instanceof Error
      ? NextResponse.json({ error: error.message }, { status: 500 })
      : NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const headers = getAuthHeaders(request);
    if (!headers) {
      return NextResponse.json(
        { error: "No authentication token" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/account/settings`, {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
    });
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Failed to update account settings" },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    return error instanceof Error
      ? NextResponse.json({ error: error.message }, { status: 500 })
      : NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
  }
}
