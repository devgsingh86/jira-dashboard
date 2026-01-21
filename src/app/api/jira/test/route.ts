import { NextRequest, NextResponse } from 'next/server';
import { getJiraClientFromCookies } from '@/lib/jira/client';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const jiraClient = getJiraClientFromCookies(cookieStore);

    if (!jiraClient) {
      return NextResponse.json(
        { error: 'Not authenticated with Jira', connected: false },
        { status: 401 }
      );
    }

    const result = await jiraClient.testConnection();

    if (result.success) {
      return NextResponse.json({
        connected: true,
        user: result.user,
        message: 'Successfully connected to Jira',
      });
    } else {
      return NextResponse.json(
        { error: 'Failed to connect to Jira', connected: false },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Jira test error:', error);
    return NextResponse.json(
      { error: 'Failed to test Jira connection', connected: false },
      { status: 500 }
    );
  }
}
