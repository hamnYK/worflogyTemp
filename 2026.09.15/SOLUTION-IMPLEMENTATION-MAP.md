# 홈페이지 솔루션과 실제 구현 매칭

확인일: 2026-09-16  
대상 저장소: \\wsl.localhost\Ubuntu-24.04\home\gkadudrnr\gkadudrnr-indi

## 판단 범위

현재 소스의 진입 화면·API·서비스 로직, 2026.09.13 중심의 기존 검토 문서, 홈페이지 미리보기 01~08을 대조했다. 이번 조사에서 제품을 새로 기동하거나 실제 LLM·결제·외부 계정·DB를 호출하지 않았다. 제품 소스와 홈페이지 문구·상태·이미지는 변경하지 않았다.

아래에서 “구현 확인”은 해당 코드와 연결 경로가 존재함을 뜻한다. 현재 배포의 정상 동작, 품질, 고객 실증 또는 상용 준비 완료를 뜻하지 않는다. 기존 검토의 통과 결과는 그 날짜와 범위에 한정한다.

## 1. 대응표

번호는 홈페이지 제목 번호(1~8)다. 0번은 회사 기술 개요다.

| 번호 | 홈페이지 솔루션 | 대응 구현 | 소스에서 확인한 핵심 흐름 | 매칭 판단 |
|---|---|---|---|---|
| 1 | 복잡한 엔지니어링 프로세스를 최소한의 자원으로 운영하는 솔루션 | 루트 frontend + backend / 13 ECRA | 프로필·역량·직무 포지셔닝 → 역할 배정 → WBS 소통 의무·과업 → 완료 집계. PostgreSQL 이벤트와 Oxigraph RDF/SPARQL 연결 | 높음. 현재 구현의 중심은 인력·역할·소통이며 모든 자원에 대한 최적화 성과를 입증한 것은 아님 |
| 2 | 문제를 해결하는 협업 과정을 지식 그래프로 전환하는 솔루션 | 0-prj-worflogy / Worflogy TKC | 의견·링크·가설 → 후보 비교·확정 → 수행·평가·정책. 확정 가설과 경로를 DB에 저장하고 임베딩 생성 | 높음 |
| 3 | 프로젝트 리스크를 진단하고 해당 리스크를 최적화하는 과정을 지식 그래프로 전환하는 솔루션 | 1-prj-mirrormap / MirrorMap | AS-IS/TO-BE 맵 → 서버 계산 리스크 점수 + AI 정성 진단 → 회의·전략·평가·멘토링·정책·지식 그래프 | 높음 |
| 4 | 진화하는 실험 설계를 위한 연구 노트 솔루션 | 2-prj-contexton / Contexton | 연구 노트·노드·링크·파일 → AI/RAG 설계 보조 → 스냅샷 저장·비교 → 공유·지식 거래 | 높음 |
| 5 | 온톨로지 기반 게임 서사 엔진 솔루션 | 3-prj-simengine / SimEngine Narrative | 문서·세계관·장면·조건·NPC → 게임 이벤트 검증·로그 저장 → 서사 진행 판정 → NPC 응답. Galious TRPG·Book Club 시연 클라이언트 | 높음 |
| 6 | 게임 캐릭터 및 NPC 인큐베이터 솔루션 | dudrnrdl-mind / Mind 중심, add-prj-why·SimEngine과 기능 접점 | CFPP 대화 → 인과 노드·링크·루프 → 페르소나·OWL/JSON-LD 내보내기. 독서·게임 선택과 이유 → 공명 점수·페르소나 가중치 반영 | 이미지와 구현 대응은 높음. 홈페이지의 NPC 인큐베이터 명칭보다 실제 Mind의 범위가 넓음 |
| 7 | 온톨로지로 1인 게임 콘텐츠 제작자를 지원하는 솔루션 | dudrnrdl-gamemarket / GameMarket | 게임 기획서(GDD) → 규칙·인과 그래프 진단 → 시장 비교·LTV/민감도 계산 → WBS → SDK 이벤트·지표 | 기능 매칭 높음. 홈페이지 미리보기 이미지는 다른 제품 |
| 8 | 인공지능의 인지 편향을 롤플레잉으로 진단하는 게임 솔루션 | dudrnrdl-ontologygame/game / BIAS 사무실의 편향들 | AI 동료 대화·관점 선택 → 발언 트리플 추출 → 규칙 점수·편향 표시 → 세계 상태·마일스톤 갱신 | 높음. 범용 모델 평가기보다 특정 시나리오의 편향 탐색 게임에 가까움 |

