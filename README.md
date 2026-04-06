# Hostinger Runtime Bundle
This folder is generated from the root project with `pnpm build`.
Use this folder as the Hostinger root directory for deployments that should avoid building with Vite/esbuild on the server.
Recommended Hostinger settings:
- Root directory: `./`
- Package manager: `npm`
- Entry file: `index.js`
- Node.js version: `22.x`
- Build command: `npm install --production`
- Start command: `npm start`
