# MedAI Production Deployment Guide

## Pre-Deployment Checklist

### 1. Security ✅
- [ ] Rotate all API keys exposed in git history
- [ ] Remove `.env.local` from git tracking
- [ ] Set up environment variables in Vercel
- [ ] Enable Supabase RLS on all tables
- [ ] Review and test all RLS policies
- [ ] Enable MFA for admin accounts
- [ ] Set up monitoring and alerting

### 2. Legal & Compliance ✅
- [ ] Review Terms of Service
- [ ] Review Privacy Policy
- [ ] Review Medical Disclaimer
- [ ] Consult with legal counsel
- [ ] Purchase cyber liability insurance
- [ ] Set up HIPAA compliance procedures

### 3. Services Setup
- [ ] Upgrade to Supabase Pro/Enterprise (HIPAA tier)
- [ ] Upgrade to OpenAI Enterprise (with BAA)
- [ ] Sign up for Resend (email service)
- [ ] Sign up for Twilio (SMS service)
- [ ] Set up Razorpay account
- [ ] Get WalletConnect Project ID

### 4. Testing
- [ ] Run all tests: `npm test`
- [ ] Manual QA on desktop browsers
- [ ] Manual QA on mobile devices (iOS/Android)
- [ ] Test payment flows
- [ ] Test email notifications
- [ ] Test SMS notifications
- [ ] Load testing

## Step-by-Step Deployment

### Step 1: Prepare Environment Variables

Create a file with all production environment variables:

```bash
# AI Configuration
OPENAI_API_KEY=sk-...

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Payment Gateway (Razorpay)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...

# Email Service (Resend)
RESEND_API_KEY=re_...

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# Web3 Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=...

# Smart Contract (after deployment)
NEXT_PUBLIC_PAYMENT_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_CHAIN_ID=137  # Polygon Mainnet

# Security
NODE_ENV=production
```

### Step 2: Deploy to Vercel

1. **Connect GitHub Repository**
   ```bash
   # Push your code to GitHub
   git add .
   git commit -m "Prepare for production deployment"
   git push origin main
   ```

2. **Import Project in Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select the `frontend` folder as root directory

3. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from Step 1
   - Set for Production environment

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Verify deployment at your Vercel URL

### Step 3: Configure Custom Domain

1. **Purchase Domain**
   - Recommended: medai.app, medai.health, or similar

2. **Add Domain in Vercel**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

3. **Enable HTTPS**
   - Vercel automatically provisions SSL certificate
   - Verify HTTPS is working

### Step 4: Set Up Supabase Production

1. **Create Production Project**
   - Go to https://supabase.com/dashboard
   - Create new project (Pro or Enterprise tier for HIPAA)

2. **Run Database Migrations**
   ```bash
   # Copy SQL from supabase-schema.sql
   # Run in Supabase SQL Editor
   ```

3. **Enable Row Level Security**
   ```sql
   -- Verify RLS is enabled on all tables
   SELECT schemaname, tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public';
   ```

4. **Configure Auth**
   - Enable email/password authentication
   - Set up email templates
   - Configure redirect URLs

5. **Set Up Storage**
   - Create buckets for medical records
   - Configure storage policies

### Step 5: Set Up Email Service (Resend)

1. **Sign Up**
   - Go to https://resend.com
   - Create account

2. **Verify Domain**
   - Add your domain
   - Add DNS records for verification

3. **Get API Key**
   - Generate API key
   - Add to Vercel environment variables

4. **Test Email**
   ```bash
   curl -X POST https://api.resend.com/emails \
     -H "Authorization: Bearer YOUR_API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"from":"noreply@yourdomain.com","to":"test@example.com","subject":"Test","html":"<p>Test</p>"}'
   ```

### Step 6: Set Up SMS Service (Twilio)

1. **Sign Up**
   - Go to https://twilio.com
   - Create account

2. **Get Phone Number**
   - Purchase a phone number
   - Enable SMS capabilities

3. **Get Credentials**
   - Account SID
   - Auth Token
   - Add to Vercel environment variables

4. **Test SMS**
   ```bash
   curl -X POST "https://api.twilio.com/2010-04-01/Accounts/YOUR_ACCOUNT_SID/Messages.json" \
     --data-urlencode "To=+1234567890" \
     --data-urlencode "From=YOUR_TWILIO_NUMBER" \
     --data-urlencode "Body=Test message" \
     -u YOUR_ACCOUNT_SID:YOUR_AUTH_TOKEN
   ```

### Step 7: Set Up Payment Gateway (Razorpay)

1. **Sign Up**
   - Go to https://razorpay.com
   - Create business account

2. **Complete KYC**
   - Submit business documents
   - Wait for approval

3. **Get Live Keys**
   - Switch to Live mode
   - Get Key ID and Key Secret
   - Add to Vercel environment variables

4. **Set Up Webhooks**
   - Add webhook URL: `https://yourdomain.com/api/razorpay-webhook`
   - Select events: payment.captured, payment.failed

### Step 8: Deploy Smart Contract (Optional)

1. **Install Hardhat**
   ```bash
   cd frontend
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   ```

2. **Configure Hardhat**
   - See `contracts/README.md` for details

3. **Deploy to Polygon**
   ```bash
   npx hardhat run scripts/deploy.js --network polygon
   ```

4. **Verify Contract**
   ```bash
   npx hardhat verify --network polygon DEPLOYED_CONTRACT_ADDRESS
   ```

5. **Add Contract Address**
   - Add to Vercel environment variables

### Step 9: Set Up Monitoring

1. **Vercel Analytics**
   - Enable in Project Settings
   - Monitor performance metrics

2. **Sentry (Error Tracking)**
   ```bash
   npm install @sentry/nextjs
   npx @sentry/wizard@latest -i nextjs
   ```

3. **Supabase Monitoring**
   - Monitor database performance
   - Set up alerts for high usage

4. **Uptime Monitoring**
   - Use UptimeRobot or similar
   - Monitor main endpoints

### Step 10: Final Verification

1. **Test All Features**
   - [ ] User registration/login
   - [ ] AI diagnostics
   - [ ] Appointment booking
   - [ ] Email notifications
   - [ ] SMS notifications
   - [ ] Payment processing
   - [ ] Web3 wallet connection
   - [ ] Doctor portal
   - [ ] Medical records

2. **Performance Check**
   - [ ] Lighthouse score > 90
   - [ ] Page load time < 3s
   - [ ] API response time < 500ms

3. **Security Scan**
   - [ ] Run security audit
   - [ ] Check for vulnerabilities
   - [ ] Verify HTTPS everywhere

## Post-Deployment

### Monitoring

- Check Vercel Analytics daily
- Review error logs in Sentry
- Monitor Supabase usage
- Track payment transactions

### Maintenance

- Update dependencies monthly
- Review security advisories
- Backup database weekly
- Test disaster recovery quarterly

### Scaling

- Monitor user growth
- Upgrade Vercel plan if needed
- Upgrade Supabase plan if needed
- Optimize database queries

## Rollback Plan

If issues occur after deployment:

1. **Immediate Rollback**
   ```bash
   # In Vercel Dashboard
   # Go to Deployments
   # Click on previous working deployment
   # Click "Promote to Production"
   ```

2. **Database Rollback**
   - Restore from Supabase backup
   - Verify data integrity

3. **Notify Users**
   - Send email notification
   - Update status page

## Support

- **Technical Issues**: tech@medai.app
- **Security Issues**: security@medai.app
- **Deployment Help**: devops@medai.app

---

**Last Updated**: March 13, 2026
