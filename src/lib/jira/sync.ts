import { JiraClient } from './client';
import { supabaseAdmin } from '../supabase/server';
import type { ProjectInsert } from '@/types/project';

interface SyncResult {
  success: boolean;
  projects_synced: number;
  issues_synced: number;
  errors: string[];
  warnings: string[];
}

export async function syncJiraData(jiraClient: JiraClient): Promise<SyncResult> {
  const result: SyncResult = {
    success: false,
    projects_synced: 0,
    issues_synced: 0,
    errors: [],
    warnings: [],
  };

  try {
    console.log('🔄 Starting Jira sync...');

    const jiraProjects = await jiraClient.getProjects();
    console.log(`📦 Found ${jiraProjects.values?.length || 0} Jira projects`);

    if (!jiraProjects.values || jiraProjects.values.length === 0) {
      result.errors.push('No projects found in Jira');
      return result;
    }

    for (const jiraProject of jiraProjects.values) {
      try {
        console.log(`\n🔄 Syncing project: ${jiraProject.key} (${jiraProject.name})`);
        const syncedIssues = await syncProject(jiraClient, jiraProject);
        result.projects_synced++;
        result.issues_synced += syncedIssues;
        console.log(`✅ Successfully synced: ${jiraProject.key} (${syncedIssues} issues)`);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        
        // 410 errors are warnings (archived/deleted projects), not critical errors
        if (errorMsg.includes('410')) {
          console.warn(`⚠️  Project ${jiraProject.key} is archived or deleted (410)`);
          result.warnings.push(`${jiraProject.key}: Project archived or deleted`);
          
          // Still save the project metadata without issues
          try {
            await saveProjectMetadataOnly(jiraProject);
            result.projects_synced++;
          } catch (saveError) {
            console.error(`  Failed to save project metadata:`, saveError);
          }
        } else {
          console.error(`❌ Error syncing project ${jiraProject.key}:`, errorMsg);
          result.errors.push(`${jiraProject.key}: ${errorMsg}`);
        }
      }
    }

    result.success = result.projects_synced > 0;
    console.log('\n✅ Jira sync completed:', {
      projects: result.projects_synced,
      issues: result.issues_synced,
      errors: result.errors.length,
      warnings: result.warnings.length
    });
    return result;
  } catch (error) {
    console.error('❌ Jira sync failed:', error);
    result.errors.push('Sync failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
    return result;
  }
}

async function saveProjectMetadataOnly(jiraProject: any): Promise<void> {
  const projectData: ProjectInsert = {
    name: jiraProject.name,
    jira_key: jiraProject.key,
    jira_project_id: jiraProject.id,
    description: jiraProject.description || 'Archived project',
    status: 'on_hold',
    health: 'unknown',
    health_score: 0,
    total_story_points: 0,
    completed_story_points: 0,
    total_issues: 0,
    completed_issues: 0,
    last_synced_at: new Date().toISOString(),
  };

  const { error } = await supabaseAdmin
    .from('projects')
    .upsert(projectData, {
      onConflict: 'jira_project_id',
    });

  if (error) {
    throw new Error(`Failed to save project metadata: ${error.message}`);
  }

  console.log(`  💾 Saved archived project: ${jiraProject.name}`);
}

async function syncProject(jiraClient: JiraClient, jiraProject: any): Promise<number> {
  try {
    const jql = `project = "${jiraProject.key}" ORDER BY created DESC`;
    console.log(`  📋 Fetching issues with JQL: ${jql}`);
    
    let issuesResponse;
    try {
      issuesResponse = await jiraClient.getIssues(jql, 100);
      console.log(`  📦 Raw response:`, JSON.stringify(issuesResponse, null, 2).substring(0, 500));
    } catch (error: any) {
      console.error(`  ❌ Error details:`, error);
      if (error.message?.includes('410')) {
        throw new Error('Failed to fetch issues: Jira API error: 410');
      }
      throw new Error(`Failed to fetch issues: ${error instanceof Error ? error.message : 'Unknown'}`);
    }

    const issues = issuesResponse.issues || [];
    console.log(`  📋 Found ${issues.length} issues`);
    
    // Log first issue for debugging
    if (issues.length > 0) {
      console.log(`  🔍 Sample issue:`, {
        key: issues[0].key,
        summary: issues[0].fields?.summary,
        status: issues[0].fields?.status?.name
      });
    }

    // ... rest of the function stays the same


    const totalIssues = issues.length;
    const completedIssues = issues.filter((i: any) => {
      try {
        return i.fields?.status?.statusCategory?.key === 'done';
      } catch {
        return false;
      }
    }).length;

    const totalStoryPoints = issues.reduce((sum: number, issue: any) => {
      try {
        const points = issue.fields?.customfield_10016 || 0;
        return sum + (typeof points === 'number' ? points : 0);
      } catch {
        return sum;
      }
    }, 0);

    const completedStoryPoints = issues
      .filter((i: any) => {
        try {
          return i.fields?.status?.statusCategory?.key === 'done';
        } catch {
          return false;
        }
      })
      .reduce((sum: number, issue: any) => {
        try {
          const points = issue.fields?.customfield_10016 || 0;
          return sum + (typeof points === 'number' ? points : 0);
        } catch {
          return sum;
        }
      }, 0);

    const blockedIssues = issues.filter((i: any) => {
      try {
        const statusName = i.fields?.status?.name?.toLowerCase() || '';
        const statusCategory = i.fields?.status?.statusCategory?.key || '';
        return statusName.includes('blocked') || statusCategory === 'indeterminate';
      } catch {
        return false;
      }
    }).length;

    console.log(`  📊 Metrics - Total: ${totalIssues}, Completed: ${completedIssues}, Points: ${completedStoryPoints}/${totalStoryPoints}, Blocked: ${blockedIssues}`);

    const healthScore = calculateHealthScore({
      completedIssues,
      totalIssues,
      completedStoryPoints,
      totalStoryPoints,
      blockedIssues,
    });

    const health = getHealthStatus(healthScore);

    const projectData: ProjectInsert = {
      name: jiraProject.name,
      jira_key: jiraProject.key,
      jira_project_id: jiraProject.id,
      description: jiraProject.description || null,
      status: 'active',
      health,
      health_score: healthScore,
      total_story_points: totalStoryPoints,
      completed_story_points: completedStoryPoints,
      total_issues: totalIssues,
      completed_issues: completedIssues,
      last_synced_at: new Date().toISOString(),
    };

    console.log(`  💾 Upserting project to database...`);
    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .upsert(projectData, {
        onConflict: 'jira_project_id',
      })
      .select()
      .single();

    if (projectError) {
      console.error('  ❌ Database error:', projectError);
      throw new Error(`Database error: ${projectError.message}`);
    }

    console.log(`  ✅ Project saved: ${project.name} (Health: ${health}, Score: ${healthScore})`);

    if (issues.length > 0) {
      await syncIssues(project.id, issues);
    } else {
      console.log(`  ℹ️  No issues to sync`);
    }

    return issues.length;
  } catch (error) {
    console.error(`  ❌ syncProject failed:`, error);
    throw error;
  }
}

async function syncIssues(projectId: string, jiraIssues: any[]) {
  console.log(`  🔄 Syncing ${jiraIssues.length} issues...`);

  try {
    const issuesData = jiraIssues.map((issue: any) => {
      try {
        return {
          jira_id: issue.id,
          jira_key: issue.key,
          project_id: projectId,
          summary: issue.fields?.summary || 'No summary',
          description: issue.fields?.description || null,
          issue_type: mapIssueType(issue.fields?.issuetype?.name || 'Task'),
          status: mapStatus(issue.fields?.status?.statusCategory?.key || 'new'),
          priority: issue.fields?.priority?.name || null,
          story_points: issue.fields?.customfield_10016 || null,
          labels: issue.fields?.labels || null,
          components: issue.fields?.components?.map((c: any) => c.name) || null,
          created_date: issue.fields?.created || new Date().toISOString(),
          updated_date: issue.fields?.updated || new Date().toISOString(),
          resolved_date: issue.fields?.resolutiondate || null,
          due_date: issue.fields?.duedate || null,
          is_blocked: (issue.fields?.status?.name?.toLowerCase() || '').includes('blocked'),
          blocked_reason: (issue.fields?.status?.name?.toLowerCase() || '').includes('blocked') 
            ? issue.fields?.status?.name 
            : null,
        };
      } catch (err) {
        console.error(`    ⚠️  Error mapping issue ${issue.key}:`, err);
        return null;
      }
    }).filter(Boolean);

    if (issuesData.length === 0) {
      console.log(`  ⚠️  No valid issues to sync`);
      return;
    }

    console.log(`  💾 Upserting ${issuesData.length} issues to database...`);
    const { error: issuesError } = await supabaseAdmin
      .from('issues')
      .upsert(issuesData, {
        onConflict: 'jira_id',
      });

    if (issuesError) {
      console.error('  ❌ Issues database error:', issuesError);
      throw new Error(`Issues sync error: ${issuesError.message}`);
    }

    console.log(`  ✅ Synced ${issuesData.length} issues`);
  } catch (error) {
    console.error(`  ❌ syncIssues failed:`, error);
    throw error;
  }
}

function calculateHealthScore(metrics: {
  completedIssues: number;
  totalIssues: number;
  completedStoryPoints: number;
  totalStoryPoints: number;
  blockedIssues: number;
}): number {
  const { completedIssues, totalIssues, completedStoryPoints, totalStoryPoints, blockedIssues } = metrics;

  if (totalIssues === 0) return 50;

  const completionRate = (completedIssues / totalIssues) * 40;
  const storyPointCompletion = totalStoryPoints > 0 
    ? (completedStoryPoints / totalStoryPoints) * 40 
    : 20;
  const blockedPenalty = (blockedIssues / totalIssues) * 20;

  const score = Math.max(0, Math.min(100, completionRate + storyPointCompletion - blockedPenalty + 20));
  return Math.round(score);
}

function getHealthStatus(score: number): 'on_track' | 'at_risk' | 'blocked' | 'unknown' {
  if (score >= 70) return 'on_track';
  if (score >= 50) return 'at_risk';
  if (score > 0) return 'blocked';
  return 'unknown';
}

function mapIssueType(jiraType: string): 'epic' | 'story' | 'task' | 'bug' | 'subtask' {
  const type = jiraType.toLowerCase();
  if (type.includes('epic')) return 'epic';
  if (type.includes('story')) return 'story';
  if (type.includes('bug')) return 'bug';
  if (type.includes('subtask') || type.includes('sub-task')) return 'subtask';
  return 'task';
}

function mapStatus(statusCategory: string): 'to_do' | 'in_progress' | 'done' | 'blocked' {
  const category = (statusCategory || '').toLowerCase();
  switch (category) {
    case 'done':
      return 'done';
    case 'indeterminate':
      return 'in_progress';
    case 'new':
      return 'to_do';
    default:
      return 'to_do';
  }
}
