# NULL SECTOR : PRE-DEMO — 홈페이지 연결

홈페이지와 게임은 서로 다른 디자인 시스템을 사용한다. AFTER HOURS 카드, 4자리 코드 입력, 상단 복귀 바는 홈페이지의 공통 컴포넌트를 사용한다. iframe 내부 게임은 gkadudrnr-thegame/design-system.html 및 DESIGN_SYSTEM.md 기준이다.

## 실행과 배포

- 웹 HTTP(S): gkadudrnr-thegame/dist/index.html
- 파일 직접 실행: gkadudrnr-thegame/local/index.html
- 게임의 npm run build는 dist와 local을 함께 생성한다. 이전 dist/file 경로는 사용하지 않는다.
- scripts/build-release.mjs는 게임을 재빌드하고 두 결과 디렉터리를 배포 묶음에 포함한다. local/design-system.html도 포함한다.
- 게임 원본을 교체한 뒤에는 scripts/build-release.mjs로 다시 빌드하고 새 배포 묶음을 검증한다. 이전 tmp/release-*는 해당 생성 시점의 스냅샷이다.

## 홈페이지와 게임 사이의 연결 규칙

- js/null-sector-access.js가 실행 방식에 맞는 iframe 경로를 선택한다.
- 게임은 WebGL 초기화 후 부모에게 postMessage로 null-sector-ready 또는 null-sector-error를 알린다. 부모는 메시지를 보낸 창이 실제 게임 iframe인지 확인한다. file://에서는 contentDocument 접근에 의존하지 않는다.
- js/coin-arcade.js는 NULL SECTOR의 PLAY에서만 현재 4자리 코드를 검사한다. 시작한 iframe에는 시간 만료 처리를 걸지 않는다.
- AFTER HOURS 복귀 시 iframe과 메시지 수신기를 정리한다. 다시 입장할 때는 현재 코드가 필요하다.
- 코드는 정적 사이트의 발견용 입장 키이며 서버 인증 비밀이 아니다.

## 회귀 확인

- 게임 npm test
- output/null-sector-portraits-qa.cjs --file 및 동일 스크립트의 HTTP 실행: 두 진영 14개 초상화, 실제 전투 진입, 코드 갱신 후 세션 유지, 복귀·재입장
- output/null-sector-design-system-qa.cjs --verify: 진영 카드의 게임/갤러리 공통 호버와 키보드 포커스
- output/null-sector-entry-qa.cjs: 홈페이지 입장 폼, 모바일, 오류 안내
- 위 통합 브라우저 검증은 NULL_SECTOR_QA_ROOT 환경 변수에 배포 디렉터리를 지정할 수 있다.

## 2026-09-26 검토에서 수정한 부분

- 파일 실행 경로를 새 local 구조로 갱신하고 배포 포함 범위를 확장했다.
- 게임 원본 교체로 사라진 초기화 완료 메시지를 복구했다.
- 진영 카드의 게임 전용 덮어쓰기를 제거하고 게임 디자인 시스템의 4px 상승, 프레임·그림자, 3px 외곽선/5px 간격 및 모션 감소 규칙을 공유한다.
- 새 초상화 구현의 단일 style 삽입 방식은 유지한다. 긴 이미지 데이터를 각 요원의 CSS 변수에 넣지 않는지 회귀 확인한다.
