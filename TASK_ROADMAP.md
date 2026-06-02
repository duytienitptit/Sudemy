# Task Roadmap — Sudemy V1 MVP

> **Approach:** Backend first → Frontend second per milestone.
> **Task files:** See `tasks/M{n}_*/T{n}.{x}_*.md` for detailed task breakdowns.
> **Changes:** Track in `tasks/CHANGE_LOG.md`.

---

## Overview

| Milestone | Focus | Tasks | Status |
|---|---|---|---|
| **M0** | Foundation — project init, models, middleware | 5 tasks | ⬜ |
| **M1** | Auth & Users — register, login, roles | 4 tasks | ⬜ |
| **M2** | Prompts & Tags — SEO library, filtering | 4 tasks | ⬜ |
| **M3** | Courses & Lessons — content, quiz, certificates | 6 tasks | ⬜ |
| **M4** | Payments — PayOS, orders, coupons, flash sales | 5 tasks | ⬜ |
| **M5** | Admin & Polish — dashboard, settings, landing page | 6 tasks | ⬜ |

**Total: 30 tasks**

---

## Design Checkpoints

Before starting each milestone's frontend tasks, design the relevant screens on Stitch:

| Before | Design |
|---|---|
| M1 FE | Landing Page, Login, Register, Header/Footer |
| M2 FE | Prompts List, Prompt Detail, Admin Prompts/Tags |
| M3 FE | Course List, Course Detail, Player, Dashboard |
| M4 FE | Checkout, Payment Success/Cancel, Admin Orders |
| M5 FE | Admin Dashboard, Settings, Tickets, Landing polish |

---

## Milestone Dependencies

```
M0 (Foundation) → M1 (Auth) → M2 (Prompts) ──┐
                                                ├→ M5 (Admin & Polish)
                              M3 (Courses) ────┤
                              M4 (Payments) ───┘
```

M2, M3, M4 can be done in any order after M1. M5 depends on all others.
