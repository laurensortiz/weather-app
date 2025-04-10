import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export async function POST(request: Request) {
  try {
    const { description } = await request.json();
    
    if (!description) {
      return NextResponse.json({ error: 'Location description is required' }, { status: 400 });
    }

    // Using OpenAI to interpret the location description
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
          role: "system", 
          content: "You are a location recognition assistant. Extract the most likely city and country name from the given description. Respond with ONLY the city name followed by a comma and the country/state. For example: 'New York, USA' or 'Paris, France'. If you can't determine a location, respond with 'Unknown location'." 
        },
        { 
          role: "user", 
          content: `Identify the location described by: "${description}"` 
        }
      ],
      temperature: 0.3,
      max_tokens: 50,
    });

    // Extract the location from the AI response
    const locationText = response.choices[0]?.message?.content?.trim() || 'Unknown location';
    
    // Check if we got a valid location
    if (locationText === 'Unknown location') {
      return NextResponse.json({ error: 'Could not determine location from description' }, { status: 400 });
    }

    return NextResponse.json({ location: locationText });
  } catch (error) {
    console.error('Error processing location description:', error);
    return NextResponse.json({ error: 'Failed to process location description' }, { status: 500 });
  }
} 