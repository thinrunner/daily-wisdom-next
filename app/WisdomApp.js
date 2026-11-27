'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_THEME, dayKey, dayOfYear, daysInYear, parseDayKey, quoteForDay, shiftDayKey, themeFor } from '../lib/quotes';
import { DEFAULT_LANG, LANGUAGES, UI, formatDate, formatWeekday, isLang, isRTL, quoted } from '../lib/i18n';

const PAST_DAYS = 6; // сегодня + шесть предыдущих дней
const SWIPE_THRESHOLD = 40;
const INSTALL_SNOOZE_DAYS = 60;
const SUBTLE = 'rgba(255,255,255,0.5)';

// Каждый язык — отдельный чанк: клиент скачивает только выбранный.
const LOADERS = {
  ru: () => import('../lib/generated/quotes-ru.json'),
  en: () => import('../lib/generated/quotes-en.json'),
  he: () => import('../lib/generated/quotes-he.json'),
  ro: () => import('../lib/generated/quotes-ro.json'),
};

// localStorage бывает недоступен (приватный режим, запрет в настройках) — приложение должно работать и без него.
const store = {
  get(key) {
    try { return window.localStorage.getItem(key); } catch { return null; }
  },
  set(key, value) {
    try { window.localStorage.setItem(key, value); } catch {}
  },
};

// Короткий тактильный отклик. Работает там, где браузер это умеет (Android); в остальных молча ничего не делает.
function buzz(ms = 8) {
  try { navigator.vibrate?.(ms); } catch {}
}

function Heart({ filled, size = 18 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round">
      <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7c0 5.6-7.5 10.2-7.5 10.2z" />
    </svg>
  );
}

