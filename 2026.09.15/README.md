# 워플로지 홈페이지

정적 HTML / CSS / JavaScript 사이트. 빌드와 런타임 CDN 없이 동작합니다.

## 파일
- index.html: 도면 탐색, PR, 회사·문의.
- css/style.css: 레이아웃.
- js/diagrams.js: 개요, 플랫폼, 솔루션 6종의 도면 데이터.
- js/diagram-scene.js: Phaser 도면 렌더링과 조작.
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
