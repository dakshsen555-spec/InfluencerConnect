# InfluencerConnect 🚀
> **Two-sided micro-influencer discovery platform built with Next.js 15, Supabase pgvector, and Gemini AI. Features RAG semantic matching, tone-adaptive pitch generation, and verified deliverable escrow for bootstrapped startups.**

---

### AI-Powered Micro-Influencer Marketplace for Small Businesses & Startups

InfluencerConnect helps bootstrapped startups and local businesses (who cannot afford $5,000+ celebrity influencers) discover, match with, and pitch authentic nano & micro-influencers (1k–50k followers) across YouTube, Instagram, TikTok, and Facebook.

---

## 🌟 Key Features

1. **Two-Sided Creator Marketplace**:
   - **Small Business Hub**: Enter a plain-language product description (e.g. *"Eco-friendly vegan dog treats in Austin"*).
   - **Creator Studio**: Micro-influencers register their rate cards ($20–$180/post), platform statistics, and content niches.

2. **RAG Semantic Vector Matchmaker**:
   - Computes dense vector embeddings of creator bios, content themes, and recent top video transcripts using **Google Gemini (`text-embedding-004`)** and **pgvector**.
   - Calculates **Cosine Similarity** + Multi-Factor Re-Ranking:
     - 35% Location / Geography Alignment (local creators prioritized when city is specified)
     - 30% Semantic Relevance
     - 20% Niche / Keyword Alignment
     - 10% Budget Compatibility ($ asking rate vs campaign budget)
     - 5% Engagement Rate Boost (benchmarked for authentic 6–11% micro-engagement)

3. **Direct AI Pitch Generator**:
   - Generates customized outreach pitches powered by **Gemini 1.5/2.0/3.8 Flash**.
   - **Hooks the creator's actual recent top post** (e.g., *"Loved your video ranking 5 plant-based dog chews in Austin"*).
   - Select between *Friendly*, *Professional*, and *Casual* tones with real-time tone adaptation.
   - Live editable subject & body, 1-click clipboard copy, and direct contract dispatch.

4. **Micro-Cash Escrow Hub**:
   - Fixed micro-budgets ($20 to $200 per deliverable).
   - Funds held safely in escrow upon contract dispatch.
   - Creator submits live post proof (URL).
   - Business verifies deliverable and releases the payout.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS, Glassmorphism, Lucide Icons
- **AI & RAG**: Google Gemini API (`@google/generative-ai`)
- **Database**: Supabase PostgreSQL + `pgvector` (with automatic in-memory persistent fallback)
- **State Management**: Reactive local store with browser persistence

---

## 📂 Project Structure

```
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── enhance-brief/route.ts  # Gemini brief analyzer
│   │   │   ├── match/route.ts          # RAG vector matching endpoint
│   │   │   └── pitch/route.ts          # Gemini personalized pitch generator
│   │   ├── globals.css                 # Dark theme & glassmorphism
│   │   ├── layout.tsx                  # Root metadata & layout
│   │   └── page.tsx                    # Main marketplace & studio application
│   ├── components/
│   │   ├── CampaignCreator.tsx         # Plain-English campaign creator + presets
│   │   ├── CreatorOnboardingModal.tsx  # Self-onboarding portal for creators
│   │   ├── CreatorStudio.tsx           # Creator view: rate cards, inbox, submission
│   │   ├── EscrowTracker.tsx           # Financial escrow protection hub
│   │   ├── MatchCard.tsx               # Creator match card with score breakdown
│   │   ├── Navbar.tsx                  # Header with role switcher & metrics
│   │   └── PitchGeneratorModal.tsx     # Gemini AI pitch generator
│   ├── lib/
│   │   ├── data/creators.ts            # Seeded micro-influencer profiles
│   │   ├── gemini.ts                   # Gemini AI text generation
│   │   ├── rag.ts                      # Vector embeddings & cosine similarity
│   │   └── supabase.ts                 # Database & persistent state manager
│   └── types/
│       └── index.ts                    # TypeScript data models
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql      # Supabase pgvector schema
└── README.md
```
