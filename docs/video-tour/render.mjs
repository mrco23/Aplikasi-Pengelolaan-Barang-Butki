/* Merender video tour ke MP4 memakai Edge headless (tanpa jendela).
   Butuh serve.py berjalan:  python serve.py   lalu  node render.mjs */
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const URL_ = process.argv[2] || 'http://localhost:8791/';
const PORT = 9334;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const EDGE = ['C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const proc = spawn(EDGE, ['--headless=new', `--remote-debugging-port=${PORT}`, `--user-data-dir=${join(tmpdir(), 'siber-tour-render')}`,
  '--autoplay-policy=no-user-gesture-required', '--disable-background-timer-throttling', '--disable-renderer-backgrounding', '--window-size=1280,900', URL_], { stdio: 'ignore' });

let target = null;
for (let i = 0; i < 60 && !target; i++) { await sleep(500); try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json`)).json()).find((t) => t.type === 'page'); } catch { } }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let seq = 0; const pending = new Map();
ws.addEventListener('message', (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); } });
const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pending.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
const ev = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true })).result?.result?.value;

let st = '';
for (let i = 0; i < 120 && !/^Siap/.test(st); i++) { await sleep(1000); st = await ev(`document.getElementById('st')?.textContent || ''`); }
console.log(st);
await ev(`document.getElementById('exp').click()`);
let lastLog = '';
for (;;) {
  await sleep(5000);
  st = await ev(`document.getElementById('st').textContent`);
  if (st !== lastLog) { console.log(new Date().toLocaleTimeString(), st); lastLog = st; }
  if (/^Selesai|^Gagal/.test(st)) break;
}
await sleep(1000);
ws.close(); proc.kill();
process.exit(/^Gagal/.test(st) ? 1 : 0);
