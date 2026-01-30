import { writable } from 'svelte/store';
import type { IntakeAnswers, UserBrief } from '$lib/types/intake';
import type { LayerIR } from '$lib/types/layer-ir';
import { DEFAULT_INTAKE } from '$lib/types/intake';

export type AppStep = 'intake' | 'brief' | 'generating' | 'editor';

interface AppState {
  step: AppStep;
  intake: IntakeAnswers;
  brief: string;
  briefConfirmed: boolean;
  layerIR: LayerIR | null;
  beautyDataUrl: string | null;
  segDataUrl: string | null;
}

const initialState: AppState = {
  step: 'intake',
  intake: { ...DEFAULT_INTAKE },
  brief: '',
  briefConfirmed: false,
  layerIR: null,
  beautyDataUrl: null,
  segDataUrl: null
};

export const appStore = writable<AppState>(initialState);

export function setIntake(intake: Partial<IntakeAnswers>) {
  appStore.update((s) => ({ ...s, intake: { ...s.intake, ...intake } }));
}

export function setStep(step: AppStep) {
  appStore.update((s) => ({ ...s, step }));
}

export function setBrief(brief: string) {
  appStore.update((s) => ({ ...s, brief }));
}

export function setBriefConfirmed(confirmed: boolean) {
  appStore.update((s) => ({ ...s, briefConfirmed: confirmed }));
}

export function setLayerIR(layerIR: LayerIR | null) {
  appStore.update((s) => ({ ...s, layerIR }));
}

export function setBeautyDataUrl(url: string | null) {
  appStore.update((s) => ({ ...s, beautyDataUrl: url }));
}

export function setSegDataUrl(url: string | null) {
  appStore.update((s) => ({ ...s, segDataUrl: url }));
}

export function resetToIntake() {
  appStore.set(initialState);
}
