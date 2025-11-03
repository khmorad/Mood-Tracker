import { NextResponse } from "next/server";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

interface ValidationError {
  msg?: string;
  [key: string]: unknown;
}

export async function POST(req: Request) {
  try {
    console.log("Frontend API: Received registration request");
    const { email, password, name } = await req.json();
    console.log("Frontend API: Registration data:", { email, name });

    if (!email || !password || !name) {
      console.log("Frontend API: Missing required fields");
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    // Client-side validation
    if (password.length < 6) {
      console.log("Frontend API: Password too short");
      return NextResponse.json(
        { error: "Password must be at least 6 characters long" },
        { status: 400 }
      );
    }

    console.log("Frontend API: Making request to backend");
    const response = await fetch(`${BACKEND_URL}/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name }),
      credentials: "include",
    });

    console.log("Frontend API: Backend response status:", response.status);
    const data = await response.json();
    console.log("Frontend API: Backend response data:", data);

    if (!response.ok) {
      console.log("Frontend API: Registration failed:", data);

      // Format error message for better user experience
      let errorMessage = "Registration failed";

      if (data.detail) {
        if (Array.isArray(data.detail)) {
          // Handle Pydantic validation errors
          const validationErrors = data.detail.map((err: ValidationError) => {
            if (err.msg) {
              // Make password error more user-friendly
              if (err.msg.includes("Password must be at least")) {
                return "Password must be at least 6 characters long";
              }
              return err.msg;
            }
            return String(err);
          });
          errorMessage = validationErrors.join(", ");
        } else if (typeof data.detail === "string") {
          errorMessage = data.detail;
        }
      } else if (data.error) {
        errorMessage = data.error;
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    console.log("Frontend API: Registration successful");
    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error("Frontend API: Registration error:", error);
    return error instanceof Error
      ? NextResponse.json({ error: error.message }, { status: 500 })
      : NextResponse.json({ error: "Unknown error occurred" }, { status: 500 });
  }
}
