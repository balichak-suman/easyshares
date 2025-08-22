import { NextRequest, NextResponse } from 'next/server';

// Judge0 API endpoint
const JUDGE0_URL = 'https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=true';
const JUDGE0_HEADERS = {
  'Content-Type': 'application/json',
  'X-RapidAPI-Key': process.env.JUDGE0_API_KEY || '', // Add your RapidAPI key in Vercel env
  'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
};

export async function POST(request: NextRequest) {
  try {
    const { source_code, language_id, stdin } = await request.json();
    if (!source_code || !language_id) {
      return NextResponse.json({ error: 'Missing code or language' }, { status: 400 });
    }

    // Send code to Judge0
    const judgeRes = await fetch(JUDGE0_URL, {
      method: 'POST',
      headers: JUDGE0_HEADERS,
      body: JSON.stringify({ source_code, language_id, stdin: stdin || '' }),
    });
    const result = await judgeRes.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Code execution error:', error);
    return NextResponse.json({ error: 'Execution failed' }, { status: 500 });
  }
}
