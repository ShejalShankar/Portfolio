import { TamboTool } from '@tambo-ai/react';
import { z } from 'zod';

// Tool function to scrape job postings
const scrapeJobPosting = async (url: string) => {
  try {
    const response = await fetch('/api/job-scraper', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to scrape webpage');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error scraping job posting:', error);
    throw error;
  }
};

export const jobScraperTools: TamboTool[] = [
  {
    name: 'scrapeJobPosting',
    description: `Analyzes a webpage URL to extract and summarize job posting information. This tool is automatically triggered when a user pastes a URL in the chat.

The tool:
- Fetches the webpage content
- Detects if it's a job posting
- Extracts key information like job title, company, requirements, skills, location, etc.
- Matches requirements against Akhilesh's skills and experience
- Calculates a match score based on skill overlap, experience relevance, and project demonstrations
- Provides specific talking points for a tailored pitch

Perfect for when recruiters paste job links and want to know if Akhilesh is a good fit for the role.

Example usage: When a recruiter says "Check out this role: https://company.com/jobs/senior-developer"`,
    tool: scrapeJobPosting,
    toolSchema: z
      .function()
      .args(z.string().url().describe('The URL of the webpage to analyze'))
      .returns(
        z.object({
          url: z.string(),
          isJobPosting: z
            .boolean()
            .describe('Whether the URL appears to be a job posting'),
          title: z.string().describe('The page title'),
          summary: z.string().optional().describe('Summary for non-job pages'),
          analysis: z
            .object({
              jobTitle: z.string(),
              company: z.string(),
              location: z.string().optional(),
              experienceLevel: z.string().optional(),
              requiredSkills: z.array(z.string()),
              matchingSkills: z.array(z.string()),
              keyResponsibilities: z.array(z.string()),
              relevantProjects: z.array(
                z.object({
                  name: z.string(),
                  relevance: z.string(),
                })
              ),
              relevantExperience: z.array(z.string()),
              matchScore: z.number().min(0).max(100),
              summary: z.string(),
              talkingPoints: z.array(z.string()),
            })
            .optional()
            .describe('Detailed analysis for job postings'),
        })
      ),
  },
];
