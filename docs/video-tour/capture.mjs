/* Perekam layar untuk video tour.
   Menjalankan Microsoft Edge dengan DevTools Protocol, mengikuti skenario tour.mjs,
   lalu menyimpan tangkapan layar (2880x1620) dan posisi elemen ke assets/shots + assets/manifest.json.
   Login dilakukan sendiri oleh pengguna di jendela Edge (skrip menunggu).

   node capture.mjs [http://localhost:5173] */
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { STEPS } from './tour.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const APP = process.argv[2] || 'http://localhost:5173';
const FROM = Number(process.argv[3] || 0);
const SHOTS = join(HERE, 'assets', 'shots');
mkdirSync(SHOTS, { recursive: true });
const VW = 1440, VH = 810, DPR = 2, PORT = 9333;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toLocaleTimeString(), ...a);

/* ---------- jalankan Edge ---------- */
const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const profile = join(tmpdir(), 'siber-evidence-tour-profile');
spawn(EDGE, [`--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check',
  '--window-size=1520,960', '--new-window', `${APP}/login`], { detached: true, stdio: 'ignore' }).unref();

let target = null;
for (let i = 0; i < 60 && !target; i++) {
  await sleep(500);
  try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((t) => t.type === 'page' && t.url.startsWith(APP)); } catch { }
}
if (!target) throw new Error('Edge tidak bisa dihubungi');

/* ---------- klien CDP minimal ---------- */
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let seq = 0; const pending = new Map();
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); }
});
const send = (method, params = {}) => new Promise((res, rej) => { const id = ++seq; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params })); });

const HELPER = `window.__T = window.__T || (() => {
  const norm = s => (s || '').replace(/\\s+/g, ' ').trim();
  const vis = el => { const r = el.getBoundingClientRect(); return r.width > 1 && r.height > 1 && getComputedStyle(el).visibility !== 'hidden'; };
  const area = el => { const r = el.getBoundingClientRect(); return r.width * r.height; };
  const root = L => L.in ? document.querySelector(L.in) : L.root === 'page' ? document : (document.querySelector('[role=dialog]') || document);
  const pick = (list, L) => { list = list.filter(vis); return list[L.i || 0] || null; };
  function up(el, L) {
    if (!el || L.up == null) return el;
    if (typeof L.up === 'string') return el.closest(L.up) || el;
    for (let i = 0; i < L.up && el.parentElement; i++) el = el.parentElement; return el;
  }
  function find(L) {
    const R = root(L); if (!R) return null; let el = null;
    if (L.sel) el = pick([...(R.matches && R.matches(L.sel) ? [R] : []), ...R.querySelectorAll(L.sel)], L);
    else if (L.title) el = pick([...R.querySelectorAll('[title="' + L.title + '"]')], L);
    else if (L.field) {
      const labs = [...R.querySelectorAll('label')].filter(l => { const s = l.querySelector('span'); return s && norm(s.textContent).replace(/\\*$/, '').trim().startsWith(L.field); });
      el = pick(labs, L); if (el && L.control) el = el.querySelector('input,select,textarea') || el;
    } else if (L.card) { el = pick([...R.querySelectorAll('h3')].filter(h => norm(h.textContent) === L.card), L); el = el && el.closest('section'); }
    else if (L.btn) el = pick([...R.querySelectorAll('button,a')].filter(b => { const t = norm(b.textContent); return L.starts ? t.startsWith(L.btn) : t === L.btn; }), L);
    else if (L.text) el = [...R.querySelectorAll('*')].filter(e => { const t = norm(e.textContent); return (L.starts ? t.startsWith(L.text) : t === L.text) && vis(e); }).sort((a, b) => area(a) - area(b))[0] || null;
    return up(el, L);
  }
  const all = L => (Array.isArray(L) ? L : [L]).map(find).filter(Boolean);
  function rect(L) {
    const els = all(L); if (!els.length) return null;
    let x1 = 1e9, y1 = 1e9, x2 = -1e9, y2 = -1e9;
    els.forEach(e => { const r = e.getBoundingClientRect(); x1 = Math.min(x1, r.left); y1 = Math.min(y1, r.top); x2 = Math.max(x2, r.right); y2 = Math.max(y2, r.bottom); });
    return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
  }
  function scrollTo(L) {
    const els = all(L); if (!els.length) return false; const r = rect(L);
    if (r.y >= 70 && r.y + r.h <= innerHeight - 10) return false;
    els[0].scrollIntoView({ block: r.h > innerHeight * .75 ? 'start' : 'center' }); return true;
  }
  function setVal(el, v) {
    const proto = el.tagName === 'SELECT' ? HTMLSelectElement.prototype : el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, 'value').set.call(el, v);
    el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function fill(L, a) {
    const lab = find(L); const c = lab && (lab.matches('input,select,textarea') ? lab : lab.querySelector('input,select,textarea'));
    if (!c) return 'KOLOM TIDAK ADA';
    if (c.tagName === 'SELECT') {
      const opts = [...c.options]; let o = a.option ? opts.find(o => o.text.includes(a.option)) : null;
      if (!o && a.index != null) o = opts[a.index]; if (!o) return 'OPSI TIDAK ADA';
      setVal(c, o.value); return o.text;
    }
    let v = a.value; if (v === '$firstLP') v = norm(document.querySelector('tbody a') && document.querySelector('tbody a').textContent);
    setVal(c, v); return v;
  }
  const click = L => { const el = find(L); if (!el) return false; el.click(); return true; };
  function banner(text) {
    let b = document.getElementById('__tour_banner');
    if (!text) { b && b.remove(); return; }
    if (!b) { b = document.createElement('div'); b.id = '__tour_banner'; document.body.appendChild(b); }
    b.style.cssText = 'position:fixed;left:50%;top:16px;transform:translateX(-50%);z-index:99999;background:#E5484D;color:#fff;font:700 16px system-ui;padding:12px 20px;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.25)';
    b.textContent = text;
  }
  return { find, rect, scrollTo, fill, click, banner, norm };
})();`;

async function ev(expr) {
  const r = await send('Runtime.evaluate', { expression: `${HELPER};(${expr})`, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
  return r.result.value;
}
const J = (v) => JSON.stringify(v);
const scale = (r) => r && { x: Math.round(r.x * DPR), y: Math.round(r.y * DPR), w: Math.round(r.w * DPR), h: Math.round(r.h * DPR) };
let shotN = 0;
async function shot(name) {
  await ev('window.__T.banner(null)');
  await sleep(150);
  const { data } = await send('Page.captureScreenshot', { format: 'jpeg', quality: 92 });
  const file = `${String(shotN++).padStart(3, '0')}-${name}.jpg`;
  writeFileSync(join(SHOTS, file), Buffer.from(data, 'base64'));
  return file;
}
const path = () => ev('location.pathname + location.search');
async function waitPath(re, label) {
  log(`MENUNGGU: ${label}`);
  for (let i = 0; i < 1800; i++) {
    let p = ''; try { p = await path(); } catch { }
    if (re.test(p)) return;
    if (i % 5 === 0) { try { if (/\/login/.test(p)) await ev(`window.__T.banner(${J(label)})`); } catch { } }
    await sleep(1000);
  }
  throw new Error('Waktu tunggu login habis');
}
async function mouse(r) {
  if (!r) return;
  await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: r.x + r.w / 2, y: r.y + r.h / 2 });
}
const base = async () => (await path()).split('/')[1];

/* ---------- mulai ---------- */
await send('Page.enable');
await send('Runtime.enable');
await send('Emulation.setDeviceMetricsOverride', { width: VW, height: VH, deviceScaleFactor: DPR, mobile: false });
await sleep(1500);
if (!FROM && !/\/login/.test(await path())) {
  log('Sudah login dari sesi sebelumnya; keluar dulu agar adegan login bisa direkam.');
  await ev(`window.__T.click({ text: 'Keluar', in: 'aside', up: 'button' })`); await waitPath(/\/login/, 'halaman login');
}
await sleep(1500);

const MF = join(HERE, 'assets', 'manifest.json');
const manifest = { width: VW * DPR, height: VH * DPR, steps: [] };
if (FROM) {
  const old = JSON.parse(readFileSync(MF, 'utf8'));
  manifest.steps = old.steps.filter((x) => x.i < FROM);
  shotN = 1 + Math.max(...readdirSync(SHOTS).map((f) => parseInt(f, 10)));
  const adminIdx = STEPS.findIndex((x) => x.relogin === 'admin');
  const want = FROM >= adminIdx ? 'admin' : 'petugas';
  if ((await base()) !== want) {
    if (!/\/login/.test(await path())) { await ev(`window.__T.click({ text: 'Keluar', in: 'aside', up: 'button' })`); await waitPath(/\/login/, 'halaman login'); }
    await waitPath(new RegExp(`^/${want}/`), `Silakan LOGIN sebagai ${want === 'admin' ? 'admin' : 'd.kusuma'} di jendela ini (rekaman menunggu)`);
    await sleep(3000);
  }
  { const b = await base(); await ev(`(history.pushState({}, '', '/${b}/dashboard'), dispatchEvent(new PopStateEvent('popstate')), true)`); await sleep(2000); }
}
for (let i = FROM; i < STEPS.length; i++) {
  const s = STEPS[i];
  if (FROM && i === FROM && s.relogin) s.relogin = null;
  log(`Langkah ${i}: ${s.say.slice(0, 60)}…`);
  if (s.relogin) {
    await ev(`window.__T.click({ text: 'Keluar', in: 'aside', up: 'button' })`);
    await waitPath(/\/login/, 'halaman login');
    await waitPath(new RegExp(`^/${s.relogin === 'admin' ? 'admin' : 'petugas'}/`), `Silakan LOGIN sebagai ${s.relogin} di jendela ini (rekaman menunggu)`);
    await sleep(3000);
  }
  const cursor = [], hovers = [];
  for (const a of s.act) {
    if (a.nav) {
      const p = `/${await base()}${a.nav}`;
      await ev(`(history.pushState({}, '', ${J(p)}), dispatchEvent(new PopStateEvent('popstate')), true)`);
    } else if (a.wait) await sleep(a.wait);
    else if (a.fill) { const r = await ev(`window.__T.fill(${J(a.fill)}, ${J(a)})`); log('  isi', a.fill.field, '→', r); await sleep(150); }
    else if (a.hover) hovers.push(a.hover);
    else if (a.click) {
      if (await ev(`window.__T.scrollTo(${J(a.click)})`)) await sleep(500);
      const r = await ev(`window.__T.rect(${J(a.click)})`);
      if (!r) { log('  ! elemen untuk diklik tidak ditemukan', J(a.click)); continue; }
      await mouse(r); await sleep(200);
      const pre = await shot(`s${i}-pre`);
      cursor.push({ type: 'click', rect: scale(r), pre });
      await ev(`window.__T.click(${J(a.click)})`);
      await sleep(500);
    }
  }
  if (s.zoom) { if (await ev(`window.__T.scrollTo(${J(s.zoom)})`)) await sleep(600); }
  for (const h of hovers) {
    const r = await ev(`window.__T.rect(${J(h)})`);
    if (r) { await mouse(r); cursor.push({ type: 'hover', rect: scale(r) }); } else log('  ! elemen hover tidak ditemukan', J(h));
  }
  await sleep(700);
  const file = await shot(`s${i}`);
  const z = s.zoom ? await ev(`window.__T.rect(${J(s.zoom)})`) : null;
  if (s.zoom && !z) log('  ! target zoom tidak ditemukan', J(s.zoom));
  manifest.steps.push({ i, shot: file, zoom: scale(z), cursor });
  writeFileSync(MF, JSON.stringify(manifest, null, 1));

  if (s.login) {
    await ev(`window.__T.fill({ field: 'Kata Sandi' }, { value: '' })`);
    await waitPath(/^\/(petugas|admin)\//, `Silakan LOGIN sebagai ${s.login} di jendela ini (rekaman menunggu)`);
    await sleep(3000);
  }
}
log('SELESAI. Tangkapan layar:', manifest.steps.length);
ws.close();
process.exit(0);
