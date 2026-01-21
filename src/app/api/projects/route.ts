import { NextRequest, NextResponse } from 'next/server';
import { getAllProjects, createProject, getProjectStats } from '@/lib/supabase/queries';
import type { ProjectInsert } from '@/types/project';

export const dynamic = 'force-dynamic';

// GET /api/projects
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse filters from query params
    const filters = {
      status: searchParams.get('status')?.split(','),
      health: searchParams.get('health')?.split(','),
      team_id: searchParams.get('team_id') || undefined,
      search: searchParams.get('search') || undefined,
    };

    const projects = await getAllProjects(filters);
    const stats = await getProjectStats();

    return NextResponse.json({
      projects,
      stats,
      count: projects.length,
    });
  } catch (error) {
    console.error('GET /api/projects error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}

// POST /api/projects
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.jira_key || !body.jira_project_id) {
      return NextResponse.json(
        { error: 'Missing required fields: name, jira_key, jira_project_id' },
        { status: 400 }
      );
    }

    const projectData: ProjectInsert = {
      name: body.name,
      jira_key: body.jira_key,
      jira_project_id: body.jira_project_id,
      description: body.description || null,
      status: body.status || 'active',
      health: body.health || 'unknown',
      health_score: body.health_score || null,
      start_date: body.start_date || null,
      target_date: body.target_date || null,
      total_story_points: body.total_story_points || 0,
      completed_story_points: body.completed_story_points || 0,
      total_issues: body.total_issues || 0,
      completed_issues: body.completed_issues || 0,
      team_id: body.team_id || null,
      lead_id: body.lead_id || null,
      last_synced_at: new Date().toISOString(),
    };

    const project = await createProject(projectData);

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error('POST /api/projects error:', error);
    return NextResponse.json(
      { error: 'Failed to create project' },
      { status: 500 }
    );
  }
}
