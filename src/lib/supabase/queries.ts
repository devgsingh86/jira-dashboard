import { supabaseAdmin } from './server';
import type { Project, ProjectInsert, ProjectUpdate, ProjectWithDetails, ProjectFilters } from '@/types/project';

// Projects Queries
export async function getAllProjects(filters?: ProjectFilters): Promise<Project[]> {
  try {
    let query = supabaseAdmin
      .from('projects')
      .select('*')
      .order('updated_at', { ascending: false });

    // Apply filters
    if (filters?.status && filters.status.length > 0) {
      query = query.in('status', filters.status);
    }

    if (filters?.health && filters.health.length > 0) {
      query = query.in('health', filters.health);
    }

    if (filters?.team_id) {
      query = query.eq('team_id', filters.team_id);
    }

    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,jira_key.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching projects:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Failed to fetch projects:', error);
    throw error;
  }
}

export async function getProjectById(id: string): Promise<ProjectWithDetails | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .select(`
        *,
        team:teams(*),
        lead:users(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching project:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch project:', error);
    return null;
  }
}

export async function createProject(project: ProjectInsert): Promise<Project> {
  try {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert(project)
      .select()
      .single();

    if (error) {
      console.error('Error creating project:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to create project:', error);
    throw error;
  }
}

export async function updateProject(id: string, updates: ProjectUpdate): Promise<Project> {
  try {
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating project:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to update project:', error);
    throw error;
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  } catch (error) {
    console.error('Failed to delete project:', error);
    throw error;
  }
}

export async function getProjectStats(): Promise<{
  total_projects: number;
  active_projects: number;
  on_track: number;
  at_risk: number;
  blocked: number;
  avg_health_score: number;
}> {
  try {
    const { data: projects, error } = await supabaseAdmin
      .from('projects')
      .select('status, health, health_score')
      .returns<Array<{ status: string; health: string; health_score: number | null }>>();

    if (error) throw error;

    const stats = {
      total_projects: projects?.length || 0,
      active_projects: projects?.filter(p => p.status === 'active').length || 0,
      on_track: projects?.filter(p => p.health === 'on_track').length || 0,
      at_risk: projects?.filter(p => p.health === 'at_risk').length || 0,
      blocked: projects?.filter(p => p.health === 'blocked').length || 0,
      avg_health_score: projects && projects.length > 0
        ? Math.round(
            projects.reduce((sum, p) => sum + (p.health_score || 0), 0) / projects.length
          )
        : 0,
    };

    return stats;
  } catch (error) {
    console.error('Failed to fetch project stats:', error);
    throw error;
  }
}

// Issues Queries
export async function getIssuesByProjectId(projectId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('issues')
      .select('*')
      .eq('project_id', projectId)
      .order('created_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to fetch issues:', error);
    throw error;
  }
}

// Sprints Queries
export async function getSprintsByProjectId(projectId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from('sprints')
      .select('*')
      .eq('project_id', projectId)
      .order('start_date', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to fetch sprints:', error);
    throw error;
  }
}

// Teams Queries
export async function getAllTeams() {
  try {
    const { data, error } = await supabaseAdmin
      .from('teams')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Failed to fetch teams:', error);
    throw error;
  }
}
