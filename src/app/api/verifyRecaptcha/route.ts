import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    const secretKey = process.env.RECAPTCHA_SECRET_KEY;
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify`,
      null,
      {
        params: {
          secret: secretKey,
          response: token,
        },
      }
    );

    const data = response.data;
    console.log(data.score)
    if (data.success && data.score >= 0.6) { // Umbral de score
      return NextResponse.json({ message: 'Token is valid', score: data.score });
    } else {
      return NextResponse.json({ message: 'Invalid token', score: data.score }, { status: 400 });
    }
  } catch (error) {
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ message: 'Error verifying reCAPTCHA', error: errorMessage }, { status: 500 });
  }
}
