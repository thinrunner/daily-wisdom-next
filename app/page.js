'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { MOOD_THEMES, getDayOfYear, getQuoteForDay } from '../lib/quotes';
import { LANGUAGES, DAYS, MONTHS, UI, isRTL, getDateStr } from '../lib/i18n';
import { getMusicForMood } from '../lib/music';
import { subscribeToPush, unsubscribeFromPush, isSubscribed } from '../lib/notifications';

function QuoteCard({ quote, theme, dayName, dateStr, isToday, cardRef, dir }) {
  const [color1, color2] = theme.bg;
  const textColor = '#ffffff';
  const subtleColor = 'rgba(255,255,255,0.5)';
  const borderColor = 'rgba(255,255,255,0.12)';
  const cardBg = isToday ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)';

  return (
    <div ref={cardRef} dir={dir} style={{
      background: isToday ? cardBg : `linear-gradient(135deg, ${color1}, ${color2})`,
      backdropFilter: isToday ? 'blur(24px)' : undefined,
      WebkitBackdropFilter: isToday ? 'blur(24px)' : undefined,
      border: `1px solid ${borderColor}`,
      borderRadius: isToday ? 28 : 20,
      padding: isToday ? '56px 44px 52px' : '32px 28px 28px',
      maxWidth: 440,
      width: '100%',
      textAlign: 'center',
      boxShadow: isToday
        ? '0 40px 80px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.08)'
        : '0 12px 32px rgba(0,0,0,0.3)',
      animation: isToday ? 'fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards' : undefined,
      opacity: isToday ? undefined : 0.75,
    }}>
      {dateStr && (
        <div style={{ fontSize: isToday ? 10 : 9, letterSpacing: '0.25em', textTransform: 'uppercase', color: subtleColor, marginBottom: isToday ? 12 : 8 }}>
          {dateStr}
        </div>
      )}
      <div style={{ fontSize: isToday ? 14 : 11, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: isToday ? 32 : 20, fontWeight: 600 }}>
        {dayName}
      </div>
      <div style={{ width: isToday ? 40 : 28, height: 1, background: 'rgba(255,255,255,0.2)', margin: `0 auto ${isToday ? 28 : 16}px` }} />
      {isToday && (
        <div style={{ fontSize: 80, lineHeight: 0.5, color: 'rgba(255,255,255,0.1)', marginBottom: 24, userSelect: 'none' }}>&ldquo;</div>
      )}
      <p style={{
        fontSize: isToday ? 20 : 15, lineHeight: isToday ? 1.75 : 1.6, color: textColor,
        fontStyle: 'italic', fontFamily: 'Georgia, serif',
        margin: `0 0 ${isToday ? 40 : 20}px`, letterSpacing: '0.02em',
      }}>
        {quote.text}
      </p>
      <div style={{ width: isToday ? 40 : 28, height: 1, background: 'rgba(255,255,255,0.2)', margin: `0 auto ${isToday ? 28 : 16}px` }} />
      <div style={{ fontSize: isToday ? 11 : 9, letterSpacing: '0.35em', textTransform: 'uppercase', color: subtleColor, fontVariant: 'small-caps' }}>
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
  const [savingImage, setSavingImage] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const cardRef = useRef(null);

  const date = new Date();
  const dayOfYear = getDayOfYear(date);
  const quote = getQuoteForDay(dayOfYear, lang);
  const theme = MOOD_THEMES[quote.mood] || MOOD_THEMES.calm;
  const [color1, color2] = theme.bg;
  const dir = isRTL(lang) ? 'rtl' : 'ltr';

  const textColor = '#ffffff';
  const subtleColor = 'rgba(255,255,255,0.5)';

  const dayName = DAYS[lang][date.getDay()];
  const dateStr = getDateStr(date, lang);
  const ui = UI[lang];

  // Past 3 days
  const pastDays = [1, 2, 3].map(offset => {
    const pastDate = new Date(date);
    pastDate.setDate(pastDate.getDate() - offset);
    const pastDayOfYear = getDayOfYear(pastDate);
    const pastQuote = getQuoteForDay(pastDayOfYear, lang);
    const pastTheme = MOOD_THEMES[pastQuote.mood] || MOOD_THEMES.calm;
    const pastDayName = DAYS[lang][pastDate.getDay()];
    const pastDateStr = getDateStr(pastDate, lang);
    return { quote: pastQuote, theme: pastTheme, dayName: pastDayName, dateStr: pastDateStr };
  });

  // Music suggestion for today's mood
  const music = getMusicForMood(quote.mood, dayOfYear);

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://daily-wisdom-next.vercel.app';
  const shareUrl = BASE_URL;
  const shareText = `«${quote.text}» — ${quote.author}`;

  useEffect(() => {
    // Load saved language
    const saved = localStorage.getItem('wisdom-lang');
    if (saved && ['ru', 'en', 'he', 'ro'].includes(saved)) {
      setLang(saved);
    } else {
      const browserLang = navigator.language?.slice(0, 2);
      if (['en', 'he', 'ro'].includes(browserLang)) setLang(browserLang);
    }

    // Splash screen — only in standalone PWA mode
    const installed =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    setIsInstalled(installed);

    // Check notification subscription status
    isSubscribed().then(setNotifEnabled);

    if (installed) {
      const splashShown = sessionStorage.getItem('splash-shown');
      if (!splashShown) {
        setShowSplash(true);
        sessionStorage.setItem('splash-shown', '1');
        setTimeout(() => setShowSplash(false), 2200);
      }
      return;
    }

    // iOS detection
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    // Android: beforeinstallprompt
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setTimeout(() => setShowInstall(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // iOS install hint
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

  function switchLang(code) {
    setLang(code);
    localStorage.setItem('wisdom-lang', code);
  }

  async function toggleNotifications() {
    if (notifEnabled) {
      await unsubscribeFromPush();
      setNotifEnabled(false);
    } else {
      const sub = await subscribeToPush(lang);
      setNotifEnabled(!!sub);
    }
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
    window.open(urls[platform], '_blank');
  }

  const handleSaveImage = useCallback(async () => {
    if (!cardRef.current || savingImage) return;
    setSavingImage(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: color1,
        scale: 2,
        useCORS: true,
        logging: false,
      });

      canvas.toBlob(async (blob) => {
        if (!blob) { setSavingImage(false); return; }
        const file = new File([blob], 'daily-wisdom.png', { type: 'image/png' });

        // Try native share with file first (mobile)
        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file], title: ui.appName, text: shareText });
            setSavingImage(false);
            return;
          } catch (e) {}
        }

        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'daily-wisdom.png';
        a.click();
        URL.revokeObjectURL(url);
        setSavingImage(false);
      }, 'image/png');
    } catch (e) {
      console.error('Save image error:', e);
      setSavingImage(false);
    }
  }, [savingImage, color1, ui.appName, shareText]);

  // Splash screen overlay
  if (showSplash) {
    return (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#1a1a2e',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        animation: 'splashFade 2.2s ease forwards',
      }}>
        <img
          src="/icons/icon-192.png"
          alt=""
          style={{
            width: 96, height: 96, borderRadius: 22,
            animation: 'splashPulse 1.5s ease-in-out',
          }}
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
            0% { transform: scale(0.8); opacity: 0; }
            50% { transform: scale(1.05); opacity: 1; }
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

      {/* Language switcher */}
      <div style={{
        display: 'flex', gap: 6, marginBottom: 20,
        background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: '4px 6px',
      }}>
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

      {/* Notification bell */}
      <button onClick={toggleNotifications} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        marginBottom: 12, padding: 8, display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke={notifEnabled ? '#FFCA28' : 'rgba(255,255,255,0.35)'} strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span style={{
          fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase',
          color: notifEnabled ? '#FFCA28' : 'rgba(255,255,255,0.35)',
          fontFamily: 'Georgia, serif',
        }}>
          {notifEnabled ? 'ON' : 'OFF'}
        </span>
      </button>

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
            <div style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              background: `linear-gradient(135deg, ${color1}, ${color2})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, overflow: 'hidden',
            }}>
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

      {/* Date */}
      <div style={{ fontSize: 11, letterSpacing: '0.25em', textTransform: 'uppercase', color: subtleColor, marginBottom: 16 }}>
        {dateStr}
      </div>

      {/* Today's card */}
      <QuoteCard
        quote={quote}
        theme={theme}
        dayName={dayName}
        isToday={true}
        cardRef={cardRef}
        dir={dir}
      />

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Share button */}
        <button onClick={handleShare} style={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 50, padding: '13px 28px',
          color: textColor, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
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

        {/* Save image button */}
        <button onClick={handleSaveImage} disabled={savingImage} style={{
          background: 'rgba(255,255,255,0.1)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: 50, padding: '13px 28px',
          color: textColor, fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
          fontFamily: 'Georgia, serif', cursor: savingImage ? 'wait' : 'pointer',
          backdropFilter: 'blur(10px)', display: 'flex', alignItems: 'center', gap: 9,
          opacity: savingImage ? 0.6 : 1,
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          {ui.saveImage}
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

      {/* Music suggestion */}
      {music && (
        <div style={{
          marginTop: 28, maxWidth: 440, width: '100%',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 16, padding: '16px 20px',
          animation: 'fadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}>
          <div style={{ fontSize: 9, letterSpacing: '0.3em', textTransform: 'uppercase', color: subtleColor, marginBottom: 12 }}>
            {ui.musicTitle}
          </div>
          <div style={{ fontSize: 14, color: '#fff', marginBottom: 4, fontFamily: 'Georgia, serif' }}>
            {music.name}
          </div>
          <div style={{ fontSize: 11, color: subtleColor, marginBottom: 14 }}>
            {music.artist}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <a href={music.spotify} target="_blank" rel="noopener noreferrer" style={{
              background: '#1DB954', border: 'none', borderRadius: 10,
              padding: '9px 18px', color: '#fff', fontSize: 11,
              fontFamily: 'Georgia, serif', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Spotify
            </a>
            <a href={music.youtube} target="_blank" rel="noopener noreferrer" style={{
              background: '#FF0000', border: 'none', borderRadius: 10,
              padding: '9px 18px', color: '#fff', fontSize: 11,
              fontFamily: 'Georgia, serif', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
              YouTube
            </a>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{ marginTop: 32, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: subtleColor }}>
        {ui.dayCounter} &middot; {dayOfYear} / 365
      </div>

      {/* Past days section */}
      <div style={{ marginTop: 40, maxWidth: 440, width: '100%' }}>
        <div style={{
          fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
          color: subtleColor, marginBottom: 16, textAlign: 'center',
        }}>
          {ui.recent}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {pastDays.map((pd, i) => (
            <QuoteCard
              key={i}
              quote={pd.quote}
              theme={pd.theme}
              dayName={pd.dayName}
              dateStr={pd.dateStr}
              isToday={false}
              dir={dir}
            />
          ))}
        </div>
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
