# Icon Studio

MVP1 icon studio app: **raster-first layered editing via segmentation**. Generate a Beauty PNG + Segmentation PNG, extract editable layers (background, object groups, text overlay), and edit recolor/opacity/transform/text. Built with SvelteKit.

## Concepts (from spec)

- **Beauty render**: User-facing high-res PNG (flat icon style, no text).
- **Segmentation render**: Machine-facing PNG — black background, each object a unique solid color — used to extract binary masks and layer groups.
- **Layer IR**: JSON contract (canvas, assets, palette, layers). Layers: background, object_group (merged overlapping objects), text (overlay; rendered by app).
- **Edits**: Background color, per-layer tint/opacity/transform, text content/font/size/color/position.
- **Patch regeneration**: Regenerate one selected layer/group and replace it (MVP: coming soon).

## Setup

1. **Install dependencies**

   ```bash
   npm install --legacy-peer-deps
   ```

2. **Environment**

   Copy `.env.example` to `.env` and add your **OpenRouter** API key (used for brief generation). Optionally add `GEMINI_API_KEY` for image generation.

   ```bash
   cp .env.example .env
   # Edit .env and set:
   # OPENROUTER_API_KEY=your_key_here   (get one at https://openrouter.ai)
   # GEMINI_API_KEY=...                 (optional; for beauty + segmentation images)
   ```

3. **Run**

   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173).

## Flow

1. **Intake** — Answer 5 questions (purpose, where used, visual idea, design choice, style mode) + optional palette and target size.
2. **Brief** — Generate a user brief with AI (OpenRouter, free-tier models), edit if needed, then confirm.
3. **Generate** — Call API to generate Beauty + Segmentation images (Gemini when `GEMINI_API_KEY` is set; otherwise you can plug in another provider).
4. **Editor** — View canvas, layers panel, edit background color, text content/color, and (when object groups exist) tint/opacity. Export composite PNG.

## Project structure

- `src/lib/types/` — Layer IR, intake, and shared types.
- `src/lib/constants/prompts.ts` — Prompt templates (beauty, segmentation, brief, patch).
- `src/lib/stores/app.ts` — App state (step, intake, brief, layerIR, image URLs).
- `src/lib/components/` — IntakeForm, BriefConfirm, Generating, Editor.
- `src/routes/api/` — `generate-brief` (OpenRouter LLM, free-tier), `generate-images` (Gemini when key set).

## Env

| Variable              | Description |
|-----------------------|-------------|
| `OPENROUTER_API_KEY`  | OpenRouter API key for **brief generation** (LLM). Get one at [openrouter.ai](https://openrouter.ai). |
| `GEMINI_API_KEY`      | Optional. Gemini API key for **image generation** (beauty + segmentation). |

## Docs

- [Icon Studio MVP1 – Terminology & FAQ](/Users/ThausandSunny/Downloads/Icon_Studio_Terminology_FAQ.pdf)
- [Icon Studio MVP1 – Raster Layered Segmentation Spec](/Users/ThausandSunny/Downloads/Icon_Studio_MVP1_Raster_Layered_Segmentation_Spec.pdf)
