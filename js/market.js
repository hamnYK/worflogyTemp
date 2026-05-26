/**
 * Worflogy Market Metrics & IR Dashboard Logic
 * 다국어(국문/영문) 렌더링 지원 수정
 */
document.addEventListener("DOMContentLoaded", () => {
  // 1. 현재 언어 환경 감지
  const isEnglish = window.location.href.includes('/en/');
  const currentLang = isEnglish ? 'en' : 'ko';

  // 2. 마지막 업데이트 일자 표출
  const updatedEl = document.getElementById("last-updated");
  if (updatedEl && marketData.lastUpdated) {
    updatedEl.textContent = marketData.lastUpdated;
  }

  // 3. TAM-SAM-SOM 탭 토글 및 데이터 제어
  let currentTab = isEnglish ? "global" : "ko"; // 영문 페이지는 글로벌 탭 기본 활성화
  const tabButtons = document.querySelectorAll(".market-tab-btn");
  const tamValEl = document.getElementById("tam-val");
  const samValEl = document.getElementById("sam-val");
  const somValEl = document.getElementById("som-val");
  const detailTitleEl = document.getElementById("metric-detail-title");
  const detailDescEl = document.getElementById("metric-detail-desc");
  const currencyUnitEls = document.querySelectorAll(".currency-unit");

  function updateMarketTab(tabKey) {
    currentTab = tabKey;
    const data = marketData.marketSize[tabKey];
    if (!data) return;

    // 활성 탭 버튼 스타일
    tabButtons.forEach(btn => {
      if (btn.dataset.tab === tabKey) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // 금액 텍스트 업데이트
    if (tamValEl) tamValEl.textContent = data.tam.value;
    if (samValEl) samValEl.textContent = data.sam.value;
    if (somValEl) somValEl.textContent = data.som.value;

    // 화폐 단위 업데이트
    currencyUnitEls.forEach(el => {
      el.textContent = data.currency;
    });

    // SVG 벤다이어그램 원 크기 및 텍스트 위치 애니메이션 트리거
    const tamCircle = document.getElementById("circle-tam");
    const samCircle = document.getElementById("circle-sam");
    const somCircle = document.getElementById("circle-som");
    const tamLabel = document.getElementById("label-tam");
    const samLabel = document.getElementById("label-sam");
    const somLabel = document.getElementById("label-som");

    if (tabKey === "ko") {
      // 국내 시장 스케일
      if (tamCircle) tamCircle.setAttribute("r", "140");
      if (samCircle) samCircle.setAttribute("r", "90");
      if (somCircle) somCircle.setAttribute("r", "50");
      // 국내 시장 텍스트 위치 정렬 (경계선과 겹치지 않게 조절)
      if (tamLabel) tamLabel.setAttribute("y", "90");
      if (samLabel) samLabel.setAttribute("y", "135");
      if (somLabel) somLabel.setAttribute("y", "205");
    } else {
      // 글로벌 시장 스케일
      if (tamCircle) tamCircle.setAttribute("r", "150");
      if (samCircle) samCircle.setAttribute("r", "100");
      if (somCircle) somCircle.setAttribute("r", "60");
      // 글로벌 시장 텍스트 위치 정렬 (원 크기 팽창에 따라 위로 이동)
      if (tamLabel) tamLabel.setAttribute("y", "75");
      if (samLabel) samLabel.setAttribute("y", "120");
      if (somLabel) somLabel.setAttribute("y", "205");
    }

    // 기본 가이드 설명 노출
    showMetricDetail("som"); // 기본으로 SOM(수익시장)이 활성화되어 보이도록
  }

  // 상세 카드 정보 표출 함수
  function showMetricDetail(type) {
    const data = marketData.marketSize[currentTab];
    if (!data || !data[type]) return;

    const metric = data[type];
    
    // 이전에 활성화된 원 스타일 초기화
    document.querySelectorAll(".venn-circle").forEach(c => {
      c.classList.remove("highlighted");
    });
    
    // 해당 원 강조
    const activeCircle = document.getElementById(`circle-${type}`);
    if (activeCircle) {
      activeCircle.classList.add("highlighted");
    }

    // 디테일 카드 업데이트 (페이드 효과 포함)
    if (detailTitleEl && detailDescEl) {
      detailTitleEl.style.opacity = 0;
      detailDescEl.style.opacity = 0;
      setTimeout(() => {
        detailTitleEl.textContent = `${metric.label}: ${metric.value} ${data.currency}`;
        detailDescEl.textContent = metric.desc;
        detailTitleEl.style.opacity = 1;
        detailDescEl.style.opacity = 1;
      }, 150);
    }
  }

  // 탭 버튼 클릭 리스너 연결
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      updateMarketTab(btn.dataset.tab);
    });
  });

  // SVG 원 클릭/호버 이벤트 리스너 연결
  const vennInteractiveRegions = ["tam", "sam", "som"];
  vennInteractiveRegions.forEach(type => {
    const circleEl = document.getElementById(`circle-${type}`);
    const labelEl = document.getElementById(`label-${type}`);
    
    const triggerHighlight = () => showMetricDetail(type);

    if (circleEl) {
      circleEl.addEventListener("mouseenter", triggerHighlight);
      circleEl.addEventListener("click", triggerHighlight);
    }
    if (labelEl) {
      labelEl.addEventListener("mouseenter", triggerHighlight);
      labelEl.addEventListener("click", triggerHighlight);
    }
  });

  // 4. CAGR 링 차트 로드 애니메이션
  const progressCircle = document.querySelector(".progress-ring-circle");
  if (progressCircle) {
    const radius = progressCircle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;

    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = circumference;

    // 성장률 값 매핑 (24.2%)
    const cagrValEl = document.getElementById("cagr-value");
    if (cagrValEl && marketData.growthRate) {
      cagrValEl.textContent = marketData.growthRate.value;
    }

    // 화면 스크롤이나 로딩 시 게이지 슬라이드 애니메이션
    setTimeout(() => {
      // 24.2%를 360도로 환산하여 게이지 표시 (최대 100% 기준)
      const percent = parseFloat(marketData.growthRate.value) || 24.2;
      const offset = circumference - (percent / 100) * circumference;
      progressCircle.style.strokeDashoffset = offset;
    }, 400);
  }

  // 5. 마일스톤 타임라인 렌더링 (다국어 분할 지원)
  const milestoneTimeline = document.getElementById("milestone-timeline");
  const milestonesList = marketData.milestones[currentLang];
  if (milestoneTimeline && milestonesList) {
    milestoneTimeline.innerHTML = ""; // 기존 내용 초기화
    
    milestonesList.forEach((m, idx) => {
      const step = document.createElement("div");
      step.className = "timeline-step";
      step.innerHTML = `
        <div class="step-node-container">
          <div class="step-line-prev"></div>
          <div class="step-node" data-index="${idx}">
            <span class="step-num">${idx + 1}</span>
          </div>
          <div class="step-line-next"></div>
        </div>
        <div class="step-info">
          <div class="step-period">${m.period}</div>
          <div class="step-title">${m.title}</div>
          <div class="step-desc">${m.desc}</div>
        </div>
      `;
      milestoneTimeline.appendChild(step);
    });

    // 마일스톤 호버 마이크로 인터랙션
    const nodes = document.querySelectorAll(".step-node");
    nodes.forEach(node => {
      node.addEventListener("mouseenter", () => {
        node.classList.add("active");
      });
      node.addEventListener("mouseleave", () => {
        node.classList.remove("active");
      });
    });
  }

  // 6. 지식재산권(IP) 그리드 렌더링 (다국어 분할 지원)
  const ipGrid = document.getElementById("ip-grid");
  const ipList = marketData.intellectualProperties[currentLang];
  if (ipGrid && ipList) {
    ipGrid.innerHTML = "";
    
    ipList.forEach(ip => {
      const card = document.createElement("div");
      card.className = "ip-card";
      
      let badgeClass = "badge-patent";
      if (ip.type === "trademark") {
        badgeClass = "badge-trademark";
      } else if (ip.type === "patent-app-global") {
        badgeClass = "badge-global";
      }

      card.innerHTML = `
        <div class="ip-card-header">
          <span class="ip-badge ${badgeClass}">${ip.status}</span>
          <span class="ip-holder">${ip.holder}</span>
        </div>
        <h4 class="ip-title">${ip.name}</h4>
        <div class="ip-number">${ip.number}</div>
      `;
      ipGrid.appendChild(card);
    });
  }

  // 7. 초기 실행
  updateMarketTab(currentTab);
});
