import { NextRequest, NextResponse } from 'next/server';

const WP_BASE = process.env.WP_REST_ROOT ?? 'https://wp.zivic-elektro.shop/wp-json';

export async function POST(req: NextRequest) {
  try {
    const { key, login, password } = await req.json();

    if (!key || !login || !password) {
      return NextResponse.json(
        { error: 'Missing key/login/password' },
        { status: 400 },
      );
    }

    const url = `${WP_BASE.replace(/\/$/, '')}/zvo/v1/reset-password`;

    const wpRes = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, login, password }),
    });

    const data = await wpRes.json();

    if (!wpRes.ok) {
      return NextResponse.json(
        { error: data?.error || 'WP reset error' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('reset-password error:', err);
    return NextResponse.json(
      { error: 'Unexpected error' },
      { status: 500 },
    );
  }
}