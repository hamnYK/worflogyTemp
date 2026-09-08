// ══════════════════════════════════════════════════════════════
//  Worflogy GAS - 통합 스크립트 (모델 B 라이선스)
//  게시판 / IR문의 / 교육문의 + NIA Worflogy 라이선스 관리
// ══════════════════════════════════════════════════════════════

const SHEET_ID    = '1pfjM-ba3JpRKDT4EYqfNmRQ1QQlyK6fBLnbCYKDJB3s';
const SHEET_NAME  = 'NIA Worflogy Ontology Workshop';
const ADMIN_EMAIL = 'worflogy@gmail.com';

// 컬럼 인덱스 (0-based)
const COL = {
  KEY: 0, ORG: 1, NAME: 2, EMAIL: 3,
  ISSUED: 4, EXPIRY: 5, USAGE: 6, STATUS: 7
};

// ─── 커스텀 메뉴 (스프레드시트 열릴 때 자동 생성) ─────────────
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('NIA 라이선스 관리')
    .addItem('승인 및 키 발송', 'approveAndSendKeys')
    .addToUi();
}

// ─── GET: 분기 처리 ───────────────────────────────────────────
function doGet(e) {
  const action = e.parameter.action || '';

  // ── 게시판 글 목록 조회 (기존) ──
  if (action === 'getBoardPosts') {
    try {
      var ss    = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName('게시판');
      if (!sheet) return json({ success: false, error: '게시판 시트를 찾을 수 없습니다.' });
      var data    = sheet.getDataRange().getValues();
      var headers = data[0];
      var posts   = [];
      for (var i = 1; i < data.length; i++) {
        var row = data[i], post = {};
        headers.forEach(function(h, idx) { post[h] = row[idx]; });
        if (post['status'] !== 'hidden' && post['title']) posts.push(post);
      }
      posts.reverse();
      return json({ success: true, posts: posts });
    } catch (error) { return json({ success: false, error: error.toString() }); }
  }

  // ── 라이선스 신청 (신규) ──
  if (action === 'request') {
    const org   = (e.parameter.org   || '').trim();
    const name  = (e.parameter.name  || '').trim();
    const email = (e.parameter.email || '').trim();
    try { return json(requestLicense(org, name, email)); }
    catch (err) { return json({ ok: false, msg: '서버 오류: ' + err.message }); }
  }

  // ── 라이선스 키 검증 ──
  if (action === 'validate') {
    const key = (e.parameter.key || '').trim();
    try { return json(validateKey(key)); }
    catch (err) { return json({ ok: false, msg: '서버 오류: ' + err.message }); }
  }

  return json({ success: false, error: 'Unknown action' });
}

// ─── 공통 JSON 응답 헬퍼 ─────────────────────────────────────
function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── 라이선스 키 생성 ─────────────────────────────────────────
function generateKey() {
  const year  = new Date().getFullYear();
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `WOR-${year}-${code}`;
}

// ─── 라이선스 신청 처리 ───────────────────────────────────────
function requestLicense(org, name, email) {
  if (!org)   return { ok: false, code: 'NO_ORG',   msg: '기관명을 입력하세요.' };
  if (!name)  return { ok: false, code: 'NO_NAME',  msg: '담당자명을 입력하세요.' };
  if (!email) return { ok: false, code: 'NO_EMAIL', msg: '이메일을 입력하세요.' };

  const ss    = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return { ok: false, code: 'NO_SHEET', msg: '시트 오류.' };

  // 중복 신청 체크 (동일 이메일 + 신청/유효 상태)
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    const rowEmail  = String(data[i][COL.EMAIL]).trim();
    const rowStatus = String(data[i][COL.STATUS]).trim();
    if (rowEmail !== email) continue;

    // '신청' 대기 중 → 무조건 차단
    if (rowStatus === '신청') {
      return { ok: false, code: 'DUPLICATE', msg: '이미 신청된 이메일입니다. 승인 후 이메일로 발송된 키를 확인하세요.' };
    }

    // '유효' 상태 → 만료일 확인 후 판단
    if (rowStatus === '유효') {
      const expiry = data[i][COL.EXPIRY];
      if (expiry && new Date() <= new Date(expiry)) {
        // 아직 유효한 키가 존재 → 차단
        return { ok: false, code: 'DUPLICATE', msg: '이미 유효한 라이선스가 있습니다. 이메일로 발송된 키를 확인하세요.' };
      } else {
        // 만료됐으나 상태가 갱신 안 됨 → 시트 상태를 '만료'로 업데이트하고 재신청 허용
        sheet.getRange(i + 1, COL.STATUS + 1).setValue('만료');
      }
    }
  }

  const now_str = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');

  // 시트에 신청 기록
  sheet.appendRow([
    '',       // A: 라이선스키 (승인 시 생성)
    org,      // B: 기관명
    name,     // C: 담당자명
    email,    // D: 이메일
    now_str,  // E: 신청일
    '',       // F: 만료일 (승인 시 설정)
    0,        // G: 사용횟수
    '신청'    // H: 상태
  ]);

  // 관리자 알림 이메일
  try {
    GmailApp.sendEmail(
      ADMIN_EMAIL,
      `[NIA Worflogy] 라이선스 신청 - ${org}`,
      `새로운 라이선스 신청이 접수되었습니다.\n\n` +
      `• 기관명: ${org}\n• 담당자: ${name}\n• 이메일: ${email}\n• 신청일: ${now_str}\n\n` +
      `스프레드시트에서 [NIA 라이선스 관리 > 승인 및 키 발송] 메뉴로 승인하세요.\n` +
      `https://docs.google.com/spreadsheets/d/${SHEET_ID}`
    );
  } catch(mailErr) { console.error('Admin mail failed:', mailErr); }

  return { ok: true, code: 'REQUESTED', msg: '신청이 완료됐습니다. 검토 후 이메일로 라이선스 키가 발송됩니다.' };
}

