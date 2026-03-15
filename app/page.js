'use client';

import { useState } from 'react';
import { MOOD_THEMES, getQuoteForDate, getDayOfYear, MONTHS_RU, DAYS_RU } from '../lib/quotes';

export default function HomePage() {
  const date = new Date();
  const quote = getQuoteForDate(date);
  const theme = MOOD_THEMES[quote.mood] || MOOD_THEMES.calm;
  const dark = theme.dark;
  const [color1, color2] = theme.bg;

  const textColor = dark ? '#ffffff' : '#1a1a2e';
  const subtleColor = dark ? 'rgba(255,255,255,0.5)' : 'rgba(26,26,46,0.45)';
  const borderColor = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.09)';
  const cardBg = dark ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.45)';

  const dayName = DAYS_RU[date.getDay()];
  const dateStr = `${date.getDate()} ${MONTHS_RU[date.getMonth()]} ${date.getFullYear()}`;
  const dayOfYear = getDayOfYear(date);

  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `«${quote.text}» — ${quote.author}`;

  function handleCopy() {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareOn(platform) {
    const encoded = encodeURIComponent(shareText);
    const urls = {
      twitter:  `https://twitter.com/intent/tweet?text=${encoded}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encoded}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encoded}`,
      vk:       `https://vk.com/share.php?title=${encoded}&url=${encodeURIComponent(shareUrl)}`,
    };
    window.open(urls[platform], '_blank');
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Georgia, serif',
    }}>
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.35)',
        top: -150, right: -150, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 300, height: 300, borderRadius: '50%',
        background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.2)',
        bottom: -80, left: -80, pointerEvents: 'none',
      }} />

      <div style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: subtleColor, marginBottom: 12 }}>
        {dateStr}
      </div>

      <div style={{
        background: cardBg,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${borderColor}`,
        borderRadius: 28,
        padding: '52px 48px 48px',
        maxWidth: 440,
        width: '100%',
        textAlign: 'center',
        boxShadow: dark
          ? '0 40px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)'
          : '0 40px 80px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.7)',
        animation: 'fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}>
        <div style={{ fontSize: 10, letterSpacing: '0.35em', textTransform: 'uppercase', color: subtleColor, marginBottom: 28 }}>
          {dayName}
        </div>
        <div style={{ width: 36, height: 1, background: dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)', margin: '0 auto 24px' }} />
        <div style={{ fontSize: 80, lineHeight: 0.5, color: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', marginBottom: 20, userSelect: 'none' }}>"</div>
        <p style={{
          fontSize: 19, lineHeight: 1.7, color: textColor,
          fontStyle: 'italic', fontFamily: 'Georgia, serif',
          margin: '0 0 36px', letterSpacing: '0.015em',
        }}>
          {quote.text}
        </p>
        <div style={{ width: 36, height: 1, background: dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)', margin: '0 auto 24px' }} />
        <div style={{ fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', color: subtleColor }}>
          {quote.author}
        </div>
      </div>

      <button
        onClick={() => setShowShare(s => !s)}
        style={{
          marginTop: 28, background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.07)',
          border: `1px solid ${borderColor}`, borderRadius: 50,
          padding: '13px 32px', color: textColor, fontSize: 11,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          fontFamily: 'Georgia, serif', cursor: 'pointer',
          backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: 9,
          transition: 'transform 0.15s',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        Поделиться
      </button>

      {showShare && (
        <div style={{
          marginTop: 14, background: dark ? 'rgba(0,0,0,0.28)' : 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(20px)', border: `1px solid ${borderColor}`,
          borderRadius: 22, padding: '18px 20px',
          display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center',
          maxWidth: 360, animation: 'fadeUp 0.3s ease forwards',
        }}>
          {[
            { id: 'telegram', label: 'Telegram', color: '#2AABEE', icon: '✈' },
            { id: 'whatsapp', label: 'WhatsApp', color: '#25D366', icon: '💬' },
            { id: 'twitter',  label: 'X / Twitter', color: '#14171A', icon: '✕' },
            { id: 'vk',       label: 'ВКонтакте', color: '#4C75A3', icon: 'В' },
          ].map(s => (
            <button key={s.id} onClick={() => shareOn(s.id)} style={{
              background: s.color, border: 'none', borderRadius: 14,
              padding: '11px 18px', color: '#fff', fontSize: 11,
              fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center',
              gap: 7, minWidth: 130, justifyContent: 'center', cursor: 'pointer',
              transition: 'transform 0.15s',
            }}>
              <span>{s.icon}</span>{s.label}
            </button>
          ))}
          <button onClick={handleCopy} style={{
            background: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
            border: `1px solid ${borderColor}`, borderRadius: 14,
            padding: '11px 18px', color: textColor, fontSize: 11,
            fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center',
            gap: 7, minWidth: 130, justifyContent: 'center', cursor: 'pointer',
          }}>
            {copied ? '✓ Скопировано!' : '📋 Копировать'}
          </button>
        </div>
      )}

      <div style={{ marginTop: 32, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: subtleColor }}>
        Мудрость дня · {dayOfYear} / 365
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        button:hover { transform: scale(1.03) !important; }
        button:active { transform: scale(0.97) !important; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
