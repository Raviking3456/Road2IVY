const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  let essay;
  try {
    const body = JSON.parse(event.body);
    essay = body.essay;
    if (!essay || essay.length < 50) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Essay is too short.' })
      };
    }
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid request.' })
    };
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  if (!OPENAI_API_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'OpenAI API key not set.' })
    };
  }

  const prompt = `You are an Ivy League admissions officer. Read the following college admissions essay and provide ONLY a JSON object with the following keys: score, strengths, weaknesses, suggestions. Do not include any explanation or text outside the JSON. Essay:\n${essay}`;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are an Ivy League admissions officer.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 900,
        temperature: 0.7
      })
    });
    const openaiData = await openaiRes.json();
    if (!openaiData.choices || !openaiData.choices[0] || !openaiData.choices[0].message) {
      throw new Error('No response from OpenAI');
    }
    let aiText = openaiData.choices[0].message.content;
    console.log('AI raw response:', aiText); // For debugging
    // Try to parse JSON from AI response
    let result;
    try {
      result = JSON.parse(aiText);
    } catch (e) {
      // Try to extract JSON from text
      const match = aiText.match(/\{[\s\S]*\}/);
      if (match) {
        result = JSON.parse(match[0]);
      } else {
        throw new Error('AI did not return valid JSON');
      }
    }
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'AI error: ' + err.message })
    };
  }
};