// ─── 승인 및 키 발송 (커스텀 메뉴에서 실행) ──────────────────
function approveAndSendKeys() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) { SpreadsheetApp.getUi().alert('라이선스 시트를 찾을 수 없습니다.'); return; }

  const data = sheet.getDataRange().getValues();
  let approved = 0;

  for (let i = 1; i < data.length; i++) {
    const status = String(data[i][COL.STATUS]).trim();
    if (status !== '신청') continue;

    const org   = data[i][COL.ORG];
    const name  = data[i][COL.NAME];
    const email = data[i][COL.EMAIL];

    // 키 생성 + 만료일 (+5일)
    const key    = generateKey();
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + 5);
    const expiryStr = Utilities.formatDate(expiry, 'Asia/Seoul', 'yyyy-MM-dd');

    // 시트 업데이트
    const row = i + 1;
    sheet.getRange(row, COL.KEY    + 1).setValue(key);
    sheet.getRange(row, COL.EXPIRY + 1).setValue(expiryStr);
    sheet.getRange(row, COL.STATUS + 1).setValue('유효');

    // 사용자 이메일 발송
    try {
      GmailApp.sendEmail(
        email,
        '[NIA Worflogy] 라이선스 키가 발급되었습니다',
        `안녕하세요, ${name}님.\n\n` +
        `NIA Worflogy 온톨로지 워크숍 도구 라이선스가 승인되었습니다.\n\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `  라이선스 키: ${key}\n` +
        `  기관명: ${org}\n` +
        `  만료일: ${expiryStr}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
        `도구를 열면 나타나는 라이선스 화면에서\n` +
        `"키 입력" 탭을 클릭하고 위 키를 입력 후 [인증하기]를 클릭하세요.\n\n` +
        `감사합니다.\n워플로지 팀 드림`
      );
      approved++;
    } catch(mailErr) { console.error('User mail failed:', mailErr); }
  }

  SpreadsheetApp.getUi().alert(`${approved}건 승인 완료. 이메일이 발송됐습니다.`);
}

// ─── 라이선스 키 검증 ─────────────────────────────────────────
function validateKey(key) {
  if (!key) return { ok: false, code: 'NO_KEY', msg: '라이선스 키를 입력하세요.' };

  const ss    = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return { ok: false, code: 'NO_SHEET', msg: '라이선스 시트를 찾을 수 없습니다.' };

  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    const rowKey = String(data[i][COL.KEY]).trim();
    if (rowKey !== key) continue;

    const org        = data[i][COL.ORG];
    const expiry     = data[i][COL.EXPIRY];
    const usageCount = data[i][COL.USAGE];
    const status     = String(data[i][COL.STATUS]).trim();

    if (status === '차단') return { ok: false, code: 'BLOCKED', msg: '차단된 라이선스입니다. 관리자에게 문의하세요.' };
    if (status === '신청') return { ok: false, code: 'PENDING', msg: '아직 승인 대기 중입니다. 이메일을 확인하세요.' };

    const now = new Date(), expiryDate = new Date(expiry);
    if (now > expiryDate) {
      sheet.getRange(i + 1, COL.STATUS + 1).setValue('만료');
      return { ok: false, code: 'EXPIRED', msg: `라이선스가 만료되었습니다. (만료일: ${Utilities.formatDate(expiryDate, 'Asia/Seoul', 'yyyy-MM-dd')})` };
    }

    const newCount = (Number(usageCount) || 0) + 1;
    sheet.getRange(i + 1, COL.USAGE  + 1).setValue(newCount);
    sheet.getRange(i + 1, COL.STATUS + 1).setValue('유효');

    try {
      const now_str = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
      GmailApp.sendEmail(
        ADMIN_EMAIL,
        `[NIA Worflogy] 라이선스 인증 알림 - ${org}`,
        `NIA Worflogy 라이선스 인증이 발생했습니다.\n\n• 키: ${key}\n• 기관: ${org}\n• 시각: ${now_str}\n• 만료: ${Utilities.formatDate(expiryDate, 'Asia/Seoul', 'yyyy-MM-dd')}\n• 누적: ${newCount}회`
      );
    } catch(mailErr) { console.error('Mail failed:', mailErr); }

    return { ok: true, code: 'VALID', org, usage: newCount, expiry: Utilities.formatDate(expiryDate, 'Asia/Seoul', 'yyyy-MM-dd'), msg: `인증 완료 (${org})` };
  }

  return { ok: false, code: 'NOT_FOUND', msg: '등록되지 않은 라이선스 키입니다.' };
}

