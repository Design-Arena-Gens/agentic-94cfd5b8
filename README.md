# AdCraft Agent · AI Ad Poster Designer

AdCraft is an autonomous creative assistant that turns a single product photo into a launch-ready advertising poster. The agent analyses color palettes, infers brand voice, writes copy, and renders a social-optimized layout directly in the browser—no APIs needed.

## ✨ Capabilities

- Adaptive color science: extracts dominant tones from the uploaded image and harmonises the layout.
- Brand voice inference: maps product descriptions to matching persuasive copy templates.
- Canvas compositor: renders 1080×1350 posters with gradients, depth layers, and polished typography.
- Explainability: logs every creative decision so teams can review and iterate quickly.
- Instant export: download production-ready PNGs in one click.

## 🚀 Quick start

```bash
npm install
npm run dev
```

Visit `http://localhost:3000` and upload a hero product image. Add a short product description, then hit **Generate poster** to watch the agent craft the layout.

## 🛠️ Tech stack

- Next.js 14 (App Router) + React 18
- TypeScript + Tailwind CSS
- Custom HTML Canvas rendering pipeline

## 📦 Production build

```bash
npm run build
npm run start
```

## 📄 License

MIT © 2024 AdCraft AI Agent
