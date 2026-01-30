<script lang="ts">
  import { appStore, setIntake, setStep } from '$lib/stores/app';
  import { DESIGN_CHOICES, STYLE_MODES } from '$lib/types/intake';

  let { intake } = $appStore;

  function handleSubmit() {
    setStep('brief');
  }

  function goBack() {
    setStep('intake');
  }
</script>

<div class="intake-form">
  <p class="step-label">Step 1 of 3 — Intake</p>
  <h1>Icon Studio</h1>
  <p class="subtitle">Answer a few questions so we can generate your icon brief, then create your icon in the editor.</p>

  <form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
    <label>
      <span>Purpose</span>
      <input
        type="text"
        placeholder="e.g. Represent data ingestion"
        bind:value={intake.purpose}
        oninput={(e) => setIntake({ purpose: (e.target as HTMLInputElement).value })}
      />
    </label>
    <label>
      <span>Where will it be used?</span>
      <input
        type="text"
        placeholder="e.g. App navigation, dashboard"
        bind:value={intake.whereUsed}
        oninput={(e) => setIntake({ whereUsed: (e.target as HTMLInputElement).value })}
      />
    </label>
    <label>
      <span>Visual idea</span>
      <textarea
        placeholder="e.g. Arrow going into a container, minimal and flat"
        bind:value={intake.visualIdea}
        oninput={(e) => setIntake({ visualIdea: (e.target as HTMLTextAreaElement).value })}
        rows="2"
      ></textarea>
    </label>
    <label>
      <span>Design choice</span>
      <select
        bind:value={intake.designChoice}
        onchange={(e) => setIntake({ designChoice: (e.target as HTMLSelectElement).value as typeof intake.designChoice })}
      >
        {#each DESIGN_CHOICES as c}
          <option value={c}>{c}</option>
        {/each}
      </select>
    </label>
    <label>
      <span>Style mode</span>
      <select
        bind:value={intake.styleMode}
        onchange={(e) => setIntake({ styleMode: (e.target as HTMLSelectElement).value as typeof intake.styleMode })}
      >
        {#each STYLE_MODES as m}
          <option value={m}>{m}</option>
        {/each}
      </select>
    </label>
    <label>
      <span>Target icon size (px)</span>
      <input
        type="number"
        min="16"
        max="512"
        bind:value={intake.targetSizePx}
        oninput={(e) => setIntake({ targetSizePx: Number((e.target as HTMLInputElement).value) || 24 })}
      />
    </label>
    <label>
      <span>Palette (optional)</span>
      <input
        type="text"
        placeholder="e.g. #0F172A #38BDF8"
        bind:value={intake.paletteList}
        oninput={(e) => setIntake({ paletteList: (e.target as HTMLInputElement).value })}
      />
    </label>
    <div class="actions">
      <button type="submit" class="primary">Generate brief</button>
    </div>
  </form>
</div>

<style>
  .intake-form {
    max-width: 480px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }
  .step-label {
    font-size: 0.8rem;
    color: var(--accent);
    margin: 0 0 0.25rem 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  h1 {
    font-size: 1.75rem;
    margin: 0 0 0.25rem 0;
  }
  .subtitle {
    color: var(--muted);
    margin: 0 0 1.5rem 0;
    font-size: 0.95rem;
  }
  label {
    display: block;
    margin-bottom: 1rem;
  }
  label span {
    display: block;
    font-size: 0.85rem;
    color: var(--muted);
    margin-bottom: 0.35rem;
  }
  input, select, textarea {
    width: 100%;
    padding: 0.6rem 0.75rem;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    color: var(--text);
    font-size: 1rem;
  }
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: var(--accent);
  }
  textarea {
    resize: vertical;
    min-height: 60px;
  }
  .actions {
    margin-top: 1.5rem;
  }
  button.primary {
    width: 100%;
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
