/**
 * Icon Studio MVP1 – Prompt templates (Beauty, Segmentation, Brief, Patch)
 */

export function beautyRenderPrompt(params: {
  purpose: string;
  where_used: string;
  visual_idea: string;
  design_choice: string;
  style_mode: string;
  target_size: number;
  render_px: number;
  palette_list: string;
}): string {
  return `SYSTEM:
You generate clean, flat, professional icon imagery for UI use.
Do NOT include any text, letters, numbers, or watermarks.
Return a single PNG image.

USER:
Create a high-quality flat icon image.

ICON BRIEF:
- Purpose: ${params.purpose}
- Where used: ${params.where_used}
- Visual idea: ${params.visual_idea}
- Design choice: ${params.design_choice} (Simple | Modern | Contemporary)
- Style mode: ${params.style_mode} (Outline | Filled)
- Target icon: ${params.target_size}px (final usage). Generate at high resolution for downscaling.

RENDER REQUIREMENTS:
- Output: PNG
- Resolution: ${params.render_px}x${params.render_px} (e.g., 1024x1024)
- Background: transparent (preferred). If not possible, use pure white (#FFFFFF).
- Composition: centered with generous padding (safe margin ~12% of canvas).
- Flat look: no photorealism, no textures, no noise, no drop shadows, no glow.
- Clean edges and consistent geometry.
- Keep the icon simple and readable when scaled down to ${params.target_size}px.
- Avoid tiny details and hairline strokes.

COLOR:
- If palette provided: use only these colors: ${params.palette_list}
- Otherwise: monochrome icon in black or very dark gray.

CONSTRAINTS:
- No text of any kind.
- Prefer 1-5 distinct visual elements max.

Generate the icon now.`;
}

export function segmentationRenderPrompt(params: { render_px: number }): string {
  return `SYSTEM:
You generate a segmentation mask image (not a normal icon).
Return a single PNG image. No explanations.

USER:
Create a SEGMENTATION MASK for an icon.

GOAL:
Produce a segmentation render that matches the composition of the beauty icon.

OUTPUT REQUIREMENTS:
- Output: PNG
- Resolution: ${params.render_px}x${params.render_px} (match beauty render)
- Background must be solid pure black: #000000
- Every distinct object/shape must be filled with ONE unique solid color from the allowed list below.
- NO gradients, NO shading, NO outlines, NO shadows, NO transparency.
- HARD EDGES ONLY: avoid anti-aliasing and soft edges.
- Objects may overlap if needed. If overlap occurs, the top-most object overwrites pixels beneath it.

ALLOWED COLORS:
- Background: #000000
- Objects (use one color per object, no reuse):
#FF0000 #00FF00 #0000FF #FFFF00 #FF00FF #00FFFF #FFA500 #8000FF

RULES:
- Use as few objects as possible (1-6 objects).
- Do NOT include any text.
- Ensure the segmentation matches the beauty icon's layout, scale, and position (centered, same padding).

Return ONLY the segmentation PNG.`;
}

export function userBriefPrompt(intake: {
  purpose: string;
  whereUsed: string;
  visualIdea: string;
  designChoice: string;
  styleMode: string;
  targetSizePx?: number;
  paletteList?: string;
}): string {
  const target = intake.targetSizePx ?? 24;
  const palette = intake.paletteList?.trim() ? intake.paletteList : 'monochrome (black or very dark gray)';
  return `You are helping create a user brief for an icon generation tool (Icon Studio).

The user has answered an intake form. Turn their answers into a short, clear "user brief" (2–4 sentences) that will be used as the stable contract for image generation.

Intake answers:
- Purpose: ${intake.purpose}
- Where used: ${intake.whereUsed}
- Visual idea: ${intake.visualIdea}
- Design choice: ${intake.designChoice}
- Style mode: ${intake.styleMode}
- Target icon size: ${target}px
- Palette: ${palette}

Respond with ONLY the brief text, no preamble. The brief should be user-friendly and confirm the icon's purpose, placement, look, and style. Do not include instructions to the model (e.g. "generate an image"); just describe what the icon should be.`;
}

export function patchBeautyPrompt(params: {
  user_brief: string;
  layer_id: string;
  layer_semantic_label: string;
  requested_change: string;
  patch_w: number;
  patch_h: number;
  patch_padding_px: number;
}): string {
  return `SYSTEM:
You generate clean, flat icon patches for editing workflows.
Return a PNG image only.
Do NOT include any letters, words, or numbers.

USER:
We are editing an existing icon by regenerating ONLY one layer region.

USER_BRIEF:
${params.user_brief}

TARGET_LAYER:
- Layer id: ${params.layer_id}
- What it represents: ${params.layer_semantic_label}
- Requested change: ${params.requested_change}

PATCH CONSTRAINTS:
- Output: PNG
- Size: ${params.patch_w} x ${params.patch_h}
- Background: transparent (required)
- Flat style, no gradients, no shadows, no textures.
- Match the existing icon style and line weight.
- Keep composition centered within patch; safe padding approx ${params.patch_padding_px}px.

DO NOT:
- Do not redraw the whole icon.
- Do not add text.
- Do not add extra decorative elements.

Return ONLY the patch PNG.`;
}

export function patchSegmentationPrompt(params: { patch_w: number; patch_h: number }): string {
  return `SYSTEM:
Return a segmentation mask PNG for a single patch region. No explanations.

USER:
Create a SEGMENTATION MASK for an icon PATCH.

PATCH SIZE: ${params.patch_w} x ${params.patch_h}
Background must be #000000.
All regenerated pixels for this layer must be filled with #FF0000 only.
No gradients, no outlines, no shadows, no transparency.
Hard edges only (avoid anti-aliasing).

Return ONLY the segmentation PNG.`;
}
