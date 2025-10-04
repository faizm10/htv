# 🔮 GhostWing

Your AI wingman for ghosting/dry chats. Turn those awkward silences into engaging conversations with spooky-playful SaaS magic.

![GhostWing Demo](https://via.placeholder.com/800x400/0b0f17/9b8cff?text=GhostWing+Demo)

## ✨ Features

- **Smart Rewrites**: Transform dry messages into engaging conversations
- **Ghost Detection**: Track conversation health with real-time scoring (0-100)
- **AI Suggestions**: Get contextual nudges and exit strategies via Google Gemini
- **Beautiful UI**: Dark theme with neon glows and buttery animations
- **Accessibility**: Full keyboard navigation and screen reader support

## 🚀 Quick Start

1. **Clone and install**:
   ```bash
   git clone <your-repo>
   cd ghostwing
   npm install
   ```

2. **Set up environment**:
   ```bash
   cp env.example .env.local
   # Add your Gemini API key to .env.local
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open** [http://localhost:3000](http://localhost:3000)

## 🎬 60-Second Demo Script

1. **"This is GhostWing — an AI wingman for ghosting/dry chats."**
   - Show the landing page with the floating ghost animation

2. **Open "Jamie" → GhostBadge 92 (hard haunt) + "63 days since reply."**
   - Navigate to dashboard, click on Jamie's conversation
   - Point out the red poltergeist badge and sparkline trend

3. **Type "hey" → Dryness banner pops → choose playful chip → send.**
   - Type a dry message in the composer
   - Show the "Sahara-level dry" banner with suggestions
   - Select a playful suggestion and send

4. **Open AI Sidekick → Nudge → generate 3 options → send one. (Confetti as score drops)**
   - Switch to the Nudge tab in the AI panel
   - Generate suggestions and send one
   - Watch the confetti animation when ghost score improves

5. **Show Insights: "Your replies get drier after 11pm."**
   - Switch to Insights tab
   - Show the metric cards and ghost score trend

6. **Click Exit → paste polite boundary → "Ghost contained. Nice."**
   - Switch to Exit tab
   - Generate a polite exit message
   - Show the success toast

## 🎨 Design System

### Color Palette
- **Background**: `#0b0f17` (near-black blue)
- **Panel**: `#121827`
- **Text**: `#E6EDF3`
- **Slime Green**: `#93ff7a` (success/healthy)
- **Ectoplasm Purple**: `#9b8cff` (AI/actions)
- **Haunt Red**: `#ff5470` (danger)

### Ghost Score Tiers
- **0-29** ✅ *Alive & texting* (Green)
- **30-59** 🟡 *Slow fade* (Yellow)
- **60-79** 🟠 *Advanced haunting* (Orange)
- **80-100** 🔴 *Poltergeist mode* (Red)

### Typography
- **Display**: Sora/Plus Jakarta Sans (700 for headings)
- **Body**: Inter (400/500)
- **Tight letter-spacing** on headings (-0.02em)
- **Comfy line-height** for messages (1.6)

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + ShadCN
- **Animations**: Framer Motion
- **AI**: Google Gemini API
- **Icons**: Lucide React

## 📁 Project Structure

```
ghostwing/
├── app/                    # Next.js app directory
│   ├── chat/[id]/         # Chat page with 3-column layout
│   ├── dashboard/         # Dashboard with conversation list
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # ShadCN UI components
│   ├── GhostBadge.tsx    # Ghost score indicator
│   ├── MessageBubble.tsx # Chat message component
│   ├── DraftCoachBanner.tsx # Dryness suggestions
│   ├── AIBox.tsx         # AI sidekick panel
│   └── ...
├── hooks/                # Custom React hooks
│   ├── useDemoData.ts    # Synthetic conversation data
│   └── useDryness.ts     # Message quality detection
├── lib/                  # Utilities
│   ├── gemini.ts         # Google Gemini integration
│   └── utils.ts          # Helper functions
└── ...
```

## 🎯 Key Components

### GhostBadge
Circular indicator showing conversation health (0-100) with color-coded tiers and pulse animation for high scores.

### MessageBubble
Chat message with quality indicators (Dry/Okay/Playful) and smooth animations.

### DraftCoachBanner
Appears when typing dry messages, offering AI-generated suggestions to improve engagement.

### AIBox
Right panel with tabs for Nudge, Rewrite, Exit, and Insights. Integrates with Google Gemini for contextual suggestions.

### Sparkline
Mini trend visualization for ghost score over time.

## 🔧 Configuration

### Environment Variables
- `GEMINI_API_KEY`: Your Google Gemini API key (get from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Customization
- Colors: Edit `tailwind.config.js` and `app/globals.css`
- Animations: Modify Framer Motion configs in components
- AI prompts: Update `lib/gemini.ts` functions

## 🧪 Testing

```bash
# Run tests
npm test

# Test dryness detection
npm run test:dryness

# Test ghost badge tiers
npm run test:ghost-badge
```

## 🚀 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Add `GEMINI_API_KEY` environment variable
4. Deploy!

### Other Platforms
- Build: `npm run build`
- Start: `npm start`
- Ensure environment variables are set

## 🎭 Easter Eggs

- Hover the app title for 3 seconds → tiny ghost drifts across
- Type "k" alone → shake + tooltip "you can do better, champ"
- Confetti when ghost score drops >10 points
- Ghost badge pulses when crossing tier boundaries

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **Email**: support@ghostwing.ai

---

*Built with 👻 and lots of coffee. Happy ghost-busting!*
