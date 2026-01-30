<script lang="ts">
  import { appStore, setBrief, setStep } from '$lib/stores/app';

  let loading = false;
  let error = '';

  async function generateBrief() {
    const { intake } = $appStore;
    loading = true;
    error = '';
    try {
      const res = await fetch('/api/generate-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purpose: intake.purpose,
          whereUsed: intake.whereUsed,
          visualIdea: intake.visualIdea,
          designChoice: intake.designChoice,
          styleMode: intake.styleMode,
          targetSizePx: intake.targetSizePx ?? 24,
          paletteList: intake.paletteList ?? ''
        })
      });
      const data = await res.json();
      if (!res.ok) {
        error = data.error ?? 'Failed to generate brief';
        return;
      }
      const text = typeof data.brief === 'string' ? data.brief : (data.brief ?? '');
      setBrief(text);
    } catch (e) {
      error = e instanceof Error ? e.message : 'Network error';
    } finally {
      loading = false;
    }
  }

  function confirmAndGenerate() {
    setStep('generating');
  }

  function goBack() {
    setStep('intake');
  }
</script>

<div class="brief-confirm">
  <p class="step-label">Step 2 of 3 — Brief</p>
  <h1>User brief</h1>
  <p class="subtitle">Review and edit the brief, then click <strong>Create icon</strong> to generate your icon image and open the editor.</p>

  {#if !$appStore.brief && !loading}
    <button class="primary" onclick={generateBrief} disabled={loading}>
      Generate brief with AI
    </button>
  {/if}

  {#if loading}
    <p class="muted">Generating brief…</p>
  {/if}

  {#if error}
    <p class="error">{error}</p>
  {/if}

  {#if $appStore.brief}
    <label>
      <span>Brief (editable)</span>
      <textarea
        value={$appStore.brief}
        oninput={(e) => setBrief((e.target as HTMLTextAreaElement).value)}
        rows="4"
        placeholder="Your icon brief…"
      ></textarea>
    </label>
    <p class="next-hint">Next: we’ll generate your icon image and open the editor.</p>
    <div class="actions">
      <button type="button" class="secondary" onclick={goBack}>Back</button>
      <button type="button" class="primary cta-large" onclick={confirmAndGenerate}>Create icon →</button>
    </div>
  {/if}
</div>

<style>
  .brief-confirm {
    max-width: 560px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
  h1 {
    font-size: 1.75rem;
    margin: 0 0 0.25rem 0;
  }
  .step-label {
    font-size: 0.8rem;
    color: var(--accent);
    margin: 0 0 0.25rem 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .subtitle {
    color: var(--muted);
    margin: 0 0 1.5rem 0;
    font-size: 0.95rem;
  }
  .next-hint {
    color: var(--muted);
    font-size: 0.9rem;
    margin: 0.5rem 0 0 0;
  }
  button.cta-large {
    font-size: 1.1rem;
    padding: 0.85rem 1.5rem;
  }
  .muted {
    color: var(--muted);
  }
  .error {
    color: #f87171;
    margin: 0.5rem 0;
  }
  label {
    display: block;
    margin: 1rem 0;
  }
  label span {
    display: block;
    font-size: 0.85rem;
    color: var(--muted);
    margin-bottom: 0.35rem;
  }
  textarea {
    width: 100%;
    padding: 0.6rem 0.75rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    font-size: 1rem;
    resize: vertical;
  }
  textarea:focus {
    outline: none;
    border-color: var(--accent);
  }
  .actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1rem;
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
  button.primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  button.secondary {
    padding: 0.75rem 1.25rem;
    background: var(--surface);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    font-size: 1rem;
  }
  button.secondary:hover {
    border-color: var(--muted);
  }
</style>
