import { ImageResponse } from '@vercel/og';
import { QUOTES, MOOD_THEMES } from '../../../lib/quotes';
import { QUOTES_EN } from '../../../lib/quotes-en';
import { QUOTES_HE } from '../../../lib/quotes-he';
import { QUOTES_RO } from '../../../lib/quotes-ro';
import { MONTHS, DAYS } from '../../../lib/i18n';

export const runtime = 'edge';

const QUOTES_BY_LANG = { ru: QUOTES, en: QUOTES_EN, he: QUOTES_HE, ro: QUOTES_RO };

function getDayInTimezone(offsetHours = 2) {
  const now = new Date();
  const local = new Date(now.getTime() + offsetHours * 60 * 60 * 1000);
  const start = new Date(Date.UTC(local.getUTCFullYear(), 0, 0));
  const diff = local - start;
  return Math.floor(diff / 86400000);
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const dayParam = searchParams.get('day');
  const lang = searchParams.get('lang') || 'ru';
  const day = dayParam ? parseInt(dayParam) : getDayInTimezone(2);

  const date = new Date();
  const quotes = QUOTES_BY_LANG[lang] || QUOTES;
  const quote = quotes[day % quotes.length];
  const theme = MOOD_THEMES[quote.mood] || MOOD_THEMES.calm;

  const [color1, color2] = theme.bg;
  const subtleColor = 'rgba(255,255,255,0.5)';
  const months = MONTHS[lang] || MONTHS.ru;
  const dateStr = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  const dayName = (DAYS[lang] || DAYS.ru)[date.getDay()];
  const isRTL = lang === 'he';

  // Scale factor ~2x relative to the 440px app card → 880px card in 1200px image
  return new ImageResponse(
    (
      <div style={{
        width: '1200px', height: '630px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
        fontFamily: 'Georgia, serif', position: 'relative',
      }}>
        {/* Decorative orbs — same as app */}
        <div style={{
          position: 'absolute', width: '500px', height: '500px',
          borderRadius: '50%', background: 'rgba(255,255,255,0.03)',
          top: '-150px', right: '-150px', display: 'flex',
        }} />
        <div style={{
          position: 'absolute', width: '300px', height: '300px',
          borderRadius: '50%', background: 'rgba(255,255,255,0.02)',
          bottom: '-80px', left: '-80px', display: 'flex',
        }} />

        {/* Card — mirrors app QuoteCard exactly, scaled 2x */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          background: 'rgba(255,255,255,0.07)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '56px',
          padding: '72px 88px',
          width: '900px',
          textAlign: 'center',
          boxShadow: '0 40px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)',
          direction: isRTL ? 'rtl' : 'ltr',
        }}>
          {/* Date — app: 10px × 2 = 20px */}
          <div style={{
            fontSize: '20px', letterSpacing: '0.25em', textTransform: 'uppercase',
            color: subtleColor, marginBottom: '24px', display: 'flex',
          }}>
            {dateStr}
          </div>

          {/* Day name — app: 14px × 2 = 28px */}
          <div style={{
            fontSize: '28px', letterSpacing: '0.35em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.7)', marginBottom: '64px', fontWeight: 600,
            display: 'flex',
          }}>
            {dayName}
          </div>

          {/* Divider — app: 40px wide × 2 = 80px */}
          <div style={{
            width: '80px', height: '1px',
            background: 'rgba(255,255,255,0.2)',
            marginBottom: '56px', display: 'flex',
          }} />

          {/* Opening quote mark — app: 80px × 2 = 160px */}
          <div style={{
            fontSize: '160px', lineHeight: '0.5',
            color: 'rgba(255,255,255,0.1)',
            marginBottom: '48px', display: 'flex',
          }}>&ldquo;</div>

          {/* Quote text — app: 20px × 2 = 40px, scale down for long quotes */}
          <div style={{
            fontSize: quote.text.length > 100 ? '30px' : quote.text.length > 60 ? '36px' : '40px',
            lineHeight: '1.75', color: '#ffffff',
            fontStyle: 'italic', fontFamily: 'Georgia, serif',
            marginBottom: '56px', display: 'flex', textAlign: 'center',
            flexWrap: 'wrap', justifyContent: 'center',
          }}>
            {quote.text}
          </div>

          {/* Divider */}
          <div style={{
            width: '80px', height: '1px',
            background: 'rgba(255,255,255,0.2)',
            marginBottom: '48px', display: 'flex',
          }} />

          {/* Author — app: 11px × 2 = 22px */}
          <div style={{
            fontSize: '22px', letterSpacing: '0.35em', textTransform: 'uppercase',
            color: subtleColor, display: 'flex', fontFamily: 'Georgia, serif',
          }}>
            {quote.author}
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}
