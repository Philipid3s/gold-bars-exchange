# Gold Bars Exchange

Blockchain-backed marketplace for physical gold bars. The UI lets users create listings, make offers, accept or reject offers, and stores metadata in MongoDB via Next.js API routes. On-chain actions are executed through MetaMask on Polygon Amoy (testnet).



## Stack
1. **Frontend**: Next.js 16, React 18, MUI v5. Node.js 22.
2. **State**: Redux + redux-api.
3. **Blockchain**: viem + MetaMask.
4. **Database**: MongoDB (Mongoose).
5. **API**: Next.js API routes (`/pages/api`).

## Features
1. Create and list gold bar listings.
2. Make, accept, and reject offers on-chain.
3. API key protection for API routes (optional).
4. Swagger docs at `/docs`.

## Project Layout
1. `pages/index.js`: main UI and Web3 actions.
2. `pages/status.js`: wallet/chain status.
3. `pages/api/v1/goldbars/*`: REST API routes.
4. `models/GoldBar.js`: MongoDB model.
5. `lib/mongoose.js`: DB connection helper.
6. `lib/viem.js`: wallet and chain helpers.
7. `contracts/`: ABI and bytecode.
8. `components/`: UI components.

## API
1. `GET /api/v1/goldbars` (paginated via `limit` and `offset`)
2. `POST /api/v1/goldbars`
3. `GET /api/v1/goldbars/:id`
4. `PUT /api/v1/goldbars/:id`
5. `DELETE /api/v1/goldbars/:id`

## Swagger
1. UI: `http://localhost:3000/docs`
2. JSON: `http://localhost:3000/api/docs`

## Environment

Create a root `.env`:

```env
MONGODB_URI=mongodb://localhost/gold-bars
API_KEY=change-me
NEXT_PUBLIC_RPC_URL=https://rpc-amoy.polygon.technology/
NEXT_PUBLIC_API_URL=
```

Notes:
1. `API_KEY` is server-only. Set it when the process starts (shell export, or the `app` service `environment` in Docker Compose). It is not a `NEXT_PUBLIC_*` variable and it is not passed as a Docker build argument.
2. `NEXT_PUBLIC_API_KEY` has been removed. The browser does not send `x-api-key`. Same-origin writes from the UI (the PoC on port 3000) are allowed. Other clients must send header `x-api-key` with the runtime `API_KEY`.
3. `NEXT_PUBLIC_API_URL` can be left empty to use same-origin API routes.
4. `NEXT_PUBLIC_RPC_URL` is a public Polygon Amoy endpoint. It may be set at image build time. It is not a secret.

## Local Dev

```bash
npm install
npm run dev
```

API: `http://localhost:3000/api/v1/goldbars`

## Docker (Dev)

```bash
docker compose up --build
```

Uses `docker-compose.yml` and runs `npm run dev`.

## Docker (Prod)

Put runtime settings in a root `.env` (see `.env.example`). Do not create `.env.production` for the API key; env files are excluded from the image build.

```bash
docker compose -f docker-compose.prod.yml up --build
```

Uses `Dockerfile` (multi-stage, Node 22) and runs `npm run build` + `npm run start`. `API_KEY` is passed into the running container only.

## Upgrade notes (Next.js 14 → 16, Node 20 → 22)

1. Node.js 20 is end of life. Images and `package.json` `engines` now require Node.js 22 (maintained LTS). Next.js 16 itself allows Node.js 20.9+, but this repo does not.
2. Next.js 15 left maintenance on 21 Oct 2026. This app is on Next.js 16 (active LTS), still using the Pages Router and React 18. Next.js 16 prints a deprecation that React 18 support goes away in Next.js 17. React stays on 18 because `react-redux` 7 (used by the Pages UI) does not declare React 19 support.
3. `next build` / `next dev` use Turbopack by default. This app has no custom webpack config.
4. Removed Next.js 16 features that this app did not use: `next lint`, AMP, `middleware` (now `proxy`), and `serverRuntimeConfig` / `publicRuntimeConfig`.
5. Deployers: drop `NEXT_PUBLIC_API_KEY`. Keep supplying `API_KEY` at container start. Rotate that key and delete Docker Hub tags built before this change; those tags contain the old key in client JavaScript. That cleanup is outside this repo.
6. Next.js 16 warns that a root `static/` directory is deprecated in favor of `public/`. This version still serves `/static/app.css`, so the PoC stylesheet URL is unchanged.

## Mongo via Docker

MongoDB: `mongodb://localhost:27017`

## Tests

API tests:

```bash
npm run test:api
```

## Polygon Amoy Test Account

1. Install MetaMask and create a wallet.
2. Add Polygon Amoy network in MetaMask:

```text
Network Name: Polygon Amoy Testnet
RPC URL: https://rpc-amoy.polygon.technology/
Chain ID: 80002
Currency Symbol: POL
Block Explorer URL: https://amoy.polygonscan.com/
```

3. Get test tokens at:

```text
https://faucet.polygon.technology
```

## Notes

1. Actions are blocked if wallet is not connected or chain is not Amoy.
2. The current UI uses a simple listing flow; the contract ABI/bytecode are in `contracts/`.
