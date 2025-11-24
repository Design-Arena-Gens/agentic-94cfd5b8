"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  AgentInsight,
  craftCallToAction,
  craftTagline,
  describeFeatureHighlight,
  generateAgentInsights,
} from "@/lib/text";
import {
  extractPaletteFromImage,
  getReadableTextColor,
  hexToRgba,
  mixColor,
} from "@/lib/colors";

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1350;

const fallbackPalette = ["#111827", "#1E293B", "#6366F1", "#F472B6", "#FACC15"];

const createImage = (url: string) => {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Unable to load the supplied image."));
    img.src = url;
  });
};

const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) => {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
};

const drawParagraph = (params: {
  ctx: CanvasRenderingContext2D;
  text: string;
  x: number;
  y: number;
  maxWidth: number;
  lineHeight: number;
  font: string;
  color: string;
  align?: CanvasTextAlign;
}) => {
  const { ctx, text, x, y, maxWidth, lineHeight, font, color, align = "left" } = params;
  ctx.save();
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textBaseline = "top";
  ctx.textAlign = align;

  const words = text.split(" ");
  let currentLine = "";
  let currentY = y;

  words.forEach((word, index) => {
    const testLine = currentLine.length === 0 ? word : `${currentLine} ${word}`;
    const { width } = ctx.measureText(testLine);
    if (width > maxWidth && currentLine.length > 0) {
      ctx.fillText(currentLine, x, currentY);
      currentLine = word;
      currentY += lineHeight;
    } else {
      currentLine = testLine;
    }

    if (index === words.length - 1) {
      ctx.fillText(currentLine, x, currentY);
    }
  });

  ctx.restore();
};

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const [palette, setPalette] = useState<string[]>([]);
  const [tagline, setTagline] = useState("");
  const [callToAction, setCallToAction] = useState("");
  const [featureHighlight, setFeatureHighlight] = useState(describeFeatureHighlight());
  const [posterDataUrl, setPosterDataUrl] = useState<string | null>(null);
  const [agentInsights, setAgentInsights] = useState<AgentInsight[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  useEffect(() => {
    const runRender = async () => {
      if (!canvasRef.current) return;
      if (!imageElementRef.current) return;
      if (palette.length === 0) return;
      if (!tagline || !callToAction) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const resolvedPalette = Array.from(
        { length: 5 },
        (_, index) => palette[index] ?? fallbackPalette[index]
      );

      const [primary, secondary, accent, highlightTone, pop] = resolvedPalette;
      const textColor = getReadableTextColor(mixColor(primary, 0.16));

      canvas.width = CANVAS_WIDTH;
      canvas.height = CANVAS_HEIGHT;

      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      gradient.addColorStop(0, mixColor(primary, 0.25));
      gradient.addColorStop(1, mixColor(secondary, -0.2));
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      const glow = ctx.createRadialGradient(
        CANVAS_WIDTH * 0.85,
        CANVAS_HEIGHT * 0.1,
        0,
        CANVAS_WIDTH * 0.85,
        CANVAS_HEIGHT * 0.1,
        CANVAS_WIDTH * 0.9
      );
      glow.addColorStop(0, hexToRgba(pop, 0.3));
      glow.addColorStop(1, hexToRgba(primary, 0));
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      ctx.save();
      drawRoundedRect(
        ctx,
        CANVAS_WIDTH * 0.08,
        CANVAS_HEIGHT * 0.18,
        CANVAS_WIDTH * 0.84,
        CANVAS_HEIGHT * 0.6,
        48
      );
      const panelGradient = ctx.createLinearGradient(
        CANVAS_WIDTH * 0.08,
        CANVAS_HEIGHT * 0.18,
        CANVAS_WIDTH * 0.92,
        CANVAS_HEIGHT * 0.78
      );
      panelGradient.addColorStop(0, hexToRgba(secondary, 0.18));
      panelGradient.addColorStop(1, hexToRgba(primary, 0.38));
      ctx.fillStyle = panelGradient;
      ctx.fill();
      ctx.restore();

      ctx.save();
      const ribbonHeight = 72;
      drawRoundedRect(
        ctx,
        CANVAS_WIDTH * 0.58,
        CANVAS_HEIGHT * 0.16,
        CANVAS_WIDTH * 0.34,
        ribbonHeight,
        28
      );
      const ribbonGradient = ctx.createLinearGradient(
        CANVAS_WIDTH * 0.58,
        CANVAS_HEIGHT * 0.16,
        CANVAS_WIDTH * 0.92,
        CANVAS_HEIGHT * 0.16 + ribbonHeight
      );
      ribbonGradient.addColorStop(0, mixColor(pop, -0.1));
      ribbonGradient.addColorStop(1, mixColor(pop, 0.25));
      ctx.fillStyle = ribbonGradient;
      ctx.fill();
      ctx.font = `600 28px "Manrope", "Inter", sans-serif`;
      ctx.fillStyle = getReadableTextColor(mixColor(pop, 0.12));
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText("Autonomous Poster Agent", CANVAS_WIDTH * 0.75, CANVAS_HEIGHT * 0.16 + ribbonHeight / 2);
      ctx.restore();

      const image = imageElementRef.current;
      const maxImageWidth = CANVAS_WIDTH * 0.58;
      const maxImageHeight = CANVAS_HEIGHT * 0.52;
      const imageRatio = image.naturalWidth / image.naturalHeight;
      let drawWidth = maxImageWidth;
      let drawHeight = drawWidth / imageRatio;

      if (drawHeight > maxImageHeight) {
        drawHeight = maxImageHeight;
        drawWidth = drawHeight * imageRatio;
      }

      const drawX = CANVAS_WIDTH * 0.11 + (maxImageWidth - drawWidth) / 2;
      const drawY = CANVAS_HEIGHT * 0.24 + (maxImageHeight - drawHeight) / 2;

      ctx.save();
      drawRoundedRect(ctx, drawX - 22, drawY - 22, drawWidth + 44, drawHeight + 44, 40);
      ctx.fillStyle = hexToRgba(highlightTone, 0.16);
      ctx.shadowColor = hexToRgba(primary, 0.45);
      ctx.shadowBlur = 48;
      ctx.shadowOffsetY = 32;
      ctx.fill();
      ctx.restore();

      ctx.save();
      drawRoundedRect(ctx, drawX, drawY, drawWidth, drawHeight, 32);
      ctx.clip();
      ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
      ctx.restore();

      ctx.save();
      ctx.textAlign = "left";
      ctx.fillStyle = textColor;

      ctx.font = `800 ${Math.round(CANVAS_WIDTH * 0.055)}px "Manrope", "Inter", sans-serif`;
      ctx.textBaseline = "top";
      const headlineX = CANVAS_WIDTH * 0.12;
      const headlineY = CANVAS_HEIGHT * 0.12;
      const maxHeadlineWidth = CANVAS_WIDTH * 0.74;
      drawParagraph({
        ctx,
        text: productName,
        x: headlineX,
        y: headlineY,
        maxWidth: maxHeadlineWidth,
        lineHeight: Math.round(CANVAS_WIDTH * 0.055),
        font: ctx.font,
        color: textColor,
      });

      drawParagraph({
        ctx,
        text: tagline,
        x: CANVAS_WIDTH * 0.12,
        y: CANVAS_HEIGHT * 0.76,
        maxWidth: CANVAS_WIDTH * 0.76,
        lineHeight: 48,
        font: `600 40px "Manrope", "Inter", sans-serif`,
        color: getReadableTextColor(mixColor(secondary, 0.1)),
      });

      drawParagraph({
        ctx,
        text: featureHighlight,
        x: CANVAS_WIDTH * 0.12,
        y: CANVAS_HEIGHT * 0.88,
        maxWidth: CANVAS_WIDTH * 0.76,
        lineHeight: 38,
        font: `500 30px "Manrope", "Inter", sans-serif`,
        color: hexToRgba(highlightTone, 0.9),
      });

      const ctaWidth = CANVAS_WIDTH * 0.42;
      const ctaHeight = 92;
      const ctaX = CANVAS_WIDTH * 0.12;
      const ctaY = CANVAS_HEIGHT * 0.9;
      ctx.save();
      drawRoundedRect(ctx, ctaX, ctaY, ctaWidth, ctaHeight, 46);
      const ctaGradient = ctx.createLinearGradient(ctaX, ctaY, ctaX + ctaWidth, ctaY + ctaHeight);
      ctaGradient.addColorStop(0, mixColor(accent, 0.25));
      ctaGradient.addColorStop(1, mixColor(pop, 0.1));
      ctx.fillStyle = ctaGradient;
      ctx.shadowColor = hexToRgba(accent, 0.45);
      ctx.shadowBlur = 32;
      ctx.shadowOffsetY = 16;
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.font = `700 34px "Manrope", "Inter", sans-serif`;
      ctx.fillStyle = getReadableTextColor(mixColor(accent, 0.25));
      ctx.textBaseline = "middle";
      ctx.textAlign = "center";
      ctx.fillText(callToAction, ctaX + ctaWidth / 2, ctaY + ctaHeight / 2);
      ctx.restore();

      ctx.restore();

      setPosterDataUrl(canvas.toDataURL("image/png"));
    };

    runRender();
  }, [callToAction, featureHighlight, palette, productName, tagline]);

  const resolvedPalette = useMemo(
    () => Array.from({ length: 5 }, (_, index) => palette[index] ?? fallbackPalette[index]),
    [palette]
  );

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setStatusMessage("Please upload an image file (PNG, JPG, or WebP).");
      return;
    }

    setStatusMessage(null);

    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }

    const nextUrl = URL.createObjectURL(file);
    setImageUrl(nextUrl);
    setPalette([]);
    setPosterDataUrl(null);
    setAgentInsights([]);
    setFeatureHighlight(describeFeatureHighlight());
    imageElementRef.current = null;
  };

  const handleGenerate = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    if (!productName.trim() || !productDescription.trim()) {
      setStatusMessage("Feed the agent a product name and description before generating.");
      return;
    }

    if (!imageUrl) {
      setStatusMessage("Upload a hero product image to anchor the composition.");
      return;
    }

    try {
      setIsGenerating(true);
      setStatusMessage("Running autonomous design pipeline…");

      const image =
        imageElementRef.current?.src === imageUrl
          ? imageElementRef.current
          : await createImage(imageUrl);

      imageElementRef.current = image;

      const extractedPalette = await extractPaletteFromImage(image, 5);
      setPalette(extractedPalette);

      const generatedTagline = craftTagline(productName, productDescription);
      setTagline(generatedTagline);

      const generatedCta = craftCallToAction(productDescription);
      setCallToAction(generatedCta);

      const insights = generateAgentInsights({
        productName,
        description: productDescription,
        palette: extractedPalette,
        tagline: generatedTagline,
        cta: generatedCta,
      });
      setAgentInsights(insights);

      setStatusMessage("Poster rendered. Download and ship your campaign.");
    } catch (error) {
      console.error(error);
      setStatusMessage(
        "The agent hit a snag while reading that image. Try another file or smaller size."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    const safeName = productName.trim().toLowerCase().replace(/\s+/g, "-") || "adcraft-poster";
    link.download = `${safeName}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-12 px-6 py-12 lg:px-12">
      <header className="flex flex-col gap-4">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-700 bg-slate-950/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
          AdCraft Autonomous Lab
        </span>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl">
          AI agent for high-converting ad posters
        </h1>
        <p className="max-w-2xl text-lg text-slate-300">
          Drop in a product shot. Feed a sentence of context. Watch the AdCraft agent build a
          campaign-ready poster with adaptive color science, brand-consistent copy, and export-ready
          assets.
        </p>
      </header>

      <section className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
        <form
          onSubmit={handleGenerate}
          className="flex flex-col gap-8 rounded-3xl border border-slate-800/80 bg-slate-900/40 p-6 backdrop-blur-lg sm:p-8"
        >
          <div className="grid gap-4">
            <label className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              Product name
              <input
                value={productName}
                onChange={(event) => setProductName(event.target.value)}
                placeholder="Lumen Arc Smart Lamp"
                className="mt-2 w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-base text-slate-100 outline-none transition hover:border-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
              />
            </label>
            <label className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              Product story
              <textarea
                value={productDescription}
                onChange={(event) => setProductDescription(event.target.value)}
                placeholder="Minimalist wireless lighting with adaptive brightness and ambient sensors."
                className="mt-2 min-h-28 w-full rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-base text-slate-100 outline-none transition hover:border-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
              />
            </label>
          </div>

          <div className="grid gap-3">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-400">
              Hero product image
            </span>
            <label className="group relative flex min-h-48 cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 px-6 py-8 text-center transition hover:border-indigo-500 hover:bg-slate-900/90">
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 transition group-hover:bg-indigo-500/20 group-hover:text-indigo-200">
                Upload or drop
              </span>
              <p className="max-w-sm text-sm text-slate-300">
                PNG, JPG or WebP. The agent analyses palette, contrast and shape composition.
              </p>
              {imageUrl && (
                <div className="mt-4 w-full overflow-hidden rounded-xl border border-slate-800 shadow-lg shadow-indigo-900/20">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Uploaded product preview"
                    className="max-h-64 w-full object-cover object-center"
                  />
                </div>
              )}
            </label>
          </div>

          <div className="grid gap-4 rounded-2xl bg-slate-950/40 p-5">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Copy adjustments
            </span>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-200">Tagline</span>
              <input
                value={tagline}
                onChange={(event) => setTagline(event.target.value)}
                placeholder="Next-level product storytelling generated here."
                className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-base text-slate-100 outline-none transition hover:border-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-200">Call to action</span>
              <input
                value={callToAction}
                onChange={(event) => setCallToAction(event.target.value)}
                placeholder="Launch your glow up"
                className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-base text-slate-100 outline-none transition hover:border-slate-700 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
              />
            </label>
          </div>

          <div className="flex flex-col gap-4 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 p-5">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200">
              Status feed
            </span>
            <p className="text-sm text-slate-200">
              {statusMessage ??
                "Agent idle. Feed it product context and trigger generation to craft a poster."}
            </p>
            <button
              type="submit"
              disabled={isGenerating}
              className="inline-flex items-center justify-center rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-white transition hover:bg-indigo-400 disabled:cursor-wait disabled:bg-indigo-600/70"
            >
              {isGenerating ? "Synthesizing…" : "Generate poster"}
            </button>
          </div>
        </form>

        <div className="flex flex-col gap-6">
          <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/30 p-6 backdrop-blur xl:p-8">
            <div className="absolute inset-x-0 -top-24 h-32 rounded-full bg-indigo-500/20 blur-3xl" />
            <div className="relative flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                    Poster preview
                  </span>
                  <p className="text-sm text-slate-300">
                    Canvas is rendered at 1080×1350 — optimal for social drops.
                  </p>
                </div>
                <button
                  onClick={handleDownload}
                  disabled={!posterDataUrl}
                  className="inline-flex items-center rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-200 transition hover:border-indigo-500 hover:text-indigo-200 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500"
                >
                  Download PNG
                </button>
              </div>
              <div className="overflow-hidden rounded-[28px] border border-slate-800/80 bg-slate-950/60 p-3 shadow-2xl shadow-indigo-900/30">
                <canvas
                  ref={canvasRef}
                  width={CANVAS_WIDTH}
                  height={CANVAS_HEIGHT}
                  className="mx-auto w-full max-w-[20rem] rounded-[24px] bg-slate-950/80 shadow-lg shadow-indigo-900/30 sm:max-w-[24rem] lg:max-w-[26rem]"
                />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/20 p-6 backdrop-blur">
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Color intelligence
            </span>
            <div className="mt-4 grid grid-cols-5 gap-3">
              {resolvedPalette.map((color, index) => (
                <div
                  key={color + index}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-slate-800/80 bg-slate-950/60 p-3 text-center"
                >
                  <div
                    className="aspect-square w-full rounded-xl border border-slate-800 shadow-inner shadow-slate-900/50"
                    style={{ background: color }}
                  />
                  <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-slate-400">
                    {color.toUpperCase()}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800/70 bg-slate-900/30 p-6 backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                Agent rationale
              </span>
            </div>
            <div className="mt-4 space-y-4">
              {agentInsights.length === 0 && (
                <p className="text-sm text-slate-400">
                  The reasoning board activates after generation, logging every creative decision
                  for your review.
                </p>
              )}
              {agentInsights.map((insight) => (
                <div
                  key={insight.title}
                  className="grid gap-1 rounded-2xl border border-slate-800/70 bg-slate-950/50 px-4 py-3"
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-200">
                    {insight.title}
                  </span>
                  <p className="text-sm text-slate-200">{insight.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
