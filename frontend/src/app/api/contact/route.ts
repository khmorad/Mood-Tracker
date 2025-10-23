import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, subject, message } = body;

    // Basic validation
    if (!fullName || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }

    // In a real application, you would handle the form submission here,
    // for example, by sending an email or saving the data to a database.
    // For this example, we'll just log the data to the console.
    console.log('Contact form submission received:');
    console.log('Full Name:', fullName);
    console.log('Email:', email);
    console.log('Subject:', subject);
    console.log('Message:', message);

    // Simulate a successful submission
    return NextResponse.json({ message: 'Your message has been sent successfully!' }, { status: 200 });

  } catch (error) {
    console.error('Error handling contact form submission:', error);
    return NextResponse.json({ error: 'An unexpected error occurred. Please try again later.' }, { status: 500 });
  }
}
