const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('   Please check your .env.local file has:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function seedDatabase() {
  try {
    console.log('🌱 Seeding database with sample data...\n');

    // Create sample teams
    console.log('Creating teams...');
    const { data: teams, error: teamError } = await supabase
      .from('teams')
      .insert([
        { name: 'Platform Team', description: 'Core platform development' },
        { name: 'Mobile Team', description: 'Mobile app development' },
        { name: 'API Team', description: 'Backend API development' },
      ])
      .select();

    if (teamError) {
      console.error('Error creating teams:', teamError);
      throw teamError;
    }
    console.log(`✅ Created ${teams?.length} teams\n`);

    // Create sample projects
    console.log('Creating projects...');
    const { data: projects, error: projectError } = await supabase
      .from('projects')
      .insert([
        {
          name: 'Customer Portal Redesign',
          jira_key: 'CPR',
          jira_project_id: 'proj_001',
          description: 'Complete redesign of customer-facing portal',
          status: 'active',
          health: 'on_track',
          health_score: 85,
          start_date: '2026-01-01',
          target_date: '2026-03-15',
          total_story_points: 150,
          completed_story_points: 120,
          total_issues: 45,
          completed_issues: 38,
          team_id: teams[0].id,
        },
        {
          name: 'Mobile App V2',
          jira_key: 'MOBILE',
          jira_project_id: 'proj_002',
          description: 'Second version of mobile application',
          status: 'active',
          health: 'at_risk',
          health_score: 62,
          start_date: '2025-12-15',
          target_date: '2026-02-28',
          total_story_points: 100,
          completed_story_points: 45,
          total_issues: 32,
          completed_issues: 15,
          team_id: teams[1].id,
        },
        {
          name: 'API Migration',
          jira_key: 'API',
          jira_project_id: 'proj_003',
          description: 'Migrate legacy APIs to new architecture',
          status: 'active',
          health: 'blocked',
          health_score: 35,
          start_date: '2026-01-10',
          target_date: '2026-04-01',
          total_story_points: 120,
          completed_story_points: 30,
          total_issues: 28,
          completed_issues: 8,
          team_id: teams[2].id,
        },
        {
          name: 'Infrastructure Upgrade',
          jira_key: 'INFRA',
          jira_project_id: 'proj_004',
          description: 'Upgrade cloud infrastructure and monitoring',
          status: 'active',
          health: 'on_track',
          health_score: 78,
          start_date: '2026-01-15',
          target_date: '2026-03-30',
          total_story_points: 80,
          completed_story_points: 55,
          total_issues: 20,
          completed_issues: 14,
          team_id: teams[0].id,
        },
      ])
      .select();

    if (projectError) {
      console.error('Error creating projects:', projectError);
      throw projectError;
    }
    console.log(`✅ Created ${projects?.length} projects\n`);

    console.log('🎉 Database seeded successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Teams: ${teams?.length}`);
    console.log(`   Projects: ${projects?.length}\n`);
    
    console.log('📋 Projects:');
    projects?.forEach(p => {
      const healthEmoji = {
        on_track: '🟢',
        at_risk: '🟡',
        blocked: '🔴',
        unknown: '⚪'
      };
      console.log(`   ${healthEmoji[p.health]} ${p.name} (${p.jira_key}) - ${p.health}`);
    });

    console.log('\n✨ Visit http://localhost:3000/dashboard to see your projects!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
