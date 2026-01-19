# StyleSnap AI - AI Image Generation Platform

A modern, full-featured AI image generation platform that allows users to create stunning images in various artistic styles (anime, cartoon, comic) using text descriptions or by transforming uploaded images.

## ✨ Features

- **Text-to-Image Generation**: Create images from text descriptions
- **Image-to-Image Transformation**: Upload your photos and transform them into different artistic styles
- **Multiple Art Styles**: 
  - Western Animation
  - Japanese Anime
  - Korean Manhwa
  - Comic Book
  - Cute Cartoon
  - Vintage Cartoon
- **Flexible Image Sizes**: Standard, Large, and Premium HD options
- **Credit-Based System**: Fair pay-per-use pricing model
- **Secure Payments**: Stripe integration for credit purchases
- **Beautiful UI**: Modern, responsive design with smooth animations

## 💰 Pricing & Profitability

### Cost Analysis (Using Replicate SDXL)
- API Cost per generation: ~$0.006
- Payment processing (Stripe): 2.9% + $0.30 per transaction

### Pricing Structure
| Package | Credits | Price | Cost | Profit | Margin |
|---------|---------|-------|------|--------|--------|
| Starter | 10 | $1.99 | $0.06 | $1.64 | 82% |
| Popular | 50 | $7.99 | $0.30 | $7.27 | 91% |
| Pro | 100 | $12.99 | $0.60 | $11.77 | 91% |
| Premium | 500 | $49.99 | $3.00 | $45.29 | 91% |

**Target Profit Margin: 85-91%** ✅

## 🚀 Quick Start (2-Day Setup)

### Prerequisites
- Node.js 18+ and npm
- Replicate API account
- Stripe account

### Day 1: Setup & Configuration

#### 1. Clone and Install
```bash
npm install
```

#### 2. Get API Keys

**Replicate API:**
1. Go to https://replicate.com
2. Sign up and navigate to Account Settings
3. Create an API token
4. Copy the token

**Stripe API:**
1. Go to https://stripe.com
2. Create an account
3. Get your API keys from Dashboard > Developers > API keys
4. Copy Secret Key and Publishable Key
5. Set up webhooks: Dashboard > Developers > Webhooks
   - Endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events to send: `checkout.session.completed`
   - Copy the webhook secret

#### 3. Configure Environment Variables
Create a `.env` file in the root directory:

```env
# Replicate API
REPLICATE_API_TOKEN=your_replicate_token_here

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### 4. Test Locally
```bash
# Terminal 1 - Start backend
npm start

# Terminal 2 - Start frontend
npm run dev
```

Visit http://localhost:5173

### Day 2: Deploy to Production

#### Option A: Deploy to Vercel (Recommended - Fastest)

**Frontend:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

**Backend:**
Create a separate repository for the backend and deploy:
```bash
vercel --prod
```

Update environment variables in Vercel dashboard.

#### Option B: Deploy to Heroku

**Backend:**
```bash
# Install Heroku CLI
# Login
heroku login

# Create app
heroku create stylesnap-api

# Set environment variables
heroku config:set REPLICATE_API_TOKEN=your_token
heroku config:set STRIPE_SECRET_KEY=your_key
# ... set all env vars

# Deploy
git push heroku main
```

**Frontend:**
Build and deploy static files to Vercel/Netlify.

#### Option C: VPS (DigitalOcean, AWS, etc.)

```bash
# SSH into your server
ssh user@your-server-ip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone your repo
git clone your-repo-url
cd your-repo

# Install dependencies
npm install

# Install PM2 for process management
npm install -g pm2

# Build frontend
npm run build

# Start backend with PM2
pm2 start server.js --name stylesnap-api
pm2 save
pm2 startup

# Set up Nginx as reverse proxy
sudo apt install nginx
# Configure nginx (see nginx.conf example below)
```

**Nginx Configuration (`/etc/nginx/sites-available/stylesnap`):**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        root /path/to/your/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Post-Deployment Steps

1. **Update Stripe Webhook URL**
   - Go to Stripe Dashboard > Webhooks
   - Update endpoint to your production URL: `https://yourdomain.com/api/webhooks/stripe`

2. **Update Environment Variables**
   - Set `FRONTEND_URL` to your production domain
   - Set `NODE_ENV=production`

3. **Test Payment Flow**
   - Use Stripe test cards: `4242 4242 4242 4242`
   - Verify credits are added after successful payment

4. **Set Up SSL**
   - Use Let's Encrypt for free SSL certificates
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

## 📁 Project Structure

