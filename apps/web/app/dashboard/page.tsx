'use client';

import React from 'react';

type ProjectStatus = 'مكتمل' | 'قيد المعالجة' | 'في الانتظار' | 'فشل';

type Project = {
  id: string;
  name: string;
  dialect: string;
  status: ProjectStatus;
  progress: number;
  createdAt: string;
};

const projects: Project[] = [
  { id: 'PR-1024', name: 'مؤتمر قمة اليمن', dialect: 'صنعاني', status: 'مكتمل', progress: 100, createdAt: '2026-09-23' },
  { id: 'PR-1023', name: 'مقدمة الشركة', dialect: 'عدني', status: 'قيد المعالجة', progress: 72, createdAt: '2026-09-23' },
  { id: 'PR-1022', name: 'دورة تدريبية', dialect: 'تعزي', status: 'في الانتظار', progress: 25, createdAt: '2026-09-22' },
  { id: 'PR-1021', name: 'أخبار وطنية', dialect: 'حضرمية', status: 'فشل', progress: 42, createdAt: '2026-09-21' },
];

const stats = [
  { label: 'إجمالي المشاريع', value: '1,248', icon: '📦', tone: '#0f766e' },
  { label: 'في المعالجة', value: '86', icon: '⚙️', tone: '#f59e0b' },
  { label: 'مكتملة', value: '1,042', icon: '✅', tone: '#16a34a' },
  { label: 'إيرادات هذا الشهر', value: '$12.4K', icon: '💰', tone: '#6366f1' },
];

const activities = [
  { title: 'تمت معالجة مشروع جديد', meta: 'منذ 12 دقيقة', color: '#14b8a6' },
  { title: 'تمت ترجمة 3 مقاطع', meta: 'منذ 32 دقيقة', color: '#f59e0b' },
  { title: 'تم إرسال نسخة نهائية', meta: 'منذ ساعة', color: '#3b82f6' },
  { title: 'تم تحديث اللهجة إلى حضرمية', meta: 'منذ يوم', color: '#8b5cf6' },
];

const statusColor: Record<ProjectStatus, string> = {
  مكتمل: '#16a34a',
  'قيد المعالجة': '#f59e0b',
  'في الانتظار': '#64748b',
  فشل: '#ef4444',
};

