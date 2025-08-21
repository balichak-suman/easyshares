# CodeShare Deployment Guide

## Free Deployment to Vercel

This guide will help you deploy your CodeShare application to Vercel for free, making it accessible from anywhere in the world.

### Prerequisites

1. A GitHub account
2. Node.js installed locally (for testing)

### Step 1: Push to GitHub

1. Initialize a git repository (if not already done):
```bash
git init
git add .
git commit -m "Initial commit - CodeShare application"
```

2. Create a new repository on GitHub:
   - Go to https://github.com/new
   - Name it `codeshare` or any name you prefer
   - Make it public or private (both work with Vercel)
   - Don't initialize with README since you already have files

3. Connect your local repository to GitHub:
```bash
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to https://vercel.com
2. Sign up/login with your GitHub account
3. Click "New Project"
4. Import your CodeShare repository
5. Vercel will automatically detect it's a Next.js project
6. Click "Deploy"

#### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy from your project directory:
```bash
vercel
```

4. Follow the prompts:
   - Link to existing project? No
   - Project name: codeshare (or your preferred name)
   - Directory: ./ (current directory)

### Step 3: Configuration

The project includes a `vercel.json` file with optimized settings:
- Next.js build configuration
- API route optimization
- Proper function timeouts

### Step 4: Access Your Application

Once deployed, Vercel will provide you with:
- A production URL (e.g., `https://codeshare-xyz.vercel.app`)
- Automatic HTTPS
- Global CDN distribution
- Automatic deployments on git push

### Features Available After Deployment

✅ **Global Access**: Your CodeShare app is accessible from anywhere
✅ **Custom URLs**: Create clean URLs like `yourapp.com/my-code-title`
✅ **Password Protection**: Secure editing with password authentication
✅ **Syntax Highlighting**: Full Monaco Editor with VS Code features
✅ **Responsive Design**: Works on desktop, tablet, and mobile
✅ **Fast Performance**: Optimized with Next.js and Vercel's CDN

### Custom Domain (Optional)

To use your own domain:
1. Go to your Vercel project dashboard
2. Click "Settings" → "Domains"
3. Add your domain and configure DNS

### Environment Variables

The app works out of the box with no additional configuration needed. For production scaling, you might want to add a database later.

### Monitoring

Vercel provides:
- Real-time analytics
- Performance monitoring
- Error tracking
- Usage statistics

### Support

- Vercel Free Plan includes:
  - 100GB bandwidth per month
  - Unlimited personal repositories
  - Automatic HTTPS
  - Global CDN

---

🎉 **Congratulations!** Your CodeShare application is now live and accessible globally for free!

Share your app URL with others to start collaborating on code snippets.
