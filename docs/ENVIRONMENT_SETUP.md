# Environment Setup Guide

## Prerequisites
- **Node.js:** v20+ (LTS recommended)
- **npm:** v10+ (comes with Node.js)
- **MongoDB:** Atlas account (free tier) or local MongoDB 7+
- **Git:** Latest version

## Quick Start

```bash
# 1. Clone and install
git clone <repo-url> && cd Sudemy
cd client && npm install && cd ../server && npm install

# 2. Configure environment
cp .env.example .env
# Fill in your values (see Environment Variables section below)

# 3. Seed database (first time only)
cd server && npm run seed

# 4. Run development servers
# Terminal 1:
cd server && npm run dev

# Terminal 2:
cd client && npm run dev
```

Client runs on `http://localhost:5173`, Server on `http://localhost:5000`.

---

## Environment Variables

### Server (`server/.env`)

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net/sudemy` |
| `JWT_SECRET` | JWT signing secret (min 32 chars) | `your-super-secret-key-min-32-chars` |
| `JWT_EXPIRES_IN` | JWT token expiration | `7d` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `sudemy-xxxxx` |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | `firebase-adminsdk-xxx@sudemy.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key | `-----BEGIN PRIVATE KEY-----\n...` |
| `PAYOS_CLIENT_ID` | PayOS client ID | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `PAYOS_API_KEY` | PayOS API key | `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| `PAYOS_CHECKSUM_KEY` | PayOS checksum key for webhook verification | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` |
| `PAYOS_RETURN_URL` | Redirect URL after successful payment | `http://localhost:5173/payment/success` |
| `PAYOS_CANCEL_URL` | Redirect URL after cancelled payment | `http://localhost:5173/payment/cancel` |
| `RESEND_API_KEY` | Resend email API key | `re_xxxxxxxxx` |
| `RESEND_FROM_EMAIL` | Sender email address | `no-reply@sudemy.vn` |
| `CLIENT_URL` | Frontend URL (for CORS) | `http://localhost:5173` |
| `LOG_LEVEL` | Winston log level | `debug` |

### Client (`client/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000/api/v1` |
| `VITE_FIREBASE_API_KEY` | Firebase web API key | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `sudemy-xxxxx.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID | `sudemy-xxxxx` |
| `VITE_GA_MEASUREMENT_ID` | Google Analytics 4 ID | `G-XXXXXXXXXX` |

---

## Third-Party Account Setup

### MongoDB Atlas
1. Create free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free M0 cluster (512MB)
3. Create database user with read/write access
4. Whitelist IP (or `0.0.0.0/0` for development)
5. Get connection string → paste into `MONGODB_URI`

### Firebase
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project "Sudemy"
3. Enable Authentication → Email/Password + Google provider
4. Go to Project Settings → Service Accounts → Generate new private key
5. Copy `project_id`, `client_email`, `private_key` → paste into server `.env`
6. Go to Project Settings → General → Web app → Copy config → paste into client `.env`

### PayOS
1. Register at [payos.vn](https://payos.vn)
2. Create sandbox application
3. Copy Client ID, API Key, Checksum Key → paste into server `.env`
4. Configure webhook URL: `https://your-api.com/api/v1/payments/webhook`

### Resend
1. Register at [resend.com](https://resend.com)
2. Get API key from dashboard
3. Verify sending domain (or use `onboarding@resend.dev` for testing)

### Google Analytics 4
1. Go to [analytics.google.com](https://analytics.google.com)
2. Create property → Web stream
3. Copy Measurement ID (G-XXXXXXXXXX) → paste into client `.env`

---

## Common Issues & Troubleshooting

| Issue | Solution |
|---|---|
| MongoDB connection fails | Check IP whitelist, verify connection string, ensure cluster is running |
| Firebase token verification fails | Ensure `FIREBASE_PRIVATE_KEY` has `\n` characters (not literal newlines) |
| PayOS webhook not received | Use ngrok for local development, verify webhook URL in PayOS dashboard |
| CORS errors | Verify `CLIENT_URL` matches exactly (including port, no trailing slash) |
| Port already in use | Kill process: `lsof -ti:5000 \| xargs kill -9` |
| Vite HMR not working | Clear `.vite` cache: `rm -rf client/node_modules/.vite` |
