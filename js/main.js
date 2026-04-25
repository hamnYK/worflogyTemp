/* ================================================
   WORFLOGY — main.js
   Sidebar active state, mobile menu, project graph
   ================================================ */

/* ── Active nav item ── */
document.addEventListener('DOMContentLoaded', () => {
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
    // projects active for project-N.html
    if (href === 'projects.html' && path.startsWith('project-')) {
      a.classList.add('active');
    }
  });

  /* ── Mobile sidebar ── */
  const sidebar  = document.querySelector('.sidebar');
  const overlay  = document.querySelector('.sidebar-overlay');
  const hamburger = document.querySelector('.hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('show');
    });
    overlay?.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    });
  }

  /* ── Project Graph ── */
  initGraph();
});

/* ── SVG Node-Link Graph ── */
function initGraph() {
  const svg = document.getElementById('project-graph');
  if (!svg) return;

  const W = svg.viewBox.baseVal.width  || 680;
  const H = svg.viewBox.baseVal.height || 580;
  const cx = W / 2, cy = H / 2;
  const R  = 170; // orbit radius

  const nodes = [
    { id: 'root', label: '프랙털\n온톨로지', sublabel: '디자인 기술', href: null,
      x: cx, y: cy, r: 68, primary: true },
    { id: 'p1', label: '팀 지식', sublabel: '팀 지식 자산화', href: 'project-1.html',
      x: cx, y: cy - R, r: 52 },
    { id: 'p2', label: '지식 기반 진단', sublabel: '스타트업 진단', href: 'project-2.html',
      x: cx + R, y: cy, r: 52 },
    { id: 'p3', label: '개인 지식', sublabel: '리서치노트', href: 'project-3.html',
      x: cx, y: cy + R, r: 52 },
    { id: 'p4', label: '게임 엔진', sublabel: '지능형 서사 엔진', href: 'project-4.html',
      x: cx - R, y: cy, r: 52 },
  ];

  const BLUE   = '#1D4ED8';
  const ORANGE = '#F97316';
  const LIGHT  = '#EFF6FF';

  // defs
  const defs = svgEl('defs');
  // Glow filter
  const filter = svgEl('filter', { id: 'glow', x: '-30%', y: '-30%', width: '160%', height: '160%' });
  const blur = svgEl('feGaussianBlur', { stdDeviation: '4', result: 'blur' });
  const merge = svgEl('feMerge');
  merge.appendChild(svgEl('feMergeNode', { in: 'blur' }));
  merge.appendChild(svgEl('feMergeNode', { in: 'SourceGraphic' }));
  filter.appendChild(blur);
  filter.appendChild(merge);
  defs.appendChild(filter);
  svg.appendChild(defs);

  // edges
  const edgeGroup = svgEl('g', { class: 'edges' });
  nodes.slice(1).forEach((n, i) => {
    const line = svgEl('line', {
      x1: cx, y1: cy, x2: n.x, y2: n.y,
      stroke: BLUE, 'stroke-width': '2',
      'stroke-dasharray': '6 4',
      opacity: '0.35',
      class: 'edge-line'
    });
    line.style.animation = `dashAnim 2s linear infinite ${i * 0.5}s`;
    edgeGroup.appendChild(line);
  });
  svg.appendChild(edgeGroup);

  // nodes
  const nodeGroup = svgEl('g', { class: 'nodes' });
  nodes.forEach(n => {
    const g = svgEl('g', {
      class: n.primary ? 'node node-primary' : 'node node-child',
      transform: `translate(${n.x},${n.y})`,
      style: n.href ? 'cursor:pointer' : 'cursor:default'
    });

    // circle
    const circle = svgEl('circle', {
      r: n.r,
      fill: n.primary ? BLUE : '#fff',
      stroke: n.primary ? 'transparent' : BLUE,
      'stroke-width': '2.5',
    });
    g.appendChild(circle);

    // label lines
    const lines = n.label.split('\n');
    lines.forEach((line, i) => {
      const t = svgEl('text', {
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        fill: n.primary ? '#fff' : BLUE,
        'font-size': n.primary ? '15' : '13',
        'font-weight': '700',
        'font-family': 'Pretendard Variable, Outfit, sans-serif',
        y: (i - (lines.length - 1) / 2) * 18 - 8,
      });
      t.textContent = line;
      g.appendChild(t);
    });

    // sublabel
    const sub = svgEl('text', {
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      fill: n.primary ? 'rgba(255,255,255,0.75)' : '#6B7280',
      'font-size': '10',
      'font-weight': '500',
      'font-family': 'Pretendard Variable, Outfit, sans-serif',
      y: lines.length * 10,
    });
    sub.textContent = n.sublabel;
    g.appendChild(sub);

    // hover + click
    if (n.href) {
      g.addEventListener('mouseenter', () => {
        circle.setAttribute('stroke', ORANGE);
        circle.setAttribute('stroke-width', '3');
        circle.setAttribute('fill', LIGHT);
        g.style.filter = 'url(#glow)';
        g.style.transform = `translate(${n.x}px,${n.y}px) scale(1.06)`;
      });
      g.addEventListener('mouseleave', () => {
        circle.setAttribute('stroke', BLUE);
        circle.setAttribute('stroke-width', '2.5');
        circle.setAttribute('fill', '#fff');
        g.style.filter = '';
        g.style.transform = `translate(${n.x}px,${n.y}px) scale(1)`;
      });
      g.addEventListener('click', () => { location.href = n.href; });
    }

    nodeGroup.appendChild(g);
  });
  svg.appendChild(nodeGroup);
}

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
  return el;
}

/* ── CSS animation for dash ── */
const style = document.createElement('style');
style.textContent = `
@keyframes dashAnim {
  to { stroke-dashoffset: -20; }
}
.edge-line { stroke-dashoffset: 0; }
`;
document.head.appendChild(style);

/* ── Image Slider ── */
document.addEventListener('DOMContentLoaded', () => {
  const sliders = document.querySelectorAll('.slider-container');
  sliders.forEach(container => {
    const track = container.querySelector('.slider-track');
    const items = track.querySelectorAll('.slider-item');
    const prevBtn = container.querySelector('.slider-btn.prev');
    const nextBtn = container.querySelector('.slider-btn.next');
    const dotsContainer = container.nextElementSibling;
    
    if (items.length <= 1) {
      if (prevBtn) prevBtn.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
      return;
    }

    let currentIndex = 0;

    if (dotsContainer && dotsContainer.classList.contains('slider-dots')) {
      items.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.classList.add('slider-dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(i));
        dotsContainer.appendChild(dot);
      });
    }

    function updateSlider() {
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      if (dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.slider-dot');
        dots.forEach((dot, i) => {
          dot.classList.toggle('active', i === currentIndex);
        });
      }
    }

    function goToSlide(index) {
      currentIndex = index;
      updateSlider();
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex > 0) ? currentIndex - 1 : items.length - 1;
        updateSlider();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex < items.length - 1) ? currentIndex + 1 : 0;
        updateSlider();
      });
    }
  });
});
