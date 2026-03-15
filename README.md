# daily-wisdom-next

Ежедневные мудрые цитаты с красивыми OG-превью для Telegram и WhatsApp.

## Стек

- **Next.js 14** (App Router)
- **@vercel/og** — генерация OG-изображений через `satori` на Edge Runtime
- **React 18**

## Запуск

```bash
npm install
npm run dev
```

## OG Image

Превью генерируется динамически по адресу `/api/og`

Тестирование конкретного дня: `/api/og?day=42`

## Деплой

```bash
git init && git add . && git commit -m "init"
vercel
```

Установи переменную окружения в Vercel:
```
NEXT_PUBLIC_BASE_URL=https://твой-домен.vercel.app
```
