# 📋 Deployment Checklist

Use this checklist to ensure everything is set up correctly.

## Pre-Deployment

### API Keys & Accounts
- [ ] Created Replicate account (https://replicate.com)
- [ ] Generated Replicate API token
- [ ] Created Stripe account (https://stripe.com)
- [ ] Got Stripe Secret Key
- [ ] Got Stripe Publishable Key
- [ ] Set up Stripe webhook
- [ ] Got Stripe Webhook Secret

### Local Setup
- [ ] Installed Node.js (v18+)
- [ ] Ran `npm install`
- [ ] Created `.env` file
- [ ] Added all API keys to `.env`
- [ ] Tested backend: `npm start` (port 3001)
- [ ] Tested frontend: `npm run dev` (port 5173)

### Local Testing
- [ ] Website loads without errors
- [ ] Can type in prompt field
- [ ] Can select art styles
- [ ] Can upload images
- [ ] Can click "Generate Image" button
- [ ] Credits modal opens
- [ ] Test payment works (card: 4242 4242 4242 4242)
- [ ] Credits increase after payment

## Deployment

### Backend Deployment
- [ ] Created GitHub repository
- [ ] Pushed code to GitHub
- [ ] Deployed to Vercel/Railway/Heroku
- [ ] Added all environment variables
- [ ] Got production backend URL
- [ ] Backend health check works: `https://your-backend-url/api/health`

### Frontend Deployment
- [ ] Updated API URL in code
- [ ] Built frontend: `npm run build`
- [ ] Deployed to Vercel/Netlify
- [ ] Got production frontend URL
- [ ] Site loads correctly

### Stripe Configuration
- [ ] Updated webhook URL to production
- [ ] Selected event: `checkout.session.completed`
- [ ] Updated `STRIPE_WEBHOOK_SECRET` in production env vars
- [ ] Updated `FRONTEND_URL` in production env vars

## Post-Deployment Testing

### Functionality Tests
- [ ] Visit production URL
- [ ] Homepage loads correctly
- [ ] Can enter text prompt
- [ ] Can select different styles
- [ ] Can upload image
- [ ] Generate button works
- [ ] Image generation completes successfully
- [ ] Generated image displays
- [ ] Can download generated image
- [ ] Credits display correctly

### Payment Tests
- [ ] Click "Buy Credits"
- [ ] Modal opens with packages
- [ ] Click on a package
- [ ] Redirects to Stripe checkout
- [ ] Complete payment with test card
- [ ] Redirects back to site
- [ ] Credits increase correctly
- [ ] Can use new credits to generate

### Mobile Tests
- [ ] Site loads on mobile
- [ ] UI is responsive
- [ ] Can upload image on mobile
- [ ] Can generate images
- [ ] Can complete payment

### Security Tests
- [ ] HTTPS is enabled (🔒 in browser)
- [ ] API keys not visible in frontend code
- [ ] Webhook secret is secure
- [ ] File uploads are validated

## Marketing Launch

### Pre-Launch
- [ ] Created Twitter/X account
- [ ] Created Instagram account
- [ ] Prepared launch tweet/post
- [ ] Generated example images
- [ ] Created demo video (optional)

### Launch Day
- [ ] Posted on Product Hunt
- [ ] Posted on Twitter/X
- [ ] Posted on Reddit (r/SideProject)
- [ ] Posted on Hacker News (Show HN)
- [ ] Shared on Instagram
- [ ] Posted in relevant Discord servers

### Post-Launch
- [ ] Set up Google Analytics (optional)
- [ ] Set up error tracking (Sentry)
- [ ] Monitor server logs
- [ ] Respond to user feedback
- [ ] Track metrics daily

## Monitoring

### Daily Checks
- [ ] Site is online and working
- [ ] No error logs
- [ ] Payment processing works
- [ ] API costs within budget
- [ ] Revenue tracking

### Weekly Checks
- [ ] Review user feedback
- [ ] Check conversion rates
- [ ] Monitor API usage
- [ ] Review Stripe dashboard
- [ ] Plan improvements

## Optimization (After First Users)

### Performance
- [ ] Images load quickly
- [ ] Generation time is acceptable
- [ ] Payment flow is smooth
- [ ] No unnecessary API calls

### User Experience
- [ ] Error messages are clear
- [ ] Loading states are visible
- [ ] Success feedback is provided
- [ ] Mobile experience is good

### Business
- [ ] Pricing is competitive
- [ ] Profit margins are healthy
- [ ] Users are returning
- [ ] Growth is happening

## Emergency Contacts

**Replicate Issues:**
- Dashboard: https://replicate.com/account
- Docs: https://replicate.com/docs
- Support: support@replicate.com

**Stripe Issues:**
- Dashboard: https://dashboard.stripe.com
- Docs: https://stripe.com/docs
- Support: Built-in dashboard support

**Hosting Issues:**
- Vercel: https://vercel.com/support
- Railway: https://railway.app/help
- Heroku: https://help.heroku.com

## Troubleshooting Quick Reference

**Site won't load:**
1. Check deployment status
2. Check environment variables
3. Check server logs

**Images won't generate:**
1. Verify Replicate API token
2. Check Replicate credits/usage
3. Check server logs for errors

**Payments failing:**
1. Verify Stripe keys are correct
2. Check webhook is configured
3. Check webhook secret matches
4. Review Stripe dashboard logs

**Out of credits:**
1. Add credits to Replicate account
2. Check billing settings
3. Monitor usage patterns

---

## Success Criteria

You're ready to launch when:
- ✅ All items in "Pre-Deployment" are checked
- ✅ All items in "Deployment" are checked  
- ✅ All items in "Post-Deployment Testing" are checked
- ✅ Site is live and working perfectly
- ✅ You're confident to share with users

---

**Good luck with your launch! 🚀**

Print this checklist and check off items as you complete them.
