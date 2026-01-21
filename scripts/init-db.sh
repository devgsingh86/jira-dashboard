#!/bin/bash

echo "🚀 Initializing Jira Dashboard Project..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your actual credentials"
else
    echo "✅ .env.local already exists"
fi

echo "📦 Installing dependencies..."
npm install

echo "🗄️  Database setup instructions:"
echo "1. Go to https://supabase.com and create a new project"
echo "2. Copy the SQL schema from the setup guide and run it in Supabase SQL Editor"
echo "3. Update .env.local with your Supabase URL and keys"
echo "4. Run: supabase gen types typescript --project-id YOUR_PROJECT_ID > src/types/database.types.ts"

echo ""
echo "🔐 Jira OAuth setup instructions:"
echo "1. Go to https://developer.atlassian.com/console/myapps/"
echo "2. Create a new OAuth 2.0 (3LO) app"
echo "3. Add callback URL: http://localhost:3000/api/jira/auth"
echo "4. Add required scopes: read:jira-work, read:jira-user"
echo "5. Update .env.local with your Client ID and Secret"

echo ""
echo "✨ Setup complete! Run 'npm run dev' to start development"
