import { NextResponse } from 'next/server';

export async function POST(request) {
  // Only enable if Upstash credentials are configured
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    return NextResponse.json({ error: 'Push notifications not configured' }, { status: 503 });
  }

  try {
    const { subscription, lang } = await request.json();
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
    }

    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({ url: redisUrl, token: redisToken });

    // Store subscription with language preference, keyed by endpoint hash
    const key = `push:${Buffer.from(subscription.endpoint).toString('base64url').slice(0, 32)}`;
    await redis.set(key, JSON.stringify({ subscription, lang: lang || 'ru' }));
    // Add to set for easy iteration
    await redis.sadd('push:subscribers', key);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Subscribe error:', e);
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
  const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!redisUrl || !redisToken) {
    return NextResponse.json({ error: 'Push notifications not configured' }, { status: 503 });
  }

  try {
    const { endpoint } = await request.json();
    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
    }

    const { Redis } = await import('@upstash/redis');
    const redis = new Redis({ url: redisUrl, token: redisToken });

    const key = `push:${Buffer.from(endpoint).toString('base64url').slice(0, 32)}`;
    await redis.del(key);
    await redis.srem('push:subscribers', key);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Unsubscribe error:', e);
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 });
  }
}
