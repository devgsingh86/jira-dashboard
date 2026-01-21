import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getJiraClientFromCookies } from '@/lib/jira/client';
import { syncJiraData } from '@/lib/jira/sync';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow 60 seconds for sync

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Jira sync requested');

    const cookieStore = await cookies();
    const jiraClient = getJiraClientFromCookies(cookieStore);

    if (!jiraClient) {
      console.error('❌ Not authenticated with Jira');
      return NextResponse.redirect(
        new URL('/dashboard?error=not_authenticated', request.url)
      );
    }

    // Test connection first
    const connectionTest = await jiraClient.testConnection();
    if (!connectionTest.success) {
      console.error('❌ Jira connection test failed');
      return NextResponse.redirect(
        new URL('/dashboard?error=jira_connection_failed', request.url)
      );
    }

    console.log('✅ Jira connection verified, starting sync...');

    // Perform sync
    const result = await syncJiraData(jiraClient);

    if (result.success) {
      console.log('✅ Sync completed successfully:', result);
      return NextResponse.redirect(
        new URL(
          `/dashboard?success=sync_complete&projects=${result.projects_synced}&issues=${result.issues_synced}`,
          request.url
        )
      );
    } else {
      console.error('❌ Sync failed:', result.errors);
      return NextResponse.redirect(
        new URL(`/dashboard?error=sync_failed&details=${encodeURIComponent(result.errors.join(', '))}`, request.url)
      );
    }
  } catch (error) {
    console.error('❌ Sync error:', error);
    return NextResponse.redirect(
      new URL('/dashboard?error=sync_error', request.url)
    );
  }
}

export async function POST(request: NextRequest) {
  // Same logic as GET for programmatic access
  return GET(request);
}
