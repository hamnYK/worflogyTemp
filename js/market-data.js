/**
 * Worflogy Market Metrics & IR Data
 * 최종 업데이트: 2026-05-26
 * 다국어(국문/영문) 지원 구조 확장
 */
const marketData = {
  lastUpdated: "2026.05.26",
  
  // TAM-SAM-SOM 데이터 (국내 및 글로벌)
  marketSize: {
    ko: {
      ko: {
        title: "국내 목표 시장 (Korea Market)",
        currency: "원",
        tam: {
          value: "2,000억 ~ 5,000억",
          label: "TAM (전체시장)",
          desc: "국내 스타트업, AC/VC 투자 생태계, 대기업 PI(Process Innovation) 부서 및 중소·벤처기업의 비즈니스 리스크 및 관점 링킹 진단 수요 총합"
        },
        sam: {
          value: "200억 ~ 600억",
          label: "SAM (유효시장)",
          desc: "초기 스타트업 보육 기관, VC 포트폴리오 관리팀, 대기업 오픈이노베이션 프로그램 및 유연한 피봇/관점 링킹 솔루션 도입을 우선 고려하는 핵심 시장"
        },
        som: {
          value: "10억 ~ 30억",
          label: "SOM (수익시장)",
          desc: "출시 1~3년 차 이내 확보 가능한 타깃 시장. 대기업 오픈이노베이션 프로그램 연계 및 주요 액셀러레이터(AC) 파트너십을 통한 즉각 진입 시장"
        }
      },
      global: {
        title: "글로벌 목표 시장 (Global Market)",
        currency: "USD",
        tam: {
          value: "2.0B ~ 5.0B",
          label: "TAM (전체시장)",
          desc: "글로벌 지식 그래프 및 AI 기반 비즈니스 시뮬레이션/지식 자동화 솔루션 시장 규모의 총합 (2032년까지 약 37억 달러로 고성장 예상)"
        },
        sam: {
          value: "300M ~ 1.0B",
          label: "SAM (유효시장)",
          desc: "스타트업 역량 진단, 시나리오 시뮬레이션 및 데이터 기반 보고서 도구 도입을 희망하는 글로벌 테크 기업 및 전문 경영 컨설팅 분야"
        },
        som: {
          value: "500K ~ 50M",
          label: "SOM (수익시장)",
          desc: "글로벌 AC/VC 파트너십 네트워크 및 180개국 IRM(영국 리스크관리협회) 네트워크를 통해 즉각 확보 가능한 글로벌 타깃 시장"
        }
      }
    },
    en: {
      ko: {
        title: "Korea Market",
        currency: "KRW",
        tam: {
          value: "200B ~ 500B",
          label: "TAM (Total Addressable Market)",
          desc: "Total demand for business risk diagnosis and perspective linking from domestic startups, AC/VC investment ecosystems, corporate PI (Process Innovation) departments, and SMEs/venture companies"
        },
        sam: {
          value: "20B ~ 60B",
          label: "SAM (Serviceable Available Market)",
          desc: "Early-stage startup incubators, VC portfolio management teams, corporate open innovation programs, and key markets that prioritize adopting innovative pivot and perspective linking solutions"
        },
        som: {
          value: "1B ~ 3B",
          label: "SOM (Serviceable Obtainable Market)",
          desc: "Target market share obtainable within 1–3 years of launch. Immediate entry markets through corporate open innovation program alignments and key accelerator (AC) partnerships"
        }
      },
      global: {
        title: "Global Market",
        currency: "USD",
        tam: {
          value: "2.0B ~ 5.0B",
          label: "TAM (Total Addressable Market)",
          desc: "Sum of global knowledge graph and AI-based business simulation/knowledge automation solution markets (Projected to reach approximately $3.7B by 2032)"
        },
        sam: {
          value: "300M ~ 1.0B",
          label: "SAM (Serviceable Available Market)",
          desc: "Global tech enterprises and management consulting sectors seeking to adopt startup capability diagnostics, scenario simulations, and data-driven reporting systems"
        },
        som: {
          value: "500K ~ 50M",
          label: "SOM (Serviceable Obtainable Market)",
          desc: "Target markets immediately accessible through global AC/VC partnership networks and the IRM (Institute of Risk Management, UK) networks in 180 countries"
        }
      }
    }
  },
  
  // CAGR 성장률 지표
  growthRate: {
    ko: {
      value: "24.2%",
      period: "2032년까지",
      source: "GMI Market Report (2025.10)",
      desc: "글로벌 기업 진단 및 유연한 의사결정 지원 분야 내 AI 활용 시장의 연평균 성장률(CAGR)"
    },
    en: {
      value: "24.2%",
      period: "by 2032",
      source: "GMI Market Report (2025.10)",
      desc: "Compound annual growth rate (CAGR) of the AI-driven market within global corporate diagnosis and adaptive decision support domains"
    }
  },
  
  // 2026년 하반기 마일스톤 (다국어 분리)
  milestones: {
    ko: [
      {
        period: "7월 ~ 8월",
        title: "핵심 기술 장벽 구축 및 솔루션 테스트",
        desc: "프랙털 온톨로지 핵심 특허(IP) 등록을 마무리하고, 출시 예정인 3개 솔루션의 UX/안정성 테스트 및 파일럿 검증을 집중적으로 수행합니다."
      },
      {
        period: "9월 ~ 10월",
        title: "솔루션 공식 론칭 및 기술 인증 획득",
        desc: "온톨로지 기반 비즈니스 솔루션 1~3종을 공식 출시하며, 기 확보된 등록 특허를 기반으로 기술 혁신형 벤처기업 인증을 획득합니다."
      },
      {
        period: "10월 ~ 12월",
        title: "국가 R&D 과제 참여 및 파트너십 확장",
        desc: "정부 주도 R&D 지원사업 참여를 위한 컨소시엄을 구성하고, 신규 서사 게임 엔진 솔루션 개발 초도 완료 및 B2B 마케팅/협업 채널을 다각화합니다."
      },
      {
        period: "2026년 하반기",
        title: "투자 유치(IR) 본격화 및 스케일업",
        desc: "기관 투자자(AC/VC) 대상의 IR 라운드를 본격 진행하여 투자 유치를 달성하고, 솔루션 고도화 및 글로벌 확장을 위한 핵심 인재를 영입합니다."
      }
    ],
    en: [
      {
        period: "July ~ August",
        title: "Core Technology Barrier & Solution Testing",
        desc: "Finalize registration of core fractal ontology patents (IP), and conduct intensive UX/stability testing and pilot verification of the three upcoming solutions."
      },
      {
        period: "September ~ October",
        title: "Official Solution Launch & Technology Certification",
        desc: "Officially launch 1 to 3 ontology-based business solutions, and obtain Venture Business Certification based on secured registered patents."
      },
      {
        period: "October ~ December",
        title: "National R&D Project Participation & Partnership Expansion",
        desc: "Form a consortium to participate in government-led R&D support projects, finalize initial development of a new narrative game engine solution, and diversify B2B marketing/collaboration channels."
      },
      {
        period: "H2 2026",
        title: "Investment Attraction (IR) & Scale-up",
        desc: "Launch official IR rounds targeted at institutional investors (AC/VC) to secure funding, and recruit key talents for solution advancement and global expansion."
      }
    ]
  },
  
  // 지식재산권(IP) 현황 (다국어 분리)
  intellectualProperties: {
    ko: [
      {
        type: "patent-reg",
        status: "특허 등록 완료 (국내)",
        name: "관점 데이터 간의 링크를 이용한 마인드 마이닝 분석 방법",
        number: "제 10-1791086 호 (등록일: 2017.05.18)",
        holder: "발명자: 함영국 대표"
      },
      {
        type: "patent-app-global",
        status: "국제 특허 출원 (PCT)",
        name: "Mind-mining analysis method using link between view data",
        number: "WO2018212398A1 (출원일: 2017.06.12)",
        holder: "발명자: 함영국 대표"
      },
      {
        type: "patent-app",
        status: "우선심사 진행 중 (국내)",
        name: "이슈 기반 워크플로우 온톨로지 관리 방법 및 이러한 방법을 수행하는 장치",
        number: "제 10-2025-0187777 호 (출원일: 2025.12.02)",
        holder: "출원인: 주식회사 워플로지"
      },
      {
        type: "trademark",
        status: "상표권 등록 완료",
        name: "WORFLOGY (브랜드 상표 및 로고)",
        number: "제 40-2025-0115810 / 0115814 호",
        holder: "권리자: 함영국 대표"
      },
      {
        type: "trademark",
        status: "상표권 등록 완료",
        name: "CONTEXTON (서비스 상표 및 로고)",
        number: "제 40-2025-0108753 / 0108754 호",
        holder: "권리자: 함영국 대표"
      }
    ],
    en: [
      {
        type: "patent-reg",
        status: "Patent Registered (KR)",
        name: "Mind mining analysis method using link between view data",
        number: "No. 10-1791086 (Registered: 2017.05.18)",
        holder: "Inventor: CEO Youngkuk Hamn"
      },
      {
        type: "patent-app-global",
        status: "International Patent Applied (PCT)",
        name: "Mind-mining analysis method using link between view data",
        number: "WO2018212398A1 (Applied: 2017.06.12)",
        holder: "Inventor: CEO Youngkuk Hamn"
      },
      {
        type: "patent-app",
        status: "Under Prioritized Examination (KR)",
        name: "Issue-based workflow ontology management method and apparatus performing the same",
        number: "No. 10-2025-0187777 (Applied: 2025.12.02)",
        holder: "Applicant: Worflogy Inc."
      },
      {
        type: "trademark",
        status: "Trademark Registered",
        name: "WORFLOGY (Brand Trademark & Logo)",
        number: "No. 40-2025-0115810 / 0115814",
        holder: "Owner: CEO Youngkuk Hamn"
      },
      {
        type: "trademark",
        status: "Trademark Registered",
        name: "CONTEXTON (Service Trademark & Logo)",
        number: "No. 40-2025-0108753 / 0108754",
        holder: "Owner: CEO Youngkuk Hamn"
      }
    ]
  }
};

// 브라우저 및 Node 환경 지원
if (typeof module !== "undefined" && module.exports) {
  module.exports = marketData;
}