## 2. 실제 코드 근거

아래 경로는 대상 저장소 루트 기준이다.

### 1 — 엔지니어링 플랫폼
- frontend/app/dashboard/ecra/page.tsx: 13 ECRA 포지셔닝 화면과 개요·배치·팀 시뮬레이션 컴포넌트.
- frontend/app/dashboard/ecra/components/WbsTreePanel.tsx, CommunicationRegistryPanel.tsx, TeamSimulationTab.tsx: WBS·소통·팀 화면.
- backend/app/api/v1/ecra.py: 표준 WBS와 역할 간 소통 엣지 매핑.
- backend/app/services/rdf_sync_service.py: 역할 배정 트리플 → 테넌트별 RDF → SPARQL 소통 의무 추론 → PostgreSQL 저장.
- 확인한 구조는 역할·인력·프로세스 지원이다. 비용·일정·장비까지 포괄하는 “최소 자원 최적해”나 생산성 향상 수치는 이번 조사로 증명되지 않는다.

### 2 — Worflogy TKC
- 0-prj-worflogy/src/domain/services/finalize.service.ts:15: 가설·노드·링크 조회, 소유자 확인, 암묵 가설 생성, ADOPTED/LATENT 등 상태 처리, 경로 기반 임베딩 작업.
- 0-prj-worflogy/src/lib/rag.ts: 실제 외부 임베딩 호출. 키 누락·실패 때 빈 벡터로 진행하는 경계가 있으므로 DB 기록만으로 AI 연동 성공을 단정할 수 없다.
- Agile-Lite / Strict-Audit 두 업무 모드는 기존 검토 기록에서도 구분된다.

### 3 — MirrorMap
- 1-prj-mirrormap/src/services/diagnosis-service.ts: 맵의 시간 차이·구조 중요도·연결 부하 등으로 서버에서 점수를 계산하고 AI는 정성 설명을 생성하는 구조.
- 1-prj-mirrormap/src/services/knowledge-service.ts: 개념·관계 조회/생성, 역관계 처리, 임베딩 저장.
- 1-prj-mirrormap/src/services/facilitator/, hypothesis-service.ts, report-service.ts, task-service.ts: 퍼실리테이션·가설·보고·수행 코드 구성.
- 위험 점수는 구현된 계산 모델의 결과이며 실증적으로 검증된 범용 예측 정확도와 동일하지 않다.

### 4 — Contexton
- 2-prj-contexton/app/api/ai/chat/route.ts: 노드 생성·수정, 설계 분석·논리 진단·이론 추천 의도 처리 및 임베딩/AI 서비스 연결.
- 2-prj-contexton/app/api/research-note/[id]/snapshots/route.ts: 소유권 확인 후 노드·링크 스냅샷 저장/조회.
- 2-prj-contexton/app/api/research-note/[id]/chat/route.ts: 노트별 대화 이력 조회.
- 연구 노트·그래프·변경 이력을 다루는 실제 앱이다. 실험 설계의 과학적 타당성을 자동 보장한다는 의미는 아니다.

### 5 — SimEngine
- 3-prj-simengine/src/app/api/narrative/message/route.ts:222: 통합 서사 API. 플레이어 발언과 게임 상태를 비교하는 분류, 로그 저장·임베딩, 진행 조건 평가와 NPC 응답 생성 경로.
- 3-prj-simengine/src/app/api/npc/profile/route.ts: 공통/세계관별 NPC 프로필 CRUD와 personaJsonLd 필드.
- 3-prj-simengine/README.md: 주 제품은 서사 엔진이며 Galious·Book Club은 시연 클라이언트. 현재 시연은 공유 진행 상태를 사용하며 사용자별 독립 세이브 서비스와 구별됨.
- 게임 화면이 존재한다는 것과 독립적인 상용 게임·다중 사용자 서비스가 완성됐다는 것은 별개다.

