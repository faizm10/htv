# GhostWing 👻

Your AI wingman for ghosting and dry chats. A spooky-playful SaaS that keeps conversations alive with crisp typography, subtle neon glows, micro-roasts, and buttery animations.

## 🎬 60-Second Demo Script

1. **"This is GhostWing — an AI wingman for ghosting/dry chats."**
2. Open "Jamie" → **GhostBadge 92** (hard haunt) + "63 days since reply."
3. Type "hey" → **Dryness banner** pops → choose playful chip → send.
4. Open **Alex → Nudge** → generate 3 options → send one. *(Confetti as score drops)*
5. Show **Insights**: "Your replies get drier after 11pm."
6. Click **Exit** → paste polite boundary → "Ghost contained. Nice."

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp .env.local.example .env.local
   # Add your GEMINI_API_KEY (optional - works with mock data too)
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open [http://localhost:3000](http://localhost:3000)** in your browser.

## 🎨 Features

### Core Functionality
- **GhostBadge**: Real-time ghosting risk assessment (0-100)
- **Dryness Detection**: AI-powered message quality analysis
- **Alex**: Generate nudges, rewrites, and exit messages
- **Conversation Management**: Track and manage multiple chats

### UI/UX Highlights
- **Dark-first theme** with custom GhostWing color palette
- **Framer Motion animations** for smooth interactions
- **Responsive 3-column layout** (conversations, chat, Alex)
- **Accessibility features** with keyboard shortcuts and ARIA labels

### AI Integration
- **Google Gemini** for intelligent suggestions
- **Mock fallbacks** when API key isn't provided
- **Context-aware** rewriting and nudging

## 🎯 Key Components

### GhostBadge
- Color-coded tiers: Alive (0-29), Slow fade (30-59), Advanced haunting (60-79), Poltergeist (80-100)
- Pulsing animation when crossing tier boundaries
- Glowing effects for high-risk states

### MessageBubble
- Quality indicators: Dry, Okay, Playful
- Smooth animations on message arrival
- Responsive design with proper message tails

### DraftCoachBanner
- Appears when draft is "Sahara-level dry"
- 3 AI-generated suggestions
- One-click insertion into composer

### AIBox
- **Nudge**: Low-risk conversation starters
- **Rewrite**: Multiple draft variants
- **Exit**: Polite boundary messages
- **Insights**: Analytics and trends

## 🎨 Design System

### Color Palette
- **Background**: `#0b0f17` (near-black blue)
- **Panel**: `#121827`
- **Ink**: `#E6EDF3`
- **Accent Slime**: `#93ff7a` (success/healthy)
- **Accent Ectoplasm**: `#9b8cff` (AI/actions)
- **Danger Haunt**: `#ff5470` (hard ghost)

### Typography
- **Headings**: Sora (700 weight, -0.02em letter-spacing)
- **Body**: Inter (400/500 weight, 1.6 line-height)

### Animations
- **Message arrival**: Fade + 6px vertical lift (180ms)
- **Badge pulses**: Scale + glow expansion (1.5s loop)
- **AI suggestions**: Slide from right (220ms spring)
- **Confetti**: Triggered on significant ghost score drops

## 🎪 Easter Eggs

- Hover the app title for 3 seconds → tiny ghost drifts across header
- Type "k" alone → shake + tooltip "you can do better, champ"
- Redact mode toggle blurs names/text until clicked

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: Custom components with ShadCN patterns
- **Animations**: Framer Motion
- **AI**: Google Gemini API
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📱 Responsive Design

- **Desktop**: Full 3-column layout
- **Tablet**: Collapsible sidebars
- **Mobile**: Single-column with navigation

## ♿ Accessibility

- Minimum 4.5:1 contrast ratios
- Keyboard navigation support
- ARIA live regions for AI suggestions
- Reduced motion mode support
- Screen reader friendly

## 🧪 Demo Data

The app includes rich demo data with:
- 6 conversations with varying ghost scores
- Realistic message threads
- Precomputed metrics and trends
- Jamie Chen as the "high-risk" example (92% ghost score)

## 🚀 Deployment

The app is ready for deployment on Vercel, Netlify, or any Next.js-compatible platform. Just ensure your environment variables are set correctly.

## 📄 License

MIT License - feel free to use this for your own projects!

---

**Built with 👻 by the GhostWing team**