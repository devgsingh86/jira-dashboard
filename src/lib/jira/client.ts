interface JiraClientConfig {
  accessToken: string;
  cloudId: string;
}

export class JiraClient {
  private accessToken: string;
  private cloudId: string;
  private baseUrl: string;

  constructor(config: JiraClientConfig) {
    this.accessToken = config.accessToken;
    this.cloudId = config.cloudId;
    this.baseUrl = `https://api.atlassian.com/ex/jira/${config.cloudId}`;
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Jira API error (${response.status}):`, errorText);
        throw new Error(`Jira API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('Jira API request failed:', error);
      throw error;
    }
  }

  async getProjects() {
    return this.fetch('/rest/api/3/project/search?maxResults=1000');
  }

  async getProject(projectKey: string) {
    return this.fetch(`/rest/api/3/project/${projectKey}`);
  }

  async getIssues(jql: string, maxResults = 100) {
    // Use the new /rest/api/3/search/jql endpoint (not deprecated)
    const body = {
      jql,
      maxResults,
      fields: [
        'summary',
        'status',
        'assignee',
        'reporter',
        'created',
        'updated',
        'resolutiondate',
        'duedate',
        'priority',
        'issuetype',
        'labels',
        'components',
        'customfield_10016', // Story points
      ],
    };

    // Changed endpoint from /search to /search/jql
    return this.fetch('/rest/api/3/search/jql', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async getSprints(boardId: string) {
    return this.fetch(`/rest/agile/1.0/board/${boardId}/sprint?maxResults=1000`);
  }

  async getBoard(projectKey: string) {
    return this.fetch(`/rest/agile/1.0/board?projectKeyOrId=${projectKey}`);
  }

  async testConnection() {
    try {
      const response = await this.fetch('/rest/api/3/myself');
      return { success: true, user: response };
    } catch (error) {
      return { success: false, error };
    }
  }
}

export function getJiraClientFromCookies(cookies: {
  get: (name: string) => { value: string } | undefined;
}): JiraClient | null {
  const accessToken = cookies.get('jira_access_token')?.value;
  const cloudId = cookies.get('jira_cloud_id')?.value;

  if (!accessToken || !cloudId) {
    return null;
  }

  return new JiraClient({ accessToken, cloudId });
}
