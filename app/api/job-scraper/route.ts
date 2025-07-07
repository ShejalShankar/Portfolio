import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import speakingAgentData from '../../../public/speaking_agent_data.json';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'nodejs';

// Helper function to extract text content from HTML
function extractTextContent(html: string): string {
  // Remove script and style elements
  let text = html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");

  // Clean up whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

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

    // Fetch the webpage
    const response = await fetch(validatedUrl.toString(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch webpage: ${response.statusText}` },
        { status: response.status }
      );
    }

    const html = await response.text();
    const textContent = extractTextContent(html);

    // Limit text content to avoid token limits
    const maxLength = 8000;
    const truncatedContent =
      textContent.length > maxLength
        ? textContent.substring(0, maxLength) + '...'
        : textContent;

    // Check if it's likely a job posting
    const isJobPosting = isLikelyJobPosting(url, textContent);

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

    // Use GPT to analyze with specific matching focus
    const systemPrompt = isJobPosting
      ? `You are an expert at analyzing job postings and matching them to Akhilesh's profile.
         
         Akhilesh's Profile:
         - Skills: ${JSON.stringify(akhileshProfile.skills)}
         - Current Roles: ${JSON.stringify(akhileshProfile.currentRoles)}
         - Key Projects: ${speakingAgentData.projects.map(p => p.name).join(', ')}
         
         Analyze the job posting and provide:
         1. Job title and company
         2. Required skills (list all technical skills mentioned)
         3. Experience level needed
         4. Key responsibilities
         5. Location/remote options
         6. Specific matching points between the job and Akhilesh's experience
         7. Projects that demonstrate relevant experience
         8. A match percentage (0-100) based on:
            - Skill overlap (40%)
            - Experience relevance (30%)
            - Project demonstrations (20%)
            - Other factors like location, culture fit (10%)
         
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
           "talkingPoints": ["specific", "points", "to", "mention", "in", "conversation"]
         }`
      : `Analyze this webpage and provide a brief summary of its content.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Please analyze this webpage content:\n\nURL: ${url}\n\nContent:\n${truncatedContent}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 1500,
      response_format: isJobPosting ? { type: 'json_object' } : undefined,
    });

    const analysisContent = completion.choices[0]?.message?.content || '{}';

    if (isJobPosting) {
      try {
        const analysis = JSON.parse(analysisContent);

        return NextResponse.json({
          url,
          isJobPosting: true,
          title:
            html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] ||
            analysis.jobTitle,
          analysis,
        });
      } catch (e) {
        // Fallback if JSON parsing fails
        return NextResponse.json({
          url,
          isJobPosting: true,
          summary: analysisContent,
          title:
            html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || 'Job Posting',
        });
      }
    } else {
      return NextResponse.json({
        url,
        isJobPosting: false,
        summary: analysisContent,
        title:
          html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || 'No title found',
      });
    }
  } catch (error: any) {
    console.error('Web scraping error:', error);
    return NextResponse.json(
      {
        error: 'Failed to scrape webpage',
        details: error.message,
      },
      { status: 500 }
    );
  }
}
