<script lang="ts">
  import { onMount } from 'svelte';
  import { appStore, resetToIntake } from '$lib/stores/app';
  import type { LayerIR, BackgroundLayer, ObjectGroupLayer, TextLayer } from '$lib/types/layer-ir';

  let { layerIR, beautyDataUrl } = $appStore;

  let selectedLayerId: string | null = null;
  let showLayersPanel = true;
  let canvasEl: HTMLCanvasElement;

  $: layers = layerIR?.layers ?? [];
  $: selectedLayer = layers.find((l) => l.id === selectedLayerId) ?? null;
  $: bgLayer = layers.find((l): l is BackgroundLayer => l.type === 'background');
  $: objectGroups = layers.filter((l): l is ObjectGroupLayer => l.type === 'object_group');
  $: textLayers = layers.filter((l): l is TextLayer => l.type === 'text');

  function selectLayer(id: string) {
    selectedLayerId = id === selectedLayerId ? null : id;
  }

  function updateBackgroundColor(color: string) {
    if (!layerIR || !bgLayer || bgLayer.type !== 'background') return;
    const idx = layerIR.layers.findIndex((l) => l.id === bgLayer!.id);
    if (idx === -1) return;
    const updated = { ...bgLayer, props: { ...bgLayer.props, color } };
    layerIR = {
      ...layerIR,
      layers: layerIR.layers.slice(0, idx).concat(updated, layerIR.layers.slice(idx + 1))
    };
    appStore.update((s) => ({ ...s, layerIR }));
  }

  function updateTextContent(content: string) {
    if (!layerIR || !selectedLayer || selectedLayer.type !== 'text') return;
    const idx = layerIR.layers.findIndex((l) => l.id === selectedLayer.id);
    if (idx === -1) return;
    const updated = { ...selectedLayer, props: { ...selectedLayer.props, content } };
    layerIR = {
      ...layerIR,
      layers: layerIR.layers.slice(0, idx).concat(updated, layerIR.layers.slice(idx + 1))
    };
    appStore.update((s) => ({ ...s, layerIR }));
  }

  function updateTextColor(color: string) {
    if (!layerIR || !selectedLayer || selectedLayer.type !== 'text') return;
    const idx = layerIR.layers.findIndex((l) => l.id === selectedLayer.id);
    if (idx === -1) return;
    const updated = { ...selectedLayer, props: { ...selectedLayer.props, color } };
    layerIR = {
      ...layerIR,
      layers: layerIR.layers.slice(0, idx).concat(updated, layerIR.layers.slice(idx + 1))
    };
    appStore.update((s) => ({ ...s, layerIR }));
  }

  function updateObjectGroupTint(layerId: string, tint: string) {
    if (!layerIR) return;
    const idx = layerIR.layers.findIndex((l) => l.id === layerId);
    if (idx === -1) return;
    const layer = layerIR.layers[idx];
    if (layer.type !== 'object_group') return;
    const updated = { ...layer, style: { ...layer.style, tint } };
    layerIR = {
      ...layerIR,
      layers: layerIR.layers.slice(0, idx).concat(updated, layerIR.layers.slice(idx + 1))
    };
    appStore.update((s) => ({ ...s, layerIR }));
  }

  function updateObjectGroupOpacity(layerId: string, opacity: number) {
    if (!layerIR) return;
    const idx = layerIR.layers.findIndex((l) => l.id === layerId);
    if (idx === -1) return;
    const layer = layerIR.layers[idx];
    if (layer.type !== 'object_group') return;
    const updated = { ...layer, style: { ...layer.style, opacity } };
    layerIR = {
      ...layerIR,
      layers: layerIR.layers.slice(0, idx).concat(updated, layerIR.layers.slice(idx + 1))
    };
    appStore.update((s) => ({ ...s, layerIR }));
  }

  function exportComposite() {
    if (!canvasEl) return;
    const link = document.createElement('a');
    link.download = `icon-studio-${Date.now()}.png`;
    link.href = canvasEl.toDataURL('image/png');
    link.click();
  }

  async function drawCanvas() {
    if (!canvasEl || !layerIR) return;
    const ctx = canvasEl.getContext('2d');
    if (!ctx) return;
    const w = layerIR.canvas.width;
    const h = layerIR.canvas.height;
    canvasEl.width = w;
    canvasEl.height = h;

    const bg = layers.find((l): l is BackgroundLayer => l.type === 'background');
    if (bg?.type === 'background') {
      ctx.fillStyle = bg.props.color;
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.clearRect(0, 0, w, h);
    }

    if (beautyDataUrl) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, w, h);
          resolve();
        };
        img.onerror = reject;
        img.src = beautyDataUrl;
      });
    }

    // Text overlay (MVP: simple draw)
    for (const layer of layers) {
      if (layer.type === 'text' && layer.props.content) {
        ctx.fillStyle = layer.props.color;
        ctx.font = `${layer.props.fontWeight ?? 600} ${layer.props.fontSizePx}px ${layer.props.fontFamily}, sans-serif`;
        ctx.textAlign = layer.props.align;
        ctx.textBaseline = 'middle';
        ctx.fillText(layer.props.content, layer.props.x, layer.props.y);
      }
    }
  }

  $: layerIR, beautyDataUrl, layers, void drawCanvas();

  onMount(() => drawCanvas());
</script>

