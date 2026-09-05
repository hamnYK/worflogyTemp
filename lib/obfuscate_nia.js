/**
 * NIA Worflogy Tool — Obfuscation Build Script
 * nia-worflogy-tool.html  →  nia-ontology-workshop-with-worflogy.html
 *
 * 처리 순서:
 * 1. 소스 파일 읽기 (UTF-8)
 * 2. 저작권 주석 제거
 * 3. HTML 주석 제거 (<!-- ... -->)
 * 4. 빈 줄 정리
 * 5. 인라인 <script> 블록 추출 (외부 src 스크립트 제외)
 * 6. JS 합치기 → javascript-obfuscator 난독화
 * 7. 원본 <script> 블록들을 단일 난독화 <script>로 교체
 * 8. 배포 파일 저장
 * 9. 실행 방법: 
 *    - cmd에서 `node lib\obfuscate_nia.js` 실행
 */

const fs = require('fs');
const path = require('path');
const JavaScriptObfuscator = require('C:\\Users\\alchera\\AppData\\Roaming\\npm\\node_modules\\javascript-obfuscator');

const ROOT = path.resolve(path.dirname(__filename), '..');
const SRC  = path.join(ROOT, 'nia-worflogy-tool.html');
const DEST = path.join(ROOT, 'nia-ontology-workshop-with-worflogy.html');

console.log('=== NIA Worflogy Obfuscation Build ===');
console.log('Source :', SRC);
console.log('Dest   :', DEST);

// 1. 소스 읽기
let html = fs.readFileSync(SRC, 'utf8');
console.log(`[1] 소스 읽기 완료 (${html.length} chars)`);

// 2. 저작권 주석 제거 (파일 최상단 <!-- ... -->)
html = html.replace(/^<!--[\s\S]*?-->\r?\n?/, '');
console.log(`[2] 저작권 주석 제거 (${html.length} chars)`);

// 3. HTML 주석 제거 (인라인 JS 주석은 아직 건드리지 않음)
//    <script> 블록 바깥의 <!-- --> 만 제거
html = removeHtmlComments(html);
console.log(`[3] HTML 주석 제거 (${html.length} chars)`);

// 4. 빈 줄 정리
html = html.replace(/\r\n/g, '\n');
html = html.replace(/\n{3,}/g, '\n\n');
console.log(`[4] 빈 줄 정리 (${html.length} chars)`);

// 5. 인라인 <script> 블록 추출 (src 없는 것만)
const scriptRegex = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
let combinedJs = '';
const scriptMatches = [];
let match;
while ((match = scriptRegex.exec(html)) !== null) {
    scriptMatches.push({ full: match[0], content: match[1], index: match.index });
    combinedJs += match[1].trim() + '\n';
}
console.log(`[5] 인라인 <script> ${scriptMatches.length}개 발견, JS 합계 ${combinedJs.length} chars`);

if (scriptMatches.length === 0) {
    console.error('ERROR: 인라인 <script> 블록을 찾지 못했습니다.');
    process.exit(1);
}

// 6. JS 난독화
console.log('[6] JS 난독화 중...');
const obfuscated = JavaScriptObfuscator.obfuscate(combinedJs, {
    compact: true,
    controlFlowFlattening: false,
    deadCodeInjection: false,
    debugProtection: false,
    disableConsoleOutput: false,
    identifierNamesGenerator: 'hexadecimal',
    log: false,
    numbersToExpressions: false,
    renameGlobals: false,
    selfDefending: false,
    simplify: true,
    splitStrings: false,
    stringArray: true,
    stringArrayCallsTransform: false,
    stringArrayEncoding: ['base64'],
    stringArrayIndexShift: true,
    stringArrayRotate: true,
    stringArrayShuffle: true,
    stringArrayWrappersCount: 1,
    stringArrayWrappersChainedCalls: true,
    stringArrayWrappersParametersMaxCount: 2,
    stringArrayWrappersType: 'variable',
    stringArrayThreshold: 0.75,
    unicodeEscapeSequence: false
}).getObfuscatedCode();
console.log(`[6] 난독화 완료 (${obfuscated.length} chars)`);

// 7. 원본 <script> 블록 모두 제거하고, 마지막 위치에 단일 난독화 <script> 삽입
//    역순으로 교체 (인덱스 보존)
let result = html;
for (let i = scriptMatches.length - 1; i >= 0; i--) {
    const m = scriptMatches[i];
    if (i === scriptMatches.length - 1) {
        // 마지막 <script> 자리에 난독화 코드 삽입
        result = result.slice(0, m.index) + `<script>${obfuscated}\n</script>` + result.slice(m.index + m.full.length);
    } else {
        // 나머지 <script> 블록 제거
        result = result.slice(0, m.index) + result.slice(m.index + m.full.length);
    }
}
console.log(`[7] HTML 재조립 완료 (${result.length} chars)`);

// 8. 저장
fs.writeFileSync(DEST, result, 'utf8');
const stat = fs.statSync(DEST);
console.log(`[8] 저장 완료: ${DEST}`);
console.log(`    파일 크기: ${stat.size.toLocaleString()} bytes`);
console.log('=== Build 완료 ===');

// ──────────────────────────────────────────────────────────────────────────────
// Helper: <script> 블록 바깥의 HTML 주석만 제거
// ──────────────────────────────────────────────────────────────────────────────
function removeHtmlComments(src) {
    let result = '';
    let i = 0;
    while (i < src.length) {
        // <script 태그 시작이면 닫힐 때까지 그대로 통과
        if (src.startsWith('<script', i) && (src[i + 7] === '>' || src[i + 7] === ' ' || src[i + 7] === '\n' || src[i + 7] === '\r')) {
            const endScript = findEndScript(src, i);
            result += src.slice(i, endScript);
            i = endScript;
        // <!-- 주석 시작이면 --> 까지 건너뜀
        } else if (src.startsWith('<!--', i)) {
            const endComment = src.indexOf('-->', i + 4);
            if (endComment === -1) {
                result += src.slice(i);
                break;
            }
            i = endComment + 3;
        } else {
            result += src[i];
            i++;
        }
    }
    return result;
}

function findEndScript(src, start) {
    const end = src.indexOf('</script>', start);
    return end === -1 ? src.length : end + '</script>'.length;
}
