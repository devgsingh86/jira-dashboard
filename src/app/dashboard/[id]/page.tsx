import { Suspense } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getProjectById, getProjectIssues } from '@/lib/supabase/queries';
import type { Issue } from '@/types/project';

function getStatusColor(status: string) {
  switch (status) {
    case 'done':
      return 'bg-success-100 text-success-800';
    case 'in_progress':
      return 'bg-primary-100 text-primary-800';
    case 'blocked':
      return 'bg-danger-100 text-danger-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

function getHealthColor(health: string) {
  switch (health) {
    case 'on_track':
      return 'bg-success-500';
    case 'at_risk':
      return 'bg-warning-500';
    case 'blocked':
      return 'bg-danger-500';
    default:
      return 'bg-gray-400';
  }
}

function getPriorityIcon(priority: string | null) {
  switch (priority?.toLowerCase()) {
    case 'highest':
      return '🔴';
    case 'high':
      return '🟠';
    case 'medium':
      return '🟡';
    case 'low':
      return '🟢';
    case 'lowest':
      return '⚪';
    default:
      return '⚫';
  }
}

function IssueRow({ issue }: { issue: Issue }) {
  const statusLabels = {
    to_do: 'To Do',
    in_progress: 'In Progress',
    done: 'Done',
    blocked: 'Blocked',
  };

  const typeIcons = {
    epic: '📚',
    story: '📖',
    task: '✅',
    bug: '🐛',
    subtask: '📝',
  };

  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{typeIcons[issue.issue_type]}</span>
          <div>
            <div className="font-medium text-gray-900">{issue.summary}</div>
            <div className="text-xs text-gray-500">{issue.jira_key}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(issue.status)}`}>
          {statusLabels[issue.status]}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="text-sm">{getPriorityIcon(issue.priority)}</span>
      </td>
      <td className="px-4 py-3 text-center">
        {issue.story_points ? (
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary-100 text-primary-800 text-xs font-bold">
            {issue.story_points}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        )}
      </td>
      <td className="px-4 py-3">
        {issue.is_blocked && (
          <span className="inline-flex items-center gap-1 text-xs text-danger-600">
            🚫 Blocked
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">
        {new Date(issue.created_date).toLocaleDateString()}
      </td>
    </tr>
  );
}

function ProjectMetrics({ project, issues }: { project: any; issues: Issue[] }) {
  const issuesByStatus = {
    to_do: issues.filter(i => i.status === 'to_do').length,
    in_progress: issues.filter(i => i.status === 'in_progress').length,
    done: issues.filter(i => i.status === 'done').length,
    blocked: issues.filter(i => i.status === 'blocked').length,
  };

  const issuesByType = {
    epic: issues.filter(i => i.issue_type === 'epic').length,
    story: issues.filter(i => i.issue_type === 'story').length,
    task: issues.filter(i => i.issue_type === 'task').length,
    bug: issues.filter(i => i.issue_type === 'bug').length,
    subtask: issues.filter(i => i.issue_type === 'subtask').length,
  };

  const completionPercent = project.total_story_points > 0
    ? Math.round((project.completed_story_points / project.total_story_points) * 100)
    : 0;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
      <div className="card">
        <div className="text-sm text-gray-600 mb-2">Overall Progress</div>
        <div className="text-3xl font-bold text-primary-700 mb-2">{completionPercent}%</div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full bg-primary-500 transition-all"
            style={{ width: `${completionPercent}%` }}
          />
        </div>
      </div>

      <div className="card">
        <div className="text-sm text-gray-600 mb-2">Story Points</div>
        <div className="text-3xl font-bold text-gray-900">
          {project.completed_story_points}/{project.total_story_points}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {project.total_story_points - project.completed_story_points} remaining
        </div>
      </div>

      <div className="card">
        <div className="text-sm text-gray-600 mb-3">Issues by Status</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-600">To Do:</span>
            <span className="font-medium">{issuesByStatus.to_do}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">In Progress:</span>
            <span className="font-medium">{issuesByStatus.in_progress}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Done:</span>
            <span className="font-medium text-success-600">{issuesByStatus.done}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Blocked:</span>
            <span className="font-medium text-danger-600">{issuesByStatus.blocked}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="text-sm text-gray-600 mb-3">Issues by Type</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {issuesByType.epic > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">📚 Epic:</span>
              <span className="font-medium">{issuesByType.epic}</span>
            </div>
          )}
          {issuesByType.story > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">📖 Story:</span>
              <span className="font-medium">{issuesByType.story}</span>
            </div>
          )}
          {issuesByType.task > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">✅ Task:</span>
              <span className="font-medium">{issuesByType.task}</span>
            </div>
          )}
          {issuesByType.bug > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">🐛 Bug:</span>
              <span className="font-medium">{issuesByType.bug}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

async function ProjectDetailContent({ id }: { id: string }) {
  const project = await getProjectById(id);
  
  if (!project) {
    notFound();
  }

  const issues = await getProjectIssues(id);

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Link 
            href="/dashboard" 
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <span className={`badge text-white ${getHealthColor(project.health)}`}>
                {project.health.replace('_', ' ')}
              </span>
            </div>
            <p className="text-sm text-gray-500 mb-2">{project.jira_key}</p>
            {project.description && (
              <p className="text-gray-600 max-w-3xl">{project.description}</p>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-600 mb-1">Health Score</div>
            <div className="text-4xl font-bold text-gray-900">{project.health_score}</div>
            <div className="text-xs text-gray-500">out of 100</div>
          </div>
        </div>

        {project.target_date && (
          <div className="mt-4 flex items-center gap-4 text-sm">
            <div>
              <span className="text-gray-600">Start Date:</span>
              <span className="ml-2 font-medium">
                {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Target Date:</span>
              <span className="ml-2 font-medium">
                {new Date(project.target_date).toLocaleDateString()}
              </span>
            </div>
            {project.last_synced_at && (
              <div>
                <span className="text-gray-600">Last Synced:</span>
                <span className="ml-2 font-medium">
                  {new Date(project.last_synced_at).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <ProjectMetrics project={project} issues={issues} />

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">
            Issues ({issues.length})
          </h2>
          <div className="flex gap-2">
            <select className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm">
              <option value="">All Status</option>
              <option value="to_do">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
              <option value="blocked">Blocked</option>
            </select>
            <select className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm">
              <option value="">All Types</option>
              <option value="epic">Epic</option>
              <option value="story">Story</option>
              <option value="task">Task</option>
              <option value="bug">Bug</option>
            </select>
          </div>
        </div>

        {issues.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No issues found for this project.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Issue
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Points
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flags
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {issues.map((issue) => (
                  <IssueRow key={issue.id} issue={issue} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div>
      <Suspense fallback={
        <div className="text-center py-12">
          <div className="animate-pulse">Loading project details...</div>
        </div>
      }>
        <ProjectDetailContent id={id} />
      </Suspense>
    </div>
  );
}
