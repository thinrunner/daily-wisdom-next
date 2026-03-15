import { ImageResponse } from '@vercel/og';
import { QUOTES, MOOD_THEMES, MONTHS_RU } from '../../../lib/quotes';
import { QUOTES_EN } from '../../../lib/quotes-en';
import { QUOTES_HE } from '../../../lib/quotes-he';
import { QUOTES_RO } from '../../../lib/quotes-ro';
import { MONTHS } from '../../../lib/i18n';

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
  const textColor = '#ffffff';
  const subtleColor = 'rgba(255,255,255,0.5)';
  const cardBg = 'rgba(255,255,255,0.07)';
  const borderColor = 'rgba(255,255,255,0.12)';
  const months = MONTHS[lang] || MONTHS_RU;
  const dateStr = `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  const isRTL = lang === 'he';

  const appNames = { ru: 'Мудрость дня', en: 'Daily Wisdom', he: 'חוכמה יומית', ro: 'Înțelepciunea zilei' };

  return new ImageResponse(
    (
      <div style={{
        width: '1200px', height: '630px',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
        fontFamily: 'Georgia, serif', position: 'relative',
        direction: isRTL ? 'rtl' : 'ltr',
      }}>
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

        <div style={{
          fontSize: '13px', letterSpacing: '0.25em', textTransform: 'uppercase',
          color: subtleColor, marginBottom: '20px', display: 'flex',
          fontFamily: 'Georgia, serif',
        }}>
          {dateStr}
        </div>

        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          background: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: '32px',
          padding: '56px 72px',
          maxWidth: '860px', width: '860px',
          textAlign: 'center',
          boxShadow: '0 40px 80px rgba(0,0,0,0.4)',
        }}>
          <div style={{
            width: '40px', height: '1px',
            background: 'rgba(255,255,255,0.2)',
            marginBottom: '24px', display: 'flex',
          }} />

          <div style={{
            fontSize: '90px', lineHeight: '0.5',
            color: 'rgba(255,255,255,0.1)',
            marginBottom: '24px', display: 'flex',
          }}>&ldquo;</div>

          <div style={{
            fontSize: quote.text.length > 80 ? '26px' : '30px',
            lineHeight: '1.65', color: textColor,
            fontStyle: 'italic', fontFamily: 'Georgia, serif',
            marginBottom: '36px', display: 'flex', textAlign: 'center',
          }}>
            {quote.text}
          </div>

          <div style={{
            width: '40px', height: '1px',
            background: 'rgba(255,255,255,0.2)',
            marginBottom: '24px', display: 'flex',
          }} />

          <div style={{
            fontSize: '13px', letterSpacing: '0.3em', textTransform: 'uppercase',
            color: subtleColor, display: 'flex', fontFamily: 'Georgia, serif',
          }}>
            {quote.author}
          </div>
        </div>

        <div style={{
          position: 'absolute', bottom: '28px',
          fontSize: '13px', letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.3)', display: 'flex',
        }}>
          ✦ {appNames[lang] || appNames.ru}
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