### 6 — Mind
- dudrnrdl-mind/backend/app/routers/cfpp.py:631, 811, 1153: 대화, 완료 시 인과 구조 처리, OWL/JSON-LD 내보내기.
- dudrnrdl-mind/backend/app/routers/game.py: NPC 서술, 선택과 이유의 공명 계산, 게임 완료 시 UserPersona 가중치 갱신과 DB 저장.
- dudrnrdl-mind/backend/app/services/narrative_sync.py: 서사 레지스트리·그래프 처리.
- 홈페이지 canvas-06.png에 보이는 CFPP 아바타·독서 클럽·소셜 시뮬레이션·UserPersona 관리자 화면과 대응한다.
- SimEngine에는 별도의 NPC 프로필/페르소나 입력 코드가 있다. Mind와 Why의 사유 구조를 NPC에 이용할 접점은 있으나 제품 간 전체 내보내기→가져오기→플레이를 이번에 실행한 것은 아니다.
- “NPC 인큐베이터”의 적용 가치는 설명할 수 있지만, 실제 메뉴 전체를 NPC 제작 전용 도구로 소개하면 범위를 오해할 수 있다.

### 7 — GameMarket
- dudrnrdl-gamemarket/backend/app/core/ontology.py: 사전 정의된 기획 요소·지표의 인과 그래프와 장르별 임계값 진단.
- dudrnrdl-gamemarket/backend/app/api/v1/analysis.py: 벤치마크·LTV·민감도·WBS 계산 경로. 벤치마크 캐시가 없으면 기본값을 사용한다.
- dudrnrdl-gamemarket/backend/app/api/v1/gdd.py, sdk.py, ingest.py 및 unity-sdk/: 기획서·SDK·이벤트 수집 코드 구성.
- 현재 확인한 진단 핵심은 사전 정의 그래프·임계값이다. 모든 관계가 실시간 시장 데이터로 자율 학습·검증된다고 설명할 근거는 부족하다.
- 기존 문서의 대학 데이터 공급은 예정 범위이며 실제 공급/활용 완료로 해석하지 않는다.

### 8 — BIAS
- dudrnrdl-ontologygame/game/js/main.js:171~203: AI 응답 호출 → 관점 해석 → 트리플 추가 → 편향 규칙 추론 → 세계 상태 갱신.
- main.js:178은 extractTriples(..., null)을 호출한다. 따라서 현재 이 경로의 트리플 추출은 추가 LLM 분석이 아니라 한국어 트리거 기반 규칙 경로를 사용한다.
- ontology-engine.js:275: 선택적 LLM 추출 코드와 규칙 기반 대체 경로. 매칭이 없어도 기본 frames 트리플을 생성한다.
- ontology-engine.js:361: 규칙 가중치와 임계값으로 편향을 표시한다.
- ai-bridge.js: Gemini/OpenAI/로컬 모델 연결 코드. 브라우저에서 설정하는 방식이다.
- 특정 역할극의 발언·관점을 탐색하는 게임 구현은 확인된다. 이 점수만으로 범용 AI 편향 벤치마크 정확도나 표준화된 진단 신뢰도를 주장할 수는 없다.
- 기존 9월 13일 OntologyGame 검토는 references의 NIA/CBC 도구 중심이다. 이를 현재 game/의 완주 검증으로 인용하면 안 된다.

## 3. 홈페이지 이미지 대조