```
stylesnap-ai/
├── src/
│   ├── main.jsx          # React app with API integration
│   └── index.css         # Tailwind CSS
├── server.js             # Express backend
├── package.json          # Dependencies
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
├── index.html            # HTML entry point
└── .env                  # Environment variables (create this)
```

## 🔧 Development

### Running Tests
```bash
# Test backend endpoints
curl http://localhost:3001/api/health

# Test credit fetching
curl http://localhost:3001/api/credits/test-user-id
```

### Customization

**Add New Styles:**
Edit `server.js` and `src/main.jsx`:
```javascript
const stylePrompts = {
  'your-new-style': 'your custom prompt here',
  // ...
};
```

**Adjust Pricing:**
Modify in `src/main.jsx`:
```javascript
const creditPackages = [
  { credits: 10, price: 1.99, popular: false },
  // Add or modify packages
];
```

**Change Image Models:**
In `server.js`, update the Replicate model:
```javascript
const output = await replicate.run(
  "your-preferred-model-here",
  { input: { /* ... */ } }
);
```

## 🎨 Styling & Branding

The current design uses a purple-pink gradient theme. To customize:

1. **Colors**: Edit `src/main.jsx` - search for `purple-600` and `pink-600`
2. **Fonts**: Update in `index.html` and `tailwind.config.js`
3. **Logo**: Replace the Sparkles icon in the header
4. **Name**: Change "StyleSnap AI" throughout the app

## 📊 Analytics & Monitoring

**Recommended Tools:**
- **Analytics**: Google Analytics, Plausible
- **Error Tracking**: Sentry
- **Uptime Monitoring**: UptimeRobot
- **Payment Analytics**: Stripe Dashboard

## 🔒 Security Best Practices

1. **Never commit `.env` file** - Add to `.gitignore`
2. **Use environment variables** for all sensitive data
3. **Validate user inputs** before API calls
4. **Rate limit API endpoints** to prevent abuse
5. **Implement user authentication** for production
6. **Use HTTPS only** in production
7. **Sanitize file uploads** - check file types and sizes

## 🚧 Production Checklist

- [ ] Set all environment variables
- [ ] Update Stripe webhook URL
- [ ] Enable SSL/HTTPS
- [ ] Set up database for persistent user data
- [ ] Implement rate limiting
- [ ] Add user authentication (OAuth, email/password)
- [ ] Set up error logging (Sentry)
- [ ] Configure CDN for static assets
- [ ] Add terms of service and privacy policy
- [ ] Test payment flow with real cards
- [ ] Set up backup system
- [ ] Configure monitoring and alerts

## 🗄️ Database (Optional - For Production)

For production, replace the in-memory storage with a database:

**Recommended: PostgreSQL with Prisma**

```bash
npm install @prisma/client prisma
npx prisma init
```

**Schema example:**
```prisma
model User {
  id        String   @id @default(cuid())
  email     String?  @unique
  credits   Int      @default(0)
  createdAt DateTime @default(now())
  generations Generation[]
  purchases Purchase[]
}

model Generation {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  imageUrl  String
  prompt    String
  style     String
  createdAt DateTime @default(now())
}

model Purchase {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  credits       Int
  amount        Float
  stripeSession String
  createdAt     DateTime @default(now())
}
```

## 💡 Tips for Success

1. **Start with low prices** to attract initial users
2. **Offer free credits** for new signups (already implemented - 10 free credits)
3. **Market on social media** - Twitter, Instagram, TikTok
4. **Create example galleries** showcasing different styles
5. **Add referral program** to grow virally
6. **Optimize for mobile** - most users will be on phones
7. **A/B test pricing** to find optimal price points
8. **Collect user feedback** and iterate quickly

## 🐛 Troubleshooting

**Issue: Images not generating**
- Check Replicate API token is valid
- Verify REPLICATE_API_TOKEN in .env
- Check Replicate dashboard for API usage/limits

**Issue: Payment not working**
- Verify Stripe keys are correct
- Check webhook is receiving events
- Use Stripe test mode for testing

**Issue: Upload not working**
- Check file size limit (10MB max)
- Verify file type is supported (PNG, JPG)
- Check server upload directory permissions

## 📞 Support

For issues or questions:
- Check the troubleshooting section above
- Review Replicate documentation: https://replicate.com/docs
- Review Stripe documentation: https://stripe.com/docs
- Check server logs for error messages

## 📄 License

MIT License - feel free to use for commercial purposes!

## 🎉 What's Next?

**Phase 2 Features:**
- User accounts and authentication
- Gallery of generated images
- Social sharing
- Batch generation
- Custom style training
- API access for developers
- Mobile app (React Native)

---

Built with ❤️ using React, Express, Replicate AI, and Stripe
