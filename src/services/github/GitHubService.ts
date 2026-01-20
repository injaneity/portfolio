import { Octokit } from '@octokit/rest';

export interface PageMetadata {
  title: string;
  slug: string;
  path: string;
  section: 'projects' | 'experience' | 'root';
  sha: string;
}

export interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
}

class GitHubService {
  private octokit: Octokit | null = null;
  private unauthenticatedOctokit: Octokit;
  private config: GitHubConfig;

  constructor() {
    this.config = {
      owner: import.meta.env.VITE_GITHUB_OWNER || '',
      repo: import.meta.env.VITE_GITHUB_REPO || '',
      branch: import.meta.env.VITE_GITHUB_BRANCH || 'main',
    };

    // Create unauthenticated instance for read-only operations
    this.unauthenticatedOctokit = new Octokit();
  }

  /**
   * Initialize the service with a GitHub PAT
   */
  authenticate(token: string): void {
    this.octokit = new Octokit({ auth: token });
  }

  /**
   * Check if the service is authenticated
   */
  isAuthenticated(): boolean {
    return this.octokit !== null;
  }

  /**
   * Get the appropriate Octokit instance (authenticated if available, otherwise unauthenticated)
   */
  private getOctokit(): Octokit {
    return this.octokit || this.unauthenticatedOctokit;
  }

  /**
   * Validate the PAT by making a test API call
   */
  async validateToken(token: string): Promise<{ valid: boolean; user?: any; error?: string }> {
    try {
      const testOctokit = new Octokit({ auth: token });
      const { data: user } = await testOctokit.users.getAuthenticated();
      return { valid: true, user };
    } catch (error: any) {
      return {
        valid: false,
        error: error.message || 'Invalid token'
      };
    }
  }

  /**
   * Get content from a file in the repository
   * Works for both authenticated and unauthenticated users (for public repos)
   */
  async getContent(path: string): Promise<string> {
    const octokit = this.getOctokit();

    try {
      const { data } = await octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        ref: this.config.branch,
      });

      if ('content' in data && data.type === 'file') {
        // Decode base64 content
        return atob(data.content);
      }

      throw new Error('Path does not point to a file');
    } catch (error: any) {
      if (error.status === 404) {
        throw new Error(`File not found: ${path}`);
      }
      throw error;
    }
  }

  /**
   * Update content of a file (create or modify)
   */
  async updateContent(
    path: string,
    content: string,
    message: string,
    sha?: string
  ): Promise<void> {
    if (!this.octokit) {
      throw new Error('Not authenticated. Please provide a GitHub PAT.');
    }

    try {
      // Get the current file SHA if not provided
      let fileSha = sha;
      if (!fileSha) {
        try {
          const { data } = await this.octokit.repos.getContent({
            owner: this.config.owner,
            repo: this.config.repo,
            path,
            ref: this.config.branch,
          });
          if ('sha' in data) {
            fileSha = data.sha;
          }
        } catch (error: any) {
          // File doesn't exist, that's okay for creation
          if (error.status !== 404) {
            throw error;
          }
        }
      }

      // Encode content to base64
      const encodedContent = btoa(
        unescape(encodeURIComponent(content))
      );

      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        message,
        content: encodedContent,
        branch: this.config.branch,
        ...(fileSha && { sha: fileSha }),
      });
    } catch (error: any) {
      console.error('Error updating content:', error);
      throw new Error(`Failed to update ${path}: ${error.message}`);
    }
  }

  /**
   * List all markdown pages in the content directory
   * Works for both authenticated and unauthenticated users (for public repos)
   */
  async listPages(): Promise<PageMetadata[]> {
    const octokit = this.getOctokit();

    try {
      const pages: PageMetadata[] = [];

      // Get all content from src/content
      const { data } = await octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path: 'src/content',
        ref: this.config.branch,
      });

      if (!Array.isArray(data)) {
        return pages;
      }

      // Process each item
      for (const item of data) {
        if (item.type === 'file' && item.name.endsWith('.md')) {
          // Root level markdown files
          pages.push({
            title: this.formatTitle(item.name),
            slug: item.name.replace('.md', ''),
            path: item.path,
            section: 'root',
            sha: item.sha,
          });
        } else if (item.type === 'dir') {
          // Check subdirectories (projects, experience)
          const subdir = await octokit.repos.getContent({
            owner: this.config.owner,
            repo: this.config.repo,
            path: item.path,
            ref: this.config.branch,
          });

          if (Array.isArray(subdir.data)) {
            for (const file of subdir.data) {
              if (file.type === 'file' && file.name.endsWith('.md')) {
                const section = item.name as 'projects' | 'experience';
                pages.push({
                  title: this.formatTitle(file.name),
                  slug: file.name.replace('.md', ''),
                  path: file.path,
                  section,
                  sha: file.sha,
                });
              }
            }
          }
        }
      }

      return pages;
    } catch (error: any) {
      if (error.status === 404) {
        // Content directory doesn't exist yet
        return [];
      }
      console.error('Error listing pages:', error);
      throw new Error(`Failed to list pages: ${error.message}`);
    }
  }

  /**
   * Delete a page
   */
  async deletePage(path: string, sha: string): Promise<void> {
    if (!this.octokit) {
      throw new Error('Not authenticated. Please provide a GitHub PAT.');
    }

    try {
      await this.octokit.repos.deleteFile({
        owner: this.config.owner,
        repo: this.config.repo,
        path,
        message: `Delete page: ${path}`,
        sha,
        branch: this.config.branch,
      });
    } catch (error: any) {
      console.error('Error deleting page:', error);
      throw new Error(`Failed to delete ${path}: ${error.message}`);
    }
  }

  /**
   * Format a filename into a readable title
   */
  private formatTitle(filename: string): string {
    return filename
      .replace('.md', '')
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
}

export const githubService = new GitHubService();
