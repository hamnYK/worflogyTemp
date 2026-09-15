/* CSS is the source of truth; loaded before the vector renderers. */
(()=>{'use strict';const css=getComputedStyle(document.documentElement),theme={};
for(const role of ["background","plane","plane-secondary","plane-result","grid","border","link","active","flow","ink","dark","accent","highlight","pale","secondary","secondary-dark","secondary-light","gold","cream","paper","edge","white","shadow","skin","tile-side","tile-front","tile-selected","tile"]){const value=css.getPropertyValue('--scene-'+role).trim();if(!/^#[0-9a-f]{6}$/i.test(value))throw new Error('Invalid canvas theme token: '+role);theme[role.replace(/-([a-z])/g,(_,c)=>c.toUpperCase())]=parseInt(value.slice(1),16);}
window.WorfTheme=Object.freeze(theme);})();
