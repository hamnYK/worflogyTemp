/* ================================================
   WORFLOGY — main.js
   Sidebar active state, mobile menu, project graph (Multi-language Supported)
   ================================================ */

window.name = "worflogy_main";

/* ── Active nav item & Mobile sidebar (sidebar.js로 이관됨) ── */
document.addEventListener('DOMContentLoaded', () => {
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
  const R  = 190; // orbit radius

  const isEnglish = window.location.href.includes('/en/');

  // 국문/영문에 따른 그래프 텍스트 다국어화
  const nodes = isEnglish ? [
    { id: 'root', label: 'Fractal\nOntology', sublabel: 'Design Tech', href: null,
      x: cx, y: cy, r: 80, primary: true },
    { id: 'p1', label: 'Team Knowledge\nConnection', sublabel: 'Organic Collab', href: 'project-1.html',
      x: cx, y: cy - R, r: 64 },
    { id: 'p2', label: 'Strategic Pivot\n& Linking', sublabel: 'Risk Routing', href: 'project-2.html',
      x: cx + R, y: cy, r: 64 },
    { id: 'p3', label: 'R&D Context\n& IP Protection', sublabel: 'IP Value Proof', href: 'project-3.html',
      x: cx, y: cy + R, r: 64 },
    { id: 'p4', label: 'Contextual\nNarrative Engine', sublabel: 'Narrative Translation', href: 'project-4.html',
      x: cx - R, y: cy, r: 64 },
  ] : [
    { id: 'root', label: '프랙털\n온톨로지', sublabel: '디자인 기술', href: null,
      x: cx, y: cy, r: 80, primary: true },
    { id: 'p1', label: '팀 지식\n유기화', sublabel: '자생적 협업 지능', href: 'project-1.html',
      x: cx, y: cy - R, r: 64 },
    { id: 'p2', label: '유연한 피봇\n& 관점 링킹', sublabel: '리스크 경로 진단', href: 'project-2.html',
      x: cx + R, y: cy, r: 64 },
    { id: 'p3', label: 'R&D 맥락\n자산화 & IP', sublabel: 'R&D 무형자산 입증', href: 'project-3.html',
      x: cx, y: cy + R, r: 64 },
    { id: 'p4', label: '지능형 맥락\n내러티브 엔진', sublabel: 'AI 맥락적 서사 변환', href: 'project-4.html',
      x: cx - R, y: cy, r: 64 },
  ];

  const PRIMARY    = '#1A1F36';   // Ink Navy
  const BORDER     = 'rgba(26,31,54,0.10)';
  const TEXT_MUTED = '#6B7280';

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

  // 1. Interconnected Web (Outer Ring)
  const childNodes = nodes.slice(1);
  for (let i = 0; i < childNodes.length; i++) {
    let nextNode = childNodes[(i + 1) % childNodes.length];
    const webLine = svgEl('line', {
      x1: childNodes[i].x, y1: childNodes[i].y, 
      x2: nextNode.x, y2: nextNode.y,
      stroke: BORDER, 'stroke-width': '1.5',
      'stroke-dasharray': '4 4',
      opacity: '0.6'
    });
    edgeGroup.appendChild(webLine);
  }

  // 2. Main Spokes (Root to Children)
  childNodes.forEach((n, i) => {
    const line = svgEl('line', {
      x1: cx, y1: cy, x2: n.x, y2: n.y,
      stroke: PRIMARY, 'stroke-width': '2',
      'stroke-dasharray': '6 4',
      opacity: '0.25',
      class: 'edge-line'
    });
    line.style.animation = `dashAnim 2s linear infinite ${i * 0.5}s`;
    edgeGroup.appendChild(line);
  });
  
  // 3. Fractal Micro Nodes
  nodes.forEach(n => {
    for (let j = 0; j < 3; j++) {
      let angle = Math.random() * Math.PI * 2;
      let dist = n.r + 15 + Math.random() * 25;
      let mx = n.x + Math.cos(angle) * dist;
      let my = n.y + Math.sin(angle) * dist;
      
      const link = svgEl('line', {
        x1: n.x, y1: n.y, x2: mx, y2: my,
        stroke: PRIMARY, 'stroke-width': '1',
        opacity: '0.15'
      });
      edgeGroup.appendChild(link);
      
      const dot = svgEl('circle', {
        cx: mx, cy: my, r: 2 + Math.random() * 3,
        fill: PRIMARY,
        opacity: '0.3'
      });
      edgeGroup.appendChild(dot);
    }
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

    // circle – CSS transition
    const circle = svgEl('circle', {
      r: n.r,
      fill: n.primary ? PRIMARY : '#fff',
      stroke: n.primary ? 'transparent' : PRIMARY,
      'stroke-width': '1.5',
      style: 'transition: fill 0.22s ease, stroke-width 0.22s ease;'
    });
    g.appendChild(circle);

    // label lines
    const lines = n.label.split('\n');
    lines.forEach((line, i) => {
      const t = svgEl('text', {
        'text-anchor': 'middle',
        'dominant-baseline': 'middle',
        fill: n.primary ? '#fff' : PRIMARY,
        'font-size': n.primary ? '18' : (isEnglish ? '12' : '15'),
        'font-weight': '700',
        'font-family': 'var(--font-serif-ko)',
        y: (i - (lines.length - 1) / 2) * (isEnglish ? 17 : 21) - 10,
      });
      t.textContent = line;
      g.appendChild(t);
    });

    // sublabel
    const sub = svgEl('text', {
      'text-anchor': 'middle',
      'dominant-baseline': 'middle',
      fill: n.primary ? 'rgba(255,255,255,0.7)' : TEXT_MUTED,
      'font-size': isEnglish ? '10' : '12',
      'font-weight': '500',
      'font-family': 'var(--font-body)',
      y: lines.length * (isEnglish ? 10 : 12) + (isEnglish ? 3 : 0),
    });
    sub.textContent = n.sublabel;
    g.appendChild(sub);

    // hover + click
    if (n.href) {
      g.addEventListener('mouseenter', () => {
        circle.setAttribute('stroke-width', '2.5');
        circle.setAttribute('fill', '#F5F0E8');
      });
      g.addEventListener('mouseleave', () => {
        circle.setAttribute('stroke-width', '1.5');
        circle.setAttribute('fill', '#fff');
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

/* ── Platform Node Entrance Animation ── */
document.addEventListener('DOMContentLoaded', () => {
  const nodes = document.querySelectorAll('.pm-anim');
  if (!nodes.length) return;
  if (!('IntersectionObserver' in window)) {
    nodes.forEach(n => n.classList.add('visible'));
    return;
  }
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = parseInt(e.target.dataset.delay || 0, 10);
        setTimeout(() => e.target.classList.add('visible'), delay);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  nodes.forEach(n => obs.observe(n));
});

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
