# 🚀 QUICK START GUIDE - Get Live in 2 Days!

## Day 1: Setup & Local Testing (4-6 hours)

### Step 1: Get Your API Keys (30 minutes)

#### Replicate API
1. Go to https://replicate.com
2. Click "Sign Up" (free tier available)
3. Navigate to Account → API Tokens
4. Click "Create Token"
5. **Copy and save** this token securely

#### Stripe API
1. Go to https://stripe.com
2. Sign up for an account
3. Go to Developers → API Keys
4. **Copy:**
   - Secret key (starts with `sk_test_`)
   - Publishable key (starts with `pk_test_`)
5. Go to Developers → Webhooks
6. Click "Add endpoint"
7. For now, use: `http://localhost:3001/api/webhooks/stripe`
8. Select event: `checkout.session.completed`
9. **Copy the webhook secret** (starts with `whsec_`)

### Step 2: Install & Configure (30 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Create .env file
cp .env.example .env

# 3. Edit .env file with your API keys
nano .env  # or use any text editor
```

**Your .env should look like:**
```env
REPLICATE_API_TOKEN=r8_xxxxxxxxxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxx
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### Step 3: Test Locally (1 hour)

```bash
# Terminal 1 - Start Backend
npm start

# Terminal 2 - Start Frontend  
npm run dev
```

**Visit:** http://localhost:5173

