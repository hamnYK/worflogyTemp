/**
 * Worflogy Market Metrics & IR Data
 * 최종 업데이트: 2026-05-22
 */
const marketData = {
  lastUpdated: "2026.05.22",
  
  // TAM-SAM-SOM 데이터 (국내 및 글로벌)
  marketSize: {
    ko: {
      title: "국내 목표 시장 (Korea Market)",
      currency: "원",
      tam: {
        value: "2,000억 ~ 5,000억",
        label: "TAM (전체시장)",
        desc: "스타트업, 액셀러레이터, VC 포트폴리오사, 기업의 PI(Process Innovation) 부서 및 중소기업의 기업 진단 전체 수요"
      },
      sam: {
        value: "200억 ~ 600억",
        label: "SAM (유효시장)",
        desc: "초기 스타트업, 액셀러레이터, VC 포트폴리오 관리, 대기업/중견기업 PI 부서 중심의 실질 서비스 유효 시장"
      },
      som: {
        value: "10억 ~ 30억",
        label: "SOM (수익시장)",
        desc: "솔루션 출시 1~3년차 내 확보 가능한 시장. 대기업 오픈이노베이션 및 액셀러레이터 파트너십 네트워크를 통해 도달"
      }
    },
    global: {
      title: "글로벌 목표 시장 (Global Market)",
      currency: "USD",
      tam: {
        value: "20억 ~ 60억",
        label: "TAM (전체시장)",
        desc: "글로벌 지식 그래프(Knowledge Graph) 및 AI 기반 비즈니스 진단/지식 자동화 도구의 교집합적 시장 영역 (2032년 37억 USD 규모로 성장 전망)"
      },
      sam: {
        value: "3억 ~ 10억",
        label: "SAM (유효시장)",
        desc: "스타트업 문제 진단, 의사결정 시뮬레이션 및 실행 가능 보고서 도구를 도입하려는 글로벌 테크 기업 및 전문 경영 컨설팅 도메인"
      },
      som: {
        value: "50만 ~ 5,000만",
        label: "SOM (수익시장)",
        desc: "글로벌 액셀러레이터/VC 포트폴리오 유입 및 자사 네트워크(대표자의 글로벌 리스크 관리 협회 투표권 및 180여개국 네트워크) 기반 확보 시장"
      }
    }
  },
  
  // CAGR 성장률 지표
  growthRate: {
    value: "24.2%",
    period: "2032년까지",
    source: "GMI 시장 보고서 (2025.10)",
    desc: "기업 진단 및 의사결정 도메인 내 AI 활용 글로벌 시장의 연평균 성장률(CAGR)"
  },
  
  // 2026년 하반기 마일스톤
  milestones: [
    {
      period: "5월 ~ 6월",
      title: "기술 장벽 구축 및 출시 준비",
      desc: "주요 특허(IP) 등록을 완료하고, 솔루션 3건의 안정화 및 사용자 경험(UX) 테스트를 집중적으로 진행합니다."
    },
    {
      period: "7월 ~ 8월",
      title: "솔루션 공식 출시 & 인증",
      desc: "솔루션 01~03종을 공식 출시하며, 확보된 등록 지식재산권을 기반으로 기술 벤처기업 인증을 획득합니다."
    },
    {
      period: "9월 ~ 10월",
      title: "정부 R&D 및 마케팅 확장",
      desc: "정부 R&D 과제 참여를 위한 컨소시엄을 구성하고, 솔루션 04 개발 및 기존 솔루션들의 마케팅/협업 채널을 다각화합니다."
    },
    {
      period: "11월 ~ 12월",
      title: "투자 유치(IR) 및 스케일업",
      desc: "AC/VC 네트워크를 통한 투자 유치를 본격화하고, 솔루션 운영 및 기술 고도화를 위한 핵심 인력을 채용합니다."
    }
  ],
  
  // 지식재산권(IP) 현황
  intellectualProperties: [
    {
      type: "patent-reg",
      status: "등록 완료 (국내)",
      name: "관점 데이터 간의 링크를 이용한 마인드 마이닝 분석 방법",
      number: "10-1791086 (등록일: 17.05.18)",
      holder: "함영국 대표"
    },
    {
      type: "patent-app-global",
      status: "출원 완료 (국외)",
      name: "Mind-mining analysis method using link between view data",
      number: "WO2018212398A1 (출원일: 17.06.12)",
      holder: "함영국 대표"
    },
    {
      type: "patent-app",
      status: "우선심사 진행 중 (국내)",
      name: "이슈 기반 워크플로우 온톨로지 관리 방법 및 이러한 방법을 수행하는 장치",
      number: "2025-0187777 (출원일: 25.12.02)",
      holder: "주식회사 워플로지"
    },
    {
      type: "trademark",
      status: "상표 등록 완료",
      name: "WORFLOGY (상표 및 로고)",
      number: "40-2025-0115810 / 0115814",
      holder: "함영국 대표"
    },
    {
      type: "trademark",
      status: "상표 등록 완료",
      name: "CONTEXTON (상표 및 로고)",
      number: "40-2025-0108753 / 0108754",
      holder: "함영국 대표"
    }
  ]
};

// 브라우저 및 Node 환경 지원
if (typeof module !== "undefined" && module.exports) {
  module.exports = marketData;
}
