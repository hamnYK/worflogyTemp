# 한글·영문 검색 노출 준비

## 적용 범위와 최종 주소

모든 작업 파일은 2026.09.15 폴더 안에 둔다. 이 폴더의 내용을 최종 사이트 루트에 배포하는 구성을 기준으로 한다.

| 언어 | 파일 | 최종 주소 |
| --- | --- | --- |
| 한국어 | index.html | https://www.worflogy.com/ |
| English | en.html | https://www.worflogy.com/en.html |

아직 배포하거나 Search Console에 사이트맵을 제출한 상태는 아니다. 기존 루트 홈페이지와 기존 robots.txt는 수정하지 않았다. 현재 폴더를 임시 하위 경로로 서비스하더라도 canonical은 위 최종 주소를 가리킨다.

## 구현

- 두 파일 모두 주요 소개·플랫폼·솔루션 설명을 HTML 본문에 포함한다. 자바스크립트 없이도 내용을 읽을 수 있다.
- 자바스크립트가 실행되면 정적 소개 영역을 같은 내용의 인터랙티브 도면으로 바꾼다.
- 제목, description, html lang, self-canonical, ko/en/x-default hreflang을 언어별로 제공한다.
- 한글과 영문은 서로 다른 URL을 가지며 상대 언어로 가는 실제 링크를 제공한다.
- 정상 클릭에서는 새로고침 없이 언어와 URL을 함께 전환한다. Ctrl/Command 클릭 등 기본 링크 조작은 유지한다.
- 요청된 URL의 언어가 저장된 선호보다 우선한다. 새로고침은 현재 언어 URL을 다시 요청한다.
- Organization, WebSite, WebPage JSON-LD에는 확인된 회사명과 설립일, 페이지 언어·주소만 기재한다. 존재하지 않는 검색 기능, 평점, 수상 이력은 추가하지 않는다.
- OG와 Twitter 공유 정보 및 1200×630 공유 이미지를 제공한다.
- sitemap.xml은 위 두 대표 URL을 포함한다. hreflang은 양쪽 HTML head에서 관리한다.
- robots.txt는 사이트 루트에 배포될 때 적용되며 루트 사이트맵 주소를 제공한다.
- 디자인 시스템 문서 페이지는 noindex를 유지한다.

## 수정과 생성

주소와 검색 문구는 seo.config.json, 한글 본문은 index.html, 도면 소개는 js/diagrams.js, 영문 대응 문구는 js/translations.js에서 관리한다.

변경 후 실행:

```powershell
python scripts/build-seo.py
```

스크립트 위치를 기준으로 작업하므로 어느 디렉터리에서 실행하더라도 출력은 이 폴더 안이다. Python과 Node의 표준 라이브러리만 사용한다. 런타임에는 Python이나 Node 서버가 필요 없다.

생성 대상: index.html의 SEO·정적 소개 블록, en.html, sitemap.xml, robots.txt. en.html을 직접 편집하지 않는다. 한국어 원문을 보존하는 data-i18n-ko/data-i18n-attrs는 영문 페이지에서 한글로 되돌릴 때 사용한다.

## 배포 시 확인

1. 최종 도메인에서 /와 /en.html이 각각 200으로 응답하는지 확인한다.
2. 공유 이미지, CSS, JS 등 상대 경로가 모두 루트 배포 위치에서 동작하는지 확인한다.
3. /index.html의 중복 접근은 서버가 지원하면 /로 영구 리디렉션한다. 현재 canonical은 /다.
4. 기존 한국어·영문 페이지의 URL을 별도로 목록화한다. 실제 대응되는 새 페이지가 있는 경우에만 영구 리디렉션을 계획한다. 이번 작업은 기존 페이지나 서버 리디렉션 설정을 변경하지 않는다.
5. Search Console의 도메인 소유권 확인 후 https://www.worflogy.com/sitemap.xml을 제출하고 두 언어 URL을 검사한다.
6. 검색결과 제목·설명과 색인 여부는 배포 후 검색엔진에서 확인한다.

## 참고한 공식 문서

- [Google: 다국어 사이트 관리](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
- [Google: 언어별 버전과 hreflang](https://developers.google.com/search/docs/specialty/international/localized-versions)
- [Google: Organization 구조화 데이터](https://developers.google.com/search/docs/appearance/structured-data/organization)

## 첫 방문 언어 선택

대표 주소 / 는 저장된 사용자 선택을 우선하며, 선택 이력이 없으면 브라우저의 첫 번째 선호 언어가 한국어일 때 한국어, 나머지는 영어로 표시한다. 주소 리디렉션은 하지 않는다. /index.html 과 /en.html 은 고정 언어 페이지이며 각각 canonical·hreflang·사이트맵에 등록한다. x-default는 영어 페이지를 가리킨다. 자동 감지 결과는 저장하지 않고 직접 토글한 선택만 저장한다. JavaScript를 사용할 수 없는 경우 대표 주소는 원본 한국어 콘텐츠를 표시하며 영어 링크로 이동할 수 있다.
