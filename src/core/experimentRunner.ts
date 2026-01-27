import { createRenderer } from "./renderer";
import { setupInputs } from "./input";
import { setupResize } from "./resize";
import { startLoop } from "./loop";
import type { RendererInfo, RendererOptions } from "../types";

export interface ExperimentSetup {
  config?: RendererOptions;
  init: (info: RendererInfo) => void;
  update: (time: number) => void;
  setupInputs?: boolean;
  setupResize?: boolean;
  title?: string;
  onResize?: (info: RendererInfo) => void;
  onToggleInfo?: (visible: boolean) => void;
}

export function runExperiment(experiment: ExperimentSetup) {
  const info = createRenderer(experiment.config);

  const shouldSetupInputs = experiment.setupInputs ?? true;
  const shouldSetupResize = experiment.setupResize ?? true;

  if (shouldSetupInputs) {
    setupInputs(info);
  }

  if (shouldSetupResize) {
    setupResize(info, experiment.onResize);
  }

  experiment.init(info);

  showCompositorDescription();
  setupKeyboardToggle();
  setOnToggleInfo(experiment.onToggleInfo);

  startLoop(info, experiment.update);
}

function showCompositorDescription() {
  setTimeout(() => {
    const compositor = (window as any).__compositor;
    if (compositor && typeof compositor.getDescription === 'function') {
      const description = compositor.getDescription();
      displayDescription(description);
    }
  }, 0);
}

function getOrCreateOverlayContainer(): HTMLElement {
  let container = document.getElementById('info-overlay');
  if (!container) {
    container = document.createElement('div');
    container.id = 'info-overlay';
    container.className = 'info-overlay';
    document.body.appendChild(container);
  }
  container.style.display = 'none';
  return container;
}

function setupKeyboardToggle() {
  document.removeEventListener('keydown', handleKeyDown);
  document.addEventListener('keydown', handleKeyDown);
}

function handleKeyDown(event: KeyboardEvent) {
  if (event.key === 'i' || event.key === 'I') {
    toggleInfo();
  }
}

function toggleInfo() {
  const existing = document.getElementById('info-overlay');
  if (existing) {
    const computedStyle = getComputedStyle(existing);
    const isCurrentlyHidden = computedStyle.display === 'none';
    const willBeVisible = isCurrentlyHidden;
    existing.style.display = willBeVisible ? 'block' : 'none';
    if (typeof getOnToggleInfo() === 'function') {
      getOnToggleInfo()!(willBeVisible);
    }
  }
}

let __onToggleInfo: ((visible: boolean) => void) | undefined;
function setOnToggleInfo(fn?: (visible: boolean) => void) {
  __onToggleInfo = fn;
}
function getOnToggleInfo() {
  return __onToggleInfo;
}

function displayDescription(description: string) {
  let container = document.getElementById('compositor-description');
  if (container) {
    container.innerHTML = '';
  } else {
    container = document.createElement('div');
    container.id = 'compositor-description';
    container.className = 'compositor-description';

    const overlayContainer = getOrCreateOverlayContainer();
    overlayContainer.appendChild(container);
  }

  const lines = description.split('\n');
  lines.forEach((line, index) => {
    if (line.trim()) {
      const span = document.createElement('span');
      span.textContent = line;

      if (line.includes(':') && !line.startsWith('  ') && !line.startsWith('\t')) {
        span.classList.add('title');
      }

      container!.appendChild(span);
    }
    if (index < lines.length - 1) {
      container!.appendChild(document.createElement('br'));
    }
  });
}
