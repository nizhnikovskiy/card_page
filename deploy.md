# GitHub Pages Deployment Guide

## Quick Deployment Steps

### 1. Update Repository Information
Before deploying, update the homepage URL in `package.json`:
```json
"homepage": "https://YOUR_USERNAME.github.io/card_page"
```
Replace `YOUR_USERNAME` with your actual GitHub username.

### 2. Initialize Git Repository (if not already done)
```bash
git init
git add .
git commit -m "Initial commit: Payment screen component"
```

### 3. Connect to GitHub Repository
```bash
git remote add origin https://github.com/YOUR_USERNAME/card_page.git
git branch -M main
git push -u origin main
```

### 4. Deploy to GitHub Pages
```bash
npm run deploy
```

This command will:
- Build the project (`npm run build`)
- Create a `gh-pages` branch
- Push the built files to the `gh-pages` branch

### 5. Configure GitHub Pages Settings
1. Go to your repository on GitHub
2. Click on "Settings" tab
3. Scroll down to "Pages" section in the left sidebar
4. Under "Source", select "Deploy from a branch"
5. Choose "gh-pages" branch and "/ (root)" folder
6. Click "Save"

### 6. Access Your Deployed Site
Your site will be available at:
```
https://YOUR_USERNAME.github.io/card_page
```

## Troubleshooting

### If deployment fails:
1. Make sure you have push access to the repository
2. Verify the repository name matches the homepage URL
3. Check that the `gh-pages` package is installed (`npm list gh-pages`)

### If the site doesn't load correctly:
1. Verify the base path in `vite.config.js` matches your repository name
2. Check browser console for any errors
3. Ensure GitHub Pages is enabled in repository settings

### To redeploy after making changes:
```bash
git add .
git commit -m "Update payment component"
git push origin main
npm run deploy
```

## Development Commands

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run deploy` - Deploy to GitHub Pages 