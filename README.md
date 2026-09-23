# YemenDub AI — Android

تطبيق Android حقيقي لواجهة YemenDub AI، متصل بواجهة Backend لمعالجة الفيديو، استخراج الكلام، تحديد المتحدثين، ترجمة السياق، توليد الصوت والتصدير.

## التشغيل

1. افتح المشروع في Android Studio Hedgehog أو أحدث.
2. شغّل `./gradlew :app:assembleDebug`.
3. عيّن عنوان الـ Backend في `app/build.gradle.kts` عبر `BuildConfig.API_BASE_URL`. المحاكي يستخدم افتراضياً `http://10.0.2.2:8080/`.
4. لا يتم تضمين مفاتيح مزودي الذكاء الاصطناعي داخل التطبيق؛ المصادقة والمعالجة يجب أن تكون في Backend.

## عقد Backend المطلوب

التطبيق يستخدم REST endpoints حقيقية:

- `POST /v1/projects/upload` — multipart: `video`, `dialect`, `addSubtitles`
- `POST /v1/projects/from-url` — `{ url, dialect, addSubtitles }`
- `GET /v1/projects/{id}` — يعيد المشروع وحالته والمقاطع
- `POST /v1/projects/{id}/process` — يبدأ pipeline غير متزامن
- `PATCH /v1/projects/{id}/segments/{segmentId}` — يحفظ النص والتوقيت ويطلب إعادة توليد الصوت
- `POST /v1/projects/{id}/export?addSubtitles=true` — يبدأ تصدير FFmpeg

حالات المشروع المتوقعة: `UPLOADED`, `PROCESSING`, `READY`, `FAILED`. التطبيق يستطلع الحالة كل ثانيتين أثناء المعالجة ولا يزعم نجاحاً قبل رد الخادم.

## ملاحظات الإنتاج

- يجب أن يتحقق الخادم من ملكية روابط الفيديو وحقوق استخدامها، وحجم/نوع الملف.
- التخزين، Whisper/diarization، الترجمة، TTS وFFmpeg تعمل في Backend workers، وليس داخل APK.
- لإضافة لهجة يمنية جديدة أضف قيمة إلى قائمة اللهجات واسم اللهجة في عقد الخادم.
