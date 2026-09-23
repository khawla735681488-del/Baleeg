# YemenDub AI

مشروع SaaS حقيقي لتوليج ودبلجة الفيديو إلى العربية مع التركيز على اللهجات اليمنية.

## المرحلة الثالثة

تم تنفيذ الطبقات التالية فعلياً:
- معالجة المشاريع عبر Queue Worker
- استخراج وتوليد المقاطع النصية من الفيديو
- خدمة AI pipeline جاهزة للتوسيع
- تحرير نص المقاطع وتوقيتها من الواجهة
- تصدير الفيديو النهائي عبر API
- دعم رفع فيديو أو رابط URL

## التقنيات المستخدمة

- Frontend: Next.js
- Backend: Express + TypeScript
- Prisma + PostgreSQL
- Redis + BullMQ
- FFmpeg

## التشغيل المحلي

```bash
npm install
cp .env.example .env
docker compose up -d
npm run db:generate
npm run db:push
npm run dev
```

- Frontend: http://localhost:3000
- API: http://localhost:8080/health

## ملاحظات

هذا المشروع الآن في مرحلة pipeline عملية قابلة للتوسع، مع دعم أساسي للتحليل، الترجمة، التعديل، والتصدير، ويمكن ربط مزودات AI حقيقية مثل Whisper وAzure Speech لاحقاً.
