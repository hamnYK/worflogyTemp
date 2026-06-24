/* ================================================
   WORFLOGY — sidebar.js
   Dynamic Sidebar Loader & Mobile Menu Controller
   ================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;

  const isEnglish = window.location.pathname.includes('/en/') || window.location.href.includes('/en/');
  const prefix = isEnglish ? '../' : '';

  // 1. Sidebar HTML Content Injection
  const logoHref = "index.html";
  const logoSrc = `${prefix}assets/worflogy_logo.svg`;
  const logoAlt = isEnglish ? "Worflogy" : "워플로지";

  const brandHtml = `
    <div class="sidebar-logo">
      <a href="${logoHref}"><img src="${logoSrc}" alt="${logoAlt}"></a>
      <div class="sidebar-brand notranslate" translate="no">
        <span class="brand-ko">주식회사 워플로지</span>
        <span class="brand-en">Worflogy Inc.</span>
      </div>
    </div>
  `;

  const navItems = [
    { href: "index.html", textKo: "랜딩", textEn: "Home", icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H15.75v-6h-7.5v6H3.75A.75.75 0 013 21V9.75z" />` },
    { href: "footprint.html", textKo: "히스토리", textEn: "History", icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />` },
    { href: "projects.html", textKo: "프로젝트", textEn: "Projects", icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zm0 9.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zm9.75-9.75A2.25 2.25 0 0115.75 3.75H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zm0 9.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />` },
    { href: "market.html", textKo: "시장 참조", textEn: "Market Reference", icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" /><path stroke-linecap="round" stroke-linejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />` },
    { href: "company.html", textKo: "회사", textEn: "Company", icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M2.25 21h19.5M9 7.5h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6h1.5m-1.5 3h1.5m-1.5 3h1.5M6.75 21V6.375c0-.621.504-1.125 1.125-1.125h8.25c.621 0 1.125.504 1.125 1.125V21M3.375 21h17.25" />` }
  ];

  const platformTitle = "Platform";
  const platformItem = {
    textKo: "BKGSoR (준비 중)",
    textEn: "BKGSoR (Coming Soon)",
    icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 3.75l7.794 4.5v9L12 21.75l-7.794-4.5v-9L12 3.75z" />`
  };

  const servicesTitle = "Services";
  const servicesItem = {
    href: "https://edu.contextonai.com",
    textKo: "교육 브랜드 홈",
    textEn: "Education Brand Home",
    icon: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />`
  };

  let navHtml = `<nav class="sidebar-nav">`;

  navItems.forEach(item => {
    const text = isEnglish ? item.textEn : item.textKo;
    navHtml += `
      <a href="${item.href}" class="nav-item">
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          ${item.icon}
        </svg>
        ${text}
      </a>
    `;
  });

  navHtml += `<div class="nav-divider"></div>`;
  navHtml += `<div class="nav-group-title">${platformTitle}</div>`;
  navHtml += `
    <a href="bkgsor.html" class="nav-item">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        ${platformItem.icon}
      </svg>
      ${isEnglish ? platformItem.textEn : platformItem.textKo}
    </a>
  `;

  navHtml += `<div class="nav-divider"></div>`;
  navHtml += `<div class="nav-group-title">${servicesTitle}</div>`;
  navHtml += `
    <a href="${servicesItem.href}" class="nav-item" target="worflogy_edu" rel="opener">
      <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        ${servicesItem.icon}
      </svg>
      ${isEnglish ? servicesItem.textEn : servicesItem.textKo}
      <svg class="nav-item-outlink" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
      </svg>
    </a>
  `;

  navHtml += `</nav>`;

  const footerHtml = `
    <div class="sidebar-footer">
      © 2025 ${isEnglish ? "Worflogy" : "워플로지"}<br />worflogy.com
    </div>
  `;

  sidebar.innerHTML = brandHtml + navHtml + footerHtml;

  // 2. Active Nav Item Highlighting
  const path = location.pathname.split('/').pop() || 'index.html';
  sidebar.querySelectorAll('.nav-item').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path || (path === '' && href === 'index.html')) {
      a.classList.add('active');
    }
    if (href === 'projects.html' && path.startsWith('project-')) {
      a.classList.add('active');
    }
    if (href === 'footprint.html' && path.startsWith('news-')) {
      a.classList.add('active');
    }
  });

  // 3. Dynamic Mobile Hamburger & Overlay Injection
  let hamburger = document.querySelector('.hamburger');
  let overlay = document.querySelector('.sidebar-overlay');

  if (!hamburger) {
    hamburger = document.createElement('button');
    hamburger.className = 'hamburger';
    hamburger.setAttribute('aria-label', isEnglish ? 'Open Menu' : '메뉴 열기');
    hamburger.innerHTML = `<svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>`;
    document.body.prepend(hamburger);
  }

  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.prepend(overlay);
  }

  // 4. Mobile Hamburger & Overlay Controller
  if (hamburger && overlay) {
    hamburger.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('show');
    });
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('show');
    });
  }
});
