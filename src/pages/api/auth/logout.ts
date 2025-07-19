// ComputerPOS Pro - Logout API Endpoint
// Handles user logout and session cleanup

import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    // Clear the auth token cookie
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Đăng xuất thành công' 
    }), {
      status: 200,
      headers: {
        'Set-Cookie': 'auth-token=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Strict',
        'Content-Type': 'application/json'
      }
    });
    
  } catch (error) {
    console.error('Logout API Error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Lỗi khi đăng xuất' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Handle GET requests (also logout)
export const GET: APIRoute = async () => {
  return new Response(JSON.stringify({ 
    success: true, 
    message: 'Đăng xuất thành công' 
  }), {
    status: 200,
    headers: {
      'Set-Cookie': 'auth-token=; HttpOnly; Secure; Path=/; Max-Age=0; SameSite=Strict',
      'Content-Type': 'application/json'
    }
  });
};
