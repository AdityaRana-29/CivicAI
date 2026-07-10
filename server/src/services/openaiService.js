// OpenAI API wrapper for classification, severity, embeddings, and summarization

const apiKey = process.env.OPENAI_API_KEY;

/**
 * Classify issue from image
 * @param {string} imageUrl
 * @returns {Promise<{issueType: string, confidence: number}>}
 */
const classifyIssue = async (imageUrl) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at classifying civic infrastructure issues from images. Respond ONLY with valid JSON: {"issueType": "one of [pothole, broken_streetlight, overflowing_garbage, fallen_tree, water_leakage, damaged_road, other]", "confidence": 0.0-1.0}',
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Classify this civic infrastructure issue image.' },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 100,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const parsed = JSON.parse(content);

    return {
      issueType: parsed.issueType || 'other',
      confidence: parsed.confidence || 0.0,
    };
  } catch (error) {
    console.error('Classification error:', error.message);
    return { issueType: 'other', confidence: 0.0 };
  }
};

/**
 * Estimate severity
 */
const estimateSeverity = async (imageUrl, issueType) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at assessing civic infrastructure issue severity. Respond ONLY with valid JSON: {"severityLevel": "one of [low, medium, high, critical]"}',
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `This is a ${issueType}. Rate its severity as low, medium, high, or critical.`,
              },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        max_tokens: 50,
        temperature: 0.3,
      }),
    });

    const data = await response.json();
    const content = data.choices[0].message.content.trim();
    const parsed = JSON.parse(content);

    return parsed.severityLevel || 'low';
  } catch (error) {
    console.error('Severity estimation error:', error.message);
    return 'low';
  }
};

/**
 * Generate summary
 */
const generateSummary = async (issueType, severity, address, description = '') => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are summarizing civic infrastructure issue reports. Keep it under 100 words, plain language.',
          },
          {
            role: 'user',
            content: `Summarize this report: Type: ${issueType}, Severity: ${severity}, Location: ${address}, Details: ${description}`,
          },
        ],
        max_tokens: 150,
        temperature: 0.5,
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Summary generation error:', error.message);
    return `A ${severity} ${issueType} was reported at ${address}.`;
  }
};

/**
 * Generate text embedding
 */
const generateEmbedding = async (text) => {
  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: text,
      }),
    });

    const data = await response.json();
    return data.data[0].embedding; // 1536-dim array
  } catch (error) {
    console.error('Embedding generation error:', error.message);
    return [];
  }
};

module.exports = { classifyIssue, estimateSeverity, generateSummary, generateEmbedding };
