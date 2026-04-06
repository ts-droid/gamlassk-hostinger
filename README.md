# Gamla SSK Website - Hostinger Deployment

## Build Configuration (Hostinger Settings)

- **Framework:** Express (Node.js)
- **Node version:** 22.x
- **Package manager:** npm
- **Build command:** `npm run build`
- **Entry file:** `dist/index.js`
- **Root directory:** `./`

## Environment Variables Required

| Key | Description |
|-----|-------------|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `DATABASE_URL` | MySQL connection string |
| `JWT_SECRET` | Session signing secret |
| `ADMIN_PASSWORD` | Admin login password |
| `VITE_APP_URL` | Public URL of the site |

## How it works

Hostinger runs `npm install` then `npm run build` which:
1. Builds the React frontend with Vite → `dist/public/`
2. Bundles the Express server with esbuild → `dist/index.js`
3. Starts with `node dist/index.js`
