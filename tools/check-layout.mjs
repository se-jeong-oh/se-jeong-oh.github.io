// 레이아웃 검사: 여러 화면 크기에서 각 장으로 스크롤하며
//   - 서로 다른 글자 줄이 겹치는 곳 (overlap)
//   - 가로로 넘치는 페이지 (h-overflow) / 화면 밖으로 나간 글자 (text-offscreen)
//   - 말줄임(…)으로 잘린 글자 (truncated)
//   - 상자 밖으로 넘친 내용 (v-overflow)
// 을 찾고, 장마다 스크린샷을 남긴다.
//
// 사용법 (Node 22 이상, Chrome 필요):
//   python3 -m http.server 8000            # 다른 터미널에서
//   node tools/check-layout.mjs http://127.0.0.1:8000/ /tmp/layout-shots
// CHROME 환경변수로 Chrome 경로를 바꿀 수 있다.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const url = process.argv[2] || 'http://127.0.0.1:8000/';
const outDir = process.argv[3] || 'layout-shots';
const CHROME = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const VIEWPORTS = [[1440, 900], [1280, 800], [1180, 820], [1024, 768], [820, 1180], [390, 844], [360, 740]];
const PORT = 9400 + Math.floor(Math.random() * 400);
const sleep = ms => new Promise(r => setTimeout(r, ms));

mkdirSync(outDir, { recursive: true });
const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${join(outDir, '.profile')}`,
  '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', 'about:blank'], { stdio: 'ignore' });

let page;
for (let i = 0; i < 50 && !page; i++) {
  await sleep(200);
  try { page = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find(t => t.type === 'page'); } catch {}
}
if (!page) { console.error('Chrome을 띄우지 못했습니다. CHROME 경로를 확인하세요.'); proc.kill(); process.exit(1); }
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise(r => ws.addEventListener('open', r));
let id = 0; const pending = new Map(); const errors = [];
ws.addEventListener('message', ev => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
});
ws.addEventListener('close', () => { console.error('Chrome 연결이 끊겼습니다.'); proc.kill(); process.exit(1); });
// 응답이 없으면 기다리지 않고 오류로 넘긴다
const send = (method, params = {}, ms = 30000) => new Promise((resolve, reject) => {
  const i = ++id;
  const timer = setTimeout(() => { pending.delete(i); reject(new Error(`${method}: ${ms}ms 동안 응답 없음`)); }, ms);
  pending.set(i, m => { clearTimeout(timer); resolve(m); });
  ws.send(JSON.stringify({ id: i, method, params }));
});
const evaluate = async expression => (await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true })).result.result?.value;

// 페이지 안에서 실행할 검사
const CHECK = `(() => {
  const vw = innerWidth, vh = innerHeight, out = [];
  if (document.documentElement.scrollWidth > vw + 1) out.push({ type: 'h-overflow', width: document.documentElement.scrollWidth });
  const boxes = [], range = document.createRange();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: n => n.textContent.trim() ? 1 : 2 });
  for (let n; (n = walker.nextNode());) {
    const el = n.parentElement;
    if (!el || el.closest('.skip, noscript')) continue;
    let hidden = false;
    for (let p = el; p && p !== document.body; p = p.parentElement) { const cs = getComputedStyle(p); if (cs.visibility === 'hidden' || cs.display === 'none' || +cs.opacity < 0.05) { hidden = true; break; } }
    if (hidden) continue;
    range.selectNodeContents(n);
    const layer = el.closest('.site-head') ? 'head' : el.closest('.mbar') ? 'mbar' : el.closest('.win') ? 'win' : 'page';
    for (const r of range.getClientRects()) {
      if (r.width < 1 || r.height < 1 || r.bottom < 0 || r.top > vh) continue;
      boxes.push({ el, r, layer, txt: n.textContent.trim().slice(0, 24) });
    }
  }
  const head = document.querySelector('.site-head').getBoundingClientRect().bottom;
  const mbar = document.querySelector('.mbar'); const mb = mbar && getComputedStyle(mbar).display !== 'none' && mbar.classList.contains('show') ? mbar.getBoundingClientRect().top : vh;
  // 창문(.win) 안의 글자는 창틀이 잘라내고, 사진이 넘어가는 동안 잠깐 겹치므로 검사에서 뺀다
  const live = boxes.filter(b => b.layer !== 'win' && (b.layer !== 'page' || (b.r.top >= head && b.r.bottom <= mb)));
  for (const b of live) if (b.r.left < -1 || b.r.right > vw + 1) out.push({ type: 'text-offscreen', txt: b.txt });
  for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) {
    const a = live[i], b = live[j];
    if (a.el === b.el || a.layer !== b.layer) continue;
    const x = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left);
    const y = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
    if (x > 1 && y > 2) out.push({ type: 'overlap', a: a.txt, b: b.txt, x: Math.round(x), y: Math.round(y) });
  }
  for (const el of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || !el.textContent.trim()) continue;
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) continue;
    if (cs.textOverflow === 'ellipsis' && el.scrollWidth > el.clientWidth + 1) out.push({ type: 'truncated', txt: el.textContent.trim().slice(0, 40) });
    if ((cs.overflowY === 'hidden' || cs.overflowY === 'auto') && el.scrollHeight > el.clientHeight + 1 && !el.matches('.win, .win *')) out.push({ type: 'v-overflow', el: el.className || el.tagName, by: el.scrollHeight - el.clientHeight });
  }
  return out;
})()`;

const report = {};
for (const [w, h] of VIEWPORTS) {
  await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: w < 760 });
  await send('Page.enable'); await send('Runtime.enable');
  await send('Page.navigate', { url });
  await sleep(3000);
  await evaluate('document.fonts.ready.then(() => true)');
  const ids = await evaluate(`[...document.querySelectorAll('.chapter, .index-page')].filter(e => getComputedStyle(e).display !== 'none').map(e => e.id)`);
  const dir = join(outDir, `${w}x${h}`); mkdirSync(dir, { recursive: true });
  for (const cid of ids) try {
    // 장의 맨 위에서 시작해 화면 0.8개씩 내려가며 장 끝까지 검사한다. 스크린샷은 장 맨 위에서 한 장.
    const span = await evaluate(`(() => { document.documentElement.style.scrollBehavior = 'auto'; const el = document.getElementById('${cid}'); const top = el.getBoundingClientRect().top + scrollY - (parseFloat(getComputedStyle(el).scrollMarginTop) || 0); return { top, height: el.offsetHeight }; })()`);
    const found = new Map();
    for (let y = span.top, k = 0; y < span.top + span.height; y += Math.round(h * 0.8), k++) {
      await evaluate(`window.scrollTo(0, ${y})`);
      await sleep(k === 0 ? 1700 : 1000);
      for (const issue of (await evaluate(CHECK)) || []) found.set(JSON.stringify(issue), issue);
      if (k === 0) {
        const shot = await send('Page.captureScreenshot', { format: 'png' });
        writeFileSync(join(dir, `${cid}.png`), Buffer.from(shot.result.data, 'base64'));
      }
    }
    if (found.size) (report[`${w}x${h}`] ||= {})[cid] = [...found.values()];
  } catch (e) {
    errors.push(`${w}x${h} ${cid}: ${e.message}`);
  }
}
console.log(JSON.stringify({ errors, report }, null, 1));
ws.close(); proc.kill(); process.exit(0);
