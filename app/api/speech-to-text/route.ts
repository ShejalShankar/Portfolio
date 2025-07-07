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

    console.log('Received audio:', {
      mimeType,
      bufferSize: audioBuffer.length,
      firstBytes: audioBuffer.slice(0, 4).toString('hex'),
    });

    // Determine file extension based on mime type
    let fileExtension = 'webm';
    if (mimeType?.includes('wav')) {
      fileExtension = 'wav';
    } else if (mimeType?.includes('mp3')) {
      fileExtension = 'mp3';
    } else if (mimeType?.includes('mp4')) {
      fileExtension = 'm4a';
    }

    // Create a File object with proper type and extension
    const audioFile = new File([audioBuffer], `audio.${fileExtension}`, {
      type: mimeType || 'audio/webm',
      lastModified: Date.now(),
    });

    try {
      // Use OpenAI SDK
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'en',
        response_format: 'json',
      });

      // Analyze if we should submit
      const shouldSubmit = await analyzeTranscriptForSubmission(
        transcription.text
      );

      return NextResponse.json({
        type: 'transcript',
        text: transcription.text,
        shouldSubmit,
      });
    } catch (openaiError: any) {
      console.error('OpenAI error details:', {
        error: openaiError,
        message: openaiError.message,
        response: openaiError.response?.data,
      });
      throw openaiError;
    }
  } catch (error: any) {
    console.error('Speech-to-text error:', error);
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
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a smart assistant that determines when a user has finished speaking and wants to submit their message. 
          
Analyze the transcript and return "true" if the user seems to have completed their thought and wants to send it, or "false" if they seem to be pausing or still thinking.

Consider these factors:
- Complete sentences ending with periods or question marks likely indicate completion
- Phrases like "send that", "submit", "that's all", "send it" indicate explicit submission intent
- Long pauses or trailing off (indicated by "..." or incomplete sentences) suggest they're still thinking
- Questions typically indicate completion
- Commands or requests are usually complete thoughts

Respond with only "true" or "false".`,
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
    return result === 'true';
  } catch (error) {
    console.error('Error analyzing transcript:', error);
    return false; // Default to not submitting on error
  }
}
