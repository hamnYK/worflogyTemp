# 워플로지 홈페이지

정적 HTML / CSS / JavaScript 사이트. 언어별 HTML과 SEO 파일을 생성하는 빌드 스크립트를 제공하며, 배포 후에는 런타임 서버나 CDN 없이 동작합니다.

## 파일
- index.html: 도면 탐색, PR, 회사·문의.
- css/style.css: 레이아웃.
- js/diagrams.js: 개요, 플랫폼, 솔루션 6종의 도면 데이터.
- js/diagram-scene.js: Phaser 도면 렌더링과 조작.
- js/object-art.js: 모든 캔버스의 공통 벡터 오브젝트, 역할별 그래픽과 성장 상태 표현.
- js/overview-story.js: 두 가지 온톨로지 구성 방식, 네트워크 강화 및 반복 성장 시연.
- js/main.js: 도면 선택과 HTML 인터페이스.
- lib/phaser.min.js: Phaser 3.90.0.
- lib/PHASER-LICENSE.txt: MIT 라이선스.
- SITE-PLAN.md: 기획안 대응과 도면 해석.
- assets/images, assets/audio: 후속 자료 공간.

## 조작
도면 선택 / 노드 드래그 / 빈 화면 드래그 / 휠 또는 버튼 확대·축소 /
노드 선택 후 관계 강조 / 전체 보기 / 배치 초기화.
키보드 사용자는 '도면 구성 목록'의 버튼으로 같은 관계를 확인할 수 있습니다.
배치는 페이지 세션 동안 유지됩니다. 실제 AI 서비스 연결은 아직 없습니다.

## 미리보기
이 폴더에서 정적 서버 실행: python -m http.server 8000
브라우저에서 http://localhost:8000 접속.

## GitHub Pages
독립 저장소라면 이 폴더 내용 전체를 루트에 올린 뒤
Settings → Pages → Deploy from a branch → 브랜치 / (root) 선택.
기존 저장소가 루트를 게시하면 /2026.09.15/ 경로로 접근.
dist만 배포한다면 별도 배포 포함 설정이 필요합니다.
현재 작업은 배포 설정을 변경하거나 게시하지 않습니다.

기획안 PDF는 보존합니다. 이메일과 PR 자료는 후속 반영합니다.
Phaser 출처: https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js

## 플레이형 시연
시작 버튼으로 플레이어와 AI 에이전트의 대화, 기술 인프라·로직 작동, 지식 그래프 생성 장면을 재생합니다.
다음 단계로 장면을 진행하거나 다시 시작할 수 있습니다. 마지막에 세 가지 기술 활용 문구와 현재 도면의 분류를 표시합니다.
이는 설명용 시연이며 실제 AI 응답이나 추론 결과가 아닙니다.

## Korean / English display

- The language button above the workshop link switches the homepage in place.
- The entry URL `/` uses a saved explicit preference, otherwise the primary browser language (Korean for ko, English for all others). Automatic detection does not save a preference.
- Explicit `/index.html` (Korean) and `/en.html` (English) links stay in their requested language. History/reloads retain the current entry language. Canvas state and form values are retained during live switching.
- `js/translations.js` contains authored English copy keyed by the original Korean text. Add or update its entries when changing visible Korean content.
- `js/language.js` translates page text, accessibility labels and dynamically updated captions, and restores the original Korean text when switched back.
- No external translation service is called. The linked workshop application and text embedded in images are separate from this homepage language switch.

## 디자인 시스템

- [컴포넌트 예시](./design-system.html)
- [사용 기준과 적용 범위](./DESIGN-SYSTEM.md)
- 공통 스타일: css/tokens.css → css/components.css → css/style.css
- 모든 파일과 적용 범위는 2026.09.15 폴더 내부입니다.

## 한영 SEO와 타이포그래피

- [검색 노출 구성과 배포 확인](./SEO.md)
- 주소·메타데이터 설정: seo.config.json
- 한글 수정 후 영문·SEO 재생성: python scripts/build-seo.py
- 언어별 읽기 스타일: css/typography.css
- 최종 주소: https://www.worflogy.com/ 및 https://www.worflogy.com/en.html

