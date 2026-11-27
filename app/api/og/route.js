import { ImageResponse } from 'next/og';
import { quoteForDay, themeFor } from '../../../lib/quotes';
import { QUOTES_BY_LANG, resolveShareParams } from '../../../lib/quotes-server';
import { formatDate, formatWeekday, isRTL } from '../../../lib/i18n';

const SUBTLE = 'rgba(255,255,255,0.5)';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const { lang, day, explicit } = resolveShareParams(Object.fromEntries(searchParams));
  const quote = quoteForDay(QUOTES_BY_LANG[lang], day);
  const [color1, color2] = themeFor(quote);
  const length = quote.text.length;
  const fontSize = length > 130 ? 28 : length > 90 ? 32 : length > 55 ? 36 : 40;

  // Карточка повторяет QuoteCard из приложения в масштабе ~2x.
  return new ImageResponse(
    (
      <div style={{
        width: '1200px', height: '630px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(255,255,255,0.03)', top: '-150px', right: '-150px', display: 'flex' }} />
        <div style={{ position: 'absolute', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.02)', bottom: '-80px', left: '-80px', display: 'flex' }} />

        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '48px',
          padding: '48px 80px',
          width: '960px',
          textAlign: 'center',
          direction: isRTL(lang) ? 'rtl' : 'ltr',
        }}>
          <div style={{ fontSize: '20px', letterSpacing: '0.25em', textTransform: 'uppercase', color: SUBTLE, marginBottom: '16px', display: 'flex' }}>
            {formatDate(day, lang)}
          </div>
          <div style={{ fontSize: '28px', letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: '36px', fontWeight: 600, display: 'flex' }}>
            {formatWeekday(day, lang)}
          </div>
          <div style={{ width: '80px', height: '1px', background: 'rgba(255,255,255,0.2)', marginBottom: '40px', display: 'flex' }} />
          <div style={{
            fontSize: `${fontSize}px`, lineHeight: 1.6, color: '#fff', fontStyle: 'italic',
            marginBottom: '40px', display: 'flex', textAlign: 'center', justifyContent: 'center',
          }}>
            {quote.text}
          </div>
          <div style={{ width: '80px', height: '1px', background: 'rgba(255,255,255,0.2)', marginBottom: '32px', display: 'flex' }} />
          <div style={{ fontSize: '22px', letterSpacing: '0.3em', textTransform: 'uppercase', color: SUBTLE, display: 'flex' }}>
            {quote.author}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        // Картинка для конкретного дня неизменна; «сегодняшняя» без даты живёт недолго.
        'Cache-Control': explicit
          ? 'public, max-age=86400, s-maxage=31536000, immutable'
          : 'public, max-age=600, s-maxage=600',
      },
    }
  );
}
