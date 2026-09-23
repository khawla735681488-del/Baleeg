# YemenDub AI

مشروع SaaS حقيقي لتوليد ودبلجة الفيديو إلى العربية مع التركيز على اللهجات اليمنية.

## المرحلة الثانية

تمت إضافة:
- واجهة لوحة المشاريع
- رفع فيديو أو رابط URL
- تشغيل المعالجة عبر Queues
- عرض حالة المشروع والتقدم
- التعامل مع المقاطع النصية والتوقيت
- تحميل الفيديو النهائي وتجهيز التصدير

## الطبقات الحالية

- Frontend: Next.js
- Backend: Express + TypeScript
- Database: PostgreSQL + Prisma
- Queue: Redis + BullMQ
- Media processing: FFmpeg

## التشغيل السريع

1. تثبيت التبعيات:
   ```bash
   npm install
   ```
2. تشغيل قاعدة البيانات والـ Redis:
   ```bash
   docker compose up -d
   ```
3. إنشاء قاعدة البيانات Prisma:
   ```bash
   npm run db:generate
   npm run db:push
   ```
4. تشغيل المشروع:
   ```bash
   npm run dev
   ```
5. افتح التطبيق:
   - Frontend: http://localhost:3000
   - API: http://localhost:8080/health

## ملاحظات حرجة

- هذه المرحلة تمثل قاعدة تشغيلية حقيقية، قابلة للتوسع.
- لا تزال طبقة الذكاء الاصطناعي (Whisper, Diarization, TTS, Translation) تحتاج إلى ربط مزودات حقيقية عبر OPENAI/Azure.
- إذا تم تفعيل FFmpeg في الجهاز، ستعمل معالجة الملفات الأساسية محلياً.
