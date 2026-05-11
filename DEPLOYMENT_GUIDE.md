# Portfolio Deployment & Management Guide

This document outlines the steps to run your React portfolio locally, push your code changes to GitHub, and deploy the updated application to GitHub Pages.

## 1. Running the Code Locally

To start a local development server and view your changes in real-time, follow these steps:

1. Open your terminal and navigate to the root directory of your project (`/Users/arpitpardesi/Programming/React/portfolio`).
2. If you have recently pulled new code or added new dependencies, install them by running:
   ```bash
   npm install
   ```
3. Start the local development server:
   ```bash
   npm start
   ```
   *Your default web browser should automatically open to `http://localhost:3000`. Any changes you make to the code will automatically hot-reload the page.*

---

## 2. Pushing Code to GitHub

Once you are satisfied with your local changes, you should commit and push them to your main GitHub repository.

1. Stage all your changes:
   ```bash
   git add .
   ```
2. Commit your changes with a descriptive message:
   ```bash
   git commit -m "Update: Your descriptive commit message here"
   ```
3. Push your commits to your GitHub repository (usually the `main` or `master` branch):
   ```bash
   git push origin main
   ```
   *(Note: Replace `main` with `master` if your default branch is named master)*

---

## 3. Building and Publishing to GitHub Pages

Your project is already configured with the `gh-pages` package. To build your project and deploy it directly to GitHub Pages, you only need to run a single command.

1. Run the deployment script:
   ```bash
   npm run deploy
   ```

**What this command does behind the scenes:**
- First, it automatically runs `npm run build` (due to the `predeploy` script in your `package.json`), which creates a highly optimized production build of your app in the `build/` folder.
- Then, it runs the `gh-pages -d build` command, which takes the contents of the `build/` directory and pushes them to the `gh-pages` branch on your GitHub repository.
- GitHub Pages then serves the content from this branch to your live site at `https://arpitpardesi.github.io/portfolio`.

*(Note: It may take a minute or two for GitHub's CDN to refresh and show your latest changes online).*
