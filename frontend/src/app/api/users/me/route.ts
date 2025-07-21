import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function GET(req: Request) {
  try {
    // Get the JWT token from cookies
    const cookieHeader = req.headers.get("cookie");
    const cookies = cookieHeader?.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {} as Record<string, string>);

    const accessToken = cookies?.access_token;

    if (!accessToken) {
      return NextResponse.json(
        { error: "No authentication token" },
        { status: 401 }
      );
    }

    // Forward the request to backend with the token
    const response = await fetch(`${BACKEND_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Authentication failed" },
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
