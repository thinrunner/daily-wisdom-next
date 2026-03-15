'use client';

import { useState, useEffect } from 'react';
import { MOOD_THEMES, getQuoteForDate, getDayOfYear, MONTHS_RU, DAYS_RU } from '../lib/quotes';

export default function HomePage() {
  const date = new Date();
  const quote = getQuoteForDate(date);
  const theme = MOOD_THEMES[quote.mood] || MOOD_THEMES.calm;
  const dark = theme.dark;
  const [color1, color2] = theme.bg;

  const textColor = '#ffffff';
  const subtleColor = 'rgba(255,255,255,0.5)';
  const borderColor = 'rgba(255,255,255,0.12)';
  const cardBg = 'rgba(255,255,255,0.07)';

  const dayName = DAYS_RU[date.getDay()];
  const dateStr = `${date.getDate()} ${MONTHS_RU[date.getMonth()]} ${date.getFullYear()}`;
  const dayOfYear = getDayOfYear(date);

  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://daily-wisdom-next.vercel.app';
  const shareUrl = BASE_URL;
  const shareText = `«${quote.text}» — ${quote.author}`;

  useEffect(() => {
    // Проверяем iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    // Проверяем установлено ли уже
    const installed =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsInstalled(installed);

    if (installed) return; // уже установлено — ничего не показываем

    // Android: ловим событие beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      // Показываем баннер через 3 сек
      setTimeout(() => setShowInstall(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS: показываем подсказку через 3 сек если не установлено
    if (ios) {
      const shown = sessionStorage.getItem('install-hint-shown');
      if (!shown) {
        setTimeout(() => {
          setShowInstall(true);
          sessionStorage.setItem('install-hint-shown', '1');
        }, 3000);
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall() {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstall(false);
        setInstallPrompt(null);
      }
    }
  }

  async function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: 'Мудрость дня', text: shareText, url: shareUrl });
        return;
      } catch (e) {}
    }
    setShowShare(s => !s);
  }

  function handleCopy() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function shareOn(platform) {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    const urls = {
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      whatsapp: `https://api.whatsapp.com/send?text=${encodedText}%0A${encodedUrl}`,
      twitter:  `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      vk:       `https://vk.com/share.php?url=${encodedUrl}&title=${encodedText}`,
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

      {/* Декоративные орбы */}
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%',
        background: 'rgba(255,255,255,0.03)',
        top: -150, right: -150, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 300, height: 300, borderRadius: '50%',
        background: 'rgba(255,255,255,0.02)',
        bottom: -80, left: -80, pointerEvents: 'none',
      }} />

      {/* Баннер установки */}
      {showInstall && !isInstalled && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)',
          maxWidth: 400,
          background: 'rgba(20,20,35,0.97)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 20,
          padding: '18px 20px',
          zIndex: 1000,
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            {/* Иконка */}
            <div style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              background: `linear-gradient(135deg, ${color1}, ${color2})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
            }}>✦</div>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4, fontFamily: 'Georgia, serif' }}>
                Мудрость дня
              </div>
              {isIOS ? (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                  Нажми <span style={{ color: '#fff' }}>⬆ Поделиться</span> внизу Safari, затем <span style={{ color: '#fff' }}>«На экран Домой»</span>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                  Добавь на главный экран — новая цитата каждый день
                </div>
              )}
            </div>

            {/* Кнопка закрыть */}
            <button
              onClick={() => setShowInstall(false)}
              style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
                fontSize: 20, cursor: 'pointer', padding: '0 0 0 4px', lineHeight: 1,
                flexShrink: 0,
              }}
            >×</button>
          </div>

          {/* Кнопка установки (только Android) */}
          {!isIOS && installPrompt && (
            <button
              onClick={handleInstall}
              style={{
                marginTop: 14,
                width: '100%',
                background: `linear-gradient(135deg, ${color1}, ${color2})`,
                border: 'none',
                borderRadius: 12,
                padding: '12px',
                color: '#fff',
                fontSize: 13,
                letterSpacing: '0.1em',
                fontFamily: 'Georgia, serif',
                cursor: 'pointer',
                textTransform: 'uppercase',
              }}
            >
              Установить приложение
            </button>
          )}
        </div>
      )}

      {/* Дата */}
      <div style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: subtleColor, marginBottom: 16 }}>
        {dateStr}
      </div>

      {/* Карточка */}
      <div id="quote-card" style={{
        background: cardBg,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${borderColor}`,
        borderRadius: 28,
        padding: '56px 44px 52px',
        maxWidth: 440,
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 40px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)',
        animation: 'fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}>
        <div style={{ fontSize: 14, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 32, fontWeight: 600 }}>
          {dayName}
        </div>
        <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.2)', margin: '0 auto 28px' }} />
        <div style={{ fontSize: 80, lineHeight: 0.5, color: 'rgba(255,255,255,0.1)', marginBottom: 24, userSelect: 'none' }}>"</div>
        <p style={{
          fontSize: 20, lineHeight: 1.75, color: textColor,
          fontStyle: 'italic', fontFamily: 'Georgia, serif',
          margin: '0 0 40px', letterSpacing: '0.02em',
        }}>
          {quote.text}
        </p>
        <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.2)', margin: '0 auto 28px' }} />
        <div style={{ fontSize: 11, letterSpacing: '0.35em', textTransform: 'uppercase', color: subtleColor, fontVariant: 'small-caps' }}>
          {quote.author}
        </div>
      </div>

      {/* Кнопка поделиться */}
      <button
        onClick={handleShare}
        style={{
          marginTop: 28,
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 50,
          padding: '13px 32px',
          color: textColor,
          fontSize: 11,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          fontFamily: 'Georgia, serif',
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: 9,
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

      {/* Панель шаринга для десктопа */}
      {showShare && (
        <div style={{
          marginTop: 14,
          background: 'rgba(0,0,0,0.35)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 22,
          padding: '18px 20px',
          display: 'flex',
          gap: 10,
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: 360,
          animation: 'fadeUp 0.3s ease forwards',
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
            }}>
              <span>{s.icon}</span>{s.label}
            </button>
          ))}
          <button onClick={handleCopy} style={{
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 14, padding: '11px 18px',
            color: '#fff', fontSize: 11,
            fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center',
            gap: 7, minWidth: 130, justifyContent: 'center', cursor: 'pointer',
          }}>
            {copied ? '✓ Ссылка скопирована!' : '🔗 Копировать ссылку'}
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
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}