## 보완 및 배포 후보 생성

보완 내역과 서버에서 남은 작업은 [보안·안정성 검토](./SECURITY-STABILITY-REVIEW.md)를 참고하세요.

2026.09.15 폴더에서 실행합니다.

1. `python scripts/build-seo.py` — 한영 페이지와 SEO 파일 재생성
2. `node lib/obfuscate_nia.js` — 워크숍 원본 변경 시 배포본 재생성 (빌드 도구 의존성 필요)
3. `node scripts/build-release.mjs` — 공개 파일을 새로운 tmp/release-* 폴더로 복사

배포 후보 폴더의 내용만 공개 루트에 배포합니다. 상위 작업 폴더 전체를 공개하지 마세요. 이 도구는 실제 배포나 기존 파일 삭제를 수행하지 않습니다. lib/workshop-safety.js도 워크숍 실행에 필요하며 배포 후보에 포함됩니다.

## 새 홈페이지 배포 실행

이 폴더의 **deploy.cmd**를 실행합니다. 새 홈페이지 공개 파일만 gh-pages에 반영합니다. 상위 폴더의 기존 build.ps1과 별개입니다. 실행 방법·필수 도구·실패 처리는 [배포 안내](./DEPLOY.md)를 참고하세요.

## Arcade build and local-file preview

The arcade lazy-loads js/chip-football.bundle.js as a classic script so index.html and en.html can also be opened directly with file://. The editable sources remain js/chip-football.mjs and js/chip-football-rules.mjs. After changing those sources, rebuild the checked-in bundle:

    npm install --prefix tmp/chip-bundler --no-save esbuild@0.25.10
    node scripts/build-chip-football.cjs

The release includes the generated bundle, lib/THREE-LICENSE.txt and assets/images/hidden-bg.mp4. Browsers do not need a build tool or an external CDN at runtime.
Basketball tosses use vendored cannon-es 0.20.0 (lib/cannon-es.mjs, MIT license in lib/CANNON-LICENSE.txt). The cylinder orientation is shared by collision physics and rendering; no random bounce direction is injected. Rebuild with the existing arcade build command.

Triangle Territory (세모 땅따먹기) uses 21 dots and a computer opponent. Connect two dots without crossing an edge or passing through another dot. Completing an empty triangle claims it and grants another move; one edge can claim two triangles. The largest total claimed area wins when no legal edges remain. Scores show each player's share of the combined claimed area (0.0% each before any capture); triangle counts are secondary. Winner calculation uses unrounded area, independent of camera zoom. The computer prefers larger captures and avoids giving away large triangles. The first player is random and alternates on New board. Click/tap dots, or use arrow keys and Enter/Space; Escape clears selection. Results remain visible for 3 seconds: victory returns to Games; defeat or a draw starts a new board. Exiting or manually starting a new board cancels the pending result action.

Editable sources: `js/triangle-territory.mjs` and `js/triangle-territory-rules.mjs`. Rebuild with `node scripts/build-chip-football.cjs`. Validate rules with `node output/triangle-rules-qa.mjs` and browser interaction with `node output/triangle-ui-qa.cjs` (uses the local Playwright/Chrome installation).

The triangle board uses `js/triangle-table.mjs` for a Three.js tabletop with the shared arcade lighting and physical materials, paper grain, pencil hatching, and stationery. Native dot buttons are projected onto the paper for accurate pointer, touch, and keyboard input. It renders on changes, respects reduced motion, disposes GPU resources on exit, and retains the flat board if WebGL creation is unavailable.

Playable boards enforce an 18-unit clearance from unrelated dots, preventing a near miss from appearing connected. Hover or keyboard-focus a destination to preview the number of triangles it will complete. The move history records each actor, endpoint pair, and captured triangle. Run `node output/triangle-ownership-qa.mjs` for closing-edge ownership and near-dot regression checks.

