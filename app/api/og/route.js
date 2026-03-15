import { ImageResponse } from '@vercel/og';
import { QUOTES, MOOD_THEMES, getDayOfYear, MONTHS_RU } from '../../../lib/quotes';

export const runtime = 'edge';

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  // Поддержка кастомного дня через ?day=N (для тестирования)
  const dayParam = searchParams.get('day');
  const date = new Date();
  const day = dayParam ? parseInt(dayParam) : getDayOfYear(date);
  const quote = QUOTES[day % QUOTES.length];
  const theme = MOOD_THEMES[quote.mood] || MOOD_THEMES.calm;

  const [color1, color2] = theme.bg;
  const dark = theme.dark;
  const textColor = dark ? '#ffffff' : '#1a1a2e';
  const subtleColor = dark ? 'rgba(255,255,255,0.55)' : 'rgba(26,26,46,0.5)';
  const cardBg = dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.45)';
  const borderColor = dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.10)';

  const dateStr = `${date.getDate()} ${MONTHS_RU[date.getMonth()]} ${date.getFullYear()}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
          fontFamily: 'Georgia, serif',
          position: 'relative',
        }}
      >
        {/* Декоративный круг справа сверху */}
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.3)',
          top: '-150px',
          right: '-150px',
          display: 'flex',
        }} />
        {/* Декоративный круг слева снизу */}
        <div style={{
          position: 'absolute',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.2)',
          bottom: '-80px',
          left: '-80px',
          display: 'flex',
        }} />

        {/* Карточка */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: cardBg,
          border: `1px solid ${borderColor}`,
          borderRadius: '32px',
          padding: '64px 72px',
          maxWidth: '860px',
          width: '860px',
          textAlign: 'center',
          boxShadow: dark
            ? '0 40px 80px rgba(0,0,0,0.4)'
            : '0 40px 80px rgba(0,0,0,0.12)',
        }}>
          {/* Дата */}
          <div style={{
            fontSize: '13px',
            letterSpacing: '0.25em',
            textTransform: 'uppercase',
            color: subtleColor,
            marginBottom: '28px',
            fontFamily: 'Georgia, serif',
          }}>
            {dateStr} · День {day}
          </div>

          {/* Разделитель */}
          <div style={{
            width: '40px',
            height: '1px',
            background: dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)',
            marginBottom: '24px',
            display: 'flex',
          }} />

          {/* Открывающая кавычка */}
          <div style={{
            fontSize: '90px',
            lineHeight: '0.5',
            color: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)',
            fontFamily: 'Georgia, serif',
            marginBottom: '20px',
            display: 'flex',
          }}>
            "
          </div>

          {/* Цитата */}
          <div style={{
            fontSize: quote.text.length > 80 ? '26px' : '30px',
            lineHeight: '1.6',
            color: textColor,
            fontStyle: 'italic',
            fontFamily: 'Georgia, serif',
            marginBottom: '36px',
            display: 'flex',
            textAlign: 'center',
          }}>
            {quote.text}
          </div>

          {/* Разделитель */}
          <div style={{
            width: '40px',
            height: '1px',
            background: dark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.15)',
            marginBottom: '24px',
            display: 'flex',
          }} />

          {/* Автор */}
          <div style={{
            fontSize: '13px',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: subtleColor,
            fontFamily: 'Georgia, serif',
            display: 'flex',
          }}>
            {quote.author}
          </div>
        </div>

        {/* Брендинг внизу */}
        <div style={{
          position: 'absolute',
          bottom: '28px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <div style={{
            fontSize: '13px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: dark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.3)',
            fontFamily: 'Georgia, serif',
            display: 'flex',
          }}>
            ✦ Мудрость дня
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
