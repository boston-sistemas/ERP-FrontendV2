import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  const { token } = await request.json();
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`
    );

    const data = response.data;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Error verifying reCAPTCHA' }, { status: 500 });
  }
}