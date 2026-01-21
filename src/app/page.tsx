import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="mb-4 text-5xl font-bold text-gray-900">
          Jira Project Dashboard
        </h1>
        <p className="mb-8 text-xl text-gray-600">
          AI-powered project management with automatic forecasting and health monitoring
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link
            href="/dashboard"
            className="btn-primary"
          >
            View Dashboard
          </Link>
          <Link
            href="/api/jira/auth"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Connect Jira
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="card">
            <h3 className="mb-2 text-lg font-semibold">Auto-Discovery</h3>
            <p className="text-sm text-gray-600">
              Automatically identifies projects from your Jira instance
            </p>
          </div>
          <div className="card">
            <h3 className="mb-2 text-lg font-semibold">Health Monitoring</h3>
            <p className="text-sm text-gray-600">
              Real-time status tracking with risk indicators
            </p>
          </div>
          <div className="card">
            <h3 className="mb-2 text-lg font-semibold">ML Forecasting</h3>
            <p className="text-sm text-gray-600">
              Predict completion dates with confidence intervals
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
