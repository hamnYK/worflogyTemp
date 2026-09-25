import atlas from './assets/characters/agent-atlas-v1.png';
import './character-art.css';
// Keep the embedded atlas out of CSS custom properties (browser size limits)
// and avoid duplicating the entire image in every portrait's inline style.
const atlasStyle=document.createElement('style');
atlasStyle.textContent=`.agent-portrait.ink-portrait{background-image:url("${atlas}")}`;
document.head.append(atlasStyle);
export function portrait(role,faction='human'){
 const index=Math.max(0,Math.min(6,role))+(faction==='ai'?8:0);
 return '<span class="agent-portrait ink-portrait" aria-hidden="true" style="--portrait-x:'+((index%4)*100/3)+'%;--portrait-y:'+(Math.floor(index/4)*100/3)+'%"></span>';
}
export function actionIcon(id,role){const paths={equipment:'M3 8h18v12H3zM8 8V4h8v4M9 14h6M12 11v6',move:'M4 12h16m-6-6 6 6-6 6M5 4v3M5 17v3',shoot:'M12 3v4m0 10v4M3 12h4m10 0h4M7 7h10v10H7z',watch:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM9 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0',hack:'M6 3h12v18H6zM9 7h6M9 11h6M10 16h4',skill:['M4 18a10 10 0 0 1 16 0M7 14a6 6 0 0 1 10 0M10 10a2 2 0 0 1 4 0M12 4v3','m5 4 8 8-8 8m7-16 8 8-8 8','m12 2 2 6 6-3-3 6 5 3-7 1-1 7-3-6-7 3 3-7-5-3 7-1z','M4 12h16M12 4v16M6 6h12v12H6z','M9 3h6v6h6v6h-6v6H9v-6H3V9h6z','M8 8h8v8H8zM2 3l6 5m14-5-6 5M2 21l6-5m14 5-6-5','M3 9h4l2-6 5 18 3-12h4'][role]};return `<svg class="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[id]||paths.move}"/></svg>`;}