// ─── 시트 초기 설정 (최초 1회) ──────────────────────────────
function setupSheet() {
  const ss    = SpreadsheetApp.openById(SHEET_ID);
  let sheet   = ss.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
  sheet.getRange('A1:H1').setValues([['라이선스키','기관명','담당자명','이메일','신청일','만료일','사용횟수','상태']]);
  sheet.getRange('A1:H1').setFontWeight('bold');
  sheet.setFrozenRows(1);
  SpreadsheetApp.flush();
  Logger.log('시트 설정 완료 (8컬럼)');
}

// ─── Drive 권한 테스트 ───────────────────────────────────────
function testDriveAccess() {
  var folders = DriveApp.getFoldersByName('게시판_이미지');
  Logger.log(folders.hasNext() ? '폴더 있음' : '폴더 없음 — Drive 권한 정상');
}

// ─── POST: 게시판 / IR / 문의 / 교육 ──────────────────────────
function doPost(e) {
  try {
    var ss   = SpreadsheetApp.getActiveSpreadsheet();
    var data = JSON.parse(e.postData.contents);

    function sanitize(val) {
      if (typeof val !== 'string') return val;
      var r = val.trim().startsWith('=') ? "'" + val : val;
      return r.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#x27;').replace(/`/g,'&#x60;');
    }

    if (data.type === 'board') {
      var boardSheet = ss.getSheetByName('게시판');
      if (!boardSheet) return json({ result: 'error', error: '게시판 시트 없음' });
      var id = new Date().getTime().toString(), dt = new Date().toISOString(), imageUrl = '';
      if (data.imageBase64 && data.imageMimeType) {
        try {
          var folders = DriveApp.getFoldersByName('게시판_이미지');
          var folder  = folders.hasNext() ? folders.next() : DriveApp.createFolder('게시판_이미지');
          var blob    = Utilities.newBlob(Utilities.base64Decode(data.imageBase64), data.imageMimeType, id + '_img');
          var file    = folder.createFile(blob);
          file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          imageUrl = 'https://drive.google.com/thumbnail?id=' + file.getId() + '&sz=w1200';
        } catch(imgErr) { console.error('Image upload failed:', imgErr); }
      }
      boardSheet.appendRow([id, sanitize(data.title||''), sanitize(data.author||'익명'), dt, sanitize(data.content||''), sanitize(data.category||''), 'visible', imageUrl]);
      return json({ result: 'success' });
    }

    var sheetName='워플로지_IR_제안목록', emailSubject='[워플로지] 웹사이트 새로운 IR 미팅 제안 접수', inquiryTypeLabel='IR 미팅 제안';
    if (data.type==='inquiry') { sheetName='워플로지_일반문의'; emailSubject='[워플로지] 웹사이트 새로운 일반 비즈니스 문의 접수'; inquiryTypeLabel='일반 비즈니스 문의'; }
    else if (data.type==='edu'||data.type==='education') { sheetName='워플로지_교육서비스'; emailSubject='[워플로지] 웹사이트 새로운 교육 서비스 문의 접수'; inquiryTypeLabel='교육 서비스 문의'; }

    var sheet = ss.getSheetByName(sheetName) || ss.getActiveSheet();
    sheet.appendRow([new Date(), sanitize(data.name), sanitize(data.company), sanitize(data.email), sanitize(data.message)]);
    GmailApp.sendEmail(
      ADMIN_EMAIL, emailSubject,
      '웹사이트에서 새로운 문의가 접수되었습니다.\n\n• 구분: '+inquiryTypeLabel+'\n• 제안자: '+sanitize(data.name)+'\n• 회사명: '+sanitize(data.company)+'\n• 이메일: '+sanitize(data.email)+'\n\n• 내용:\n'+sanitize(data.message)
    );
    return json({ result: 'success' });
  } catch(error) { return json({ result: 'error', error: error.toString() }); }
}