**Test Checklist:**
- [ ] Page loads correctly
- [ ] Can type in text box
- [ ] Can select different styles
- [ ] Can upload an image
- [ ] Click "Generate Image" (may fail without credits - that's ok)
- [ ] Click "Buy Credits"
- [ ] Test payment with: `4242 4242 4242 4242` (Stripe test card)
- [ ] Verify credits increase after payment

### Step 4: Fix Any Issues (1 hour)

Common issues and fixes:

**Error: "Cannot find module 'express'"**
```bash
npm install
```

**Error: "REPLICATE_API_TOKEN not found"**
- Double check .env file exists
- Restart the server after editing .env

**Payment not working:**
- Verify Stripe keys are correct
- Check webhook secret is set
- Make sure both frontend and backend are running

### Step 5: Customize (Optional - 2 hours)

**Change Colors:**
Edit `src/main.jsx` - find and replace:
- `purple-600` → your primary color
- `pink-600` → your secondary color

**Change Name:**
- Edit `index.html` - update `<title>`
- Edit `src/main.jsx` - search for "StyleSnap AI"
- Edit `README.md`

**Adjust Prices:**
Edit `src/main.jsx` around line 38:
```javascript
const creditPackages = [
  { credits: 10, price: 1.99, popular: false },  // Change these
  { credits: 50, price: 7.99, popular: true },
  // ...
];
```

---

## Day 2: Deploy to Production (4-6 hours)

### Option A: Vercel (Easiest - Recommended)

#### Deploy Backend (1 hour)

1. **Create GitHub Repository**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin your-github-url
git push -u origin main
```

2. **Deploy Backend on Vercel**
- Go to https://vercel.com
- Click "New Project"
- Import your GitHub repository
- Add environment variables (all from .env)
- Click "Deploy"
- **Copy the deployment URL** (e.g., `https://stylesnap-api.vercel.app`)

3. **Update Stripe Webhook**
- Go to Stripe Dashboard → Webhooks
- Add new endpoint: `https://your-backend-url.vercel.app/api/webhooks/stripe`
- Select event: `checkout.session.completed`
- Update STRIPE_WEBHOOK_SECRET in Vercel

#### Deploy Frontend (30 minutes)

1. **Update API URLs**
In `src/main.jsx`, add at the top:
```javascript
const API_URL = import.meta.env.PROD 
  ? 'https://your-backend-url.vercel.app'
  : 'http://localhost:3001';
```

Replace all `/api/` calls with `${API_URL}/api/`

2. **Build and Deploy**
```bash
npm run build
vercel --prod
```

3. **Get Your Live URL**
Vercel will give you a URL like: `https://stylesnap-ai.vercel.app`

### Option B: Railway (Alternative)

1. Go to https://railway.app
2. Sign up with GitHub
3. New Project → Deploy from GitHub
4. Select your repository
5. Add environment variables
6. Deploy
7. Get your URL from Railway dashboard

### Option C: DigitalOcean/AWS (Advanced)

See full README.md for VPS deployment instructions.

---

## Post-Deployment Checklist

- [ ] Website loads at production URL
- [ ] Can generate images (test with real API)
- [ ] Payment works (test with real card or Stripe test card)
- [ ] Credits increase after payment
- [ ] Can download generated images
- [ ] Works on mobile
- [ ] SSL/HTTPS is enabled (should be automatic on Vercel)

---

## Testing Your Live Site

1. **Visit your live URL**
2. **Sign up / Get free credits** (starts with 10)
3. **Generate an image** with text
4. **Upload and transform** an image  
5. **Buy credits** using test card: `4242 4242 4242 4242`
6. **Verify credits** increase
7. **Share with friends** for feedback

---

## Making Your First Dollar 💰

### Marketing Strategy

1. **Create Social Media Accounts**
   - Twitter/X
   - Instagram
   - TikTok
   
2. **Post Examples**
   - Generate amazing images with different styles
   - Post before/after transformations
   - Use hashtags: #AIart #AIimages #AnimeAI

3. **Submit to Directories**
   - Product Hunt
   - Hacker News (Show HN)
   - Reddit (r/SideProject, r/InternetIsBeautiful)
   
4. **Special Launch Offer**
   - First 100 users get 50% off
   - Tweet code: LAUNCH50

5. **Content Marketing**
   - Write blog post: "How I built an AI image generator"
   - Share on Dev.to, Medium
   - Show your profit margins (people love transparency)

### Pricing Strategy

**Week 1-2:** Lower prices to gain users
- 10 credits: $0.99
- 50 credits: $3.99

**Week 3+:** Regular pricing (as in code)
- 10 credits: $1.99
- 50 credits: $7.99

### Revenue Projections

**Conservative:**
- 10 users/day × $3.99 avg = $39.90/day
- Monthly: ~$1,200
- Profit (88%): ~$1,056

**Optimistic:**
- 50 users/day × $5 avg = $250/day  
- Monthly: ~$7,500
- Profit (88%): ~$6,600

---

## Scaling Up

Once you hit 100+ users/day:

1. **Add Authentication** (Clerk, Auth0)
2. **Use Real Database** (Supabase, PlanetScale)
3. **Add Analytics** (PostHog, Plausible)
4. **Upgrade API Limits** (Replicate, Stripe)
5. **Add More Features**:
   - User galleries
   - Favorites/history
   - Batch generation
   - API access ($$$)

---

## Emergency Support

**Site Down?**
- Check Vercel/Railway status
- Check API keys are still valid
- Look at deployment logs

**Payments Not Working?**
- Verify webhook URL is correct
- Check Stripe dashboard for errors
- Test with Stripe test cards first

**Images Not Generating?**
- Check Replicate API credits
- Verify API token is valid
- Check server logs in Vercel

---

## Success Metrics to Track

**Week 1:**
- [ ] First signup
- [ ] First payment
- [ ] First $10 in revenue

**Month 1:**
- [ ] 100+ signups
- [ ] $500+ revenue
- [ ] <1% error rate

**Month 3:**
- [ ] 1,000+ signups
- [ ] $2,000+ revenue
- [ ] Product-market fit

---

## Next Steps After Launch

1. **Collect Feedback** - Add a feedback form
2. **Monitor Metrics** - Daily revenue, signups, generations
3. **Iterate Quickly** - Ship new features weekly
4. **Build Community** - Discord server for users
5. **Add Referrals** - Give credits for referrals
6. **Expand Styles** - Add more AI models
7. **Create API** - Let developers integrate

---

**You've got this! 🚀**

Remember: Done is better than perfect. Launch, learn, iterate!

Any issues? Check the main README.md for detailed troubleshooting.
