/**
 * Icon Studio MVP1 – Intake (5 questions) and User Brief
 */

export type DesignChoice = 'Simple' | 'Modern' | 'Contemporary';
export type StyleMode = 'Outline' | 'Filled';

export interface IntakeAnswers {
  purpose: string;
  whereUsed: string;
  visualIdea: string;
  designChoice: DesignChoice;
  styleMode: StyleMode;
  targetSizePx?: number;
  paletteList?: string;
}

export interface UserBrief {
  purpose: string;
  whereUsed: string;
  visualIdea: string;
  designChoice: DesignChoice;
  styleMode: StyleMode;
  targetSizePx: number;
  renderPx: number;
  paletteList: string;
  /** Optional reference or notes */
  notes?: string;
}

export const DEFAULT_INTAKE: IntakeAnswers = {
  purpose: '',
  whereUsed: '',
  visualIdea: '',
  designChoice: 'Simple',
  styleMode: 'Outline',
  targetSizePx: 24,
  paletteList: ''
};

export const DESIGN_CHOICES: DesignChoice[] = ['Simple', 'Modern', 'Contemporary'];
export const STYLE_MODES: StyleMode[] = ['Outline', 'Filled'];
