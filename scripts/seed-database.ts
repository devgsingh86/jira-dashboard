-- Insert teams
INSERT INTO teams (name, description) VALUES
  ('Platform Team', 'Core platform development'),
  ('Mobile Team', 'Mobile app development'),
  ('API Team', 'Backend API development');

-- Insert projects (replace team_id with actual UUIDs from teams table)
INSERT INTO projects (
  name, jira_key, jira_project_id, description, status, health, health_score,
  start_date, target_date, total_story_points, completed_story_points,
  total_issues, completed_issues, team_id
) VALUES
  (
    'Customer Portal Redesign',
    'CPR',
    'proj_001',
    'Complete redesign of customer-facing portal',
    'active',
    'on_track',
    85,
    '2026-01-01',
    '2026-03-15',
    150,
    120,
    45,
    38,
    (SELECT id FROM teams WHERE name = 'Platform Team')
  ),
  (
    'Mobile App V2',
    'MOBILE',
    'proj_002',
    'Second version of mobile application',
    'active',
    'at_risk',
    62,
    '2025-12-15',
    '2026-02-28',
    100,
    45,
    32,
    15,
    (SELECT id FROM teams WHERE name = 'Mobile Team')
  ),
  (
    'API Migration',
    'API',
    'proj_003',
    'Migrate legacy APIs to new architecture',
    'active',
    'blocked',
    35,
    '2026-01-10',
    '2026-04-01',
    120,
    30,
    28,
    8,
    (SELECT id FROM teams WHERE name = 'API Team')
  ),
  (
    'Infrastructure Upgrade',
    'INFRA',
    'proj_004',
    'Upgrade cloud infrastructure and monitoring',
    'active',
    'on_track',
    78,
    '2026-01-15',
    '2026-03-30',
    80,
    55,
    20,
    14,
    (SELECT id FROM teams WHERE name = 'Platform Team')
  );