Triangle camera controls: wheel or +/− to zoom, left-drag empty space to pan, right-drag to orbit, and 0 or Reset view to restore the camera. On-screen zoom/rotation/reset buttons also support touch. Camera changes reproject dot targets and preserve the current move. Run `node output/triangle-camera-qa.cjs` for camera/input regression checks.

PEBBLE TERRITORY recreates the playground stone-flicking territory game against a computer. Each turn starts anywhere on the player's land and permits up to three flicks. Passing over rival territory is legal; stopping there or outside the playground fails immediately. Returning home closes the travelled path through existing home territory, claims enclosed neutral/rival land, and passes the turn. Failed excursions claim nothing. Capturing every part of the opponent's territory wins. Results remain visible for 3 seconds: victory returns to the lobby, defeat or a draw starts another game with the opening player alternated. Each player receives 10 turns, with up to 3 flicks per turn; failures and voluntary passes also consume a turn. Eliminating the rival wins immediately. Otherwise, after both players have completed all 10 turns, the larger unrounded owned area wins; equal areas draw.

Click/tap home territory before the first flick to reposition, then pull the stone backwards and release. Left/right arrows or the aim slider set direction; up/down, PageUp/PageDown or the power slider set strength; Space or Flick launches. Dragging updates both controls and a short aiming guide; it does not promise a landing point on rough sand. Escape cancels a drag; Pass turn abandons an excursion. Left-drag empty space (or Shift-drag) pans; right-drag rotates; wheel, +/− and camera buttons zoom; 0 resets the view. Territory percentages use the whole playground, including unclaimed ground. Ownership uses a 200 × 128 grid of 5-unit cells shared by capture, landing and boundary rendering; camera changes do not affect rules. A shared fixed-step rolling simulation now sets the actual landing and curved capture boundary. Nominal full-power travel is 360 units (previously 720), modified by sand, irregular rotation, old grooves and impacts. Both players use the same physics.

Editable sources: `js/pebble-territory-rules.mjs`, `js/pebble-territory.mjs`, and `js/pebble-table.mjs`. The Three.js playground uses shared physical materials, granular sand with a dynamic groove bump map, mineral-textured rounded irregular stones, contact shadows, stone borders and a bench. Each new game scatters 3?5 larger, non-overlapping stones away from initial homes. Impact impulses depend on speed, mass and uneven contact faces; stronger nearby hits move blockers, while weak or distant hits lose energy to sand. Pebble and blocker tracks persist across turns and failures and alter later rolling; all terrain resets on a new game. The fixed-step planar simulation and AI aiming are in `js/pebble-physics.mjs`. Rebuild with `node scripts/build-chip-football.cjs`. Validate with `node output/pebble-rules-qa.mjs`, `node output/pebble-ui-qa.cjs`, and `node output/pebble-end-qa.cjs`.

Additional physics checks: `node output/pebble-physics-qa.mjs` and `node output/pebble-impact-ui-qa.cjs` cover seeded layouts, shorter travel, grooves, impact energy, blocker displacement, curved capture paths and rendered collision integration.

Dots and Boxes is available in AFTER HOURS alongside Triangle Territory. Connect adjacent horizontal or vertical dots on a 6-by-6 lattice. Closing the fourth edge claims a box for one point and keeps the turn; a shared edge can claim two boxes. The most of the 25 boxes wins; the odd total prevents a draw. The opening player alternates on New board. Victory returns to Games after 3 seconds; a loss starts a new board. Keyboard, touch and tabletop camera controls match Triangle Territory. Sources: js/dots-and-boxes-rules.mjs and js/dots-and-boxes.mjs; rebuild with node scripts/build-chip-football.cjs.
Validate Dots and Boxes with node output/dots-boxes-rules-qa.mjs and node output/dots-boxes-ui-qa.cjs. The shared tabletop supports both triangular and quadrilateral claims.

Territory board art: Dots and Boxes uses a Western writing desk with parchment, burgundy leather, brass drafting tools and a quill; Triangle Territory uses a hanji-inspired Eastern writing desk with bamboo brushes, inkstone and scroll rollers. Procedural decoration is in js/territory-desk.mjs; camera, rules and input are shared unchanged.
