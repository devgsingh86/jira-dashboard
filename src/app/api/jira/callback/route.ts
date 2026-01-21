import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    console.log('🔍 Jira callback received:', { code: !!code, state, error });

    // Check for OAuth errors
    if (error) {
      console.error('❌ OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/dashboard?error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code || !state) {
      console.error('❌ Missing code or state');
      return NextResponse.redirect(
        new URL('/dashboard?error=missing_code_or_state', request.url)
      );
    }

    // Verify state matches (CSRF protection)
    const storedState = request.cookies.get('jira_oauth_state')?.value;
    console.log('🔐 State verification:', { received: state, stored: storedState, match: state === storedState });
    
    if (state !== storedState) {
      console.error('❌ State mismatch');
      return NextResponse.redirect(
        new URL('/dashboard?error=invalid_state', request.url)
      );
    }

    // Exchange code for access token
    const clientId = process.env.JIRA_CLIENT_ID;
    const clientSecret = process.env.JIRA_CLIENT_SECRET;
    const redirectUri = process.env.JIRA_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      console.error('❌ Missing Jira OAuth configuration');
      throw new Error('Missing Jira OAuth configuration');
    }

    console.log('🔄 Exchanging code for token...');
    const tokenResponse = await fetch('https://auth.atlassian.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('❌ Token exchange failed:', errorData);
      throw new Error('Failed to exchange code for token');
    }

    const tokens = await tokenResponse.json();
    console.log('✅ Token received:', { 
      hasAccessToken: !!tokens.access_token, 
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expires_in 
    });

    // Get accessible resources (Jira sites)
    console.log('🔄 Fetching accessible resources...');
    const resourcesResponse = await fetch(
      'https://api.atlassian.com/oauth/token/accessible-resources',
      {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          Accept: 'application/json',
        },
      }
    );

    if (!resourcesResponse.ok) {
      const errorData = await resourcesResponse.text();
      console.error('❌ Failed to fetch resources:', errorData);
      throw new Error('Failed to fetch accessible resources');
    }

    const resources = await resourcesResponse.json();
    console.log('✅ Resources found:', resources.length, resources.map(r => ({ id: r.id, name: r.name })));
    
    if (!resources || resources.length === 0) {
      console.error('❌ No Jira resources accessible');
      return NextResponse.redirect(
        new URL('/dashboard?error=no_jira_access', request.url)
      );
    }

    // Store tokens in cookies
    const response = NextResponse.redirect(
      new URL('/dashboard?success=jira_connected', request.url)
    );

    console.log('💾 Setting cookies...');
    response.cookies.set('jira_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: tokens.expires_in || 3600,
      path: '/',
    });

    response.cookies.set('jira_refresh_token', tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 90 * 24 * 60 * 60, // 90 days
      path: '/',
    });

    response.cookies.set('jira_cloud_id', resources[0].id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 90 * 24 * 60 * 60,
      path: '/',
    });

    response.cookies.set('jira_site_name', resources[0].name, {
      httpOnly: false, // Make this readable by client
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 90 * 24 * 60 * 60,
      path: '/',
    });

    // Clear state cookie
    response.cookies.delete('jira_oauth_state');

    console.log('✅ Authentication successful, redirecting...');
    return response;
  } catch (error) {
    console.error('❌ Jira callback error:', error);
    return NextResponse.redirect(
      new URL('/dashboard?error=auth_failed', request.url)
    );
  }
}
