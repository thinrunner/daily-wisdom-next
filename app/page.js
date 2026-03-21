'use client';

import { useState, useEffect, useRef } from 'react';
import { MOOD_THEMES, getDayOfYear, getQuoteForDay } from '../lib/quotes';
import { LANGUAGES, DAYS, UI, isRTL, getDateStr } from '../lib/i18n';

function QuoteCard({ quote, theme, dayName, dateStr, isToday, cardRef, dir }) {
  const [color1, color2] = theme.bg;
  const subtleColor = 'rgba(255,255,255,0.5)';

  return (
    <div ref={cardRef} dir={dir} style={{
      background: isToday
        ? 'rgba(255,255,255,0.07)'
        : `linear-gradient(135deg, ${color1}, ${color2})`,
      backdropFilter: isToday ? 'blur(24px)' : undefined,
      WebkitBackdropFilter: isToday ? 'blur(24px)' : undefined,
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 28,
      padding: '56px 44px 52px',
      maxWidth: 440,
      width: '100%',
      textAlign: 'center',
      boxShadow: '0 40px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)',
      animation: isToday ? 'fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards' : undefined,
      userSelect: 'none',
      WebkitUserSelect: 'none',
    }}>
      {dateStr && (
        <div style={{ fontSize: 10, letterSpacing: '0.25em', textTransform: 'uppercase', color: subtleColor, marginBottom: 12 }}>
          {dateStr}
        </div>
      )}
      <div style={{ fontSize: 14, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 32, fontWeight: 600 }}>
        {dayName}
      </div>
      <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.2)', margin: '0 auto 28px' }} />
      <div style={{ fontSize: 80, lineHeight: 0.5, color: 'rgba(255,255,255,0.1)', marginBottom: 24, userSelect: 'none' }}>&ldquo;</div>
      <p style={{
        fontSize: 20, lineHeight: 1.75, color: '#ffffff',
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
  );
}

export default function HomePage() {
  const [lang, setLang] = useState('ru');
  const [showSplash, setShowSplash] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showInstall, setShowInstall] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const dragStart = useRef(null);

  const date = new Date();
  const dayOfYear = getDayOfYear(date);
  const quote = getQuoteForDay(dayOfYear, lang);
  const theme = MOOD_THEMES[quote.mood] || MOOD_THEMES.calm;
  const [color1, color2] = theme.bg;
  const dir = isRTL(lang) ? 'rtl' : 'ltr';

  const subtleColor = 'rgba(255,255,255,0.5)';
  const dayName = DAYS[lang][date.getDay()];
  const dateStr = getDateStr(date, lang);
  const ui = UI[lang];

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://daily-wisdom-next.vercel.app';
  const shareUrl = BASE_URL;
  const shareText = `«${quote.text}» — ${quote.author}`;

  // All cards: today + past 3
  const allCards = [
    { quote, theme, dayName, dateStr, isToday: true },
    ...[1, 2, 3].map(offset => {
      const pastDate = new Date(date);
      pastDate.setDate(pastDate.getDate() - offset);
      const pastDayOfYear = getDayOfYear(pastDate);
      const pastQuote = getQuoteForDay(pastDayOfYear, lang);
      const pastTheme = MOOD_THEMES[pastQuote.mood] || MOOD_THEMES.calm;
      return {
        quote: pastQuote,
        theme: pastTheme,
        dayName: DAYS[lang][pastDate.getDay()],
        dateStr: getDateStr(pastDate, lang),
        isToday: false,
      };
    }),
  ];

  useEffect(() => {
    const saved = localStorage.getItem('wisdom-lang');
    if (saved && ['ru', 'en', 'he', 'ro'].includes(saved)) {
      setLang(saved);
    } else {
      const browserLang = navigator.language?.slice(0, 2);
      if (['en', 'he', 'ro'].includes(browserLang)) setLang(browserLang);
    }

    const installed =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsInstalled(installed);

    if (installed) {
      const splashShown = sessionStorage.getItem('splash-shown');
      if (!splashShown) {
        sessionStorage.setItem('splash-shown', '1');
        // Wait for fonts before showing splash — prevents font-flash glitch
        document.fonts.ready.then(() => setShowSplash(true));
      }
      return;
    }

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setTimeout(() => setShowInstall(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handler);

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

  // Arrow key navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowLeft') setCardIndex(i => dir === 'rtl' ? Math.min(3, i + 1) : Math.max(0, i - 1));
      if (e.key === 'ArrowRight') setCardIndex(i => dir === 'rtl' ? Math.max(0, i - 1) : Math.min(3, i + 1));
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [dir]);

  function switchLang(code) {
    setLang(code);
    localStorage.setItem('wisdom-lang', code);
  }

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
        await navigator.share({ title: ui.appName, text: shareText, url: shareUrl });
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
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      vk: `https://vk.com/share.php?url=${encodedUrl}&title=${encodedText}`,
    };
    const target = urls[platform];
    if (!target) return;
    window.open(target, '_blank', 'noopener,noreferrer');
  }

  // Pointer-unified drag/swipe (handles both touch and mouse)
  function handlePointerDown(e) {
    dragStart.current = e.clientX;
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerUp(e) {
    if (dragStart.current === null) return;
    const dx = dragStart.current - e.clientX;
    dragStart.current = null;
    if (Math.abs(dx) < 40) return;
    if (dx > 0) setCardIndex(i => Math.min(3, i + 1));
    else setCardIndex(i => Math.max(0, i - 1));
  }

  function handlePointerCancel() {
    dragStart.current = null;
  }

  // Splash screen — shown after fonts.ready, hidden via CSS animationend
  if (showSplash) {
    return (
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: '#1a1a2e',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          animation: 'splashFade 2.2s ease forwards',
        }}
        onAnimationEnd={() => setShowSplash(false)}
      >
        <img
          src="/icons/icon-192.png"
          alt=""
          style={{ width: 96, height: 96, borderRadius: 22, animation: 'splashPulse 1.5s ease-in-out' }}
        />
        <div style={{
          marginTop: 24, fontSize: 18, letterSpacing: '0.2em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.8)', fontFamily: 'Georgia, serif',
        }}>
          {ui.appName}
        </div>
        <style>{`
          @keyframes splashFade {
            0%, 70% { opacity: 1; }
            100% { opacity: 0; pointer-events: none; }
          }
          @keyframes splashPulse {
            0%   { transform: scale(0.8); opacity: 0; }
            50%  { transform: scale(1.05); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div dir={dir} style={{
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '24px 16px 60px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: 'Georgia, serif',
    }}>

      {/* Decorative orbs */}
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', top: -150, right: -150, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', bottom: -80, left: -80, pointerEvents: 'none' }} />

      {/* Language switcher */}
      <div dir="ltr" style={{ display: 'flex', gap: 6, marginBottom: 28, background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: '4px 6px' }}>
        {LANGUAGES.map(l => (
          <button key={l.code} onClick={() => switchLang(l.code)} style={{
            background: lang === l.code ? 'rgba(255,255,255,0.15)' : 'transparent',
            border: 'none', borderRadius: 8, padding: '6px 12px',
            color: lang === l.code ? '#fff' : 'rgba(255,255,255,0.45)',
            fontSize: 11, letterSpacing: '0.1em', fontFamily: 'Georgia, serif',
            cursor: 'pointer', fontWeight: lang === l.code ? 600 : 400,
            transition: 'all 0.2s',
          }}>
            {l.label}
          </button>
        ))}
      </div>

      {/* Install banner */}
      {showInstall && !isInstalled && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          width: 'calc(100% - 32px)', maxWidth: 400,
          background: 'rgba(20,20,35,0.97)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20,
          padding: '18px 20px', zIndex: 1000,
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0, overflow: 'hidden' }}>
              <img src="/icons/icon-96.png" alt="" style={{ width: 48, height: 48 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4, fontFamily: 'Georgia, serif' }}>
                {ui.installTitle}
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
                {isIOS ? ui.installIOS : ui.installAndroid}
              </div>
            </div>
            <button onClick={() => setShowInstall(false)} style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)',
              fontSize: 20, cursor: 'pointer', padding: '0 0 0 4px', lineHeight: 1, flexShrink: 0,
            }}>&times;</button>
          </div>
          {!isIOS && installPrompt && (
            <button onClick={handleInstall} style={{
              marginTop: 14, width: '100%',
              background: `linear-gradient(135deg, ${color1}, ${color2})`,
              border: 'none', borderRadius: 12, padding: '12px',
              color: '#fff', fontSize: 13, letterSpacing: '0.1em',
              fontFamily: 'Georgia, serif', cursor: 'pointer', textTransform: 'uppercase',
            }}>
              {ui.installButton}
            </button>
          )}
        </div>
      )}

      {/* Horizontal card carousel */}
      <div
        dir="ltr"
        style={{ width: '100%', maxWidth: 440, overflow: 'hidden', touchAction: 'pan-y', cursor: 'grab' }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <div style={{
          display: 'flex',
          transform: `translateX(calc(-${cardIndex} * 100%))`,
          transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'transform',
        }}>
          {allCards.map((card, i) => (
            <div key={i} style={{ minWidth: '100%', display: 'flex', justifyContent: 'center' }}>
              <QuoteCard
                quote={card.quote}
                theme={card.theme}
                dayName={card.dayName}
                dateStr={card.dateStr}
                isToday={card.isToday}
                dir={dir}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Dot indicators */}
      <div style={{ display: 'flex', gap: 7, marginTop: 20, alignItems: 'center' }}>
        {allCards.map((_, i) => (
          <button key={i} onClick={() => setCardIndex(i)} style={{
            width: i === cardIndex ? 20 : 6,
            height: 6,
            borderRadius: 3,
            background: i === cardIndex ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
            border: 'none', padding: 0, cursor: 'pointer',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      {/* Share button */}
      <div style={{ marginTop: 24 }}>
        <button onClick={handleShare} style={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 50, padding: '13px 28px',
          color: '#ffffff', fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
          fontFamily: 'Georgia, serif', cursor: 'pointer', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', gap: 9,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          {ui.share}
        </button>
      </div>

      {/* Share panel (desktop) */}
      {showShare && (
        <div style={{
          marginTop: 14,
          background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)', borderRadius: 22,
          padding: '18px 20px', display: 'flex', gap: 10,
          flexWrap: 'wrap', justifyContent: 'center', maxWidth: 360,
          animation: 'fadeUp 0.3s ease forwards',
        }}>
          {[
            { id: 'telegram', label: 'Telegram', color: '#2AABEE', icon: '\u2708' },
            { id: 'whatsapp', label: 'WhatsApp', color: '#25D366', icon: '\uD83D\uDCAC' },
            { id: 'twitter', label: 'X / Twitter', color: '#14171A', icon: '\u2715' },
            { id: 'vk', label: '\u0412\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u0435', color: '#4C75A3', icon: '\u0412' },
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
            color: '#fff', fontSize: 11, fontFamily: 'Georgia, serif',
            display: 'flex', alignItems: 'center', gap: 7,
            minWidth: 130, justifyContent: 'center', cursor: 'pointer',
          }}>
            {copied ? ui.copied : `\uD83D\uDD17 ${ui.copyLink}`}
          </button>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 32, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: subtleColor }}>
        {ui.dayCounter} &middot; {dayOfYear} / 365
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
