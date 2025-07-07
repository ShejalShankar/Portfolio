import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { audio, type, mimeType } = body;

    if (type === 'stop') {
      return NextResponse.json({ type: 'stopped' });
    }

    if (!audio) {
      return NextResponse.json(
        { error: 'No audio data provided' },
        { status: 400 }
      );
    }

    // Convert base64 to Buffer
    const audioBuffer = Buffer.from(audio, 'base64');

    // Check minimum size
    if (audioBuffer.length < 1000) {
      console.log('Audio buffer too small:', audioBuffer.length);
      return NextResponse.json({
        type: 'transcript',
        text: '',
        shouldSubmit: false,
      });
    }

    console.log('Processing audio:', {
      mimeType,
      bufferSize: audioBuffer.length,
    });

    // Create file with appropriate extension
    const fileName = mimeType === 'audio/wav' ? 'audio.wav' : 'audio.webm';

    // Create a File object
    const audioFile = new File([audioBuffer], fileName, {
      type: mimeType || 'audio/wav',
      lastModified: Date.now(),
    });

    try {
      // Use OpenAI SDK
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'en',
        response_format: 'json',
        temperature: 0.2,
      });

      // Only analyze for submission if we have actual text
      const shouldSubmit =
        transcription.text.trim().length > 0
          ? await analyzeTranscriptForSubmission(transcription.text)
          : false;

      return NextResponse.json({
        type: 'transcript',
        text: transcription.text,
        shouldSubmit,
      });
    } catch (openaiError: any) {
      console.error('OpenAI API error:', openaiError);

      // Handle specific errors
      if (openaiError.message?.includes('too short')) {
        return NextResponse.json({
          type: 'transcript',
          text: '',
          shouldSubmit: false,
        });
      }

      throw openaiError;
    }
  } catch (error: any) {
    console.error('Speech-to-text error:', error);

    // Don't show errors for expected cases
    if (
      error.message?.includes('too short') ||
      error.message?.includes('too small')
    ) {
      return NextResponse.json({
        type: 'transcript',
        text: '',
        shouldSubmit: false,
      });
    }

    return NextResponse.json(
      {
        error: 'Failed to process audio',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

async function analyzeTranscriptForSubmission(
  transcript: string
): Promise<boolean> {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a decision-making engine embedded inside a continuous chat transcript analyzer. Your job is to determine whether the current message is ready to be submitted in a chat interface. This function is run repeatedly, and each time it receives the current version of the user's typed message.

Your goal is to return a boolean value:
- Return "true" if the message is ready for submission (i.e., the user is done typing and the message is complete).
- Return "false" if the message is still in progress and should not be submitted yet.

You are NOT responding to the user. You are only making a decision based on message analysis.

---

### MESSAGE SUBMISSION RULES:

A message is ready for submission (return "true") when **all of the following are true**:

1. **Completeness**:
   - The message contains a complete thought, question, or command.
   - It is not grammatically or logically incomplete.

2. **Ending Punctuation** (Strong signal):
   - The message ends with ".", "?", or "!" AND is not followed by any additional content or sentence fragments.
   - It may optionally include emojis or polite sign-offs ("thanks!", "please!", "that's it.").

3. **Intent to Submit** (Even without punctuation):
   - The message starts with or is structured as a command or clear instruction:
     - Examples: "Summarize this...", "Create a table...", "Explain this part...", "Give me 5 ideas...".
   - OR the message ends in a clear prompt to the assistant like:
     - "What do you think", "Can you help with this", "Does that make sense".

4. **Length Threshold**:
   - If the message has **more than 3 words**, it may be considered for submission.
   - Short phrases like "ok thanks" or "yes please" can still be valid if they meet other criteria (punctuation or closure indicators).

5. **No Signs of Mid-Edit**:
   - The message does not end with conjunctions like "and", "but", "so", "because".
   - It does not look like it was cut off, e.g., ending in "that's why I".

6. **Behave like a human and think like a human**:
   - Read the message as a human would, and determine if it is a complete thought.
   - If a human would not send the message, it is not ready for submission.
   - If a human would send the message, it is ready for submission.

---

### NEVER submit if:
- The message is clearly incomplete or mid-sentence.
- The user seems to be typing additional thoughts (e.g., "I think we should", "And then I").
- It ends with ellipsis ("...") or a comma ",".
- It contains opening brackets/quotes with no closing counterpart.
- The message is a single interjection (e.g., "Hmm", "Uhh", "So...").
- It looks like the user is still thinking or drafting.

---

### EDGE CASE GUIDANCE:

- If the message is a question or command and ends with a newline ("\n") or is followed by a brief pause, it is **likely ready** for submission.
- Be conservative: when in doubt, assume the user is still typing and return **false**.

---

Return ONLY "true" or "false" based on whether the message is ready for submission.
Do not include explanations or extra output.

The analysis should be accurate, cautious, and context-aware.`,
        },
        {
          role: 'user',
          content: transcript,
        },
      ],
      temperature: 0.3,
      max_tokens: 10,
    });

    const result = response.choices[0]?.message?.content?.trim().toLowerCase();
    console.log('Analysis result:', result);
    return result === 'true';
  } catch (error) {
    console.error('Error analyzing transcript:', error);
    return false;
  }
}
