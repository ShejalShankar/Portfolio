import FirecrawlApp from '@mendable/firecrawl-js';
import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { z } from 'zod';
import speakingAgentData from '../../../public/speaking_agent_data.json';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const firecrawl = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY,
});

export const runtime = 'nodejs';

// Define schema for job posting extraction
const JobPostingSchema = z.object({
  jobTitle: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  experienceLevel: z.string().optional(),
  requiredSkills: z.array(z.string()).optional(),
  keyResponsibilities: z.array(z.string()).optional(),
  salary: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  applicationDeadline: z.string().optional(),
  jobType: z.string().optional(), // full-time, part-time, contract, etc.
  remoteOptions: z.string().optional(),
});

// Helper function to detect if URL is likely a job posting
function isLikelyJobPosting(url: string, content: string): boolean {
  const jobUrlPatterns = [
    /jobs?/i,
    /careers?/i,
    /opportunities/i,
    /positions?/i,
    /openings?/i,
    /hiring/i,
    /recruit/i,
    /vacancy/i,
    /employment/i,
    /lever\.co/i,
    /greenhouse\.io/i,
    /workday\.com/i,
    /taleo\.net/i,
    /indeed\.com/i,
    /linkedin\.com.*\/jobs/i,
    /glassdoor\.com/i,
  ];

  const jobContentKeywords = [
    'job description',
    'responsibilities',
    'requirements',
    'qualifications',
    'salary',
    'benefits',
    'apply now',
    'submit application',
    'position',
    'role',
    'experience required',
    'skills',
    'education',
    'location',
    'job type',
    'full-time',
    'part-time',
    'contract',
    'remote',
  ];

  // Check URL patterns
  const urlMatch = jobUrlPatterns.some(pattern => pattern.test(url));

  // Check content keywords (at least 3 keywords present)
  const contentLower = content.toLowerCase();
  const keywordMatches = jobContentKeywords.filter(keyword =>
    contentLower.includes(keyword)
  ).length;

  return urlMatch || keywordMatches >= 3;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'No URL provided' }, { status: 400 });
    }

    // Validate URL
    let validatedUrl: URL;
    try {
      validatedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      );
    }

    console.log('Scraping URL with Firecrawl:', validatedUrl.toString());

    // First, do a quick scrape to check if it's a job posting
    const initialScrape = await firecrawl.scrapeUrl(validatedUrl.toString(), {
      formats: ['markdown'],
      onlyMainContent: true, // Focus on main content
      timeout: 30000, // 30 second timeout
    });

    if (!initialScrape.success || !initialScrape.markdown) {
      return NextResponse.json(
        { error: 'Failed to scrape webpage' },
        { status: 500 }
      );
    }

    const isJobPosting = isLikelyJobPosting(url, initialScrape.markdown);

    if (isJobPosting) {
      // If it's a job posting, scrape again with structured data extraction
      const jobScrape = await firecrawl.scrapeUrl(validatedUrl.toString(), {
        formats: ['markdown', 'json'],
        jsonOptions: {
          schema: JobPostingSchema,
        },
        onlyMainContent: false,
        timeout: 30000,
      });

      if (!jobScrape.success) {
        return NextResponse.json(
          { error: 'Failed to extract job posting data' },
          { status: 500 }
        );
      }

      // Prepare Akhilesh's profile for matching
      const akhileshProfile = {
        skills: [
          ...speakingAgentData.techStack.Languages,
          ...speakingAgentData.techStack.Frameworks,
          ...speakingAgentData.techStack.Tools,
          ...speakingAgentData.techStack.AI,
          ...speakingAgentData.techStack.Other,
        ].map(skill => skill.toLowerCase()),
        experience: speakingAgentData.experience,
        projects: speakingAgentData.projects,
        currentRoles: speakingAgentData.current,
      };

      // Use GPT to analyze the match with enhanced context
      const systemPrompt = `You are an expert at analyzing job postings and matching them to Akhilesh's profile.
         
         Akhilesh's Profile:
         - Skills: ${JSON.stringify(akhileshProfile.skills)}
         - Current Roles: ${JSON.stringify(akhileshProfile.currentRoles)}
         - Key Projects: ${JSON.stringify(akhileshProfile.projects)}
         - Experience: ${JSON.stringify(akhileshProfile.experience)}
         
         You have access to:
         1. The structured job data extracted by Firecrawl
         2. The full markdown content of the job posting
         
         Analyze the job posting and provide:
         1. A comprehensive match analysis
         2. Specific matching points between the job and Akhilesh's experience
         3. Projects that demonstrate relevant experience
         4. A match percentage (0-100) based on:
            - Skill overlap (40%)
            - Experience relevance (30%)
            - Project demonstrations (20%)
            - Other factors like location, culture fit (10%)
         5. Talking points for an interview or application
         
         Be specific about which of Akhilesh's projects and experiences match the requirements.
         
         Return a JSON object with this structure:
         {
           "jobTitle": "string",
           "company": "string",
           "location": "string",
           "experienceLevel": "string",
           "requiredSkills": ["array", "of", "skills"],
           "matchingSkills": ["skills", "that", "match"],
           "keyResponsibilities": ["array", "of", "responsibilities"],
           "relevantProjects": [{"name": "project name", "relevance": "why it's relevant"}],
           "relevantExperience": ["specific", "experiences", "that", "match"],
           "matchScore": number,
           "summary": "brief summary",
           "talkingPoints": ["specific", "points", "to", "mention", "in", "conversation"],
           "missingSkills": ["skills", "not", "in", "profile"],
           "recommendations": ["suggestions", "for", "application"]
         }`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: `Please analyze this job posting:
            
            Structured Data:
            ${JSON.stringify(jobScrape.json, null, 2)}
            
            Full Content:
            ${jobScrape.markdown}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      });

      const analysis = JSON.parse(
        completion.choices[0]?.message?.content || '{}'
      );

      return NextResponse.json({
        url,
        isJobPosting: true,
        title: jobScrape.metadata?.title || analysis.jobTitle || 'Job Posting',
        structuredData: jobScrape.json,
        analysis,
        metadata: jobScrape.metadata,
      });
    } else {
      // For non-job pages, return a simple summary
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'Analyze this webpage and provide a brief summary of its content.',
          },
          {
            role: 'user',
            content: `Please analyze this webpage content:\n\n${initialScrape.markdown}`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      });

      return NextResponse.json({
        url,
        isJobPosting: false,
        summary: completion.choices[0]?.message?.content,
        title: initialScrape.metadata?.title || 'No title found',
        metadata: initialScrape.metadata,
      });
    }
  } catch (error: any) {
    console.error('Job scraping error:', error);

    // Provide more specific error messages
    if (error.message?.includes('FIRECRAWL_API_KEY')) {
      return NextResponse.json(
        {
          error: 'Firecrawl API key not configured',
          details: 'Please add FIRECRAWL_API_KEY to your environment variables',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to scrape webpage',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
