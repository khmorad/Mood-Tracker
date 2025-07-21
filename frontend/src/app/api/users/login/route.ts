import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export async function POST(req: Request) {
  try {
    console.log("Frontend API: Received login request");
    const { email, password } = await req.json();
    console.log("Frontend API: Email:", email);

    if (!email || !password) {
      console.log("Frontend API: Missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    console.log("Frontend API: Making request to backend");
    const response = await fetch(`${BACKEND_URL}/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    console.log("Frontend API: Backend response status:", response.status);
    const data = await response.json();
    console.log("Frontend API: Backend response data:", data);

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Login failed" },
        { status: response.status }
      );
    }

    const nextResponse = NextResponse.json(data);
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      nextResponse.headers.set("set-cookie", setCookie);
      console.log("Frontend API: Cookie forwarded to client");
    }

    return nextResponse;
  } catch (error: unknown) {
    console.error("Frontend API: Error:", error);
    return error instanceof Error
      ? NextResponse.json({ error: error.message }, { status: 500 })
      : NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
  }
}
