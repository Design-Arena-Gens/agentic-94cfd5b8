const brandVoices = [
  {
    id: "bold",
    matcher: (text: string) =>
      /performance|power|bold|sport|speed|pro|max/i.test(text),
    adjectives: ["Bold", "Unstoppable", "Fearless", "Uncompromising"],
    vibes: [
      "Built for those who refuse limits",
      "Engineered to outperform expectations",
      "Made for moments that demand more",
    ],
    ctas: [
      "Claim yours today",
      "Level up your performance",
      "Join the power movement",
    ],
  },
  {
    id: "eco",
    matcher: (text: string) =>
      /eco|green|sustainable|organic|earth|planet|nature|clean/i.test(text),
    adjectives: ["Natural", "Pure", "Eco-Luxe", "Conscious"],
    vibes: [
      "Where sustainability meets style",
      "Designed to respect the planet",
      "A cleaner choice for modern living",
    ],
    ctas: [
      "Choose the greener upgrade",
      "Make the conscious switch",
      "Feel-good design, delivered",
    ],
  },
  {
    id: "luxury",
    matcher: (text: string) =>
      /lux|luxury|artisan|premium|signature|limited/i.test(text),
    adjectives: ["Signature", "Artisanal", "Refined", "Curated"],
    vibes: [
      "Crafted for uncompromised taste",
      "Because ordinary is never enough",
      "An elevated experience in every detail",
    ],
    ctas: [
      "Reserve your limited drop",
      "Indulge in the experience",
      "Step into the signature collection",
    ],
  },
  {
    id: "wellness",
    matcher: (text: string) =>
      /wellness|calm|relax|balance|fresh|glow|self-care|mindful/i.test(text),
    adjectives: ["Radiant", "Restorative", "Mindful", "Balanced"],
    vibes: [
      "Your daily ritual for feeling amazing",
      "Wellness that fits real life",
      "Designed to restore your natural rhythm",
    ],
    ctas: [
      "Refresh your routine",
      "Start your glow-up",
      "Make self-care non-negotiable",
    ],
  },
];

const defaultVoice = {
  id: "universal",
  adjectives: ["Smart", "Next-Level", "Game-Changing", "Inspired"],
  vibes: [
    "Designed for the modern creator",
    "Innovation you can feel instantly",
    "Built to elevate your every day",
  ],
  ctas: [
    "Unlock the full experience",
    "Make it yours today",
    "Create your highlight moment",
  ],
};

const descriptorFragments = [
  "crafted with intention",
  "designed for real-life impact",
  "built to stand out effortlessly",
  "powered by intuitive design",
  "engineered for human moments",
  "optimized for instant wow-factor",
];

const benefitFragments = [
  "Amplifies your brand presence in seconds",
  "Transforms simple ideas into standout visuals",
  "Turns honest moments into hero stories",
  "Helps your product spark immediate emotion",
  "Designed for social-ready storytelling",
  "Perfect for launch moments and quick campaigns",
];

const outputHooks = [
  "Optimized layout hierarchy keeps the spotlight on your hero image.",
  "Smart color pairing builds instant visual cohesion.",
  "Subtle depth layers generate premium perceived value.",
  "Asymmetric grid draws the eye to the CTA without stealing focus.",
  "Typography pairings tuned for high-contrast readability.",
];

export const pickVoice = (input: string) => {
  const match = brandVoices.find((voice) => voice.matcher(input));
  return match ?? defaultVoice;
};

const randomItem = <T,>(list: T[]): T => {
  return list[Math.floor(Math.random() * list.length)];
};

export const craftTagline = (
  productName: string,
  description: string
): string => {
  const voice = pickVoice(`${productName} ${description}`);
  const adjective = randomItem(voice.adjectives);
  const vibe = randomItem(voice.vibes);
  return `${adjective} ${productName}. ${vibe}.`;
};

export const craftCallToAction = (description: string): string => {
  const voice = pickVoice(description);
  return randomItem(voice.ctas);
};

export interface AgentInsight {
  title: string;
  detail: string;
}

export const generateAgentInsights = (params: {
  productName: string;
  description: string;
  palette: string[];
  tagline: string;
  cta: string;
}): AgentInsight[] => {
  const { productName, description, palette, tagline, cta } = params;
  const voice = pickVoice(description);
  const paletteDescription =
    palette.length > 0
      ? palette.slice(0, 3).map((color) => color.toUpperCase()).join(", ")
      : "dynamic neutrals";

  return [
    {
      title: "Brand Voice Detected",
      detail: `Aligned with a ${voice.id} tone to keep ${productName} feeling authentic.`,
    },
    {
      title: "Palette Strategy",
      detail: `Dominant colors locked: ${paletteDescription}. Contrast curve tuned for scroll-stopping impact.`,
    },
    {
      title: "Copywriting Pass",
      detail: `Tagline generated as “${tagline}” with CTA “${cta}”.`,
    },
    {
      title: "Layout Rationale",
      detail: randomItem(outputHooks),
    },
    {
      title: "Launch Checklist",
      detail: randomItem(benefitFragments),
    },
  ];
};

export const describeFeatureHighlight = (): string => {
  return randomItem(descriptorFragments);
};

