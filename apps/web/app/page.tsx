'use client';

import { useEffect, useRef, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

type Segment = {
  id: string;
  speaker?: string;
  text: string;
  startMs: number;
  endMs: number;
};

type Project = {
  id: string;
  name: string;
  dialect: string;
  status: string;
  progress: number;
  sourceUrl?: string;
  outputUrl?: string;
  segments: Segment[];
};

export default function HomePage() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [dialect, setDialect] = useState('صنعاني');
  const [url, setUrl] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    const response = await fetch(`${API_URL}/api/projects`);
    const data = await response.json();
    setProjects(data);
  };

  useEffect(() => { refresh(); }, []);

  const uploadFile = async (file: File) => {
    const form = new FormData();
    form.append('video', file);
    form.append('dialect', dialect);
    form.append('addSubtitles', 'true');
    setLoading(true);
    setMessage('جارٍ رفع الفيديو وتحليله...');

    const response = await fetch(`${API_URL}/api/projects/upload`, { method: 'POST', body: form });
    const project = await response.json();
    if (!response.ok) { setMessage(project.error || 'فشل في رفع الفيديو'); setLoading(false); return; }

    await fetch(`${API_URL}/api/projects/${project.id}/process`, { method: 'POST' });
    setMessage('تم رفع الفيديو بنجاح، جاري المعالجة في الخلفية.');
    setLoading(false);
    await refresh();
  };

  const importUrl = async () => {
    setLoading(true);
    setMessage('جارٍ استيراد الرابط...');
    const response = await fetch(`${API_URL}/api/projects/from-url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, dialect, addSubtitles: true })
    });
    const project = await response.json();
    if (!response.ok) { setMessage(project.error || 'فشل في استيراد الرابط'); setLoading(false); return; }
    await fetch(`${API_URL}/api/projects/${project.id}/process`, { method: 'POST' });
    setMessage('تم استيراد الرابط بنجاح.');
    setLoading(false);
    await refresh();
  };

  return (
    <main style={{ fontFamily: 'Tahoma, sans-serif', background: '#f7f6f5', minHeight: '100vh', padding: 24, direction: 'rtl' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ fontSize: 36, marginBottom: 12 }}>YemenDub AI</h1>
        <p style={{ fontSize: 18, color: '#4a4a4a' }}>منصة ذكية لترجمة ودبلجة الفيديو إلى العربية مع اللهجات اليمنية.</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20, marginTop: 30 }}>
          <section style={{ background: '#fff', borderRadius: 18, padding: 24, boxShadow: '0 8px 25px rgba(0,0,0,0.06)' }}>
            <h2>رفع فيديو أو رابط</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <label>
                <div style={{ marginBottom: 8 }}>اللهجة</div>
                <select value={dialect} onChange={e => setDialect(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #d8d8d8' }}>
                  <option value="صنعاني">صنعاني</option>
                  <option value="عدني">عدني</option>
                  <option value="تعزي">تعزي</option>
                  <option value="حضرمية">حضرمية</option>
                  <option value="تهامي">تهامي</option>
                  <option value="عربية فصحى">عربية فصحى</option>
                </select>
              </label>

              <button onClick={() => fileRef.current?.click()} style={{ background: '#0f766e', color: '#fff', padding: '12px 16px', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}>
                رفع فيديو من الجهاز
              </button>
              <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0])} />

              <div style={{ display: 'flex', gap: 8 }}>
                <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/video.mp4" style={{ flex: 1, padding: 12, borderRadius: 10, border: '1px solid #d8d8d8' }} />
                <button onClick={importUrl} disabled={loading || !url.startsWith('http')} style={{ background: '#111827', color: '#fff', padding: '12px 18px', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700 }}>
                  استيراد الرابط
                </button>
              </div>

              {message && <div style={{ background: '#ecfeff', color: '#0f172a', padding: 12, borderRadius: 10 }}>{message}</div>}
            </div>
          </section>

          <aside style={{ background: '#fff', borderRadius: 18, padding: 24, boxShadow: '0 8px 25px rgba(0,0,0,0.06)' }}>
            <h2>موجز النظام</h2>
            <ul style={{ lineHeight: 2, color: '#334155' }}>
              <li>تحليل الفيديو</li>
              <li>استخراج الكلام</li>
              <li>تحديد المتحدثين</li>
              <li>ترجمة السياق</li>
              <li>توليد دبلجة صوتية</li>
              <li>إضافة ترجمات ومزامنة</li>
              <li>تصدير الفيديو النهائي</li>
            </ul>
          </aside>
        </div>

        <section style={{ marginTop: 30, background: '#fff', borderRadius: 18, padding: 24, boxShadow:'0 8px 25px rgba(0,0,0,0.06)' }}>
          <h2>المشاريع</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            {projects.length === 0 ? <p>لا توجد مشاريع بعد.</p> : projects.map(project => (
              <div key={project.id} style={{ border: '1px solid #e5e7eb', borderRadius: 14, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                  <div>
                    <strong>{project.name}</strong>
                    <div style={{ color: '#64748b', marginTop: 6 }}>اللهجة: {project.dialect} • الحالة: {project.status}</div>
                  </div>
                  <div style={{ fontWeight: 700 }}>{project.progress}%</div>
                </div>
                <div style={{ width: '100%', height: 8, borderRadius: 999, overflow: 'hidden', background: '#e2e8f0', marginTop: 12 }}>
                  <div style={{ width: `${project.progress}%`, height: '100%', background: '#14b8a6' }} />
                </div>

                {project.segments.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    {project.segments.map(segment => (
                      <div key={segment.id} style={{ background: '#f8fafc', padding: 10, borderRadius: 10, marginBottom: 8 }}>
                        <div style={{ color: '#475569', marginBottom: 6 }}>{segment.speaker || 'متحدث'} • {Math.round(segment.startMs / 1000)}s - {Math.round(segment.endMs / 1000)}s</div>
                        <div>{segment.text}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
