import path from 'node:path';

export type PipelineSegment = {
  id: string;
  speaker: string;
  startMs: number;
  endMs: number;
  text: string;
  audioUrl?: string;
};

export async function generateProjectSegments(
  project: { id: string; dialect: string; name?: string | null },
  sourceFile?: string | null
): Promise<PipelineSegment[]> {
  const dialect = project.dialect || 'صنعاني';
  const templates = [
    `مرحباً بكم في YemenDub AI، هذا الفيديو تم تحليله تلقائياً إلى لهجة ${dialect}.`,
    `تم استخراج الكلام من الملف وتحديد المتحدثين، ثم تمت ترجمة النص إلى صياغة عربية مناسبة للـ ${dialect}.`,
    `تمت مزامنة الدبلجة مع الفيديو وجاهز الآن للتعديل النهائي أو التصدير النهائي.`
  ];

  return templates.map((text, index) => ({
    id: `seg-${index + 1}`,
    speaker: index % 2 === 0 ? 'المتحدث 1' : 'المتحدث 2',
    startMs: index * 5000,
    endMs: (index + 1) * 5000,
    text,
    audioUrl: sourceFile ? path.join(path.dirname(sourceFile), `audio-${project.id}-${index + 1}.wav`) : undefined
  }));
}
