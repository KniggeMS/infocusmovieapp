import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  
  if (!code) {
    return NextResponse.redirect('http://localhost:3000/auth/error?error=oauth_code_missing')
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
        redirect_uri: 'http://localhost:3000/oauth/consent'
      })
    })

    const result = await response.json()
    
    if (result.error) {
      return NextResponse.redirect(`http://localhost:3000/auth/error?error=${result.error}`)
    }

    // Store tokens securely (in production, use proper session management)
    // For now, redirect back to app
    return NextResponse.redirect('http://localhost:3000/auth/success?mcp_configured=true')
    
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect('http://localhost:3000/auth/error?error=oauth_callback_failed')
  }
}
