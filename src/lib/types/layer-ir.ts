/**
 * Icon Studio MVP1 – Layer IR (Data Contract)
 * schema: icon-studio/layer-ir/v1
 */

export const LAYER_IR_SCHEMA = 'icon-studio/layer-ir/v1' as const;

export const SEG_BACKGROUND = '#000000' as const;

export const SEG_COLORS = [
  '#FF0000',
  '#00FF00',
  '#0000FF',
  '#FFFF00',
  '#FF00FF',
  '#00FFFF',
  '#FFA500',
  '#8000FF'
] as const;

export type SegColorHex = (typeof SEG_COLORS)[number];

export interface CanvasConfig {
  width: number;
  height: number;
  targetSize: number;
  safeMarginPct?: number;
  backgroundMode?: 'transparent' | 'solid';
  backgroundColor?: string;
}

export interface AssetsConfig {
  beautyPng: string;
  segPng: string;
  maskDir: string;
}

export interface PaletteConfig {
  brandColors: string[];
  segColors: string[];
  segBackground: string;
}

export interface Transform {
  tx: number;
  ty: number;
  sx: number;
  sy: number;
  rotDeg: number;
}

export interface LayerStyle {
  tint: string;
  opacity: number;
}

export interface BackgroundLayer {
  id: string;
  type: 'background';
  zIndex: number;
  source: 'transparent' | 'solid' | 'image';
  editable?: string[];
  props: {
    color: string;
  };
}

export interface ObjectGroupLayer {
  id: string;
  type: 'object_group';
  zIndex: number;
  members?: string[];
  maskRef: string;
  bbox: [number, number, number, number]; // x, y, w, h
  transform: Transform;
  style: LayerStyle;
  editable?: string[];
}

export interface TextLayer {
  id: string;
  type: 'text';
  zIndex: number;
  editable?: string[];
  props: {
    content: string;
    fontFamily: string;
    fontWeight?: number;
    fontSizePx: number;
    color: string;
    x: number;
    y: number;
    align: 'left' | 'center' | 'right';
  };
}

export type Layer = BackgroundLayer | ObjectGroupLayer | TextLayer;

export interface LayerIRVersion {
  versionId: string;
  createdAt: string;
  notes: string;
}

export interface LayerIR {
  schema: typeof LAYER_IR_SCHEMA;
  docId: string;
  canvas: CanvasConfig;
  assets: AssetsConfig;
  palette: PaletteConfig;
  layers: Layer[];
  history?: {
    versions: LayerIRVersion[];
  };
}

export function createDefaultLayerIR(docId: string): LayerIR {
  return {
    schema: LAYER_IR_SCHEMA,
    docId,
    canvas: {
      width: 1024,
      height: 1024,
      targetSize: 24,
      safeMarginPct: 0.12,
      backgroundMode: 'transparent',
      backgroundColor: '#FFFFFF'
    },
    assets: {
      beautyPng: 'assets/beauty.png',
      segPng: 'assets/seg.png',
      maskDir: 'assets/masks/'
    },
    palette: {
      brandColors: ['#0F172A'],
      segColors: [...SEG_COLORS],
      segBackground: SEG_BACKGROUND
    },
    layers: [
      {
        id: 'bg',
        type: 'background',
        zIndex: 0,
        source: 'transparent',
        editable: ['bgColor'],
        props: { color: '#FFFFFF' }
      },
      {
        id: 'text_1',
        type: 'text',
        zIndex: 100,
        editable: ['content', 'font', 'size', 'color', 'position'],
        props: {
          content: '',
          fontFamily: 'Inter',
          fontWeight: 600,
          fontSizePx: 72,
          color: '#0F172A',
          x: 512,
          y: 900,
          align: 'center'
        }
      }
    ],
    history: {
      versions: [
        {
          versionId: 'v1',
          createdAt: new Date().toISOString(),
          notes: 'Initial'
        }
      ]
    }
  };
}
