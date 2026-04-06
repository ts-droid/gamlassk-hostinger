# Hostinger Runtime Bundle

This folder is generated from the root project with `pnpm hostinger:prepare`.

Use this folder as the Hostinger root directory for deployments that should avoid building with Vite/esbuild on the server.

Recommended Hostinger settings:

- Root directory: `./hostinger-deploy`
- Package manager: `npm`
- Entry file: `index.js`
- Node.js version: `22.x`
- Build command: leave empty if Hostinger allows it, otherwise `npm install`
- Start command: `npm start`
