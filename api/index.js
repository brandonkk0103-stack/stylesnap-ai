require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Replicate = require('replicate');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const fs = require('fs').promises;
const path = require('path');

const app = express();

// Configure multer to use /tmp directory (Vercel serverless temp storage)
const upload = multer({ 
  dest: '/tmp/uploads/',
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Replicate
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// In-memory user credits store (use database in production)
const userCredits = new Map();

// Helper functions
const getUserCredits = (userId) => {
  return userCredits.get(userId) || 0;
};

const setUserCredits = (userId, credits) => {
  userCredits.set(userId, credits);
};

// Style configurations
const stylePrompts = {
  'western-animation': 'in the style of modern western animation, vibrant colors, clean lines, expressive characters, Disney Pixar style',
  'japanese-anime': 'anime art style, detailed eyes, manga-inspired, dynamic composition, cel-shaded, Studio Ghibli quality',
  'korean-manhwa': 'Korean webtoon art style, soft shading, modern aesthetic, detailed linework, digital painting',
  'comic-book': 'American comic book style, bold outlines, halftone dots, dynamic action poses, Marvel DC style',
  'cartoon-cute': 'cute chibi style, kawaii aesthetic, pastel colors, simplified features, adorable, big eyes',
  'vintage-cartoon': 'retro cartoon style, 1930s animation aesthetic, rubber hose animation, classic Disney'
};

// Size configurations
const sizeConfigs = {
  'standard': { width: 1024, height: 1024, credits: 1 },
  'large': { width: 1024, height: 1536, credits: 2 },
  'premium': { width: 1024, height: 1024, credits: 3, hd: true }
};

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get user credits
app.get('/api/credits/:userId', (req, res) => {
  const { userId } = req.params;
  const credits = getUserCredits(userId);
  res.json({ credits });
});

// Generate image from text
app.post('/api/generate/text', async (req, res) => {
  try {
    const { userId, prompt, style, size } = req.body;
    
    if (!userId || !prompt || !style || !size) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userCredits = getUserCredits(userId);
    const requiredCredits = sizeConfigs[size]?.credits || 1;

    if (userCredits < requiredCredits) {
      return res.status(402).json({ 
        error: 'Insufficient credits',
        required: requiredCredits,
        available: userCredits
      });
    }

    const stylePrompt = stylePrompts[style] || stylePrompts['western-animation'];
    const fullPrompt = `${prompt}, ${stylePrompt}`;
    const sizeConfig = sizeConfigs[size];

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

    setUserCredits(userId, userCredits - requiredCredits);

    res.json({
      success: true,
      imageUrl: output[0],
      creditsUsed: requiredCredits,
      remainingCredits: getUserCredits(userId)
    });

  } catch (error) {
    console.error('Text generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate image',
      message: error.message 
    });
  }
});

// Generate image from uploaded image
app.post('/api/generate/image', upload.single('image'), async (req, res) => {
  try {
    const { userId, style, size, prompt } = req.body;
    const imageFile = req.file;
    
    if (!userId || !style || !size || !imageFile) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userCredits = getUserCredits(userId);
    const requiredCredits = sizeConfigs[size]?.credits || 1;

    if (userCredits < requiredCredits) {
      return res.status(402).json({ 
        error: 'Insufficient credits',
        required: requiredCredits,
        available: userCredits
      });
    }

    const imageBuffer = await fs.readFile(imageFile.path);
    const base64Image = imageBuffer.toString('base64');
    const imageDataUrl = `data:${imageFile.mimetype};base64,${base64Image}`;

    const stylePrompt = stylePrompts[style] || stylePrompts['western-animation'];
    const fullPrompt = prompt 
      ? `${prompt}, ${stylePrompt}` 
      : `transform this image to ${stylePrompt}, maintain original composition and subject`;
    
    const sizeConfig = sizeConfigs[size];

    const output = await replicate.run(
      "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
      {
        input: {
          image: imageDataUrl,
          prompt: fullPrompt,
          width: sizeConfig.width,
          height: sizeConfig.height,
          num_outputs: 1,
          negative_prompt: "ugly, blurry, low quality, distorted, deformed",
          num_inference_steps: sizeConfig.hd ? 50 : 30,
          guidance_scale: 7.5,
          prompt_strength: 0.8
        }
      }
    );

    await fs.unlink(imageFile.path).catch(() => {});

    setUserCredits(userId, userCredits - requiredCredits);

    res.json({
      success: true,
      imageUrl: output[0],
      creditsUsed: requiredCredits,
      remainingCredits: getUserCredits(userId)
    });

  } catch (error) {
    console.error('Image generation error:', error);
    
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => {});
    }
    
    res.status(500).json({ 
      error: 'Failed to generate image',
      message: error.message 
    });
  }
});

// Create Stripe checkout session
app.post('/api/purchase/create-checkout', async (req, res) => {
  try {
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

    res.json({ sessionId: session.id, url: session.url });

  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ 
      error: 'Failed to create checkout session',
      message: error.message 
    });
  }
});

// Stripe webhook
app.post('/api/webhooks/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, credits } = session.metadata;

    const currentCredits = getUserCredits(userId);
    setUserCredits(userId, currentCredits + parseInt(credits));

    console.log(`Added ${credits} credits to user ${userId}`);
  }

  res.json({ received: true });
});

// Verify payment
app.get('/api/purchase/verify/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (session.payment_status === 'paid') {
      res.json({ 
        success: true, 
        credits: parseInt(session.metadata.credits),
        userId: session.metadata.userId
      });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Export for Vercel
module.exports = app;