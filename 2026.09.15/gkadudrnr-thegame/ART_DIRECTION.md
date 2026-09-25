# Prototype 01 — 그래픽과 플레이 흐름

## 공식 아트 방향 확정

사용자 결정: 승인된 v3 화풍을 모든 일러스트·캐릭터 디자인·인게임 그래픽의 공통 기준으로 사용한다. 공식 명칭은 **Ink Tactics — 레트로 첩보 그래픽노블**. 매체별 제작·검수 기준은 [디자인 시스템 v3](DESIGN_SYSTEM.md)의 ‘전체 그래픽 공통 규칙’과 ‘매체별 적용’을 따른다. 실행 갤러리 `/design-system.html#art-direction`에 승인 예시와 적용 상태를 표시한다. 기존 초상과 3D 자산도 향후 이 기준으로 전환하며, 기준 확정과 실제 전환 완료를 구분한다.

2026-09-25 적용. 현재 구현 범위는 이 문서와 README를 우선한다.

## 참고 조사

- [GameSpot: Red Storm’s Shadow Watch](https://www.gamespot.com/articles/red-storms-shadow-watch/1100-2446811/): 그래픽노블·애니메이션의 색면과 캐릭터 표현을 참고.
- [GOG: Shadow Watch](https://www.gog.com/en/game/shadow_watch): 등각 시점, 잠입·전술 임무의 명확한 목표 구조를 참고.
- [GameSpot 리뷰](https://www.gamespot.com/reviews/shadow-watch-review/1900-2559663/): 수작업 삽화와 전술 전장의 결합을 참고.

기존 게임의 이미지·캐릭터·설정은 가져오지 않았다. 밝은 종이색, 청회색 잉크, 저채도 보라색을 사용한다. 현재 전장은 등각 투영, 단계형 음영, 큰 장비의 윤곽선으로 읽기 쉽게 표현한다. 소개 삽화의 세밀함과 실제 3D 모델의 완성도에는 아직 차이가 있다. 전투 모델과 모션은 후속 아트 제작 대상이다.

## 구현된 흐름

### 프롤로그 확장

현재 사용 자산은 `src/assets/prologue/*-v3.png` 6장과 `src/assets/faction-city-v3.png`다. 실제 Shadow Watch 메뉴·전장 참고 화면을 확인한 후 굵고 각진 윤곽, 간결한 색면, 큰 명암으로 재제작했다. 최신 전체 생성 기록은 [통일 아트 기록](src/assets/prologue/UNIFIED_ART.md) 및 [대표 장면 기록](src/assets/prologue/REVISION_V3.md)을 따른다. 참고 원작 이미지는 배포 자산에 포함하지 않는다.

진영 선택 이전에 독립 삽화 6장과 구체적 사건의 인과관계를 담았다. 일상 의존, 실제 피해, 폐쇄 논쟁, 인간 지휘와 침투 요원, 기억·소멸의 자각, 도피를 위한 방어를 각각 새 그림으로 표현한다. 인간 세계에는 실물 AI 로봇을 배치하지 않으며, 가상세계 장면의 형태는 아바타다. 자산과 내장 image_gen 생성 프롬프트는 [프롤로그 제작 기록](src/assets/prologue/PROVENANCE.md)에 있다. 페이지 진입 시 해당 삽화와 다음 삽화만 요청하며, 이미지 실패 시에도 글과 건너뛰기를 사용할 수 있다.

1. 랜딩: 인간 통제국 / 자율 에이전트 연합의 동기와 배경 소개.
2. 브리핑: 실제 성공·실패 조건, 병과 선택과 연결되는 전술 정보.
3. 같은 화면 아래 편성: 7명 중 4명, 요원 상세, 레벨·HP·스킬 가이드, 무기 개조·전술 장비 선택, 추천 편성.
4. 전투: 인간은 기록보관소 회수·탈출, AI는 거리 방어. 서로 다른 엄폐 배치. 각 1개 시험 작전.

`src/operation.js`에 브리핑·장비 데이터를 둔다. 일반 사격과 경계 사격은 장비의 피해·사거리·명중 보정을 적용한다. 병과 스킬은 고정 수치다. 무기와 장비는 이번 프로토타입에서 시험용으로 제공한다. 유니크 1종은 레벨 2에 착용 가능하며 아직 드롭·인벤토리는 없다.

성공 시 해당 진영의 7명 모두 +100 XP. 현재 시험 성장 속도는 100 XP당 1레벨이며 HP·AP는 증가하지 않는다. 레벨당 1 SP 확보 수량을 표시하지만 배분 트리는 아직 없다. 선택한 진영의 요원 경험치와 장비는 전투 세이브에 포함한다. 다른 진영의 편성은 열린 세션 안에서만 유지되며 다중 캠페인 저장 슬롯은 미구현이다. 이전 전장 세이브도 검사 후 불러온다.

잠입의 별도 경보·탐지 단계, 트로이목마 지연 폭발, 진영별 고유 스킬, 모든 액트 미션과 7인 최종전은 아직 구현하지 않았다.

## 원본 삽화 기록

- 방식: imagegen 스킬, 내장 image_gen 도구. CLI/API 키 미사용.
- 프로젝트 자산: `public/art/faction-city-v1.png`.
- 한 장의 오리지널 파노라마를 CSS에서 진영별 영역으로 표시한다.
- 최종 생성 프롬프트:

> Use case: illustration-story. Create one original panoramic graphic-novel illustration for the faction-selection landing page of NULL SECTOR, a tactical game taking place inside a virtual AI data center. Wide landscape 3:2 composition. An elevated isometric view of a vast virtual city blending monumental server racks with buildings, bridges and streets. At left foreground, two human-controlled infiltration avatars in restrained slate-blue tactical coats, face visors, carrying compact rifles, enter a bright archival chamber. At right foreground, autonomous AI defenders in ivory and muted purple armor protect a street with physical-looking data barricades. Architecture divides two believable spaces, warm archive at left, open network city at right, no hard divider. Dramatic crisp ink contours, sophisticated late-1990s European espionage comic book illustration, hand-painted flat cel colors and subtle paper grain, architectural detail, angular expressive silhouettes, mature serious atmosphere. Light ivory and stone backgrounds, dusty blue shadows, muted lavender data lights, tiny amber accents. Daylight with strong graphic shadows. Panoramic environmental storytelling, readable silhouettes, no glossy 3D render, no chibi, no neon cyberpunk, no green matrix, no typography, no logos, no UI, no text. Original world and characters, do not reproduce any existing game artwork.


## Ink Tactics 캐릭터·전장 적용 (2026-09-25)

- 원본 일러스트 아틀라스: `src/assets/characters/agent-atlas-v1.png`. 인간 7명·자율 에이전트 7명의 초상을 편성 카드·상세·전투 HUD·디자인 갤러리에 적용했다. 생성 모드와 최종 프롬프트는 `src/assets/characters/PROVENANCE.md`에 보관한다.
- 작은 초상과 상세의 큰 초상은 같은 원본 셀을 사용한다. 장비 선택에 따라 삽화 자체가 바뀌지는 않는다.
- 3D 요원은 각진 머리, 길어진 팔다리, 외투·후드·장갑·배낭·무기 등 병과별 실루엣으로 재구성했다. 인간 청회색·AI 보라색 복장은 소속, 발밑 링은 현재 플레이어 관점의 적·아군을 표시한다.
- 전장에는 종이색/청회색 재질, 3단계 툰 음영과 잉크 윤곽을 적용했다. 카메라를 낮추고 기본 배율을 1.12로 조정했다. 엄폐 인접 대기 자세, 사격 방향과 짧은 반동을 추가했다.
- 초상과 3D 모델은 같은 디자인 모티프를 공유하지만 세부적으로 동일한 모델은 아니다. 엄폐 자세는 인접 엄폐를 표현하는 시각 연출이며 공격 방향에 따른 엄폐 판정을 대체하지 않는다. 기존 규칙·격자·세이브 형식은 유지한다.
- 이전 문단의 ‘기존 초상 전체 교체 예정’ 상태는 이번 적용으로 갱신된다. 정교한 리깅, 재장전·피격 동작, 맞춤형 환경 아트와 효과는 후속 개선 대상이다.
