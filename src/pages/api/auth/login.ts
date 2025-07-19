// ComputerPOS Pro - Login API Endpoint
// Handles authentication with backend API

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Username và password là bắt buộc'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Simple demo authentication (replace with real backend call)
    if (username === 'admin' && password === 'admin123') {
      return new Response(JSON.stringify({
        success: true,
        user: {
          id: 1,
          username: 'admin',
          role: 'admin',
          name: 'Administrator'
        }
      }), {
        status: 200,
        headers: {
          'Set-Cookie': `auth-token=demo-token-${Date.now()}; HttpOnly; Secure; Path=/; Max-Age=86400; SameSite=Strict`,
          'Content-Type': 'application/json'
        }
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        error: 'Tên đăng nhập hoặc mật khẩu không đúng'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Login API Error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: 'Lỗi hệ thống. Vui lòng thử lại sau.'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
