import React, { useEffect, useMemo, useState } from 'react';
import type {
  AuthSession,
  ClassEvent,
  PlantReward,
  PointTransaction,
  Student,
  StudentGoal,
  StudentGratitude,
  StudentStreak,
  WeeklyChallenge,
} from '../types';
import { createXlsxWorkbook } from '../utils/createXlsxWorkbook';

interface GardenFeaturesPageProps {
  session: AuthSession | null;
  students: Student[];
  onRequireLogin: () => void;
}

interface GardenFeatureData {
  challenges: Array<WeeklyChallenge & { currentPoints: number }>;
  events: ClassEvent[];
  goals: StudentGoal[];
  gratitude: StudentGratitude[];
  rewards: PlantReward[];
  streaks: StudentStreak[];
  hasStudentInitialPin: boolean;
}

interface ClassReport {
  student: Pick<Student, 'id' | 'code' | 'name'>;
  startDate: string;
  endDate: string;
  totalPoints: number;
  transactions: Array<{
    date: string;
    actionName: string;
    points: number;
    status: string;
    note: string;
  }>;
}

const today = () => new Date().toLocaleDateString('sv-SE');
const weekRange = () => {
  const date = new Date();
  const day = (date.getDay() + 6) % 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - day);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return {
    start: monday.toLocaleDateString('sv-SE'),
    end: sunday.toLocaleDateString('sv-SE'),
  };
};

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function request<T>(
  path: string,
  session: AuthSession | null,
  init: RequestInit = {}
): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set('Content-Type', 'application/json');
  if (session?.token) headers.set('Authorization', `Bearer ${session.token}`);
  const response = await fetch(path, { ...init, headers, cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Không thể hoàn tất yêu cầu.');
  return data as T;
}

const panelClass =
  'rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm sm:p-6';
const inputClass =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200';
const buttonClass =
  'rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50';

export const GardenFeaturesPage: React.FC<GardenFeaturesPageProps> = ({
  session,
  students,
  onRequireLogin,
}) => {
  const week = useMemo(weekRange, []);
  const [features, setFeatures] = useState<GardenFeatureData | null>(null);
  const [timeline, setTimeline] = useState<PointTransaction[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [challengeTitle, setChallengeTitle] = useState('');
  const [challengeDescription, setChallengeDescription] = useState('');
  const [challengePoints, setChallengePoints] = useState('100');
  const [challengeStart, setChallengeStart] = useState(week.start);
  const [challengeEnd, setChallengeEnd] = useState(week.end);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventDate, setEventDate] = useState(today);
  const [goalText, setGoalText] = useState('');
  const [gratitudeRecipient, setGratitudeRecipient] = useState('');
  const [gratitudeText, setGratitudeText] = useState('');
  const [rewardStudent, setRewardStudent] = useState('');
  const [rewardName, setRewardName] = useState('');
  const [rewardIcon, setRewardIcon] = useState('🌸');
  const [rewardNote, setRewardNote] = useState('');
  const [sharedPin, setSharedPin] = useState('');
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [reportStudent, setReportStudent] = useState('');
  const [reportStart, setReportStart] = useState(week.start);
  const [reportEnd, setReportEnd] = useState(today);
  const [timelineStudent, setTimelineStudent] = useState(
    session?.role === 'student' ? session.studentId || 'all' : 'all'
  );

  const isTeacher = session?.role === 'teacher';
  const isStudent = session?.role === 'student';
  const ownGoal = features?.goals.find((goal) => goal.studentId === session?.studentId);

  const loadData = async () => {
    const [featureData, transactionData] = await Promise.all([
      request<GardenFeatureData>('/api/garden-features', session),
      request<PointTransaction[]>('/api/transactions/recent', session),
    ]);
    setFeatures(featureData);
    setTimeline(transactionData);
    const goal = featureData.goals.find((item) => item.studentId === session?.studentId);
    if (goal) setGoalText(goal.title);
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      request<GardenFeatureData>('/api/garden-features', session),
      request<PointTransaction[]>('/api/transactions/recent', session),
    ])
      .then(([featureData, transactionData]) => {
        if (!active) return;
        setFeatures(featureData);
        setTimeline(transactionData);
        const goal = featureData.goals.find((item) => item.studentId === session?.studentId);
        if (goal) setGoalText(goal.title);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Không tải được dữ liệu Góc Tử Tế.');
      });
    return () => {
      active = false;
    };
  }, [session?.token, session?.studentId]);

  const runAction = async (action: () => Promise<void>, successMessage: string) => {
    setError('');
    setNotice('');
    setBusy(true);
    try {
      await action();
      await loadData();
      setNotice(successMessage);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể hoàn tất yêu cầu.');
    } finally {
      setBusy(false);
    }
  };

  const authorized = async () => {
    if (session) return session;
    onRequireLogin();
    throw new Error('Vui lòng đăng nhập để sử dụng chức năng này.');
  };

  const saveChallenge = async (event: React.FormEvent) => {
    event.preventDefault();
    await runAction(async () => {
      const auth = await authorized();
      await request('/api/garden-features/challenges', auth, {
        method: 'POST',
        body: JSON.stringify({
          title: challengeTitle,
          description: challengeDescription,
          targetPoints: Number(challengePoints),
          startDate: challengeStart,
          endDate: challengeEnd,
        }),
      });
      setChallengeTitle('');
      setChallengeDescription('');
    }, 'Đã tạo thử thách chung cho lớp.');
  };

  const saveEvent = async (event: React.FormEvent) => {
    event.preventDefault();
    await runAction(async () => {
      const auth = await authorized();
      await request('/api/garden-features/events', auth, {
        method: 'POST',
        body: JSON.stringify({ title: eventTitle, description: eventDescription, date: eventDate }),
      });
      setEventTitle('');
      setEventDescription('');
    }, 'Đã thêm sự kiện cho lớp.');
  };

  const saveGoal = async (event: React.FormEvent) => {
    event.preventDefault();
    await runAction(async () => {
      const auth = await authorized();
      await request('/api/garden-features/goals', auth, {
        method: 'POST',
        body: JSON.stringify({ title: goalText }),
      });
    }, 'Đã lưu mục tiêu cá nhân.');
  };

  const sendGratitude = async (event: React.FormEvent) => {
    event.preventDefault();
    await runAction(async () => {
      const auth = await authorized();
      await request('/api/garden-features/gratitude', auth, {
        method: 'POST',
        body: JSON.stringify({ recipientStudentId: gratitudeRecipient, message: gratitudeText }),
      });
      setGratitudeText('');
    }, 'Lời cảm ơn đã được chia sẻ với cả lớp.');
  };

  const giftReward = async (event: React.FormEvent) => {
    event.preventDefault();
    await runAction(async () => {
      const auth = await authorized();
      await request('/api/garden-features/rewards', auth, {
        method: 'POST',
        body: JSON.stringify({
          studentId: rewardStudent,
          itemName: rewardName,
          icon: rewardIcon,
          note: rewardNote,
        }),
      });
      setRewardName('');
      setRewardNote('');
    }, 'Đã tặng vật phẩm, không trừ điểm của học sinh.');
  };

  const configureSharedPin = async (event: React.FormEvent) => {
    event.preventDefault();
    await runAction(async () => {
      const auth = await authorized();
      await request('/api/settings/student-initial-pin', auth, {
        method: 'PUT',
        body: JSON.stringify({ pin: sharedPin }),
      });
      setSharedPin('');
    }, 'Đã cập nhật PIN chung cho học sinh chưa có PIN riêng.');
  };

  const changePin = async (event: React.FormEvent) => {
    event.preventDefault();
    await runAction(async () => {
      const auth = await authorized();
      await request('/api/auth/change-student-pin', auth, {
        method: 'POST',
        body: JSON.stringify({ currentPin, newPin }),
      });
      setCurrentPin('');
      setNewPin('');
    }, 'Đã đổi sang PIN riêng.');
  };

  const removeItem = async (path: string, label: string) => {
    await runAction(async () => {
      const auth = await authorized();
      await request(path, auth, { method: 'DELETE' });
    }, `Đã xóa ${label}.`);
  };

  const createReport = async (): Promise<ClassReport> => {
    const auth = await authorized();
    const query = new URLSearchParams({
      studentId: reportStudent,
      startDate: reportStart,
      endDate: reportEnd,
    });
    return request<ClassReport>(`/api/reports/class?${query}`, auth);
  };

  const downloadExcel = async () => {
    setError('');
    setNotice('');
    try {
      const report = await createReport();
      const file = createXlsxWorkbook(report);
      const workbookBuffer = new ArrayBuffer(file.byteLength);
      new Uint8Array(workbookBuffer).set(file);
      const url = URL.createObjectURL(
        new Blob([workbookBuffer], {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        })
      );
      const link = document.createElement('a');
      link.href = url;
      link.download = `Bao-cao-${report.student.code}-${report.startDate}-${report.endDate}.xlsx`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice('Đã tải báo cáo Excel riêng của học sinh.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể tải báo cáo Excel.');
    }
  };

  const printReport = async () => {
    setError('');
    setNotice('');
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      setError('Trình duyệt đã chặn cửa sổ in. Hãy cho phép cửa sổ bật lên để lưu PDF.');
      return;
    }
    try {
      const report = await createReport();
      const rows = report.transactions
        .map(
          (item) =>
            `<tr><td>${escapeHtml(item.date)}</td><td>${escapeHtml(item.actionName)}</td><td>${escapeHtml(item.points)}</td><td>${escapeHtml(item.status === 'approved' ? 'Đã duyệt' : 'Chờ duyệt')}</td><td>${escapeHtml(item.note)}</td></tr>`
        )
        .join('');
      printWindow.document.write(
        `<!doctype html><html lang="vi"><head><meta charset="utf-8"><title>Báo cáo ${escapeHtml(report.student.name)}</title><style>body{font-family:Arial,sans-serif;padding:32px;color:#18352b}h1{color:#087f5b}table{border-collapse:collapse;width:100%;margin-top:24px}th,td{border:1px solid #ccd8d1;padding:8px;text-align:left}th{background:#e8f5ee}@media print{body{padding:0}}</style></head><body><h1>Báo cáo hoạt động học sinh</h1><p><b>${escapeHtml(report.student.name)}</b> · ${escapeHtml(report.student.code)}</p><p>Thời gian: ${escapeHtml(report.startDate)} – ${escapeHtml(report.endDate)}</p><p>Tổng điểm đã duyệt: <b>${escapeHtml(report.totalPoints)}</b></p><table><thead><tr><th>Ngày</th><th>Hoạt động</th><th>Điểm</th><th>Trạng thái</th><th>Ghi chú</th></tr></thead><tbody>${rows}</tbody></table><script>window.onload=()=>window.print()</script></body></html>`
      );
      printWindow.document.close();
      setNotice('Mở hộp thoại in để lưu báo cáo dưới dạng PDF.');
    } catch (cause) {
      printWindow.close();
      setError(cause instanceof Error ? cause.message : 'Không thể tạo báo cáo PDF.');
    }
  };

  const visibleTimeline = timeline
    .filter((item) => timelineStudent === 'all' || item.studentId === timelineStudent)
    .slice(0, 20);

  return (
    <div className="space-y-7">
      <header className="garden-feature-banner rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-100 via-lime-50 to-sky-100 p-6 shadow-sm sm:p-8">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-800">A11K65 · Cùng nhau lớn lên</p>
        <h1 className="mt-2 text-2xl font-black text-emerald-950 sm:text-3xl">Góc Tử Tế</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-700">
          Mỗi việc tốt được ghi nhận là một mầm xanh. Cùng đặt mục tiêu, nói lời cảm ơn và chia sẻ niềm vui của lớp.
        </p>
      </header>

      {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
      {notice && <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className={panelClass}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Cùng nhau cố gắng</p>
              <h2 className="mt-1 text-lg font-extrabold text-slate-900">Thử thách của lớp</h2>
            </div>
            <span className="text-3xl" aria-hidden="true">🌱</span>
          </div>
          {features?.challenges.length ? (
            <div className="space-y-3">
              {features.challenges.map((challenge) => {
                const percent = Math.min(100, Math.round((challenge.currentPoints / challenge.targetPoints) * 100));
                return (
                  <article key={challenge.id} className="rounded-2xl bg-emerald-50 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900">{challenge.title}</h3>
                        <p className="mt-1 text-xs text-slate-600">{challenge.description}</p>
                      </div>
                      {isTeacher && (
                        <button className="text-xs font-semibold text-rose-600" onClick={() => void removeItem(`/api/garden-features/challenges/${challenge.id}`, 'thử thách')}>Xóa</button>
                      )}
                    </div>
                    <div className="mt-3 flex justify-between text-xs font-semibold text-slate-600">
                      <span>{challenge.currentPoints} / {challenge.targetPoints} điểm tích cực</span>
                      <span>{percent}%</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white">
                      <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${percent}%` }} />
                    </div>
                    <p className="mt-2 text-[11px] text-slate-500">{challenge.startDate} – {challenge.endDate}</p>
                  </article>
                );
              })}
            </div>
          ) : <p className="text-sm text-slate-500">Chưa có thử thách chung. Cô giáo có thể tạo thử thách cho lớp.</p>}
          {isTeacher && (
            <form onSubmit={saveChallenge} className="mt-5 grid gap-2 border-t border-slate-100 pt-4 sm:grid-cols-2">
              <input className={inputClass} required maxLength={120} value={challengeTitle} onChange={(event) => setChallengeTitle(event.target.value)} placeholder="Tên thử thách" />
              <input className={inputClass} required type="number" min="1" value={challengePoints} onChange={(event) => setChallengePoints(event.target.value)} placeholder="Mục tiêu điểm" />
              <input className={inputClass} type="date" required value={challengeStart} onChange={(event) => setChallengeStart(event.target.value)} />
              <input className={inputClass} type="date" required value={challengeEnd} onChange={(event) => setChallengeEnd(event.target.value)} />
              <input className={`${inputClass} sm:col-span-2`} maxLength={500} value={challengeDescription} onChange={(event) => setChallengeDescription(event.target.value)} placeholder="Mô tả (không bắt buộc)" />
              <button className={`${buttonClass} sm:col-span-2`} disabled={busy}>Tạo thử thách</button>
            </form>
          )}
        </section>

        <section className={panelClass}>
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700">Cùng nhau sẻ chia</p>
          <h2 className="mt-1 text-lg font-extrabold text-slate-900">Sự kiện lớp</h2>
          <div className="mt-4 space-y-3">
            {features?.events.length ? features.events.slice().sort((a, b) => a.date.localeCompare(b.date)).map((item) => (
              <article key={item.id} className="flex items-start justify-between gap-3 rounded-2xl bg-amber-50 p-4">
                <div><p className="font-bold text-slate-900">{item.title}</p><p className="mt-1 text-xs text-slate-600">{item.date} · {item.description}</p></div>
                {isTeacher && <button className="text-xs font-semibold text-rose-600" onClick={() => void removeItem(`/api/garden-features/events/${item.id}`, 'sự kiện')}>Xóa</button>}
              </article>
            )) : <p className="text-sm text-slate-500">Chưa có sự kiện sắp tới.</p>}
          </div>
          {isTeacher && (
            <form onSubmit={saveEvent} className="mt-5 grid gap-2 border-t border-slate-100 pt-4">
              <input className={inputClass} required maxLength={120} value={eventTitle} onChange={(event) => setEventTitle(event.target.value)} placeholder="Tên sự kiện" />
              <input className={inputClass} type="date" required value={eventDate} onChange={(event) => setEventDate(event.target.value)} />
              <input className={inputClass} maxLength={500} value={eventDescription} onChange={(event) => setEventDescription(event.target.value)} placeholder="Mô tả (không bắt buộc)" />
              <button className={buttonClass} disabled={busy}>Thêm sự kiện</button>
            </form>
          )}
        </section>

        <section className={panelClass}>
          <p className="text-xs font-bold uppercase tracking-wider text-sky-700">Hành trình trưởng thành</p>
          <h2 className="mt-1 text-lg font-extrabold text-slate-900">Chuỗi ngày & dòng thời gian</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {features?.streaks.length ? features.streaks.slice(0, 10).map((streak) => (
              <span key={streak.studentId} className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900">🔥 {streak.studentName}: {streak.days} ngày</span>
            )) : <p className="text-sm text-slate-500">Chuỗi ngày sẽ xuất hiện khi có hoạt động được ghi nhận liên tiếp.</p>}
          </div>
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <h3 className="font-bold text-slate-800">Hoạt động gần đây</h3>
            <select className={`${inputClass} max-w-56`} value={timelineStudent} onChange={(event) => setTimelineStudent(event.target.value)}>
              {session?.role !== 'student' && <option value="all">Cả lớp</option>}
              {students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
            </select>
          </div>
          <ol className="mt-3 space-y-3">
            {visibleTimeline.length ? visibleTimeline.map((item) => (
              <li key={item.id} className="flex gap-3 border-l-2 border-emerald-200 pl-3">
                <span className="text-xs font-bold text-emerald-700">{item.points > 0 ? '+' : ''}{item.points}</span>
                <div className="min-w-0"><p className="text-sm font-semibold text-slate-800">{item.studentName}</p><p className="text-xs text-slate-600">{item.actionName}</p><p className="text-[11px] text-slate-400">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</p></div>
              </li>
            )) : <li className="text-sm text-slate-500">Chưa có hoạt động được ghi nhận.</li>}
          </ol>
        </section>

        <section className={panelClass}>
          <p className="text-xs font-bold uppercase tracking-wider text-rose-700">Lan tỏa yêu thương</p>
          <h2 className="mt-1 text-lg font-extrabold text-slate-900">Lời cảm ơn</h2>
          {isStudent && (
            <form onSubmit={sendGratitude} className="mt-4 grid gap-2">
              <select className={inputClass} required value={gratitudeRecipient} onChange={(event) => setGratitudeRecipient(event.target.value)}>
                <option value="">Chọn bạn muốn cảm ơn</option>
                {students.filter((student) => student.id !== session.studentId).map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
              </select>
              <textarea className={inputClass} required maxLength={500} rows={2} value={gratitudeText} onChange={(event) => setGratitudeText(event.target.value)} placeholder="Viết lời cảm ơn..." />
              <button className={buttonClass} disabled={busy}>Gửi lời cảm ơn</button>
            </form>
          )}
          <div className="mt-4 space-y-3">
            {features?.gratitude.length ? features.gratitude.slice(0, 8).map((item) => (
              <article key={item.id} className="rounded-2xl bg-rose-50 p-3">
                <p className="text-sm text-slate-800">“{item.message}”</p>
                <p className="mt-1 text-xs font-semibold text-rose-800">{item.senderName} cảm ơn {item.recipientName}</p>
              </article>
            )) : <p className="text-sm text-slate-500">Những lời cảm ơn đầu tiên sẽ được chia sẻ tại đây.</p>}
            {!isStudent && !isTeacher && <button className="text-sm font-bold text-emerald-700" onClick={onRequireLogin}>Đăng nhập học sinh để gửi lời cảm ơn</button>}
          </div>
        </section>

        <section className={panelClass}>
          <p className="text-xs font-bold uppercase tracking-wider text-violet-700">Mầm xanh của em</p>
          <h2 className="mt-1 text-lg font-extrabold text-slate-900">{isStudent ? 'Mục tiêu của em' : 'Mục tiêu cá nhân'}</h2>
          {isStudent && (
            <form onSubmit={saveGoal} className="mt-4 flex flex-col gap-2 sm:flex-row">
              <input className={inputClass} maxLength={240} value={goalText} onChange={(event) => setGoalText(event.target.value)} placeholder="Ví dụ: Mỗi ngày giúp một người bạn" />
              <button className={buttonClass} disabled={busy || !goalText.trim()}>{ownGoal ? 'Cập nhật' : 'Đặt mục tiêu'}</button>
            </form>
          )}
          <p className="mt-2 text-xs text-slate-500">Mục tiêu được chia sẻ với cả lớp để cùng động viên.</p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {features?.goals.length ? features.goals.map((goal) => (
              <article key={goal.id} className="flex items-start justify-between gap-2 rounded-2xl bg-violet-50 p-3">
                <div><p className="text-sm font-bold text-violet-950">{goal.studentName}</p><p className="mt-1 text-sm text-slate-700">{goal.title}</p></div>
                {(isTeacher || (isStudent && session.studentId === goal.studentId)) && <button className="text-xs font-semibold text-rose-600" onClick={() => void removeItem(`/api/garden-features/goals/${goal.id}`, 'mục tiêu')}>Xóa</button>}
              </article>
            )) : <p className="text-sm text-slate-500">Chưa có mục tiêu nào được chia sẻ.</p>}
          </div>
        </section>

        <section className={panelClass}>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Bộ sưu tập</p>
          <h2 className="mt-1 text-lg font-extrabold text-slate-900">Vật phẩm cho cây</h2>
          {isTeacher && (
            <form onSubmit={giftReward} className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto_1fr]">
              <select className={inputClass} required value={rewardStudent} onChange={(event) => setRewardStudent(event.target.value)}>
                <option value="">Chọn học sinh</option>
                {students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
              </select>
              <input className={`${inputClass} sm:w-20`} aria-label="Biểu tượng vật phẩm" maxLength={8} value={rewardIcon} onChange={(event) => setRewardIcon(event.target.value)} />
              <input className={inputClass} required maxLength={80} value={rewardName} onChange={(event) => setRewardName(event.target.value)} placeholder="Tên vật phẩm" />
              <input className={`${inputClass} sm:col-span-2`} maxLength={240} value={rewardNote} onChange={(event) => setRewardNote(event.target.value)} placeholder="Lời nhắn (không bắt buộc)" />
              <button className={`${buttonClass} sm:col-span-3`} disabled={busy}>Tặng vật phẩm · Không trừ điểm</button>
            </form>
          )}
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {features?.rewards.length ? features.rewards.slice(0, 12).map((reward) => (
              <article key={reward.id} className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-3">
                <span className="text-2xl">{reward.icon}</span>
                <div><p className="text-sm font-bold text-slate-900">{reward.itemName}</p><p className="text-xs text-slate-600">Tặng {reward.studentName}{reward.note ? ` · ${reward.note}` : ''}</p></div>
              </article>
            )) : <p className="text-sm text-slate-500">Vật phẩm cô giáo trao tặng sẽ được lưu tại đây.</p>}
          </div>
        </section>
      </div>

      {isStudent && (
        <section className={panelClass}>
          <h2 className="text-lg font-extrabold text-slate-900">Đổi PIN chung sang PIN riêng</h2>
          <p className="mt-1 text-sm text-slate-600">Sau khi đổi, em đăng nhập bằng PIN riêng của mình.</p>
          <form onSubmit={changePin} className="mt-4 grid gap-2 sm:grid-cols-3">
            <input className={inputClass} type="password" inputMode="numeric" maxLength={6} required value={currentPin} onChange={(event) => setCurrentPin(event.target.value.replace(/\D/g, ''))} placeholder="PIN hiện tại" />
            <input className={inputClass} type="password" inputMode="numeric" maxLength={6} minLength={4} required value={newPin} onChange={(event) => setNewPin(event.target.value.replace(/\D/g, ''))} placeholder="PIN mới (4–6 số)" />
            <button className={buttonClass} disabled={busy}>Đổi PIN</button>
          </form>
        </section>
      )}

      {isTeacher && (
        <section className={panelClass}>
          <h2 className="text-lg font-extrabold text-slate-900">Báo cáo riêng gửi phụ huynh</h2>
          <p className="mt-1 text-sm text-slate-600">Chọn từng học sinh và khoảng thời gian; chỉ giáo viên mới truy cập báo cáo.</p>
          <form onSubmit={(event) => { event.preventDefault(); void downloadExcel(); }} className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <select className={inputClass} required value={reportStudent} onChange={(event) => setReportStudent(event.target.value)}>
              <option value="">Chọn học sinh</option>
              {students.map((student) => <option key={student.id} value={student.id}>{student.name} · {student.code}</option>)}
            </select>
            <input className={inputClass} type="date" required value={reportStart} onChange={(event) => setReportStart(event.target.value)} />
            <input className={inputClass} type="date" required value={reportEnd} onChange={(event) => setReportEnd(event.target.value)} />
            <div className="flex gap-2">
              <button type="button" className={`${buttonClass} flex-1`} disabled={!reportStudent} onClick={() => void printReport()}>Lưu PDF</button>
              <button type="submit" className={`${buttonClass} flex-1`} disabled={!reportStudent}>Excel</button>
            </div>
          </form>
          <form onSubmit={configureSharedPin} className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row">
            <label className="flex-1 text-sm font-semibold text-slate-700">
              PIN chung ban đầu cho học sinh
              <input className={`${inputClass} mt-1`} type="password" inputMode="numeric" maxLength={6} minLength={4} value={sharedPin} onChange={(event) => setSharedPin(event.target.value.replace(/\D/g, ''))} placeholder={features?.hasStudentInitialPin ? 'Đã thiết lập · nhập PIN mới để đổi' : '4–6 chữ số'} />
            </label>
            <button className={`${buttonClass} self-end`} disabled={busy || sharedPin.length < 4}>Lưu PIN chung</button>
          </form>
        </section>
      )}
    </div>
  );
};
