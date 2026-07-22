/**
 * components.js — Scene comparison gallery, video modal, BibTeX copy, lightbox
 */

document.addEventListener('DOMContentLoaded', () => {
  // ─── Comparison Gallery ─────────────────────────────────
  initComparisonGallery();

  // ─── Scene Tab Switching ────────────────────────────────
  initSceneTabs();
});

// ============================================================
//  Scene Data
// ============================================================
const SCENES = ['snake', 'puffer', 'coral', 'cave', 'boat', 'anemone', 'streak', 'strait'];

// Methods available for each scene (determined from actual files)
const SCENE_METHODS = {
  snake:    ['ours', 'deformable', '3dgs', 'gspl', 'sea', 'spf', 'nerf', 'gt'],
  puffer:   ['ours', 'deformable', '3dgs', 'gspl', 'sea', 'sfp', '3d4d', 'gt'],
  coral:    ['ours', 'deformable', '3dgs', 'gspl', 'sea', 'sfp', '3d4d', 'gt'],
  cave:     ['ours', 'deformable', '3dgs', 'gspl', 'sea', 'sfp', 'nerf', 'gt'],
  boat:     ['ours', 'deformable', '3dgs', 'gspl', 'sea', 'sfp', 'nerf', 'gt'],
  anemone:  ['ours', 'deformable', '3dgs', 'sea', 'spf', '3d4d', 'gt'],
  streak:   ['ours', 'deformable', '3dgs', 'gspl', 'sea', 'spf', 'nerf', 'gt'],
  strait:   ['ours', 'deformable', '3dgs', 'gspl', 'sea', 'spf', '3d4d', 'gt'],
};

const METHOD_LABELS = {
  'ours':       'Ours (PUGS)',
  'deformable': 'Deformable',
  '3dgs':       '3DGS',
  'gspl':       'GSPL',
  'sea':        'Sea',
  'spf':        'SPF',
  'sfp':        'SFP',
  'nerf':       'NeRF',
  '3d4d':       '3D4D',
  'gt':         'Ground Truth',
};

const BASE_PATH = 'assets/images/comparisons/';

// ============================================================
//  Scene Tabs
// ============================================================
let currentScene = 'snake';

function initSceneTabs() {
  const tabs = document.querySelectorAll('.scene-tab');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const scene = tab.dataset.scene;
      if (scene === currentScene) return;

      // Update active state
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      currentScene = scene;
      renderComparisonGrid(scene);
      updateSceneLabel(scene);
    });
  });

  // Render initial scene
  renderComparisonGrid(currentScene);
  updateSceneLabel(currentScene);
}

function updateSceneLabel(scene) {
  const label = document.getElementById('scene-label');
  if (label) {
    label.textContent = `Scene: ${scene.charAt(0).toUpperCase() + scene.slice(1)} — click any image to enlarge`;
  }
  // Update legend visibility based on available methods
  updateMethodLegend(scene);
}

function updateMethodLegend(scene) {
  const methods = SCENE_METHODS[scene] || [];
  const legendItems = document.querySelectorAll('#method-legend span');
  legendItems.forEach(item => {
    const methodKey = Object.entries(METHOD_LABELS).find(([key, label]) =>
      item.textContent.trim() === label
    );
    if (methodKey) {
      const [key] = methodKey;
      item.style.opacity = methods.includes(key) ? '1' : '0.25';
    }
  });
}

// ============================================================
//  Render Comparison Grid
// ============================================================
function renderComparisonGrid(scene) {
  const grid = document.getElementById('comparison-grid');
  if (!grid) return;

  const methods = SCENE_METHODS[scene] || [];
  grid.innerHTML = '';

  methods.forEach(method => {
    const imgPath = `${BASE_PATH}${scene}/${method}.png`;
    const label = METHOD_LABELS[method] || method;
    const isOurs = method === 'ours';
    const isGT = method === 'gt';

    let cardClass = 'comparison-thumb';
    if (isOurs) cardClass += ' ours';
    if (isGT) cardClass += ' gt';

    const card = document.createElement('div');
    card.className = cardClass;
    card.onclick = () => openLightbox(imgPath, `${scene} — ${label}`);
    card.title = `${scene} — ${label}`;

    const img = document.createElement('img');
    img.src = imgPath;
    img.alt = `${scene} ${method}`;
    img.loading = 'lazy';
    // Fallback on error
    img.onerror = function () {
      this.style.display = 'none';
      this.parentElement.innerHTML +=
        `<div class="flex items-center justify-center w-full h-full text-gray-600 text-xs">${method}<br>missing</div>`;
    };

    const badge = document.createElement('span');
    badge.className = 'method-badge';
    badge.textContent = label;

    card.appendChild(img);
    card.appendChild(badge);
    grid.appendChild(card);
  });
}

