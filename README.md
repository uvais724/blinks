# Blinks

Blinks is a Nuxt 3 app to save, organize, and share social media links.  
Users can register/login, preview link metadata, group links into collections, and share links/collections with other users.

## Tech Stack

- Nuxt 3 + Vue 3
- Tailwind CSS 4 + DaisyUI
- MongoDB + Mongoose
- `nuxt-auth-utils` sessions + JWT cookie
- Puppeteer for metadata scraping fallback

## Features

- User registration and login
- Save links with preview metadata (title, description, thumbnail)
- URL allowlist validation for social platforms
- Collections (create, add/remove links, delete)
- Sharing links and collections with other users
- "Shared with me" view

## Supported URL Domains

- `facebook.com` (`fb.com`, `fb.me`)
- `linkedin.com` (`lnkd.in`)
- `reddit.com` (`redd.it`)
- `youtube.com` (`youtu.be`)
- `instagram.com` (`instagr.am`)
- `tiktok.com` (`vm.tiktok.com`)

Only `https://` URLs are accepted.

## Prerequisites

- Node.js 20+ recommended
- MongoDB running locally or remotely
- A Chrome/Chromium binary available for Puppeteer fallback scraping

## Environment Variables

Create a `.env` file in the project root:

```env
JWT_SECRET=change-this-secret
MONGODB_URI=mongodb://localhost:27017/social-links

# Optional (used for YouTube links)
YOUTUBE_API_KEY=

# Optional (for custom Chrome path)
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
```

## Local Development

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

App runs at `http://localhost:3000`.

## Scripts

- `npm run dev` - start development server
- `npm run build` - build for production
- `npm run start` - run built app
- `npm run preview` - preview production build locally
- `npm run generate` - generate static output (Nuxt)

## Docker

A `Dockerfile` is included and:

- uses `node:20-slim`
- installs `google-chrome-stable`
- sets `PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome`
- builds the app and starts with `npm start`

Build and run:

```bash
docker build -t blinks .
docker run --rm -p 3000:3000 --env-file .env blinks
```

## API Overview

Auth:

- `POST /api/register`
- `POST /api/login`

Links:

- `GET /api/links`
- `POST /api/links/preview`
- `POST /api/links/check`
- `POST /api/links/create`
- `DELETE /api/links/:id`

Collections:

- `GET /api/collections`
- `POST /api/collections/create`
- `POST /api/collections/addToCollection`
- `POST /api/collections/removeLink`
- `DELETE /api/collections/:id`

Sharing:

- `POST /api/shared/link`
- `POST /api/shared/collection`
- `GET /api/shared`
- `DELETE /api/shared/:id`

Users:

- `GET /api/users`
