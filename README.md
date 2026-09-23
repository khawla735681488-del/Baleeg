# YemenDub AI

مشروع SaaS حقيقي لتوليد ودبلجة الفيديو إلى العربية مع التركيز على اللهجات اليمنية.

## المكونات

- Frontend: Next.js
- Backend: Express + TypeScript + Prisma
- Database: PostgreSQL
- Queue: Redis + BullMQ
- Audio processing: FFmpeg
- Storage: local filesystem (قابل للتبديل إلى S3)

## التشغيل السريع

1. تثبيت التبعيات:
   ```bash
   npm install
   ```
2. إنشاء قاعدة البيانات والـ Redis:
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
5. افتح الواجهة:
   - Frontend: http://localhost:3000
   - API: http://localhost:8080/health

## مسارات API الرئيسية

- `POST /api/projects/upload`
- `POST /api/projects/from-url`
- `GET /api/projects/:id`
- `POST /api/projects/:id/process`
- `PATCH /api/projects/:projectId/segments/:segmentId`
- `POST /api/projects/:id/export`

## الملاحظات

هذا المشروع هو أساس حقيقي قابل للتوسع، لكنه لا يحل كل طبقة الذكاء الاصطناعي من دون مفاتيح Azure/OpenAI والـ FFmpeg في البيئة المحلية. وهو جاهز لربط Whisper وTTS وDiarization مباشرة في الـ pipeline.
