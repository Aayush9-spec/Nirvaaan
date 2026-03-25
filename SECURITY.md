# Security Guidelines

## Environment Variables

### ⚠️ CRITICAL: Never Commit Secrets to Git

1. **Local Development**: Use `.env.local` (already in .gitignore)
2. **Production**: Set environment variables in Vercel Dashboard
3. **Never** commit files containing actual API keys or secrets

### Current Security Issues

❌ **IMMEDIATE ACTION REQUIRED**: Your `.env.local` file contains real API keys and is tracked in git history.

#### Steps to Fix:

1. **Rotate all exposed keys immediately**:
   - OpenAI API key
   - Supabase keys (if compromised)
   - Any other exposed credentials

2. **Remove from git history**:
```bash
# Remove .env.local from git tracking
git rm --cached frontend/.env.local

# Add to .gitignore (should already be there)
echo "frontend/.env.local" >> .gitignore

# Commit the changes
git add .gitignore
git commit -m "Remove sensitive environment variables from tracking"
```

3. **Set up Vercel environment variables**:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all production keys there
   - Never commit them to the repository

## API Key Security

### OpenAI API Key
- **Current Risk**: Exposed in repository
- **Action**: Generate new key at https://platform.openai.com/api-keys
- **Storage**: Vercel environment variables only
- **Usage Limits**: Set monthly spending limits in OpenAI dashboard

### Supabase Keys
- **Anon Key**: Safe to expose (public)
- **Service Role Key**: NEVER expose (server-side only)
- **RLS Policies**: Ensure Row Level Security is enabled on all tables

### Razorpay Keys
- **Key ID**: Safe to expose (public)
- **Key Secret**: NEVER expose (server-side only)
- **Webhooks**: Use webhook signature verification

## Database Security

### Supabase Row Level Security (RLS)

Verify all tables have RLS enabled:

```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_records ENABLE ROW LEVEL SECURITY;
-- ... repeat for all tables
```

### Audit Policies

```sql
-- Verify policies exist
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

## Authentication Security

### Best Practices
- ✅ Use Supabase Auth (already implemented)
- ✅ Enable MFA for admin accounts
- ✅ Implement rate limiting on auth endpoints
- ✅ Use secure session management
- ⚠️ TODO: Add password strength requirements
- ⚠️ TODO: Implement account lockout after failed attempts

## API Route Security

### Middleware Protection
All API routes should verify authentication:

```typescript
const supabase = await createClient();
const { data: { user }, error } = await supabase.auth.getUser();

if (error || !user) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### Rate Limiting
⚠️ TODO: Implement rate limiting using Vercel Edge Config or Upstash Redis

## HTTPS/TLS

- ✅ Vercel provides automatic HTTPS
- ✅ All API calls use HTTPS
- ✅ Supabase connections use TLS

## Content Security Policy

Add to `next.config.ts`:

```typescript
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
];
```

## Dependency Security

### Regular Updates
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update
```

### Automated Scanning
- Enable Dependabot on GitHub
- Review security alerts regularly

## Incident Response

### If a Security Breach Occurs:

1. **Immediate Actions**:
   - Rotate all API keys and secrets
   - Review access logs
   - Identify scope of breach

2. **Notification** (if PHI affected):
   - Notify affected users within 60 days (HIPAA requirement)
   - Report to HHS if >500 individuals affected
   - Document incident thoroughly

3. **Remediation**:
   - Fix vulnerability
   - Update security measures
   - Conduct post-mortem

## Security Checklist

### Before Production Launch:

- [ ] Rotate all exposed API keys
- [ ] Remove secrets from git history
- [ ] Set up Vercel environment variables
- [ ] Enable Supabase RLS on all tables
- [ ] Verify all RLS policies are correct
- [ ] Implement rate limiting
- [ ] Add Content Security Policy headers
- [ ] Enable MFA for admin accounts
- [ ] Set up monitoring and alerting
- [ ] Purchase cyber liability insurance
- [ ] Conduct security audit/penetration test
- [ ] Document incident response plan
- [ ] Train team on security practices

## Monitoring

### Set Up Alerts For:
- Failed authentication attempts
- Unusual API usage patterns
- Database access anomalies
- Error rate spikes
- Slow query performance

### Tools:
- Vercel Analytics
- Supabase Dashboard
- Sentry (error tracking)
- LogRocket (session replay)

## Contact

**Security Issues**: security@medai.app
**Report Vulnerability**: Privately via GitHub Security Advisories

---

**Last Updated**: March 13, 2026
