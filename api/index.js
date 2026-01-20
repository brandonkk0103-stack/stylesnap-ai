require('dotenv').config();
const Replicate = require('replicate');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Initialize Replicate
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// In-memory user credits
const userCredits = new Map();

// Style prompts
const stylePrompts = {
  'western-animation': 'in the style of modern western animation, vibrant colors, clean lines, expressive characters, Disney Pixar style',
  'japanese-anime': 'anime art style, detailed eyes, manga-inspired, dynamic composition, cel-shaded, Studio Ghibli quality',
  'korean-manhwa': 'Korean webtoon art style, soft shading, modern aesthetic, detailed linework, digital painting',
  'comic-book': 'American comic book style, bold outlines, halftone dots, dynamic action poses, Marvel DC style',
  'cartoon-cute': 'cute chibi style, kawaii aesthetic, pastel colors, simplified features, adorable, big eyes',
  'vintage-cartoon': 'retro cartoon style, 1930s animation aesthetic, rubber hose animation, classic Disney'
};

// Size configs
const sizeConfigs = {
  'standard': { width: 1024, height: 1024, credits: 1 },
  'large': { width: 1024, height: 1536, credits: 2 },
  'premium': { width: 1024, height: 1024, credits: 3, hd: true }
};

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Health check
    if (req.url === '/api/health' && req.method === 'GET') {
      return res.json({ status: 'ok', timestamp: new Date().toISOString() });
    }

    // Get credits
    if (req.url.startsWith('/api/credits/') && req.method === 'GET') {
      const userId = req.url.split('/').pop();
      const credits = userCredits.get(userId) || 0;
      return res.json({ credits });
    }

    // Generate text to image
    if (req.url === '/api/generate/text' && req.method === 'POST') {
      const { userId, prompt, style, size } = req.body;
      
      if (!userId || !prompt || !style || !size) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const userCred = userCredits.get(userId) || 0;
      const requiredCredits = sizeConfigs[size]?.credits || 1;

      if (userCred < requiredCredits) {
        return res.status(402).json({ 
          error: 'Insufficient credits',
          required: requiredCredits,
          available: userCred
        });
      }

      const stylePrompt = stylePrompts[style] || stylePrompts['western-animation'];
      const fullPrompt = `${prompt}, ${stylePrompt}`;
      const sizeConfig = sizeConfigs[size];

      console.log('Calling Replicate with prompt:', fullPrompt);

      const output = await replicate.run(
        "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        {
          input: {
            prompt: fullPrompt,
            width: sizeConfig.width,
            height: sizeConfig.height,
            num_outputs: 1,
            negative_prompt: "ugly, blurry, low quality, distorted, deformed",
            num_inference_steps: sizeConfig.hd ? 50 : 30,
            guidance_scale: 7.5
          }
        }
      );

      userCredits.set(userId, userCred - requiredCredits);

      return res.json({
        success: true,
        imageUrl: output[0],
        creditsUsed: requiredCredits,
        remainingCredits: userCredits.get(userId)
      });
    }

    // Create checkout
    if (req.url === '/api/purchase/create-checkout' && req.method === 'POST') {
      const { userId, credits, price } = req.body;

      if (!userId || !credits || !price) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `${credits} AI Generation Credits`,
                description: 'Credits for AI image generation',
              },
              unit_amount: Math.round(price * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/`,
        metadata: {
          userId,
          credits: credits.toString(),
        },
      });

      return res.json({ sessionId: session.id, url: session.url });
    }

    // Verify payment
    if (req.url.startsWith('/api/purchase/verify/') && req.method === 'GET') {
      const sessionId = req.url.split('/').pop();
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      
      if (session.payment_status === 'paid') {
        return res.json({ 
          success: true, 
          credits: parseInt(session.metadata.credits),
          userId: session.metadata.userId
        });
      } else {
        return res.json({ success: false });
      }
    }

    return res.status(404).json({ error: 'Not found' });

  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}