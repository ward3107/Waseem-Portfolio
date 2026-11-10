"""Regenerate the three Vasia introductions; keep every other chapter recording.

Install the authoring dependency with `python -m pip install edge-tts`, then run
`python scripts/generate-narration-intros.py`. No speech service is called by
the website: visitors continue to play static MP3 files.
"""

import asyncio
import os
from pathlib import Path

import edge_tts
import edge_tts.communicate

ROOT = Path(__file__).resolve().parent.parent
INTROS = {
    'he': {
        'voice': 'he-IL-AvriNeural',
        # Display name: וסיה. Pointed spelling is for pronunciation only.
        'text': 'שלום וברוכים הבאים. אני וַאסְיָה. אני מעצב ובונה אתרים, '
                'אפליקציות ופתרונות בינה מלאכותית לעסקים. '
                'גללו למטה ובואו להכיר את השירותים והפרויקטים שלי.',
    },
    'en': {
        'voice': 'en-US-AndrewMultilingualNeural',
        'text': "Hello and welcome. I'm Vasia. I design and build websites, "
                'applications, and AI solutions for businesses. '
                'Scroll down to explore my services and projects.',
    },
    'ar': {
        'voice': 'ar-LB-RamiNeural',
        'text': 'أهلاً وسهلاً. أنا واسيا. بصمّم وببني مواقع، تطبيقات، '
                'وحلول ذكاء اصطناعي للمصالح والشركات. '
                'انزل لتحت وتعرّف على خدماتي ومشاريعي.',
    },
}


async def main():
    # Keep certificate verification enabled, including the runtime's trusted CA.
    ca_file = os.environ.get('SSL_CERT_FILE')
    if ca_file:
        edge_tts.communicate._SSL_CTX.load_verify_locations(cafile=ca_file)
    for lang, intro in INTROS.items():
        destination = ROOT / 'public' / 'audio' / lang / 'hero.mp3'
        pending = destination.with_suffix('.pending.mp3')
        try:
            await edge_tts.Communicate(
                intro['text'], voice=intro['voice'],
                proxy=os.environ.get('HTTPS_PROXY'),
                connect_timeout=10, receive_timeout=30,
            ).save(str(pending))
            if pending.stat().st_size < 1000:
                raise RuntimeError(f'Incomplete narration for {lang}')
            pending.replace(destination)
            print(f'Updated {lang} introduction: {destination.stat().st_size} bytes', flush=True)
        finally:
            pending.unlink(missing_ok=True)


if __name__ == '__main__':
    asyncio.run(main())
