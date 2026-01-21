import { Suspense } from 'react';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { getAllProjects, getProjectStats } from '@/lib/supabase/queries';
import type { Project } from '@/types/project';

function ProjectCard({ project }: { project: Project }) {
  const completionPercent = project.total_story_points > 0
    ? Math.round((project.completed_story_points / project.total_story_points) * 100)
    : 0;

  const healthColors = {
    on_track: 'bg-success-500',
    at_risk: 'bg-warning-500',
    blocked: 'bg-danger-500',
    unknown: 'bg-gray-400',
  };

  return (
    <Link href={`/dashboard/${project.id}`}>
      <div className="card cursor-pointer">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {project.name}
            </h3>
            <p className="text-sm text-gray-500">{project.jira_key}</p>
          </div>
          <span
            className={`badge text-white ${healthColors[project.health]}`}
          >
            {project.health.replace('_', ' ')}
          </span>
        </div>

        {project.description && (
          <p className="mb-4 text-sm text-gray-600 line-clamp-2">
            {project.description}
          </p>
        )}

        <div className="mb-4">
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{completionPercent}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-primary-500 transition-all"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div>
            <span className="text-gray-600">Story Points:</span>
            <span className="ml-2 font-medium">
              {project.completed_story_points}/{project.total_story_points}
            </span>
          </div>
          {project.target_date && (
            <div>
              <span className="text-gray-600">Target:</span>
              <span className="ml-2 font-medium">
                {new Date(project.target_date).toLocaleDateString()}
              </span>
            </div>
          )}
        </div>

        {project.health_score !== null && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Health Score: {project.health_score}/100
              </span>
              <span className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                View Details →
              </span>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

function StatsCard({ label, value, color = 'primary' }: { label: string; value: number | string; color?: string }) {
  const colorClasses = {
    primary: 'bg-primary-50 text-primary-700',
    success: 'bg-success-50 text-success-700',
    warning: 'bg-warning-50 text-warning-700',
    danger: 'bg-danger-50 text-danger-700',
  };

  return (
    <div className="card">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className={`text-3xl font-bold ${colorClasses[color as keyof typeof colorClasses] || colorClasses.primary}`}>
        {value}
      </div>
    </div>
  );
}

async function DashboardContent() {
  const projects = await getAllProjects();
  const stats = await getProjectStats();

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Projects Found</h3>
        <p className="text-gray-600 mb-6">
          Click "Sync Jira" above to import projects from your Jira instance.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard label="Total Projects" value={stats.total_projects} color="primary" />
        <StatsCard label="On Track" value={stats.on_track} color="success" />
        <StatsCard label="At Risk" value={stats.at_risk} color="warning" />
        <StatsCard label="Blocked" value={stats.blocked} color="danger" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </>
  );
}

type SearchParams = Promise<{ 
  success?: string; 
  error?: string;
  projects?: string;
  issues?: string;
  details?: string;
}>;

export default async function DashboardPage(props: {
  searchParams: SearchParams;
}) {
  const searchParams = await props.searchParams;
  const cookieStore = await cookies();
  
  // Check Jira connection
  const accessToken = cookieStore.get('jira_access_token')?.value;
  const cloudId = cookieStore.get('jira_cloud_id')?.value;
  const siteName = cookieStore.get('jira_site_name')?.value;
  const isJiraConnected = !!(accessToken && cloudId);

  return (
    <div>
      {/* Jira Connected Success */}
      {searchParams.success === 'jira_connected' && (
        <div className="mb-6 rounded-lg bg-success-50 border border-success-200 p-4">
          <p className="text-sm text-success-800">
            ✅ Successfully connected to Jira{siteName ? `: ${siteName}` : ''}! Click "Sync Jira" to import your projects.
          </p>
        </div>
      )}

      {/* Sync Complete Success */}
      {searchParams.success === 'sync_complete' && (
        <div className="mb-6 rounded-lg bg-success-50 border border-success-200 p-4">
          <p className="text-sm text-success-800 font-medium mb-1">
            ✅ Sync completed successfully!
          </p>
          <p className="text-xs text-success-700">
            Synced {searchParams.projects || 0} projects and {searchParams.issues || 0} issues
          </p>
        </div>
      )}

      {/* Errors */}
      {searchParams.error && (
        <div className="mb-6 rounded-lg bg-danger-50 border border-danger-200 p-4">
          <p className="text-sm text-danger-800 font-medium">
            ❌ Error: {searchParams.error.replace(/_/g, ' ')}
          </p>
          {searchParams.details && (
            <p className="text-xs text-danger-700 mt-1">
              {decodeURIComponent(searchParams.details)}
            </p>
          )}
        </div>
      )}

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Projects Dashboard</h1>
          <p className="mt-1 text-sm text-gray-600">
            {isJiraConnected ? (
              <>✅ Connected to Jira{siteName ? ` (${siteName})` : ''} | Monitor and manage all your projects</>
            ) : (
              <>⚠️ Not connected to Jira | Connect to sync real data</>
            )}
          </p>
        </div>
        <div className="flex gap-3">
          {!isJiraConnected ? (
            <a href="/api/jira/auth" className="btn-primary">
              Connect Jira
            </a>
          ) : (
            <>
              <button className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                Filters
              </button>
              <a href="/api/jira/sync" className="btn-primary">
                Sync Jira
              </a>
            </>
          )}
        </div>
      </div>

      <Suspense fallback={
        <div className="text-center py-12">
          <div className="animate-pulse">Loading projects...</div>
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