// ============================================================
//  Lightbox
// ============================================================
let lightboxImages = [];
let lightboxIndex = 0;

window.openLightbox = function (imgPath, caption) {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  if (!lightbox || !lightboxImg) return;

  // Build list of all currently visible images for prev/next
  const grid = document.getElementById('comparison-grid');
  if (grid) {
    const imgs = grid.querySelectorAll('.comparison-thumb img');
    lightboxImages = Array.from(imgs).map(img => ({
      src: img.src,
      caption: img.alt || '',
    }));
    lightboxIndex = lightboxImages.findIndex(item => imgPath.includes(item.src.split('/').pop()) &&
      item.src.includes(imgPath.split('/').slice(-3, -2)[0]));
    if (lightboxIndex === -1) lightboxIndex = 0;
  }

  lightboxImg.src = imgPath;
  lightboxImg.alt = caption;
  if (lightboxCaption) lightboxCaption.textContent = caption;
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
};

window.closeLightbox = function () {
  const lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
};

window.lightboxNav = function (direction) {
  if (!lightboxImages.length) return;

  lightboxIndex += direction;
  if (lightboxIndex < 0) lightboxIndex = lightboxImages.length - 1;
  if (lightboxIndex >= lightboxImages.length) lightboxIndex = 0;

  const item = lightboxImages[lightboxIndex];
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  if (lightboxImg) lightboxImg.src = item.src;
  if (lightboxCaption) lightboxCaption.textContent = item.caption;
};

// Keyboard navigation for lightbox
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeLightbox();
  }
  const lightbox = document.getElementById('lightbox');
  if (lightbox && lightbox.classList.contains('active')) {
    if (e.key === 'ArrowLeft') lightboxNav(-1);
    if (e.key === 'ArrowRight') lightboxNav(1);
  }
});

// ============================================================
//  Comparison Gallery Init
// ============================================================
function initComparisonGallery() {
  // Preload first scene images for snappier experience
  const scene = currentScene || 'snake';
  const methods = SCENE_METHODS[scene] || [];
  methods.forEach(method => {
    const img = new Image();
    img.src = `${BASE_PATH}${scene}/${method}.png`;
  });
}

// ============================================================
//  Video Modal
// ============================================================
window.openVideoModal = function () {
  const modal = document.getElementById('video-modal');
  const video = document.getElementById('modal-video');
  if (!modal || !video) return;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  video.play().catch(() => {});
};

window.closeVideoModal = function () {
  const modal = document.getElementById('video-modal');
  const video = document.getElementById('modal-video');
  if (!modal || !video) return;

  modal.classList.remove('active');
  document.body.style.overflow = '';
  video.pause();
};

// ============================================================
//  BibTeX Copy
// ============================================================
window.copyBibTeX = function () {
  const codeEl = document.getElementById('bibtex-code');
  if (!codeEl) return;

  const text = codeEl.innerText || codeEl.textContent;
  const btn = document.getElementById('copy-btn');
  const btnText = document.getElementById('copy-text');
  const toast = document.getElementById('copy-toast');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text.trim()).then(() => showCopyFeedback());
  } else {
    const textarea = document.createElement('textarea');
    textarea.value = text.trim();
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showCopyFeedback();
    } catch (err) {
      console.warn('Copy failed:', err);
    }
    document.body.removeChild(textarea);
  }

  function showCopyFeedback() {
    btnText.textContent = 'Copied!';
    btn.querySelector('i').className = 'fas fa-check';
    btn.style.borderColor = 'rgba(0, 191, 165, 0.5)';
    btn.style.color = '#00bfa5';

    setTimeout(() => {
      btnText.textContent = 'Copy';
      btn.querySelector('i').className = 'fas fa-copy';
      btn.style.borderColor = '';
      btn.style.color = '';
    }, 2000);

    if (toast) {
      toast.classList.add('opacity-100', 'translate-y-0');
      toast.classList.remove('opacity-0', 'translate-y-4');

      setTimeout(() => {
        toast.classList.add('opacity-0', 'translate-y-4');
        toast.classList.remove('opacity-100', 'translate-y-0');
      }, 2000);
    }
  }
};
