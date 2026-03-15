import { NextResponse } from 'next/server';

// Quote snippets for notification body (keep it short)
function getNotificationContent(lang) {
  const titles = {
    ru: 'Мудрость дня',
    en: 'Daily Wisdom',
    he: 'חוכמה יומית',
    ro: 'Înțelepciunea zilei',
  };
  const bodies = {
    ru: 'Новая цитата дня ждёт тебя ✦',
    en: 'Your new daily quote awaits ✦',
    he: '✦ ציטוט יומי חדש מחכה לך',
    ro: 'Un nou citat al zilei te așteaptă ✦',
  };
  return { title: titles[lang] || titles.ru, body: bodies[lang] || bodies.ru };
}

export async function POST(request) {
  // Verify cron secret or allow in development
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

  if (!redisUrl || !redisToken || !vapidPublicKey || !vapidPrivateKey) {
    return NextResponse.json({ error: 'Push not configured' }, { status: 503 });
  }

  try {
    const { Redis } = await import('@upstash/redis');
    const webpush = await import('web-push');

    const redis = new Redis({ url: redisUrl, token: redisToken });

    webpush.setVapidDetails(
      'mailto:noreply@daily-wisdom.app',
      vapidPublicKey,
      vapidPrivateKey
    );

    // Get all subscriber keys
    const keys = await redis.smembers('push:subscribers');
    let sent = 0;
    let failed = 0;

    for (const key of keys) {
      try {
        const data = await redis.get(key);
        if (!data) {
          await redis.srem('push:subscribers', key);
          continue;
        }

        const { subscription, lang } = typeof data === 'string' ? JSON.parse(data) : data;
        const { title, body } = getNotificationContent(lang);

        await webpush.sendNotification(subscription, JSON.stringify({
          title,
          body,
          icon: '/icons/icon-192.png',
          badge: '/icons/icon-96.png',
          data: { url: '/' },
        }));
        sent++;
      } catch (e) {
        // Remove invalid subscriptions (410 Gone, 404 Not Found)
        if (e.statusCode === 410 || e.statusCode === 404) {
          await redis.del(key);
          await redis.srem('push:subscribers', key);
        }
        failed++;
      }
    }

    return NextResponse.json({ sent, failed, total: keys.length });
  } catch (e) {
    console.error('Send push error:', e);
    return NextResponse.json({ error: 'Failed to send' }, { status: 500 });
  }
}
