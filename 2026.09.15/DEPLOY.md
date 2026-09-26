# 새 홈페이지 배포

## 실행 파일

이 폴더의 **deploy.cmd**를 더블클릭하면 새 홈페이지를 빌드하여 기존 저장소의 **gh-pages** 분기로 배포합니다. Git 인증이 가능한 환경과 Git, npm이 포함된 Node.js 22.12 이상, Python이 필요합니다. 게임 빌드 의존성 설치를 위해 인터넷 연결도 필요합니다. 분기 이름에는 앞쪽 하이픈이 없습니다.

- 대상: https://github.com/hamnYK/worflogyTemp.git
- 배포 분기: gh-pages
- 도메인: https://www.worflogy.com/
- 배포 루트에 이 폴더의 공개 파일을 배치합니다. URL에 2026.09.15 폴더가 붙지 않습니다.
- 기존 상위 build.ps1은 이전 홈페이지를 배포하므로 새 홈페이지 배포에는 사용하지 마세요.
- 워크숍 원본을 수정한 경우 먼저 `node lib/obfuscate_nia.js`로 배포본을 재생성하세요. 빌드 도구 의존성이 필요합니다.

## NULL SECTOR 포함

 deploy.cmd는 build.ps1을 호출하므로 실행 방법은 그대로입니다. 빌드 단계에서 다음을 자동 수행합니다.

1. null-sector.config.json의 source에 지정된 외부 개발 폴더를 새 tmp/ns-build-* 폴더로 복사합니다. NULL_SECTOR_SOURCE 환경 변수로 경로를 재지정할 수도 있습니다. 소스가 없으면 중단하며 이전 복사본으로 대체하지 않습니다.
2. 임시 폴더에서 package-lock.json 기준 npm ci --include=dev와 npm run build를 실행합니다. 외부 개발 폴더의 소스와 node_modules는 변경하지 않습니다.
3. 웹 실행용 ns/dist와 파일 실행용 ns/local만 새 배포 묶음에 포함합니다. 홈페이지 루트의 ns도 새 결과물로 교체하며 이전 결과물은 tmp/ns-previous-*로 보관합니다.
4. 두 실행 페이지와 게임 디자인 시스템 페이지가 모두 있는지 확인합니다. 설치·빌드·검사에 실패하면 푸시 단계로 진행하지 않습니다.

게임 node_modules, 소스, 테스트, Git 이력 백업은 배포하지 않습니다. 게임에서 연결하는 디자인 시스템 페이지는 게임 빌드의 일부로 포함합니다. main 분기에 소스를 푸시하는 것과 gh-pages에 완성된 사이트를 배포하는 것은 별도입니다.

개발 소스를 삭제·이동·이름 변경하면 다음 빌드에 반영됩니다. 이전 dist/local을 복사하거나 기존 ns에 덮어쓰지 않으므로 오래된 결과물은 남지 않습니다. ns는 생성물 전용으로 직접 수정하지 마세요. 비워도 다음 빌드에서 생성되지만, 빌드 전에는 로컬 홈페이지에서 게임을 실행할 수 없습니다. 저장 즉시 운영 사이트가 바뀌지는 않으며 deploy.cmd 실행 후 반영됩니다.

## 빌드만 확인

이 폴더에서 `powershell -NoProfile -ExecutionPolicy Bypass -File .\build.ps1`을 실행합니다. 결과는 새로운 tmp/release-* 폴더에 생성됩니다. 기본 실행에는 푸시가 없습니다.

## 배포 내용과 실패 처리

scripts/build-release.mjs의 공개 파일 목록을 사용합니다. 원본 워크숍, 보고서, 홈페이지 디자인 시스템 예시, 테스트, 빌드 스크립트, 숨김 작업 파일은 포함하지 않습니다. CNAME과 .nojekyll은 포함합니다. 코드 손상을 피하기 위해 정규식으로 JavaScript/CSS를 재압축하지 않습니다.

배포 분기의 최신 커밋을 가져와 부모로 유지한 뒤 새 공개 파일 트리를 커밋합니다. 이전 홈페이지 전용 파일은 배포 분기에서 제거되며 로컬 원본은 유지합니다. 강제 푸시를 사용하지 않으므로 동시 배포로 원격이 바뀌면 실패합니다. 오류를 해결한 뒤 다시 실행하세요. Git 인증·빌드·fetch·push 실패 시 성공 메시지를 표시하지 않습니다.

tmp/release-*와 tmp/deploy-*는 확인용으로 남습니다. 실제 사이트 반영 완료 여부는 GitHub Pages 배포 상태와 운영 URL에서 확인해야 합니다. Pages의 게시 원본은 gh-pages 분기의 /(root)를 사용해야 합니다.

검증용 로컬 Git 저장소를 지정할 때만 build.ps1의 -Remote 인수를 사용할 수 있습니다.

---
# 배포 실행

Set-Location -LiteralPath 'C:\Users\alchera\OneDrive\[주식회사 워플로지]\02. 법인 홈페이지 (도메인 사용권)\2026.04.24_워플로지 홈페이지 개편\2026\2026.09.15'

.\deploy.cmd
