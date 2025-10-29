import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    // Get the current access token from cookies
    const accessToken = request.cookies.get('access_token')?.value;
    
    if (!accessToken) {
      return NextResponse.json(
        { detail: 'No access token found' },
        { status: 401 }
      );
    }

    console.log('[Refresh Token] Requesting fresh user data from backend');
    
    // Call backend to get fresh user data
    const response = await fetch(`${BACKEND_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('[Refresh Token] Backend error:', response.status);
      return NextResponse.json(
        { detail: 'Failed to refresh token' },
        { status: response.status }
      );
    }

    const userData = await response.json();
    console.log('[Refresh Token] Fresh user data received:', userData.user);

    // Create new JWT with updated user data
    const refreshResponse = await fetch(`${BACKEND_URL}/users/refresh-jwt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData.user),
    });

    if (!refreshResponse.ok) {
      return NextResponse.json(
        { detail: 'Failed to create new JWT' },
        { status: refreshResponse.status }
      );
    }

    const refreshData = await refreshResponse.json();
    
    // Create response with new JWT cookie
    const nextResponse = NextResponse.json(refreshData);
    
    // Set new JWT cookie
    nextResponse.cookies.set('access_token', refreshData.access_token, {
      httpOnly: false,
      secure: false, // Set to true in production
      sameSite: 'lax',
      maxAge: 1800,
      path: '/'
    });

    console.log('[Refresh Token] JWT token refreshed successfully');
    return nextResponse;

  } catch (error) {
    console.error('[Refresh Token] Error:', error);
    return NextResponse.json(
      { detail: 'Internal server error' },
      { status: 500 }
    );
  }
}
