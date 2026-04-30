// Vercel Serverless Function — Claude API proxy
// CORS sorununu çözer: tarayıcı doğrudan Anthropic'e değil, bu endpoint'e istek atar.

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.VITE_CLAUDE_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'CLAUDE_API_KEY ortam değişkeni tanımlı değil' })
  }

  const { prompt } = req.body ?? {}
  if (!prompt) {
    return res.status(400).json({ error: 'prompt alanı zorunludur' })
  }

  let anthropicRes
  try {
    anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
  } catch (err) {
    console.error('Anthropic fetch hatası:', err)
    return res.status(502).json({ error: `Anthropic API bağlantı hatası: ${err.message}` })
  }

  const data = await anthropicRes.json()

  if (!anthropicRes.ok) {
    console.error('Anthropic hata yanıtı:', data)
    return res.status(anthropicRes.status).json(data)
  }

  return res.status(200).json(data)
}