function QuoteCard({ quote, dayName, dateStr, dir, hidden }) {
  const long = quote.text.length > 130;
  // разрядка красит латиницу и кириллицу, но рвёт слова на иврите
  const wide = dir === 'rtl' ? '0.08em' : undefined;
  return (
    <article dir={dir} aria-hidden={hidden || undefined} style={{
      background: 'rgba(255,255,255,0.07)',
      backdropFilter: 'blur(24px)',
      WebkitBackdropFilter: 'blur(24px)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 28,
      padding: 'clamp(40px, 12vw, 56px) clamp(24px, 9vw, 44px) clamp(38px, 11vw, 52px)',
      width: '100%',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
      textAlign: 'center',
      boxShadow: '0 30px 60px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)',
      userSelect: 'none', WebkitUserSelect: 'none',
    }}>
      <div style={{ fontSize: 10, letterSpacing: wide || '0.25em', textTransform: 'uppercase', color: SUBTLE, marginBottom: 12 }}>
        {dateStr}
      </div>
      <div style={{ fontSize: 14, letterSpacing: wide || '0.35em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 32, fontWeight: 600 }}>
        {dayName}
      </div>
      <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.2)', margin: '0 auto 28px' }} />
      <div aria-hidden="true" style={{ fontSize: 80, lineHeight: 0.5, color: 'rgba(255,255,255,0.1)', marginBottom: 24 }}>&ldquo;</div>
      <p style={{
        fontSize: long ? 18 : 20, lineHeight: 1.75, color: '#fff',
        fontStyle: 'italic', margin: '0 0 40px', letterSpacing: '0.02em',
        textWrap: 'balance',
      }}>
        {quote.text}
      </p>
      <div style={{ width: 40, height: 1, background: 'rgba(255,255,255,0.2)', margin: '0 auto 28px' }} />
      <div style={{ fontSize: wide ? 13 : 11, letterSpacing: wide || '0.3em', textTransform: 'uppercase', color: SUBTLE }}>
        {quote.author}
      </div>
      {quote.source && (
        <div style={{ marginTop: 10, fontSize: 12, fontStyle: 'italic', color: 'rgba(255,255,255,0.4)' }}>
          {quote.source}
        </div>
      )}
    </article>
  );
}

export default function WisdomApp() {
  // До монтирования не знаем ни дату пользователя, ни язык — сервер их не угадывает,
  // иначе в HTML попадёт чужая цитата и мелькнёт при загрузке.
  const [today, setToday] = useState(null);
  const [wantedLang, setWantedLang] = useState(null);
  const [active, setActive] = useState(null); // { lang, quotes } — то, что реально на экране
  const [index, setIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [copied, setCopied] = useState(false);
  const [install, setInstall] = useState(null); // null | 'ios' | 'prompt'
  const installPrompt = useRef(null);
  const dragStart = useRef(null);
  const copiedTimer = useRef(null);
  const [favorites, setFavorites] = useState([]); // id цитат, новые в начале
  const [showFavorites, setShowFavorites] = useState(false);
  const [saving, setSaving] = useState(false);
  const lastIndex = useRef(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const saved = store.get('wisdom-lang');
    const linkLang = params.get('lang');
    const browserLang = navigator.language?.slice(0, 2);
    setWantedLang([saved, linkLang, browserLang].find(isLang) || DEFAULT_LANG);

    const now = dayKey();
    setToday(now);

    try {
      const stored = JSON.parse(store.get('wisdom-favorites') || '[]');
      if (Array.isArray(stored)) setFavorites(stored.filter((id) => typeof id === 'string'));
    } catch {}

    // Ссылка, которой поделились, открывает ту самую цитату, если она ещё в ленте.
    const linked = parseDayKey(params.get('d'));
    if (linked) {
      const offset = parseDayKey(now).dayNumber - linked.dayNumber;
      if (offset > 0 && offset <= PAST_DAYS) setIndex(offset);
    }
    if (window.location.search) window.history.replaceState(null, '', window.location.pathname);

    const installed =
      window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    if (installed) {
      let seen = false;
      try {
        seen = Boolean(window.sessionStorage.getItem('splash-shown'));
        window.sessionStorage.setItem('splash-shown', '1');
      } catch {}
      if (!seen) setShowSplash(true);
      return;
    }

    // Установку предлагаем только тем, кто вернулся в другой день, и не чаще раза в два месяца.
    const firstVisit = store.get('wisdom-first-visit');
    if (!firstVisit) store.set('wisdom-first-visit', now);
    const returning = Boolean(firstVisit) && firstVisit !== now;
    const snoozedUntil = Number(store.get('wisdom-install-snooze')) || 0;
    if (!returning || Date.now() < snoozedUntil) return;

    let timer;
    const offer = (kind) => { timer = setTimeout(() => setInstall(kind), 4000); };
    const onPrompt = (e) => {
      e.preventDefault();
      installPrompt.current = e;
      offer('prompt');
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    const ua = navigator.userAgent;
    if (/iphone|ipad|ipod/i.test(ua) && /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua)) offer('ios');

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', onPrompt);
    };
  }, []);

  // Открытая вкладка или установленное приложение переживают полночь — подхватываем новый день.
  useEffect(() => {
    const check = () => {
      if (document.visibilityState !== 'visible') return;
      const now = dayKey();
      setToday((prev) => {
        if (prev && prev !== now) setIndex(0);
        return now;
      });
    };
    const timer = setInterval(check, 60000);
    document.addEventListener('visibilitychange', check);
    window.addEventListener('focus', check);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', check);
      window.removeEventListener('focus', check);
    };
  }, []);

  useEffect(() => {
    if (!wantedLang) return;
    let cancelled = false;
    LOADERS[wantedLang]()
      .then((mod) => { if (!cancelled) setActive({ lang: wantedLang, quotes: mod.default }); })
      .catch(() => {}); // офлайн без этого языка в кеше — остаёмся на прежнем
    return () => { cancelled = true; };
  }, [wantedLang]);

  const lang = active?.lang || wantedLang || DEFAULT_LANG;
  const ui = UI[lang];
  const dir = isRTL(lang) ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const cards = useMemo(() => {
    if (!today || !active) return [];
    return Array.from({ length: PAST_DAYS + 1 }, (_, offset) => {
      const day = shiftDayKey(today, -offset);
      const quote = quoteForDay(active.quotes, day);
      return {
        day, quote,
        theme: themeFor(quote),
        dayName: formatWeekday(day, active.lang),
        dateStr: formatDate(day, active.lang),
      };
    });
  }, [today, active]);

  const ready = cards.length > 0;
  const last = Math.max(0, cards.length - 1);
  const current = cards[Math.min(index, last)];
  const go = useCallback((step) => setIndex((i) => Math.min(PAST_DAYS, Math.max(0, i + step))), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'Escape') { setShowShare(false); setShowFavorites(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  useEffect(() => () => clearTimeout(copiedTimer.current), []);

  useEffect(() => {
    if (lastIndex.current !== index) buzz();
    lastIndex.current = index;
  }, [index]);

  const byId = useMemo(() => new Map((active?.quotes || []).map((q) => [q.id, q])), [active]);
  const favoriteQuotes = favorites.map((id) => byId.get(id)).filter(Boolean);

  function toggleFavorite(id) {
    buzz(12);
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [id, ...prev];
      store.set('wisdom-favorites', JSON.stringify(next));
      return next;
    });
  }

  // Вертикальная картинка для сторис и статусов: на телефоне уходит в системное «Поделиться»
  // (оттуда же — «Сохранить в Фото»), на десктопе скачивается файлом.
  async function handleSaveImage() {
    if (!current || saving) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/og?d=${current.day}&lang=${lang}&format=story`);
      if (!response.ok) throw new Error(String(response.status));
      const blob = await response.blob();
      const file = new File([blob], `wisdom-${current.day}.png`, { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        const href = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = file.name;
        link.click();
        setTimeout(() => URL.revokeObjectURL(href), 1000);
      }
    } catch {
      // офлайн или пользователь закрыл системное окно — молча остаёмся как были
    } finally {
      setSaving(false);
    }
  }

  function switchLang(code) {
    setWantedLang(code);
    store.set('wisdom-lang', code);
  }

  function dismissInstall() {
    setInstall(null);
    store.set('wisdom-install-snooze', String(Date.now() + INSTALL_SNOOZE_DAYS * 86400000));
  }

  async function handleInstall() {
    const prompt = installPrompt.current;
    if (!prompt) return;
    installPrompt.current = null;
    prompt.prompt();
    await prompt.userChoice.catch(() => {});
    dismissInstall();
  }

  // Делимся той карточкой, что на экране; ссылка несёт день и язык, чтобы превью показало именно её.
  const shareText = current ? quoted(current.quote.text, current.quote.author, lang) : '';
  const shareUrl = () => `${window.location.origin}/?d=${current.day}&lang=${lang}`;

  async function handleShare() {
    if (!current) return;
    if (navigator.share) {
      try {
        await navigator.share({ title: ui.appName, text: shareText, url: shareUrl() });
        return;
      } catch (e) {
        if (e?.name === 'AbortError') return; // пользователь сам закрыл системное окно
      }
    }
    setShowShare((s) => !s);
  }

  async function handleCopy() {
    const url = shareUrl();
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt(ui.copyLink, url);
      return;
    }
    setCopied(true);
    clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(false), 2000);
  }

  function shareOn(platform) {
    const url = encodeURIComponent(shareUrl());
    const text = encodeURIComponent(shareText);
    const targets = {
      telegram: `https://t.me/share/url?url=${url}&text=${text}`,
      whatsapp: `https://api.whatsapp.com/send?text=${text}%0A${url}`,
      x: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
    };
    window.open(targets[platform], '_blank', 'noopener,noreferrer');
  }

  function onPointerDown(e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragStart.current = e.clientX;
    setDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e) {
    if (dragStart.current === null) return;
    let dx = e.clientX - dragStart.current;
    // у краёв лента тянется туже — видно, что дальше карточек нет
    if ((index === 0 && dx > 0) || (index === last && dx < 0)) dx /= 3;
    setDragX(dx);
  }

  function endDrag(e, cancelled) {
    if (dragStart.current === null) return;
    const dx = e.clientX - dragStart.current;
    dragStart.current = null;
    setDragging(false);
    setDragX(0);
    if (!cancelled && Math.abs(dx) >= SWIPE_THRESHOLD) go(dx < 0 ? 1 : -1);
  }

  const pill = {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 50, color: '#fff', cursor: 'pointer',
    fontSize: 11, letterSpacing: '0.12em',
  };

  const iconButton = {
    ...pill, width: 44, height: 44, padding: 0, flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  };

  // последняя цитата убрана из избранного — пустой список закрываем
  if (showFavorites && favoriteQuotes.length === 0) setShowFavorites(false);

  return (
    <main dir={dir} style={{
      minHeight: '100dvh',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: 'max(24px, env(safe-area-inset-top)) 16px max(48px, env(safe-area-inset-bottom))',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Фон: по слою на карточку, плавно меняется вслед за настроением цитаты */}
      {(ready ? cards : [{ day: 'placeholder', theme: DEFAULT_THEME }]).map((card, i) => (
        <div key={card.day} aria-hidden="true" style={{
          position: 'fixed', inset: 0, zIndex: -1,
          background: `linear-gradient(135deg, ${card.theme[0]} 0%, ${card.theme[1]} 100%)`,
          opacity: !ready || i === index ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }} />
      ))}
      <div aria-hidden="true" style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', top: -150, right: -150, pointerEvents: 'none' }} />
      <div aria-hidden="true" style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.02)', bottom: -80, left: -80, pointerEvents: 'none' }} />

      {showSplash && (
        <div className="splash" onAnimationEnd={(e) => { if (e.target === e.currentTarget) setShowSplash(false); }}>
          <img src="/icons/icon-192.png" alt="" width={96} height={96} style={{ borderRadius: 22 }} />
          <div style={{ marginTop: 24, fontSize: 18, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.8)' }}>
            {ui.appName}
          </div>
        </div>
      )}

      <nav dir="ltr" aria-label={ui.language} style={{
        display: 'flex', gap: 6, marginBottom: 28,
        background: 'rgba(0,0,0,0.2)', borderRadius: 12, padding: '4px 6px',
        opacity: ready ? 1 : 0, transition: 'opacity 0.4s ease',
      }}>
        {LANGUAGES.map((l) => {
          const on = lang === l.code;
          return (
            <button key={l.code} onClick={() => switchLang(l.code)} aria-pressed={on} title={l.name} lang={l.code} style={{
              background: on ? 'rgba(255,255,255,0.15)' : 'transparent',
              border: 'none', borderRadius: 8, padding: '8px 12px',
              color: on ? '#fff' : 'rgba(255,255,255,0.55)',
              fontSize: 11, letterSpacing: '0.1em', cursor: 'pointer',
              fontWeight: on ? 600 : 400, transition: 'background 0.2s, color 0.2s',
            }}>
              {l.label}
            </button>
          );
        })}
      </nav>

      {ready && (
        <div className="fade-up" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div
            dir="ltr"
            role="group"
            aria-roledescription="carousel"
            style={{ width: '100%', maxWidth: 440, overflow: 'hidden', touchAction: 'pan-y', cursor: dragging ? 'grabbing' : 'grab', borderRadius: 28 }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={(e) => endDrag(e, false)}
            onPointerCancel={(e) => endDrag(e, true)}
          >
            <div style={{
              display: 'flex',
              transform: `translateX(calc(${-index * 100}% + ${dragX}px))`,
              transition: dragging ? 'none' : 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
              willChange: 'transform',
            }}>
              {cards.map((card, i) => (
                <div key={card.day} style={{ minWidth: '100%', display: 'flex' }}>
                  <QuoteCard quote={card.quote} dayName={card.dayName} dateStr={card.dateStr} dir={dir} hidden={i !== index} />
                </div>
              ))}
            </div>
          </div>

          <div dir="ltr" style={{ display: 'flex', marginTop: 12, alignItems: 'center' }}>
            {cards.map((card, i) => (
              <button key={card.day} onClick={() => setIndex(i)}
                aria-label={`${ui.showDay} ${card.dateStr}`} aria-current={i === index || undefined}
                style={{ background: 'none', border: 'none', padding: '12px 4px', cursor: 'pointer' }}>
                <span style={{
                  display: 'block', height: 6, borderRadius: 3,
                  width: i === index ? 20 : 6,
                  background: i === index ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
                  transition: 'width 0.3s ease, background 0.3s ease',
                }} />
              </button>
            ))}
          </div>

          <div dir="ltr" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
          <button onClick={() => toggleFavorite(current.quote.id)}
            aria-pressed={favorites.includes(current.quote.id)}
            aria-label={favorites.includes(current.quote.id) ? ui.unfavorite : ui.favorite}
            title={favorites.includes(current.quote.id) ? ui.unfavorite : ui.favorite}
            style={iconButton}>
            <Heart filled={favorites.includes(current.quote.id)} />
          </button>
          <button onClick={handleShare} aria-expanded={showShare} style={{
            ...pill, padding: '13px 28px',
            fontSize: 11, letterSpacing: '0.22em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 9,
          }}>
            <svg aria-hidden="true" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
            {ui.share}
          </button>
          <button onClick={handleSaveImage} disabled={saving} aria-label={ui.saveImage} title={ui.saveImage}
            style={{ ...iconButton, opacity: saving ? 0.5 : 1 }}>
            <svg aria-hidden="true" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 4v11" /><path d="M7.5 10.5 12 15l4.5-4.5" /><path d="M5 19.5h14" />
            </svg>
          </button>
          </div>

          {/* Запасной вариант там, где нет системного окна «Поделиться» (десктоп) */}
          {showShare && (
            <div className="fade-up" style={{ marginTop: 14, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 360 }}>
              {[['telegram', 'Telegram'], ['whatsapp', 'WhatsApp'], ['x', 'X']].map(([id, label]) => (
                <button key={id} onClick={() => shareOn(id)} style={{ ...pill, padding: '10px 18px' }}>{label}</button>
              ))}
              <button onClick={handleCopy} aria-live="polite" style={{ ...pill, padding: '10px 18px' }}>
                {copied ? `✓ ${ui.copied}` : ui.copyLink}
              </button>
            </div>
          )}

          <footer style={{ marginTop: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: SUBTLE }}>
            {favoriteQuotes.length > 0 && (
              <button onClick={() => setShowFavorites(true)} style={{
                background: 'none', border: 'none', padding: '8px 12px', cursor: 'pointer',
                color: 'rgba(255,255,255,0.7)', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
                display: 'flex', alignItems: 'center', gap: 7,
              }}>
                <Heart filled size={11} />
                {ui.favorites} &middot; {favoriteQuotes.length}
              </button>
            )}
            <div>{ui.appName} &middot; <span dir="ltr">{dayOfYear(today)} / {daysInYear(today)}</span></div>
          </footer>
        </div>
      )}

      {showFavorites && (
        <div role="dialog" aria-modal="true" aria-label={ui.favorites} className="sheet"
          onClick={(e) => { if (e.target === e.currentTarget) setShowFavorites(false); }}>
          <div className="sheet-panel">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <div style={{ fontSize: 12, letterSpacing: '0.25em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
                {ui.favorites}
              </div>
              <button onClick={() => setShowFavorites(false)} aria-label={ui.close} style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.6)',
                fontSize: 26, lineHeight: 1, cursor: 'pointer', padding: '4px 8px',
              }}>&times;</button>
            </div>
            {favoriteQuotes.map((q) => (
              <div key={q.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '18px 0', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 8px', fontSize: 16, lineHeight: 1.6, fontStyle: 'italic' }}>{q.text}</p>
                  <div style={{ fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: SUBTLE }}>{q.author}</div>
                </div>
                <button onClick={() => toggleFavorite(q.id)} aria-label={ui.unfavorite} title={ui.unfavorite}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.75)', cursor: 'pointer', padding: 8, flexShrink: 0 }}>
                  <Heart filled />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {install && (
        <div role="dialog" aria-label={ui.installButton} className="slide-up" style={{
          position: 'fixed', bottom: 'max(24px, env(safe-area-inset-bottom))', left: '50%',
          width: 'calc(100% - 32px)', maxWidth: 400,
          background: 'rgba(20,20,35,0.97)',
          border: '1px solid rgba(255,255,255,0.15)', borderRadius: 20,
          padding: '18px 20px', zIndex: 1000,
          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <img src="/icons/icon-96.png" alt="" width={48} height={48} style={{ borderRadius: 12, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{ui.appName}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.5 }}>
                {install === 'ios' ? ui.installIOS : ui.installAndroid}
              </div>
            </div>
            <button onClick={dismissInstall} aria-label={ui.close} style={{
              background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
              fontSize: 22, cursor: 'pointer', padding: '0 4px', lineHeight: 1, flexShrink: 0,
            }}>&times;</button>
          </div>
          {install === 'prompt' && (
            <button onClick={handleInstall} style={{
              marginTop: 14, width: '100%',
              background: 'rgba(255,255,255,0.14)',
              border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12, padding: 12,
              color: '#fff', fontSize: 13, letterSpacing: '0.1em',
              cursor: 'pointer', textTransform: 'uppercase',
            }}>
              {ui.installButton}
            </button>
          )}
        </div>
      )}
    </main>
  );
}