<div class="editor">
  <header class="editor-header">
    <h1>Icon Studio · Editor</h1>
    <div class="header-actions">
      <button type="button" class="secondary" onclick={() => (showLayersPanel = !showLayersPanel)}>
        {showLayersPanel ? 'Hide' : 'Show'} layers
      </button>
      <button type="button" class="secondary" onclick={exportComposite}>Export PNG</button>
      <button type="button" class="secondary" onclick={resetToIntake}>New icon</button>
    </div>
  </header>

  <div class="editor-body">
    <div class="canvas-wrap">
      <canvas
        bind:this={canvasEl}
        width={layerIR?.canvas.width ?? 1024}
        height={layerIR?.canvas.height ?? 1024}
        style="max-width: 100%; height: auto; background: {bgLayer?.type === 'background' ? bgLayer.props.color : '#1a1a1a'}; border-radius: var(--radius); display: block;"
      ></canvas>
      {#if !beautyDataUrl && layerIR}
        <p class="placeholder">No image yet. Add GEMINI_API_KEY and generate, or use placeholder assets.</p>
      {/if}
    </div>

    {#if showLayersPanel}
      <aside class="layers-panel">
        <h2>Layers</h2>
        <ul class="layer-list">
          {#each [...layers].sort((a, b) => a.zIndex - b.zIndex) as layer (layer.id)}
            <li>
              <button
                type="button"
                class="layer-item"
                class:selected={selectedLayerId === layer.id}
                onclick={() => selectLayer(layer.id)}
              >
                <span class="layer-type">{layer.type}</span>
                <span class="layer-id">{layer.id}</span>
              </button>
            </li>
          {/each}
        </ul>

        {#if selectedLayer}
          <div class="layer-props">
            <h3>Edit: {selectedLayer.id}</h3>
            {#if selectedLayer.type === 'background'}
              <label>
                <span>Background color</span>
                <input
                  type="color"
                  value={selectedLayer.props.color}
                  oninput={(e) => updateBackgroundColor((e.target as HTMLInputElement).value)}
                />
                <input
                  type="text"
                  value={selectedLayer.props.color}
                  oninput={(e) => updateBackgroundColor((e.target as HTMLInputElement).value)}
                />
              </label>
            {/if}
            {#if selectedLayer.type === 'object_group'}
              <label>
                <span>Tint</span>
                <input
                  type="color"
                  value={selectedLayer.style.tint}
                  oninput={(e) => updateObjectGroupTint(selectedLayer.id, (e.target as HTMLInputElement).value)}
                />
              </label>
              <label>
                <span>Opacity</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={selectedLayer.style.opacity}
                  oninput={(e) => updateObjectGroupOpacity(selectedLayer.id, Number((e.target as HTMLInputElement).value))}
                />
                <span>{selectedLayer.style.opacity}</span>
              </label>
            {/if}
            {#if selectedLayer.type === 'text'}
              <label>
                <span>Content</span>
                <input
                  type="text"
                  value={selectedLayer.props.content}
                  oninput={(e) => updateTextContent((e.target as HTMLInputElement).value)}
                  placeholder="Text overlay"
                />
              </label>
              <label>
                <span>Color</span>
                <input
                  type="color"
                  value={selectedLayer.props.color}
                  oninput={(e) => updateTextColor((e.target as HTMLInputElement).value)}
                />
              </label>
            {/if}
          </div>
        {/if}

        <div class="patch-regeneration">
          <h3>Patch regeneration</h3>
          <p class="muted">Select an object group and use "Regenerate" to replace only that layer (MVP: coming soon).</p>
        </div>
      </aside>
    {/if}
  </div>
</div>

<style>
  .editor {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  .editor-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.75rem 1.25rem;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
  }
  .editor-header h1 {
    font-size: 1.15rem;
    margin: 0;
    font-weight: 600;
  }
  .header-actions {
    display: flex;
    gap: 0.5rem;
  }
  .editor-body {
    display: flex;
    flex: 1;
    gap: 1rem;
    padding: 1rem;
    overflow: hidden;
  }
  .canvas-wrap {
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    min-width: 0;
  }
  .canvas-wrap canvas {
    display: block;
  }
  .placeholder {
    color: var(--muted);
    padding: 2rem;
    text-align: center;
  }
  .layers-panel {
    width: 280px;
    flex-shrink: 0;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1rem;
    overflow-y: auto;
  }
  .layers-panel h2 {
    font-size: 1rem;
    margin: 0 0 0.75rem 0;
  }
  .layers-panel h3 {
    font-size: 0.9rem;
    margin: 1rem 0 0.5rem 0;
  }
  .layer-list {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  .layer-item {
    display: block;
    width: 100%;
    padding: 0.5rem 0.75rem;
    text-align: left;
    background: transparent;
    border: none;
    border-radius: 6px;
    color: var(--text);
    font-size: 0.9rem;
  }
  .layer-item:hover {
    background: var(--border);
  }
  .layer-item.selected {
    background: var(--accent);
    color: white;
  }
  .layer-type {
    display: block;
    font-size: 0.75rem;
    color: var(--muted);
  }
  .layer-item.selected .layer-type {
    color: rgba(255, 255, 255, 0.8);
  }
  .layer-props label {
    display: block;
    margin-top: 0.5rem;
  }
  .layer-props label span {
    display: block;
    font-size: 0.8rem;
    color: var(--muted);
    margin-bottom: 0.25rem;
  }
  .layer-props input[type='color'] {
    width: 100%;
    height: 32px;
    padding: 2px;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    cursor: pointer;
  }
  .layer-props input[type='text'],
  .layer-props input[type='range'] {
    width: 100%;
    padding: 0.4rem;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text);
  }
  .patch-regeneration {
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
  }
  .patch-regeneration .muted {
    font-size: 0.8rem;
    margin: 0.25rem 0 0 0;
  }
  button.secondary {
    padding: 0.5rem 0.75rem;
    background: var(--surface);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: 6px;
    font-size: 0.9rem;
  }
  button.secondary:hover {
    border-color: var(--muted);
  }
</style>
