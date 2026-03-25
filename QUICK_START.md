# MedAI Quick Start Guide

Get your MedAI platform up and running in 30 minutes.

---

## 🎯 Goal

By the end of this guide, you'll have:
- ✅ Local development environment running
- ✅ All services configured
- ✅ Ready to deploy to production

---

## Step 1: Security First (5 minutes)

### Rotate Exposed API Keys

```bash
# 1. Generate new OpenAI API key
# Go to: https://platform.openai.com/api-keys
# Create new key, copy it

# 2. Remove .env.local from git
cd frontend
git rm --cached .env.local
git add .gitignore
git commit -m "Remove sensitive environment variables"
git push
```

---

## Step 2: Set Up Services (15 minutes)

### A. Resend (Email Service)

1. Go to https://resend.com
2. Sign up for free account
3. Verify your domain (or use test domain)
4. Get API key from dashboard
5. Save for later: `RESEND_API_KEY=re_...`

### B. Twilio (SMS Service)

1. Go to https://twilio.com
2. Sign up for account
3. Get $15 free credit
4. Purchase a phone number
5. Get credentials from dashboard:
   - `TWILIO_ACCOUNT_SID=AC...`
   - `TWILIO_AUTH_TOKEN=...`
   - `TWILIO_PHONE_NUMBER=+1...`

### C. Razorpay (Payments)

1. Go to https://razorpay.com
2. Sign up for account
3. For testing, use Test Mode keys
4. Get credentials:
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...`
   - `RAZORPAY_KEY_SECRET=...`

### D. WalletConnect (Web3)

1. Go to https://cloud.walletconnect.com
2. Sign up for account
3. Create new project
4. Get Project ID: `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=...`

---

## Step 3: Configure Environment (5 minutes)

Create `frontend/.env.local`:

```bash
# AI
OPENAI_API_KEY=sk-proj-YOUR_NEW_KEY_HERE

# Supabase (keep existing)
NEXT_PUBLIC_SUPABASE_URL=https://jezbrugkasqpjrbxlaxu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Payments
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
RAZORPAY_KEY_ID=rzp_test_YOUR_KEY
RAZORPAY_KEY_SECRET=YOUR_SECRET

# Email
RESEND_API_KEY=re_YOUR_KEY

# SMS
TWILIO_ACCOUNT_SID=AC_YOUR_SID
TWILIO_AUTH_TOKEN=YOUR_TOKEN
TWILIO_PHONE_NUMBER=+1234567890

# Web3
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=YOUR_PROJECT_ID
```

---

## Step 4: Test Locally (5 minutes)

```bash
# Make sure you're in frontend directory
cd frontend

# Install dependencies (if not already done)
npm install

# Run development server
npm run dev

# Open browser
# http://localhost:3000
```

### Test These Features:

1. **Homepage** - Should load without errors
2. **Sign Up** - Create a test account
3. **AI Diagnostics** - Try describing symptoms
4. **Appointments** - Try booking an appointment
5. **Legal Pages** - Check /terms, /privacy, /medical-disclaimer

---

## Step 5: Deploy to Vercel (5 minutes)

### A. Push to GitHub

```bash
git add .
git commit -m "Configure environment for production"
git push origin main
```

### B. Deploy on Vercel

1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. Select `frontend` as root directory
5. Add all environment variables from Step 3
6. Click "Deploy"
7. Wait 2-3 minutes
8. Your app is live! 🎉

---

## Step 6: Verify Deployment (5 minutes)

### Check These URLs:

- `https://your-app.vercel.app` - Homepage
- `https://your-app.vercel.app/terms` - Terms of Service
- `https://your-app.vercel.app/privacy` - Privacy Policy
- `https://your-app.vercel.app/medical-disclaimer` - Medical Disclaimer
- `https://your-app.vercel.app/dashboard` - Dashboard (after login)

### Test Core Features:

- [ ] User registration works
- [ ] Login works
- [ ] AI diagnostics responds
- [ ] Appointment booking works
- [ ] Email notifications send (check spam folder)

---

## Common Issues & Solutions

### Issue: "OpenAI API Error"
**Solution**: Check your API key is correct and has credits

### Issue: "Supabase Connection Error"
**Solution**: Verify NEXT_PUBLIC_SUPABASE_URL and ANON_KEY are correct

### Issue: "Payment Failed"
**Solution**: Make sure you're using Razorpay test keys for testing

### Issue: "Email Not Sending"
**Solution**: 
- Check Resend API key is correct
- Verify domain is verified in Resend
- Check spam folder

### Issue: "SMS Not Sending"
**Solution**:
- Verify Twilio credentials
- Check phone number format (+1234567890)
- Ensure Twilio account has credits

---

## Next Steps

### For Beta Launch:

1. **Review Checklist**: See [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md)
2. **Test Thoroughly**: Run through all user flows
3. **Invite Beta Users**: Start with 10-20 trusted users
4. **Monitor Closely**: Check logs daily
5. **Collect Feedback**: Set up feedback form

### For Production Launch:

1. **HIPAA Compliance**: Upgrade to Enterprise tiers
2. **Legal Review**: Have attorney review all documents
3. **Insurance**: Get cyber liability insurance
4. **Security Audit**: Complete third-party audit
5. **Load Testing**: Test with 1000+ concurrent users

---

## Resources

### Documentation
- [Full Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Production Readiness](PRODUCTION_READINESS.md)
- [Security Guidelines](SECURITY.md)
- [HIPAA Compliance](HIPAA_COMPLIANCE.md)

### Service Documentation
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [OpenAI Docs](https://platform.openai.com/docs)
- [Resend Docs](https://resend.com/docs)
- [Twilio Docs](https://www.twilio.com/docs)
- [Razorpay Docs](https://razorpay.com/docs)

### Support
- **Technical**: tech@medai.app
- **Security**: security@medai.app
- **General**: hello@medai.app

---

## Congratulations! 🎉

You now have a fully functional MedAI platform running!

**What you've accomplished:**
- ✅ Secured your API keys
- ✅ Configured all services
- ✅ Deployed to production
- ✅ Ready for beta testing

**Next milestone**: Launch to your first 50 users!

---

**Need Help?** Check the [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md) for detailed guidance.
