<script lang="ts">
  import { appStore } from '$lib/stores/app';
  import IntakeForm from '$lib/components/IntakeForm.svelte';
  import BriefConfirm from '$lib/components/BriefConfirm.svelte';
  import Generating from '$lib/components/Generating.svelte';
  import Editor from '$lib/components/Editor.svelte';

  $: step = $appStore.step;
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;1,9..40,400&display=swap" rel="stylesheet" />
</svelte:head>

{#if step === 'intake'}
  <IntakeForm />
{:else if step === 'brief'}
  <BriefConfirm />
{:else if step === 'generating'}
  <Generating />
{:else if step === 'editor'}
  <Editor />
{:else}
  <IntakeForm />
{/if}