export default function DashboardPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #f8fafc 0%, #eef6f5 100%)',
        padding: 28,
        direction: 'rtl',
        fontFamily: 'Tahoma, sans-serif',
        color: '#0f172a',
      }}
    >
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
            marginBottom: 28,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: 13, color: '#0f766e', fontWeight: 700, marginBottom: 6 }}>YemenDub AI</div>
            <h1 style={{ margin: 0, fontSize: 36 }}>لوحة التحكم</h1>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: '10px 14px',
                width: 280,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>🔎</span>
              <input
                placeholder="بحث عن مشروع..."
                style={{
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  width: '100%',
                  fontSize: 15,
                  color: '#0f172a',
                }}
              />
            </div>

            <button
              style={{
                background: '#0f766e',
                color: '#fff',
                border: 'none',
                borderRadius: 12,
                padding: '12px 18px',
                cursor: 'pointer',
                fontWeight: 700,
              }}
            >
              + مشروع جديد
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: '#fff',
                padding: '8px 12px',
                borderRadius: 12,
                border: '1px solid #e2e8f0',
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #0f766e, #14b8a6)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#fff',
                  fontWeight: 700,
                }}
              >
                م
              </div>
              <div>
                <div style={{ fontWeight: 700 }}>محمد</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>مدير النظام</div>
              </div>
            </div>
          </div>
        </header>

        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, minmax(220px, 1fr))',
            gap: 16,
            marginBottom: 28,
          }}
        >
          {stats.map(item => (
            <div
              key={item.label}
              style={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: 18,
                padding: 20,
                boxShadow: '0 10px 25px rgba(15, 23, 42, 0.04)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 26 }}>{item.icon}</div>
                <div style={{ width: 12, height: 12, borderRadius: 999, background: item.tone, opacity: 0.18 }} />
              </div>
              <div style={{ fontSize: 13, color: '#64748b' }}>{item.label}</div>
              <div style={{ fontSize: 32, fontWeight: 800, marginTop: 8 }}>{item.value}</div>
            </div>
          ))}
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr', gap: 18, marginBottom: 28 }}>
          <div
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 20,
              padding: 20,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <h2 style={{ margin: 0, fontSize: 26 }}>المشاريع الأخيرة</h2>
              <button
                style={{
                  background: '#eefcf9',
                  color: '#0f766e',
                  border: 'none',
                  borderRadius: 10,
                  padding: '10px 12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                عرض الكل
              </button>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {projects.map(project => (
                <div
                  key={project.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: 14,
                    padding: 14,
                    background: '#fafafa',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 18 }}>{project.name}</div>
                      <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
                        {project.id} • {project.dialect} • {project.createdAt}
                      </div>
                    </div>

                    <span
                      style={{
                        background: `${statusColor[project.status]}22`,
                        color: statusColor[project.status],
                        borderRadius: 999,
                        padding: '6px 10px',
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      {project.status}
                    </span>
                  </div>

                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: '#475569' }}>التقدم</span>
                      <span style={{ fontWeight: 700 }}>{project.progress}%</span>
                    </div>

                    <div style={{ width: '100%', height: 9, borderRadius: 999, overflow: 'hidden', background: '#e2e8f0' }}>
                      <div
                        style={{
                          width: `${project.progress}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, #0f766e, #14b8a6)',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14, alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <button
                      style={{
                        background: '#0f172a',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 10,
                        padding: '10px 12px',
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      فتح المشروع
                    </button>
                    <button
                      style={{
                        background: '#fff',
                        border: '1px solid #d1d5db',
                        borderRadius: 10,
                        padding: '10px 12px',
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      تصدير
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 20,
              padding: 20,
            }}
          >
            <h2 style={{ margin: '0 0 16px', fontSize: 24 }}>النشاط الأخير</h2>

            <div style={{ display: 'grid', gap: 12 }}>
              {activities.map(activity => (
                <div key={activity.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: activity.color,
                      boxShadow: `0 0 0 6px ${activity.color}22`,
                    }}
                  />
                  <div>
                    <div style={{ fontWeight: 700 }}>{activity.title}</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{activity.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
          <div
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 20,
              padding: 20,
            }}
          >
            <h2 style={{ margin: '0 0 16px', fontSize: 24 }}>المهام الحالية</h2>

            <div style={{ display: 'grid', gap: 12 }}>
              <TaskRow label="تحليل الفيديو" value="98%" color="#14b8a6" />
              <TaskRow label="استخراج الكلام" value="82%" color="#0ea5e9" />
              <TaskRow label="ترجمة السياق" value="61%" color="#8b5cf6" />
              <TaskRow label="إضافة الترجمة" value="74%" color="#f59e0b" />
              <TaskRow label="تصدير الفيديو" value="39%" color="#ef4444" />
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 20,
              padding: 20,
            }}
          >
            <h2 style={{ margin: '0 0 16px', fontSize: 24 }}>الخدمات</h2>

            <div style={{ display: 'grid', gap: 14 }}>
              <ServiceCard title="Transcription" value="Whisper" caption="تحليل الصوت إلى نص" />
              <ServiceCard title="Translation" value="LLM" caption="ترجمة نصوص بتنسيق عربي فصيح" />
              <ServiceCard title="Dubbing" value="TTS" caption="نقل النبرة واللهجة اليمنية" />
              <ServiceCard title="Export" value="MP4" caption="تصدير فيديو جاهز للنشر" />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function TaskRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontWeight: 700 }}>{label}</span>
        <span style={{ color: '#64748b' }}>{value}</span>
      </div>
      <div style={{ width: '100%', height: 8, borderRadius: 999, overflow: 'hidden', background: '#e2e8f0' }}>
        <div style={{ width: value, height: '100%', background: color }} />
      </div>
    </div>
  );
}

function ServiceCard({ title, value, caption }: { title: string; value: string; caption: string }) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: 12,
        padding: 12,
      }}
    >
      <div>
        <div style={{ fontWeight: 800, fontSize: 18 }}>{title}</div>
        <div style={{ fontSize: 12, color: '#64748b', marginTop: 3 }}>{caption}</div>
      </div>
      <div
        style={{
          background: '#ecfeff',
          color: '#0f766e',
          borderRadius: 10,
          padding: '8px 10px',
          fontWeight: 700,
          fontSize: 12,
        }}
      >
        {value}
      </div>
    </div>
  );
}
