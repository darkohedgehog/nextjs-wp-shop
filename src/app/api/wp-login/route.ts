import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  const { username, password } = await request.json();
  const baseUrl = process.env.WC_BASE_URL;
  if (!baseUrl) {
    return NextResponse.json({ message: 'WC_BASE_URL missing' }, { status: 500 });
  }

  const loginUrl = `${baseUrl}/wp-login.php`;
  const formData = new URLSearchParams();
  formData.append('log', username);
  formData.append('pwd', password);
  formData.append('redirect_to', `${baseUrl}/wp-json/wp/v2/users/me`);
  formData.append('testcookie', '1');

  // Send login request, manual redirect to capture cookie
  const loginRes = await fetch(loginUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
    credentials: 'include',
    redirect: 'manual',
  });

  // Expect 302 redirect on success
  if (loginRes.status !== 302) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  // Extract session cookie
  const cookies = loginRes.headers.get('set-cookie');
  if (!cookies) {
    return NextResponse.json({ message: 'Login failed: no session cookie' }, { status: 500 });
  }

  // Fetch logged-in user info using cookie
  const meRes = await fetch(`${baseUrl}/wp-json/wp/v2/users/me`, {
    headers: { Cookie: cookies },
  });
  if (!meRes.ok) {
    return NextResponse.json({ message: 'Unable to fetch user' }, { status: meRes.status });
  }
  const user = await meRes.json();

  // Return user and set cookie header
  const response = NextResponse.json(user);
  response.headers.append('Set-Cookie', cookies);
  return response;
}
