import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.JIRA_CLIENT_ID;
    const redirectUri = process.env.JIRA_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { error: 'Jira OAuth not configured. Please set JIRA_CLIENT_ID and JIRA_REDIRECT_URI in .env.local' },
        { status: 500 }
      );
    }

    // Generate random state for CSRF protection
    const state = Math.random().toString(36).substring(7);

    // Store state in cookie for validation
    const response = NextResponse.redirect(
      `https://auth.atlassian.com/authorize?` +
        `audience=api.atlassian.com&` +
        `client_id=${clientId}&` +
        `scope=read:jira-work read:jira-user offline_access&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `state=${state}&` +
        `response_type=code&` +
        `prompt=consent`
    );

    response.cookies.set('jira_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600, // 10 minutes
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Jira auth error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Jira authentication' },
      { status: 500 }
    );
  }
}
