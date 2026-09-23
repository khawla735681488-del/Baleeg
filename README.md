'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

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
  outputUrl?: string;
  segments: Segment[];
};

type User = {
  id: string;
  name: string | null;
  email: string;
};

export default function HomePage() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [dialect, setDialect] = useState('صنعاني');
  const [url, setUrl] = useState('');
  const [projects, setProjects] = useState<Project[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, { text: string; startMs: number; endMs: number }>>({});
  const [user, setUser] = useState<User | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('yemendub-token');
    if (saved) {
      fetch(`${API_URL}/api/auth/me`, { headers: { Authorization: `Bearer ${saved}` } })
        .then(res => res.ok ? res.json() : null)
        .then(data => data ? setUser(data) : localStorage.removeItem('yemendub-token'))
        .catch(() => localStorage.removeItem('yemendub-token'));
    }
  }, []);

  const refresh = async () => {
    const headers = user ? { Authorization: `Bearer ${localStorage.getItem('yemendub-token') || ''}` } : {};
    const response = await fetch(`${API_URL}/api/projects`, { headers });
    const data = await response.json();
    setProjects(data);
  };

  useEffect(() => { refresh(); }, [user]);

  const login = async () => {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || 'فشل في تسجيل الدخول');
      return;
    }
    localStorage.setItem('yemendub-token', result.token);
    setUser(result.user);
    setMessage('تم تسجيل الدخول بنجاح');
  };

  const register = async () => {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || 'فشل في إنشاء الحساب');
      return;
    }
    localStorage.setItem('yemendub-token', result.token);
    setUser(result.user);
    setMessage('تم إنشاء الحساب بنجاح');
  };

  const processProject = async (projectId: string) => {
    const headers = user ? { Authorization: `Bearer ${localStorage.getItem('yemendub-token') || ''}` } : {};
    const response = await fetch(`${API_URL}/api/projects/${projectId}/process`, { method: 'POST', headers });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || 'فشل في بدء المعالجة');
      return;
    }
    setMessage('تمت إضافة المشروع إلى قائمة المعالجة، وسيتم تحديث الحالة تلقائياً.');
    await refresh();
  };

  const exportProject = async (projectId: string) => {
    const headers = user ? { Authorization: `Bearer ${localStorage.getItem('yemendub-token') || ''}` } : {};
    const response = await fetch(`${API_URL}/api/projects/${projectId}/export`, { method: 'POST', headers });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || 'فشل في تصدير الفيديو');
      return;
    }
    setMessage('تم تجهيز الفيديو النهائي بنجاح.');
    if (result.outputUrl) window.open(result.outputUrl, '_blank');
    await refresh();
  };

  const saveSegment = async (projectId: string, segment: Segment) => {
    const headers = user ? { Authorization: `Bearer ${localStorage.getItem('yemendub-token') || ''}` } : {};
    const draft = drafts[segment.id] ?? { text: segment.text, startMs: segment.startMs, endMs: segment.endMs };
    const response = await fetch(`${API_URL}/api/projects/${projectId}/segments/${segment.id}`, {
      method: 'PATCH',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: draft.text, startMs: draft.startMs, endMs: draft.endMs })
    });
    const result = await response.json();
    if (!response.ok) {
      setMessage(result.error || 'فشل في حفظ المقطع');
      return;
    }
    setMessage('تم حفظ النص والتوقيت بنجاح.');
    await refresh();
  };

  const uploadFile = async (file: File) => {
    const form = new FormData();
    form.append('video', file);
    form.append('dialect', dialect);
    form.append('addSubtitles', 'true');
    setLoading(true);
    setMessage('جارٍ رفع الفيديو وتحليله...');

    const headers = user ? { Authorization: `Bearer ${localStorage.getItem('yemendub-token') || ''}` } : {};
    const response = await fetch(`${API_URL}/api/projects/upload`, { method: 'POST', headers, body: form });
    const project = await response.json();
    if (!response.ok) {
      setMessage(project.error || 'فشل في رفع الفيديو');
      setLoading(false);
      return;
    }

    setLoading(false);
    setMessage('تم رفع الملف بنجاح.');
    await processProject(project.id);
    await refresh();
  };

  const importUrl = async () => {
    setLoading(true);
    setMessage('جارٍ استيراد الرابط...');
    const headers = user ? { Authorization: `Bearer ${localStorage.getItem('yemendub-token') || ''}` } : {};
    const response = await fetch(`${API_URL}/api/projects/from-url`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, dialect, addSubtitles: true })
    });
    const project = await response.json();
    if (!response.ok) {
      setMessage(project.error || 'فشل في استيراد الرابط');
      setLoading(false);
      return;
    }
    setLoading(false);
    setMessage('تم استيراد الرابط بنجاح.');
    await processProject(project.id);
    await refresh();
  };

  const logout = () => {
    localStorage.removeItem('yemendub-token');
    setUser(null);
    setMessage('تم تسجيل الخروج');
  };

  return (
    <main style={{ fontFamily: 'Tahoma, sans-serif', background: '#f7f6f5', minHeight: '100vh', padding: 24, direction: 'rtl' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <header style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 36, marginBottom: 8 }}>YemenDub AI</h1>
            <p style={{ fontSize: 18, color: '#4a4a4a', margin: 0 }}>منصة ذكية لترجمة ودبلجة الفيديو إلى العربية مع اللهجات اليمنية.</p>
          </div>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontWeight: 700 }}>{user.name || user.email}</span>
              <button onClick={logout} style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer' }}>تسجيل الخروج</button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="الاسم" style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }} />
              <input value={email} onChange={e => setEmail(e.target.value)} placeholder="البريد" style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }} />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="كلمة المرور" style={{ padding: 10, borderRadius: 8, border: '1px solid #d1d5db' }} />
              <button onClick={login} style={{ padding: '10px 12px', borderRadius: 8, background: '#111827', color: '#fff', border: 'none', cursor: 'pointer' }}>دخول</button>
              <button onClick={register} style={{ padding: '10px 12px', borderRadius: 8, background: '#0f766e', color: '#fff', border: 'none', cursor: 'pointer' }}>تسجيل</button>
            </div>
          )}
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 20, marginBottom: 30 }}>
          <section style={{ background: '#fff', borderRadius: 18, padding: 24, boxShadow: '0 8px 25px rgba(0,0,0,0.06)' }}>
            <h2 style={{ marginTop: 0 }}>رفع فيديو أو رابط</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <label>
                <div style={{ marginBottom: 8 }}>اللهجة</div>
                <select value={dialect} onChange={e => setDialect(e.target.value)} style={{ width: '100%', padding: 12, borderRadius: 10, border: '1px solid #d8d8d8', fontSize: 16 }}>
                  <option value="صنعاني">صنعاني</option>
                  <option value="عدني">عدني</option>
                  <option value="تعزي">تعزي</option>
                  <option value="حضرمية">حضرمية</option>
                  <option value="تهامي">تهامي</option>
                  <option value="عربية فصحى">عربية فصحى</option>
                </select>
              </label>

              <button onClick={() => fileRef.current?.click()} style={{ background: '#0f766e', color: '#fff', padding: '12px 16px', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>
                رفع فيديو من الجهاز
              </button>
              <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={e => e.target.files?.[0] && uploadFile(e.target.files[0])} />

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com/video.mp4" style={{ flex: 1, minWidth: 220, padding: 12, borderRadius: 10, border: '1px solid #d8d8d8', fontSize: 16 }} />
                <button onClick={importUrl} disabled={loading || !url.startsWith('http')} style={{ background: '#111827', color: '#fff', padding: '12px 18px', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 700, fontSize: 16 }}>
                  استيراد الرابط
                </button>
              </div>

              {message && (
                <div style={{ background: '#ecfeff', color: '#0f172a', padding: 12, borderRadius: 10, border: '1px solid #b2ebf2' }}>
                  {message}
                </div>
              )}
            </div>
          </section>

          <aside style={{ background: '#fff', borderRadius: 18, padding: 24, boxShadow: '0 8px 25px rgba(0,0,0,0.06)' }}>
            <h2 style={{ marginTop: 0 }}>موجز النظام</h2>
            <ul style={{ lineHeight: 2, color: '#334155', paddingRight: 18, margin: 0 }}>
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

        <section style={{ background: '#fff', borderRadius: 18, padding: 24, boxShadow: '0 8px 25px rgba(0,0,0,0.06)' }}>
          <h2 style={{ marginTop: 0 }}>المشاريع</h2>
          <div style={{ display: 'grid', gap: 16 }}>
            {projects.length === 0 ? (
              <p style={{ margin: 0, color: '#64748b' }}>لا توجد مشاريع بعد.</p>
            ) : (
              projects.map(project => (
                <div key={project.id} style={{ border: '1px solid #e5e7eb', borderRadius: 14, padding: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <div>
                      <strong style={{ fontSize: 18 }}>{project.name}</strong>
                      <div style={{ color: '#64748b', marginTop: 6 }}>اللهجة: {project.dialect} • الحالة: {project.status}</div>
                    </div>
                    <div style={{ fontWeight: 700 }}>{project.progress}%</div>
                  </div>

                  <div style={{ width: '100%', height: 8, borderRadius: 999, overflow: 'hidden', background: '#e2e8f0', marginTop: 12 }}>
                    <div style={{ width: `${project.progress}%`, height: '100%', background: '#14b8a6' }} />
                  </div>

                  <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                    <button onClick={() => processProject(project.id)} style={{ background: '#0f172a', color: '#fff', border: 'none', borderRadius: 10, padding: '10px 14px', cursor: 'pointer' }}>
                      بدء المعالجة
                    </button>
                    <button onClick={() => exportProject(project.id)} style={{ background: '#f59e0b', color: '#111827', border: 'none', borderRadius: 10, padding: '10px 14px', cursor: 'pointer' }}>
                      تصدير الفيديو
                    </button>
                  </div>

                  {project.segments.length > 0 && (
                    <div style={{ marginTop: 18, display: 'grid', gap: 12 }}>
                      {project.segments.map(segment => {
                        const draft = drafts[segment.id] ?? { text: segment.text, startMs: segment.startMs, endMs: segment.endMs };
                        return (
                          <div key={segment.id} style={{ background: '#f8fafc', padding: 12, borderRadius: 10 }}>
                            <div style={{ color: '#475569', marginBottom: 8 }}>{segment.speaker || 'متحدث'} • {Math.round(segment.startMs / 1000)}s - {Math.round(segment.endMs / 1000)}s</div>
                            <textarea
                              value={draft.text}
                              onChange={e => setDrafts(prev => ({ ...prev, [segment.id]: { ...draft, text: e.target.value } }))}
                              style={{ width: '100%', minHeight: 80, borderRadius: 8, border: '1px solid #dfe5ee', padding: 10, resize: 'vertical' }}
                            />
                            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
                              <input type="number" value={draft.startMs} onChange={e => setDrafts(prev => ({ ...prev, [segment.id]: { ...draft, startMs: Number(e.target.value) } }))} style={{ width: 110, padding: 8, borderRadius: 8, border: '1px solid #dfe5ee' }} />
                              <input type="number" value={draft.endMs} onChange={e => setDrafts(prev => ({ ...prev, [segment.id]: { ...draft, endMs: Number(e.target.value) } }))} style={{ width: 110, padding: 8, borderRadius: 8, border: '1px solid #dfe5ee' }} />
                              <button onClick={() => saveSegment(project.id, segment)} style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer' }}>
                                حفظ النص والتوقيت
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
