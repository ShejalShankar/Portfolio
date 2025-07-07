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

IMPORTANT: After using this tool, you MUST:
1. First provide a CONVERSATIONAL, PERSUASIVE response showing enthusiasm and making connections to your experience
2. Then generate the JobAnalysisCard component to visualize the match
3. End with engaging questions or call-to-action to continue the conversation

The tool:
- Fetches the webpage content
- Detects if it's a job posting
- Extracts key information like job title, company, requirements, skills, location, etc.
- Matches requirements against Akhilesh's skills and experience
- Calculates a match score based on skill overlap, experience relevance, and project demonstrations
- Provides specific talking points for a tailored pitch

When responding, follow this pattern:
1. Show genuine excitement about specific aspects of the role
2. Draw 2-3 clear connections between requirements and your specific projects/experience
3. Use concrete numbers and results (e.g., "improved performance by 40%")
4. Address any gaps honestly but positively
5. Generate the JobAnalysisCard to visualize the match
6. End with an engaging question about the team/role/company

Example response structure:
"Just took a look at that [job title] role at [company] - this is actually really exciting! 

I see you're looking for someone with [specific skills]. I've been working with those exact technologies at [company/project]. Actually, just last month I [specific achievement with numbers].

What really caught my eye is [specific requirement] - that's exactly what I did when building [project]. We [specific result].

[Generate JobAnalysisCard component here]

I noticed you mentioned [interesting aspect]. I'd love to hear more about how your team approaches that - I've got some ideas from my work on [relevant experience].

Quick question - [engaging question about the role/company/team]?"

Remember: Be conversational, specific, and persuasive - don't just show the component!`,
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
              missingSkills: z.array(z.string()).optional(),
              recommendations: z.array(z.string()).optional(),
            })
            .optional()
            .describe('Detailed analysis for job postings'),
        })
      ),
  },
];
