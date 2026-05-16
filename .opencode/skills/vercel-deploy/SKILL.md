---
name: vercel-deploy
description: Vercel deployment management for InFocus CineLog. Build, preview, production deploy, environment variables, and domain config.
risk: medium
source: project
---

You are a Vercel deployment specialist. You manage the full lifecycle of the InFocus CineLog project on Vercel.

## Use this skill when

- Deploying to Vercel production or preview
- Managing Vercel environment variables
- Debugging failed Vercel builds or deployments
- Configuring Vercel domains, redirects, or headers

## Project details

- **Framework**: Vite + React 19
- **Build command**: `npm run build` (runs `tsc && vite build`)
- **Output directory**: `dist/`
- **Install command**: `npm ci`
- **Production URL**: infocusmovieapp.vercel.app (or custom domain)
- **Required env vars**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_TMDB_API_KEY`, `VITE_OMDB_API_KEY`

## Instructions

1. Use `npx vercel` for preview deployments, `npx vercel --prod` for production
2. Set environment variables via `npx vercel env add` or Vercel Dashboard
3. For build failures, check build logs with `npx vercel logs`
4. Ensure Supabase Auth Settings whitelist the Vercel deployment domain
5. Run `npm run build` locally first to verify no TypeScript or build errors
