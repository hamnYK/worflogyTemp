(function() {
  // 1. 페이지 로드 시 저장된 스크롤 위치 복원
  const savedScroll = sessionStorage.getItem('lang_switcher_scroll');
  if (savedScroll !== null) {
    window.scrollTo(0, parseInt(savedScroll, 10));

    // 이미지나 다이어그램(Mermaid) 렌더링에 따른 레이아웃 지연 복원
    setTimeout(function() {
      window.scrollTo(0, parseInt(savedScroll, 10));
      sessionStorage.removeItem('lang_switcher_scroll');
    }, 150);
  }

  document.addEventListener("DOMContentLoaded", function() {
    const href = window.location.href;
    // URL에 '/en/'이 포함되어 있는지 확인하여 영문 모드인지 여부 판단
    const isEnglish = href.includes('/en/');

    // 스위처 엘리먼트 생성
    const container = document.createElement('div');
    container.className = 'lang-switcher-container';

    const koActive = !isEnglish ? 'active' : '';
    const enActive = isEnglish ? 'active' : '';

    container.innerHTML = `
      <button class="lang-switcher-btn ${koActive}" data-lang="ko" aria-label="한국어 변경">KO</button>
      <button class="lang-switcher-btn ${enActive}" data-lang="en" aria-label="English">EN</button>
    `;

    document.body.appendChild(container);

    // 클릭 이벤트 리스너 등록
    container.addEventListener('click', function(e) {
      const btn = e.target.closest('.lang-switcher-btn');
      if (!btn) return;

      const targetLang = btn.getAttribute('data-lang');

      // 전환 직전 현재 스크롤 위치 기록
      sessionStorage.setItem('lang_switcher_scroll', window.scrollY);

      // 1. 영문 -> 국문 전환 (KO 클릭)
      if (targetLang === 'ko' && isEnglish) {
        let newUrl;
        const protocol = window.location.protocol;
        const host = window.location.host;

        if (protocol === 'file:') {
          const lastEnIdx = href.lastIndexOf('/en/');
          if (lastEnIdx !== -1) {
            newUrl = href.substring(0, lastEnIdx) + '/' + href.substring(lastEnIdx + 4);
          } else {
            newUrl = href;
          }
        } else {
          let targetPathname = window.location.pathname;
          if (targetPathname.startsWith('/en/')) {
            targetPathname = '/' + targetPathname.substring(4);
          } else {
            targetPathname = targetPathname.replace(/\/en\//i, '/');
          }
          newUrl = protocol + '//' + host + targetPathname + window.location.search + window.location.hash;
        }

        // 중복 슬래시 정제
        const cleanedHref = newUrl.replace(/([^:]\/)\/+/g, "$1");
        window.location.href = cleanedHref;
      } 
      // 2. 국문 -> 영문 전환 (EN 클릭)
      else if (targetLang === 'en' && !isEnglish) {
        let targetHref;
        let mainUrl = href;
        let suffix = '';

        // 해시(#)와 쿼리 스트링(?) 추출 및 보존
        const hashIdx = href.indexOf('#');
        const queryIdx = href.indexOf('?');
        let splitIdx = -1;

        if (hashIdx !== -1 && queryIdx !== -1) {
          splitIdx = Math.min(hashIdx, queryIdx);
        } else if (hashIdx !== -1) {
          splitIdx = hashIdx;
        } else if (queryIdx !== -1) {
          splitIdx = queryIdx;
        }

        if (splitIdx !== -1) {
          mainUrl = href.substring(0, splitIdx);
          suffix = href.substring(splitIdx);
        }

        // 마지막 슬래시 위치 기준으로 그 바로 뒤에 '/en/' 삽입
        const lastSlash = mainUrl.lastIndexOf('/');
        if (lastSlash !== -1) {
          const protoEnd = mainUrl.indexOf('://');
          const checkStart = (protoEnd !== -1) ? protoEnd + 3 : 0;
          const trueLastSlash = mainUrl.indexOf('/', checkStart);

          if (trueLastSlash === -1 || lastSlash <= checkStart) {
            // 도메인 루트 접근인 경우 (예: http://worflogy.com)
            targetHref = mainUrl + '/en/' + suffix;
          } else {
            // 경로 파일명이 포함된 경우 (예: /company.html)
            targetHref = mainUrl.substring(0, lastSlash) + '/en' + mainUrl.substring(lastSlash) + suffix;
          }
        } else {
          targetHref = mainUrl + '/en/' + suffix;
        }

        window.location.href = targetHref;
      }
    });
  });
})();