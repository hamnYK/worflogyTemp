# 새 홈페이지 배포

## 실행 파일

이 폴더의 **deploy.cmd**를 더블클릭하면 새 홈페이지를 빌드하여 기존 저장소의 **gh-pages** 분기로 배포합니다. Git 인증이 가능한 환경과 Git, Node.js, Python이 필요합니다. 분기 이름에는 앞쪽 하이픈이 없습니다.

- 대상: https://github.com/hamnYK/worflogyTemp.git
- 배포 분기: gh-pages
- 도메인: https://www.worflogy.com/
- 배포 루트에 이 폴더의 공개 파일을 배치합니다. URL에 2026.09.15 폴더가 붙지 않습니다.
- 기존 상위 build.ps1은 이전 홈페이지를 배포하므로 새 홈페이지 배포에는 사용하지 마세요.
- 워크숍 원본을 수정한 경우 먼저 `node lib/obfuscate_nia.js`로 배포본을 재생성하세요. 빌드 도구 의존성이 필요합니다.

## 빌드만 확인

이 폴더에서 `powershell -NoProfile -ExecutionPolicy Bypass -File .\build.ps1`을 실행합니다. 결과는 새로운 tmp/release-* 폴더에 생성됩니다. 기본 실행에는 푸시가 없습니다.

## 배포 내용과 실패 처리

scripts/build-release.mjs의 공개 파일 목록을 사용합니다. 원본 워크숍, 보고서, 디자인 시스템 예시, 테스트, 빌드 스크립트, 숨김 작업 파일은 포함하지 않습니다. CNAME과 .nojekyll은 포함합니다. 코드 손상을 피하기 위해 정규식으로 JavaScript/CSS를 재압축하지 않습니다.

배포 분기의 최신 커밋을 가져와 부모로 유지한 뒤 새 공개 파일 트리를 커밋합니다. 이전 홈페이지 전용 파일은 배포 분기에서 제거되며 로컬 원본은 유지합니다. 강제 푸시를 사용하지 않으므로 동시 배포로 원격이 바뀌면 실패합니다. 오류를 해결한 뒤 다시 실행하세요. Git 인증·빌드·fetch·push 실패 시 성공 메시지를 표시하지 않습니다.

tmp/release-*와 tmp/deploy-*는 확인용으로 남습니다. 실제 사이트 반영 완료 여부는 GitHub Pages 배포 상태와 운영 URL에서 확인해야 합니다. Pages의 게시 원본은 gh-pages 분기의 /(root)를 사용해야 합니다.

검증용 로컬 Git 저장소를 지정할 때만 build.ps1의 -Remote 인수를 사용할 수 있습니다.
