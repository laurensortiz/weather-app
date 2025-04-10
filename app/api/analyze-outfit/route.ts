import { NextResponse } from 'next/server';
import { verifyToken } from '../auth/auth';
import { executeQuery } from '../db/config';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: Request) {
  try {
    // Verify authentication
    const token = request.headers.get('cookie')?.split('token=')[1]?.split(';')[0];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { userId } = verifyToken(token);
    
    // Get the image URL and weather data from the request
    const { imageUrl, temperature, weatherDescription } = await request.json();
    
    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }
    
    // Use OpenAI to analyze the outfit
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: "You are a fashion expert. Analyze the outfit in the image and determine if it's appropriate for the given weather conditions. Consider the temperature and weather description. Provide specific feedback about what works and what doesn't, and suggest improvements if needed."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this outfit for the following weather conditions: Temperature: ${temperature}°C, Weather: ${weatherDescription}. Is this outfit appropriate?`
            },
            {
              type: "image_url",
              image_url: imageUrl
            }
          ]
        }
      ],
      max_tokens: 300
    });
    
    const analysis = response.choices[0]?.message?.content || 'Unable to analyze outfit';
    
    // Determine if the outfit is appropriate
    const isAppropriate = analysis.toLowerCase().includes('appropriate') || 
                         analysis.toLowerCase().includes('suitable') ||
                         !analysis.toLowerCase().includes('not appropriate') &&
                         !analysis.toLowerCase().includes('not suitable');
    
    // Save the analysis to the database
    await executeQuery(
      'UPDATE user_outfits SET is_appropriate = $1, feedback = $2 WHERE user_id = $3 AND image_url = $4',
      [isAppropriate, analysis, userId, imageUrl]
    );
    
    return NextResponse.json({ 
      isAppropriate,
      feedback: analysis
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze outfit' }, { status: 500 });
  }
} 