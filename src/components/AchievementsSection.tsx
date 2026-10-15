import React, { useState } from 'react';
import { Achievement, StudentAchievement, Student } from '../types';
import { Award, Sparkles, Star, Heart, Calendar } from 'lucide-react';

interface AchievementsSectionProps {
  achievements: Achievement[];
  studentAchievements: StudentAchievement[];
  students: Student[];
}

export const AchievementsSection: React.FC<AchievementsSectionProps> = ({
  achievements,
  studentAchievements,
  students,
}) => {
  const [selectedAchievementId, setSelectedAchievementId] = useState<string>('all');

  const filteredItems = studentAchievements.filter((sa) => {
    if (selectedAchievementId !== 'all' && sa.achievementId !== selectedAchievementId) {
      return false;
    }
    return true;
  });

  return (
    <div className="bg-white/95 rounded-3xl border border-emerald-100 shadow-sm p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-600 mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>VƯỜN HOA THÀNH TÍCH A11K65</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            Tôn Vinh Nỗ Lực & Sự Tử Tế
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ghi nhận sự tiến bộ vượt bậc, tình bạn sẻ chia và tinh thần trách nhiệm.
          </p>
        </div>

        {/* Filter Badges */}
        <select
          value={selectedAchievementId}
          onChange={(e) => setSelectedAchievementId(e.target.value)}
          className="py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
        >
          <option value="all">Tất cả danh hiệu ({studentAchievements.length})</option>
          {achievements.map((ach) => (
            <option key={ach.id} value={ach.id}>
              {ach.icon} {ach.title}
            </option>
          ))}
        </select>
      </div>

      {/* 8 Badges Catalog Carousel / Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {achievements.map((ach) => {
          const count = studentAchievements.filter((sa) => sa.achievementId === ach.id).length;
          const isSelected = selectedAchievementId === ach.id;

          return (
            <button
              key={ach.id}
              onClick={() => setSelectedAchievementId(isSelected ? 'all' : ach.id)}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-between ${
                isSelected
                  ? 'border-amber-500 bg-amber-50/80 shadow-sm ring-1 ring-amber-500'
                  : 'border-slate-200 bg-slate-50/50 hover:bg-white'
              }`}
            >
              <span className="text-2xl mb-1">{ach.icon}</span>
              <span className="text-[11px] font-bold text-slate-900 leading-tight line-clamp-1">
                {ach.title}
              </span>
              <span className="text-[10px] text-amber-700 font-semibold mt-1 bg-amber-100/70 px-1.5 py-0.2 rounded-full">
                {count} bạn
              </span>
            </button>
          );
        })}
      </div>

      {/* Honored Students List */}
      <div className="space-y-3 pt-2">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          Gương mặt tiêu biểu được tuyên dương ({filteredItems.length})
        </h3>

        {filteredItems.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
            Chưa có học sinh nào nhận danh hiệu này. Cô Hằng sẽ tiếp tục theo dõi và trao tặng nhé!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredItems.map((item) => {
              const student = students.find((s) => s.id === item.studentId);
              const ach = achievements.find((a) => a.id === item.achievementId);

              return (
                <div
                  key={item.id}
                  className="p-3.5 bg-gradient-to-br from-amber-50/40 to-slate-50 rounded-2xl border border-amber-200/80 flex items-start gap-3 shadow-2xl-soft"
                >
                  <span className="text-3xl shrink-0 p-1 bg-white rounded-xl shadow-xs">
                    {ach?.icon || '🏆'}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900 text-xs sm:text-sm">
                        {student?.name || 'Học sinh'}
                      </span>
                      <span className="text-[11px] font-mono text-slate-500">
                        ({student?.code})
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-amber-800">
                      {ach?.title}
                    </div>

                    <p className="text-[11px] text-slate-600 italic">
                      &ldquo;{item.reason || ach?.description}&rdquo;
                    </p>

                    <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(item.awardedAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
