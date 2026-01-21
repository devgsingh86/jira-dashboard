# Jira Project Management Dashboard

An AI-powered project management dashboard that integrates with Jira Cloud to automatically track project health, forecast completion dates, and provide actionable insights across 1000+ employees and multiple teams.

![Dashboard Preview](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=flat&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat&logo=supabase)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚀 Features

### ✅ MVP (Current Implementation)

- **Jira Integration**
  - OAuth 2.0 authentication with Atlassian
  - Automatic project discovery and synchronization
  - Real-time issue tracking with story points
  - Handles archived/deleted projects gracefully

- **Intelligent Dashboard**
  - Health score calculation (0-100 scale)
  - Project status indicators (On Track, At Risk, Blocked)
  - Progress tracking with completion percentages
  - Story points and issue metrics
  - Responsive mobile-first design

- **Data Management**
  - PostgreSQL database with Supabase
  - Automatic data synchronization
  - CRUD operations for projects and issues
  - Row-level security (RLS) policies

### 🔮 Planned Features

- ML-based forecasting with confidence intervals
- Sprint velocity tracking and analysis
- Interactive charts (burndown, velocity trends)
- Advanced filtering and search
- Team workload distribution
- Custom reporting and exports

## 🏗️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Recharts** - Data visualization

### Backend
- **Supabase** - PostgreSQL database and authentication
- **Next.js API Routes** - Serverless endpoints
- **Vercel** - Hosting and deployment

### Integrations
- **Jira Cloud API** - Project and issue data
- **Atlassian OAuth 2.0** - Secure authentication

## 📋 Prerequisites

- Node.js 18+ or 20+
- npm or yarn
- Jira Cloud account with admin access
- Supabase account (free tier works)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd jira-dashboard
2. Install Dependencies
bash
npm install
3. Set Up Supabase
Create a new project at supabase.com

Run the SQL schema from the setup guide (see Database Schema section)

Copy your project URL and keys

4. Set Up Jira OAuth
Go to Atlassian Developer Console

Create a new OAuth 2.0 (3LO) integration

Add callback URL: http://localhost:3000/api/jira/callback

Add scopes: read:jira-work, read:jira-user, offline_access

Copy your Client ID and Client Secret

5. Configure Environment Variables
Create .env.local:

bash
# Jira OAuth Configuration
JIRA_CLIENT_ID=your_jira_client_id
JIRA_CLIENT_SECRET=your_jira_client_secret
JIRA_REDIRECT_URI=http://localhost:3000/api/jira/callback
JIRA_BASE_URL=https://your-domain.atlassian.net

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
6. Run Development Server
bash
npm run dev
Open http://localhost:3000 in your browser.

7. Connect Jira and Sync
Click "Connect Jira" and authorize the app

Click "Sync Jira" to import your projects

View your projects in the dashboard!

📊 Database Schema
The application uses the following database structure:

projects - Jira projects with health scores and metrics

issues - Individual Jira issues with story points

sprints - Sprint data for velocity tracking

teams - Team organization and assignments

users - User information and Jira mappings

forecasts - ML-generated completion predictions

See docs/database-schema.sql for the complete schema.

🏛️ Project Structure
text
jira-dashboard/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── jira/         # Jira integration endpoints
│   │   │   ├── projects/     # Project CRUD operations
│   │   │   └── forecasts/    # Forecasting endpoints
│   │   ├── dashboard/        # Dashboard pages
│   │   └── layout.tsx        # Root layout
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── dashboard/        # Dashboard-specific components
│   │   └── charts/           # Chart components
│   ├── lib/                   # Core logic
│   │   ├── supabase/         # Database client and queries
│   │   ├── jira/             # Jira API client and sync
│   │   ├── ml/               # ML forecasting algorithms
│   │   └── utils/            # Utility functions
│   └── types/                 # TypeScript type definitions
├── scripts/                   # Utility scripts
└── public/                    # Static assets
🔧 Available Scripts
bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run dev:clean    # Clean build and start dev server
npm run restart      # Kill port and restart dev server
🧪 Testing
bash
# Run seed script to add sample data
node scripts/seed-database.js
📈 Key Features Explained
Health Score Calculation
Projects receive a health score (0-100) based on:

40% - Issue completion rate

40% - Story point completion

-20% - Penalty for blocked issues

Thresholds:

🟢 On Track (70-100): Project is healthy

🟡 At Risk (50-69): Needs attention

🔴 Blocked (0-49): Critical issues

Data Synchronization
Automatic Discovery: Finds all accessible Jira projects

Issue Mapping: Syncs issues with status, story points, and metadata

Smart Updates: Only syncs changed data to reduce API calls

Error Handling: Gracefully handles archived/deleted projects

🚢 Deployment
Vercel (Recommended)
bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
Add environment variables in Vercel dashboard.

Production Checklist
 Update Jira OAuth callback URL to production domain

 Set all environment variables in hosting platform

 Enable Supabase RLS policies

 Configure custom domain

 Set up monitoring and logging

🔒 Security
OAuth 2.0 for secure Jira authentication

HTTP-only cookies for token storage

Row-level security (RLS) in Supabase

Input validation and sanitization

CORS policies on API routes

Encrypted sensitive data in database

🤝 Contributing
Contributions are welcome! Please follow these steps:

Fork the repository

Create a feature branch (git checkout -b feature/amazing-feature)

Commit your changes (git commit -m 'Add amazing feature')

Push to the branch (git push origin feature/amazing-feature)

Open a Pull Request

📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
Built with Next.js

Database powered by Supabase

Integrated with Atlassian Jira

📞 Support
For questions or issues, please open a GitHub issue or contact the maintainers.

Built with ❤️ for better project management
EOF

text

## Step 4: Create Additional Documentation Files

### LICENSE

```bash
cat > LICENSE << 'EOF'
MIT License

Copyright (c) 2026 Jira Dashboard

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF