# Gold Bars Exchange

Blockchain-backed marketplace for physical gold bars. The UI lets users create listings, make offers, accept or reject offers, and stores metadata in MongoDB via Next.js API routes. On-chain actions are executed through MetaMask on Polygon Amoy (testnet).

## Stack
1. **Frontend**: Next.js 14, React 18, MUI v5.
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
NEXT_PUBLIC_API_KEY=change-me
NEXT_PUBLIC_RPC_URL=https://rpc-amoy.polygon.technology/
NEXT_PUBLIC_API_URL=
```

Notes:
1. `API_KEY` secures API routes (server-side).
2. `NEXT_PUBLIC_API_KEY` is sent by the frontend in `x-api-key`.
3. `NEXT_PUBLIC_API_URL` can be left empty to use same-origin API routes.

## Local Dev

```bash
npm install
npm run dev
```

API: `http://localhost:3000/api/v1/goldbars`

## Mongo via Docker

```bash
docker compose up --build
```

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
