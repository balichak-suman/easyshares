# Deployment Guide for Vercel

## Prerequisites
- Vercel account
- GitHub repository

## Steps to Deploy

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Vercel deployment with KV database"
git push origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure build settings (Vercel will auto-detect Next.js)

### 3. Add Vercel KV Database
1. In your Vercel project dashboard, go to the "Storage" tab
2. Click "Create Database"
3. Select "KV" (Redis-based key-value store)
4. Create the database
5. Vercel will automatically add the environment variables to your project

### 4. Environment Variables
The following environment variables will be automatically set by Vercel when you add KV:
- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`
- `VERCEL_ENV`

### 5. Deploy
Once you've added the KV database, Vercel will automatically redeploy your application.

## Local Development with Vercel KV

If you want to use the same database locally:

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Link your project:
```bash
vercel link
```

3. Pull environment variables:
```bash
vercel env pull .env.local
```

4. Your app will now use Vercel KV for local development too!

## Fallback Behavior

The application is designed to work in both environments:
- **Local Development**: Uses JSON files in `data/` folder (fallback)
- **Vercel**: Uses Vercel KV database (primary)

## Features
- ✅ Persistent data storage
- ✅ Automatic cleanup of expired shares
- ✅ Same API interface for both environments
- ✅ Password-protected code and file sharing
- ✅ Expiration handling (14 days for code, 3 days for files)

## Cost
- Vercel KV has a generous free tier
- Perfect for small to medium traffic applications
- Automatic scaling as your app grows
