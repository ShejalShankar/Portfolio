import { TamboTool } from '@tambo-ai/react';
import { z } from 'zod';
import { getGuestbookEntries } from '../../app/db/queries';

// Tool function to fetch guestbook entries
const fetchGuestbookEntries = async (options: { limit?: number }) => {
  const { limit = 10 } = options;

  try {
    const allEntries = await getGuestbookEntries();
    const entries = allEntries.slice(0, limit);

    return {
      entries: entries.map(entry => ({
        id: entry.id.toString(),
        body: entry.body,
        created_by: entry.created_by,
        created_at: entry.created_at.toISOString(),
      })),
      total: allEntries.length,
    };
  } catch (error) {
    console.error('Error fetching guestbook entries:', error);
    return {
      entries: [],
      total: 0,
    };
  }
};

export const guestbookTools: TamboTool[] = [
  {
    name: 'fetchGuestbookEntries',
    description: `Fetches guestbook entries from Akhilesh's portfolio. Returns the most recent entries with author names, messages, and timestamps. 

This tool is useful when users ask about:
- "What's in the guestbook?"
- "Show me guestbook entries"
- "What have people written in the guestbook?"
- "Show me visitor messages"

The guestbook contains messages from visitors who have signed in with GitHub authentication.`,
    tool: fetchGuestbookEntries,
    toolSchema: z
      .function()
      .args(
        z.object({
          limit: z
            .number()
            .optional()
            .describe('Maximum number of entries to fetch (default: 10)'),
        })
      )
      .returns(
        z.object({
          entries: z.array(
            z.object({
              id: z.string(),
              body: z.string(),
              created_by: z.string(),
              created_at: z.string(),
            })
          ),
          total: z.number(),
        })
      ),
  },
];
