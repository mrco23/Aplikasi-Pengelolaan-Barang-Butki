"""Membuat suara narator (edge-tts, id-ID-ArdiNeural) untuk setiap langkah di tour.mjs.
Jalankan dari folder docs/video-tour:  python tts.py
Hasil: assets/audio/NN.mp3"""
import asyncio, json, os, re, subprocess, sys
import edge_tts

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'assets', 'audio')
os.makedirs(OUT, exist_ok=True)

js = "import('./tour.mjs').then(m=>console.log(JSON.stringify({v:m.VOICE,s:m.STEPS.map(s=>s.say)})))"
data = json.loads(subprocess.check_output(['node', '--input-type=module', '-e', js], cwd=HERE, text=True))

# Penyesuaian pelafalan (hanya untuk suara, subtitle tetap memakai teks asli)
SPOKEN = [
    (r'SIBER EVIDENCE', 'Saiber Evidens'),
    (r'\bCSV\b', 'C S V'),
    (r'\bA4\b', 'A empat'),
    (r'\bIMEI\b', 'I M E I'),
    (r'chain of custody', 'cen of kastodi'),
    (r'\bExcel\b', 'Eksel'),
]


def spoken(text):
    for a, b in SPOKEN:
        text = re.sub(a, b, text)
    return text


async def main():
    only = set(int(x) for x in sys.argv[1:])
    for i, say in enumerate(data['s']):
        if only and i not in only:
            continue
        path = os.path.join(OUT, f'{i:02d}.mp3')
        await edge_tts.Communicate(spoken(say), data['v'], rate='+0%').save(path)
        print(i, os.path.getsize(path))

asyncio.run(main())
