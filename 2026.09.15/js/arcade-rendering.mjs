// Bound GPU fill cost on large HiDPI displays; keep small displays at native DPR.
export function resizeArcadeRenderer(renderer, width, height, dpr = globalThis.devicePixelRatio || 1) {
 const w = Math.max(1, Math.round(width)), h = Math.max(1, Math.round(height));
 const ratio = Math.min(dpr, 2, Math.sqrt(2500000 / (w * h)));
 if (renderer.getPixelRatio() !== ratio) renderer.setPixelRatio(ratio);
 const canvas = renderer.domElement;
 if (canvas.width !== Math.floor(w * ratio) || canvas.height !== Math.floor(h * ratio)) renderer.setSize(w, h, false);
}
