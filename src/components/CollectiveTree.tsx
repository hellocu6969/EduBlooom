import React, { useState } from 'react';
import { Sparkles, Trophy, Heart, Users, ChevronRight } from 'lucide-react';
import { getCollectiveMilestone } from '../utils/plantLevels';

interface CollectiveTreeProps {
  totalClassPoints: number;
  totalDeedsCount: number;
  totalStudentsCount: number;
}

export const CollectiveTree: React.FC<CollectiveTreeProps> = ({
  totalClassPoints,
  totalDeedsCount,
  totalStudentsCount,
}) => {
  const [showMilestonesModal, setShowMilestonesModal] = useState(false);
  const { currentMilestone, nextMilestone, progressPercent, pointsNeeded } =
    getCollectiveMilestone(totalClassPoints);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-800 text-white p-6 sm:p-8 shadow-xl">
      {/* Background soft glowing patterns */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-64 h-64 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 justify-between">
        {/* Left Side: Tree Visual and Stage */}
        <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 flex items-center justify-center bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-2 shadow-inner">
            {/* Grand Tree Vector */}
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
              <defs>
                <linearGradient id="treeGold" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#FEF08A" />
                  <stop offset="100%" stopColor="#F59E0B" />
                </linearGradient>
              </defs>
              {/* Trunk */}
              <path d="M46 95 L48 55 L52 55 L54 95 Z" fill="#78350F" />
              <path d="M48 68 Q38 60 30 55" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
              <path d="M52 65 Q62 58 70 54" stroke="#78350F" strokeWidth="2.5" strokeLinecap="round" />
              {/* Canopy */}
              <circle cx="32" cy="46" r="16" fill="#34D399" opacity="0.9" />
              <circle cx="68" cy="46" r="16" fill="#34D399" opacity="0.9" />
              <circle cx="50" cy="36" r="22" fill="#10B981" />
              <circle cx="38" cy="28" r="14" fill="#6EE7B7" />
              <circle cx="62" cy="28" r="14" fill="#6EE7B7" />
              <circle cx="50" cy="18" r="12" fill="#A7F3D0" />
<<<<<<< HEAD
=======
              <circle cx="25" cy="39" r="6" fill="#059669" />
              <circle cx="39" cy="49" r="5" fill="#10B981" />
              <circle cx="61" cy="48" r="6" fill="#059669" />
              <circle cx="76" cy="38" r="5" fill="#10B981" />
              <circle cx="43" cy="23" r="4" fill="#34D399" />
              <circle cx="59" cy="25" r="4" fill="#34D399" />
              <circle cx="51" cy="42" r="5" fill="#059669" />
>>>>>>> 1a4b379 (3)
              {/* Flowers / Fruit accents */}
              <circle cx="45" cy="30" r="3" fill="#FDA4AF" />
              <circle cx="58" cy="34" r="3" fill="#FDA4AF" />
              <circle cx="32" cy="42" r="3" fill="#FBBF24" />
              <circle cx="68" cy="42" r="3" fill="#F87171" />
              <circle cx="50" cy="20" r="3" fill="url(#treeGold)" />
            </svg>
            <div className="absolute -bottom-2 px-2.5 py-0.5 bg-amber-400 text-slate-900 text-xs font-bold rounded-full shadow-md">
              Cấp {currentMilestone.level}/5
            </div>
          </div>

          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-200 mb-1">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
              CÂY ĐẠI THỤ HẠNH PHÚC A11K65
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              {currentMilestone.name}
            </h2>
            <p className="text-emerald-100 text-sm max-w-md leading-relaxed">
              {currentMilestone.description}
            </p>
          </div>
        </div>

        {/* Right Side: Key Collective Metrics & Progress Bar */}
        <div className="w-full lg:w-96 bg-black/20 backdrop-blur-md rounded-xl p-5 border border-white/10 flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-lg bg-white/5">
              <div className="flex items-center justify-center gap-1 text-xs text-emerald-200 mb-1">
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                Tổng điểm
              </div>
              <div className="text-xl font-extrabold text-amber-300 tabular-nums">
                {totalClassPoints}
              </div>
            </div>

            <div className="p-2 rounded-lg bg-white/5">
              <div className="flex items-center justify-center gap-1 text-xs text-emerald-200 mb-1">
                <Heart className="w-3.5 h-3.5 text-rose-300" />
                Việc tốt
              </div>
              <div className="text-xl font-extrabold text-white tabular-nums">
                {totalDeedsCount}
              </div>
            </div>

            <div className="p-2 rounded-lg bg-white/5">
              <div className="flex items-center justify-center gap-1 text-xs text-emerald-200 mb-1">
                <Users className="w-3.5 h-3.5 text-sky-300" />
                Mầm xanh
              </div>
              <div className="text-xl font-extrabold text-white tabular-nums">
                {totalStudentsCount}
              </div>
            </div>
          </div>

          {/* Progress to next level */}
          <div>
            <div className="flex justify-between items-center text-xs font-medium text-emerald-200 mb-1.5">
              <span>Tiến trình vươn cao</span>
              {nextMilestone ? (
                <span>Còn {pointsNeeded} điểm đến {nextMilestone.name}</span>
              ) : (
                <span className="text-amber-300 font-bold">Đã đạt cảnh giới cao nhất!</span>
              )}
            </div>
            <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-amber-300 to-emerald-300 rounded-full transition-all duration-1000 ease-out shadow-sm"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-emerald-300/80 mt-1">
              <span>{currentMilestone.minPoints} đ</span>
              <span className="font-semibold text-white">{progressPercent}%</span>
              <span>{nextMilestone ? `${nextMilestone.minPoints} đ` : '2000+ đ'}</span>
            </div>
          </div>

          <button
            onClick={() => setShowMilestonesModal(true)}
            className="w-full text-center text-xs text-emerald-200 hover:text-white flex items-center justify-center gap-1 py-1 hover:underline transition-colors"
          >
            Xem lộ trình 5 mốc vườn tập thể
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Modal for 5 Milestones */}
      {showMilestonesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 text-slate-800 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-lg text-slate-900">
                  5 Cấp Độ Vườn Hạnh Phúc Tập Thể
                </h3>
              </div>
              <button
                onClick={() => setShowMilestonesModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              {[
                { lvl: 1, range: '0 – 199 điểm', title: 'Khu đất yêu thương', desc: 'Chuẩn bị mảnh đất tâm hồn chan chứa tình cảm, mỗi việc tốt là một hạt giống gieo vào lòng bạn bè.' },
                { lvl: 2, range: '200 – 499 điểm', title: 'Vườn mầm xanh', desc: 'Hàng trăm việc tốt được ghi nhận, mầm xanh tình bạn bừng nở khắp 4 tổ.' },
                { lvl: 3, range: '500 – 999 điểm', title: 'Vườn cây trưởng thành', desc: 'Cây đại thụ A11K65 vững vàng che bóng mát, lớp học trở thành nơi tràn ngập tiếng cười và thấu hiểu.' },
                { lvl: 4, range: '1.000 – 1.999 điểm', title: 'Vườn hoa đoàn kết', desc: 'Muôn hoa khoe sắc, tinh thần đoàn kết và sẻ chia lan tỏa như một mái nhà yêu thương thực thụ.' },
                { lvl: 5, range: 'Từ 2.000 điểm', title: 'Khu vườn hạnh phúc', desc: 'Cột mốc vinh quang! Một năm học trọn vẹn yêu thương và tự hào của cô Bùi Hằng cùng tập thể A11K65.' },
              ].map((m) => (
                <div
                  key={m.lvl}
                  className={`p-3.5 rounded-xl border transition-all ${
                    currentMilestone.level === m.lvl
                      ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-slate-900 flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        currentMilestone.level === m.lvl ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {m.lvl}
                      </span>
                      {m.title}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                      {m.range}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 pl-8 leading-relaxed">
                    {m.desc}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowMilestonesModal(false)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
