import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  
  if (!code) {
    return NextResponse.redirect(new URL('/oauth/error?error=oauth_code_missing', request.url))
  }

  // Handle OAuth callback for MCP server
  // This will exchange the authorization code for tokens
  try {
    const response = await fetch('https://mcp.supabase.com/oauth/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        code,
        state,
        redirect_uri: new URL('/oauth/consent', request.url).toString()
      })
    })

    const result = await response.json()
    
    if (result.error) {
      return NextResponse.redirect(new URL(`/oauth/error?error=${result.error}`, request.url))
    }

    // Store tokens securely (in production, use proper session management)
    // For now, redirect back to app
    return NextResponse.redirect(new URL('/oauth/success?mcp_configured=true', request.url))
    
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/oauth/error?error=oauth_callback_failed', request.url))
  }
}
