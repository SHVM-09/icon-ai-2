<script lang="ts">
  import { onMount } from 'svelte';
  import { appStore, setStep, setLayerIR, setBeautyDataUrl, setSegDataUrl } from '$lib/stores/app';
  import { createDefaultLayerIR } from '$lib/types/layer-ir';

  let status = 'Generating beauty and segmentation images…';
  let error = '';

  onMount(async () => {
    const { intake, brief } = $appStore;
    try {
      const res = await fetch('/api/generate-images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief,
          purpose: intake.purpose,
          whereUsed: intake.whereUsed,
          visualIdea: intake.visualIdea,
          designChoice: intake.designChoice,
          styleMode: intake.styleMode,
          targetSizePx: intake.targetSizePx ?? 24,
          renderPx: 1024,
          paletteList: intake.paletteList ?? ''
        })
      });
      const data = await res.json();
      if (!res.ok) {
        error = data.error ?? 'Generation failed';
        return;
      }

      if (data.beautyBase64) {
        setBeautyDataUrl(`data:image/png;base64,${data.beautyBase64}`);
      }
      if (data.segBase64) {
        setSegDataUrl(`data:image/png;base64,${data.segBase64}`);
      }

      const docId = `icon_${Date.now()}`;
      const layerIR = createDefaultLayerIR(docId);
      setLayerIR(layerIR);
      setStep('editor');
    } catch (e) {
      error = e instanceof Error ? e.message : 'Network error';
    }
  });
</script>

<div class="generating">
  <p class="step-label">Step 3 of 3 — Creating icon</p>
  <h1>Generating your icon</h1>
  <p class="muted">Calling image generation… You’ll see the editor when it’s done.</p>
  {#if error}
    <p class="error">{error}</p>
    <p class="muted">You can still open the editor with placeholder assets.</p>
    <button
      type="button"
      class="primary"
      onclick={() => {
        const docId = `icon_${Date.now()}`;
        setLayerIR(createDefaultLayerIR(docId));
        setStep('editor');
      }}
    >
      Open editor anyway
    </button>
  {:else}
    <p class="status">{status}</p>
    <div class="spinner" aria-hidden="true"></div>
  {/if}
</div>

<style>
  .generating {
    max-width: 400px;
    margin: 0 auto;
    padding: 3rem 1rem;
    text-align: center;
  }
  .step-label {
    font-size: 0.8rem;
    color: var(--accent);
    margin: 0 0 0.25rem 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  h1 {
    font-size: 1.5rem;
    margin: 0 0 0.5rem 0;
  }
  .status {
    color: var(--muted);
    margin-bottom: 1.5rem;
  }
  .error {
    color: #f87171;
    margin-bottom: 0.5rem;
  }
  .muted {
    color: var(--muted);
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }
  .spinner {
    width: 40px;
    height: 40px;
    margin: 0 auto;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  button.primary {
    padding: 0.75rem 1.25rem;
    background: var(--accent);
    color: white;
    border: none;
    border-radius: var(--radius);
    font-size: 1rem;
    font-weight: 600;
  }
  button.primary:hover {
    background: var(--accent-hover);
  }
</style>