| 파일 | 현재 배치 | 이미지에서 확인한 화면 | 판단 |
|---|---|---|---|
| canvas-01.png | 1 엔지니어링 | ECRA 표준 WBS·역할 소통 그래프 | 일치 |
| canvas-02.png | 2 협업 | Worflogy TKC 팀 업무 지식 자산 | 일치 |
| canvas-03.png | 3 리스크 | MirrorMap Map Editor·Risk Score | 일치 |
| canvas-04.png | 4 연구 | Contexton 연구 맥락 스냅샷·AI 분석가 | 일치 |
| canvas-05.png | 5 서사 엔진 | Ontology Engine 세계관·장면·조건 편집 | 일치 |
| canvas-06.png | 6 NPC | Mind 관리자·CFPP·UserPersona | 연결 가능하나 인큐베이터 활용 설명 필요 |
| canvas-07.png | 7 제작자 지원 | THE MAZE OF GALIOUS : TRPG | 불일치: SimEngine 시연 화면 |
| canvas-08.png | 8 인지 편향 | BIAS 사무실의 편향들 시작 화면 | 일치 |

7번은 GameMarket의 GDD 작성, 목표 지표 진단 또는 WBS 화면을 제품 미리보기로 사용하는 것이 설명에 맞는다. Galious 이미지는 5번 서사 엔진의 “적용 게임 예시”로 활용할 수 있다. 이번 조사에서는 이미지 교체나 제품 접속을 하지 않았다.

## 4. 기존 검증 기록과 상태 표시

_todocheck_today/2026.09.13/<프로젝트>/workflow-recheck/REVIEW.md를 읽었다. 다수 프로젝트에 API·DB·HTTP·브라우저 및 일부 실제 AI 표본의 검증 기록이 있다. 이는 구현이 단순한 소개 화면에 그치지 않는다는 근거지만 전체 상용 품질·현재 운영 상태를 보증하지 않는다.

- 플랫폼: 과업 배정·WBS 흐름의 제한된 검증. 실제 Jira/GitHub 이벤트 발신 전체는 미검증.
- TKC: 두 모드와 임베딩 표본 기록. 다수 참가자 동시 협업·장기 정책 품질은 미검증.
- MirrorMap: 진단·회의·DB 및 AI 표본 기록. 복합 RAG 회의·장기 효과·결제는 미검증.
- Contexton: 노트·파일·공유·구매복제 및 AI 요약 표본 기록. 장문 연구 품질·실제 결제 등은 미검증.
- SimEngine: 엔진/API/게임의 나뉜 검증 기록. 실제 문서부터 전체 게임까지 하나의 연속 E2E는 미검증.
- Mind: 선택·이유·성장 저장 검증과 AI 표본 기록. 장문·다회차 의미 일관성 등은 미검증.
- GameMarket: 격리 DB 기반 API·SDK 회귀 기록. 실물 Unity/모바일·실제 외부 지표 계정은 미검증.

현재 홈페이지의 “실증 테스트 가능”(1~5), “초기 사용자 테스트 중”(6), “내부 테스트 중”(7~8)은 이번 조사로 새로 판정한 상태가 아니다. 특히 “초기 사용자 테스트 중”에는 실제 참여 사용자·진행 기간·테스트 기록 같은 운영 근거가 필요하다. 과거 자동화 테스트 통과를 사용자 테스트 참여로 바꿔 해석하지 않았다.

## 5. 홈페이지 설명에 반영할 때의 우선순위

1. 7번 GameMarket의 미리보기와 실제 제품을 맞추기.
2. 6번 Mind에 “대화·독서·선택으로 페르소나를 형성하고 NPC에 활용”하는 연결 설명을 보완하기.
3. 8번은 현재의 역할극·규칙 기반 분석 범위를 드러내고 범용 AI 평가 도구로 읽히는 표현을 피하기.
4. 1번의 “최소한의 자원”, 3번의 “최적화”는 목표 가치로 사용하되 이미 입증한 정량 성과와 구분하기.
5. 각 솔루션에 입력 → 실제 기능 → 남는 결과를 짧게 설명하면, 지금의 기술 명칭보다 구현 차이가 분명해진다.

별도 프로젝트 add-prj-why는 사유 구조화 도구, add-prj-security는 보안 도구로 존재한다. 현재 홈페이지 8개 항목에 각각 독립 대응한다고 단정하지 않았다.
