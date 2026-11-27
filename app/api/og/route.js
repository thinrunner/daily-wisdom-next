import { ImageResponse } from 'next/og';
import { quoteForDay, themeFor } from '../../../lib/quotes';
import { QUOTES_BY_LANG, resolveShareParams } from '../../../lib/quotes-server';
import { UI, formatDate, formatWeekday, isRTL } from '../../../lib/i18n';

const SUBTLE = 'rgba(255,255,255,0.5)';

// Два формата одной карточки: превью ссылки (1200×630) и вертикальная картинка для сторис (1080×1920).
const FORMATS = {
  link: {
    width: 1200, height: 630, card: 960, padding: '48px 80px', radius: 48, k: 1,
    textSize: (n) => (n > 130 ? 28 : n > 90 ? 32 : n > 55 ? 36 : 40),
  },
  story: {
    width: 1080, height: 1920, card: 920, padding: '120px 80px', radius: 64, k: 1.5,
    textSize: (n) => (n > 130 ? 46 : n > 90 ? 52 : n > 55 ? 58 : 64),
  },
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const { lang, day, explicit } = resolveShareParams(Object.fromEntries(searchParams));
  const story = searchParams.get('format') === 'story';
  const f = story ? FORMATS.story : FORMATS.link;
  const px = (n) => `${Math.round(n * f.k)}px`;

  const quote = quoteForDay(QUOTES_BY_LANG[lang], day);
  const [color1, color2] = themeFor(quote);
  // разрядка рвёт слова на иврите
  const spacing = (em) => (isRTL(lang) ? '0.06em' : em);

  return new ImageResponse(
    (
      <div style={{
        width: `${f.width}px`, height: `${f.height}px`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', width: px(500), height: px(500), borderRadius: '50%', background: 'rgba(255,255,255,0.03)', top: px(-150), right: px(-150), display: 'flex' }} />
        <div style={{ position: 'absolute', width: px(300), height: px(300), borderRadius: '50%', background: 'rgba(255,255,255,0.02)', bottom: px(-80), left: px(-80), display: 'flex' }} />

        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: `${f.radius}px`,
          padding: f.padding,
          width: `${f.card}px`,
          textAlign: 'center',
          direction: isRTL(lang) ? 'rtl' : 'ltr',
        }}>
          <div style={{ fontSize: px(20), letterSpacing: spacing('0.25em'), textTransform: 'uppercase', color: SUBTLE, marginBottom: px(16), display: 'flex' }}>
            {formatDate(day, lang)}
          </div>
          <div style={{ fontSize: px(28), letterSpacing: spacing('0.35em'), textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: px(36), fontWeight: 600, display: 'flex' }}>
            {formatWeekday(day, lang)}
          </div>
          <div style={{ width: px(80), height: '1px', background: 'rgba(255,255,255,0.2)', marginBottom: px(40), display: 'flex' }} />
          <div style={{
            fontSize: `${f.textSize(quote.text.length)}px`, lineHeight: 1.6, color: '#fff', fontStyle: 'italic',
            marginBottom: px(40), display: 'flex', textAlign: 'center', justifyContent: 'center',
          }}>
            {quote.text}
          </div>
          <div style={{ width: px(80), height: '1px', background: 'rgba(255,255,255,0.2)', marginBottom: px(32), display: 'flex' }} />
          <div style={{ fontSize: px(22), letterSpacing: spacing('0.3em'), textTransform: 'uppercase', color: SUBTLE, display: 'flex' }}>
            {quote.author}
          </div>
          {story && quote.source && (
            <div style={{ fontSize: px(19), fontStyle: 'italic', color: 'rgba(255,255,255,0.4)', marginTop: px(14), display: 'flex' }}>
              {quote.source}
            </div>
          )}
        </div>

        {story && (
          <div style={{ position: 'absolute', bottom: '110px', fontSize: '26px', letterSpacing: spacing('0.3em'), textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', display: 'flex' }}>
            {UI[lang].appName}
          </div>
        )}
      </div>
    ),
    {
      width: f.width,
      height: f.height,
      headers: {
        // Картинка для конкретного дня неизменна; «сегодняшняя» без даты живёт недолго.
        'Cache-Control': explicit
          ? 'public, max-age=86400, s-maxage=31536000, immutable'
          : 'public, max-age=600, s-maxage=600',
      },
    }
  );
}
