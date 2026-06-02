# Sudemy — Nền Tảng Học AI Thực Chiến

> Vietnamese LMS platform for practical AI tool courses.

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite + TailwindCSS v4 + shadcn/ui |
| Backend | Express.js + TypeScript + Mongoose |
| Database | MongoDB Atlas |
| Auth | Firebase Auth (Google + Email) |
| Payment | PayOS |
| Email | Resend |
| Deploy | Vercel (FE) + Render (BE) |

## Quick Start

```bash
# 1. Install
cd client && npm install && cd ../server && npm install

# 2. Configure
cp .env.example .env  # Fill in your values

# 3. Run
cd server && npm run dev   # Terminal 1
cd client && npm run dev   # Terminal 2
```

## Documentation Index

| Document | Description |
|---|---|
| [PROJECT_BRIEF_V1_MVP_EN.md](PROJECT_BRIEF_V1_MVP_EN.md) | Full MVP specification |
| [PROJECT_BRIEF_V2_UPGRADE_EN.md](PROJECT_BRIEF_V2_UPGRADE_EN.md) | V2 upgrade plan |
| [TASK_ROADMAP.md](TASK_ROADMAP.md) | Sprint/milestone breakdown |
| [LEARNINGS.md](LEARNINGS.md) | Feedback loop — lessons learned |
| [docs/API_SPECIFICATION.md](docs/API_SPECIFICATION.md) | All API endpoints with schemas |
| [docs/DATA_MODELS.md](docs/DATA_MODELS.md) | MongoDB schemas + relationships |
| [docs/COMPONENT_MAP.md](docs/COMPONENT_MAP.md) | React component tree + props |
| [docs/DESIGN_TOKENS.md](docs/DESIGN_TOKENS.md) | Colors, typography, spacing |
| [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md) | Setup guide + .env reference |
| [docs/THIRD_PARTY_INTEGRATION.md](docs/THIRD_PARTY_INTEGRATION.md) | Firebase, PayOS, Resend guides |
| [docs/SECURITY_CHECKLIST.md](docs/SECURITY_CHECKLIST.md) | Security requirements |
| [docs/TESTING_STRATEGY.md](docs/TESTING_STRATEGY.md) | Test plan + coverage targets |
| [docs/SEED_DATA.md](docs/SEED_DATA.md) | Dev seed data for all collections |

## AI Agent Rules
See `.agents/rules/` for AI-specific coding rules and context.
