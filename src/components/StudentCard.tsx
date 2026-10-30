import React from 'react';
import { Student, Team } from '../types';
import { PlantIllustration } from './PlantIllustration';
import { getNextStageProgress } from '../utils/plantLevels';
import { Sparkles, Sprout, Pencil } from 'lucide-react';

interface StudentCardProps {
  student: Student;
  team?: Team;
  canAwardPoints: boolean;
  isTeacher?: boolean;
  onAwardClick: (student: Student) => void;
  onViewDetails: (student: Student) => void;
  onEditName?: (student: Student) => void;
}

export const StudentCard: React.FC<StudentCardProps> = ({
  student,
  team,
  canAwardPoints,
  isTeacher = false,
  onAwardClick,
  onViewDetails,
  onEditName,
}) => {
  const { currentStage, progressPercent } = getNextStageProgress(student.totalPoints);

  const getRoleBadge = () => {
    if (student.role === 'class_president') {
      return (
        <span className="text-[11px] font-bold text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-300">
          👑 Lớp trưởng
        </span>
      );
    }
    if (student.role === 'team_leader') {
      return (
        <span className="text-[11px] font-bold text-teal-700 bg-teal-100/90 px-2 py-0.5 rounded-full border border-teal-300">
          ⭐ Tổ trưởng
        </span>
      );
    }
    return null;
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Xem chậu cây của ${student.name}`}
      onClick={() => onViewDetails(student)}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onViewDetails(student);
        }
      }}
      className="student-plant-card group relative bg-white/95 rounded-2xl p-4 shadow-sm hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 transition-all duration-300 border border-emerald-100 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
    >
      {/* Top Row: Code, Team, and Role Badge */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
            {student.code}
          </span>
          <span
            className="text-[11px] font-semibold px-2 py-0.5 rounded-full text-slate-700 bg-emerald-50 border border-emerald-200"
            style={{ borderColor: team?.color ? `${team.color}40` : undefined }}
          >
            {team?.name ? team.name.split('(')[0].trim() : 'Lớp A11K65'}
          </span>
        </div>
        {getRoleBadge()}
      </div>

      {/* Center: Plant Stage Illustration */}
      <div className="flex flex-col items-center justify-center my-1 relative">
        <PlantIllustration level={currentStage.level} className="w-28 h-28 sm:w-32 sm:h-32" />
        <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full mt-1">
          {currentStage.name}
        </div>
      </div>

      {/* Student Name & Total Points */}
      <div className="text-center mt-2 relative">
        <div className="flex items-center justify-center gap-1">
          <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-emerald-700 transition-colors line-clamp-1">
            {student.name}
          </h3>
          {isTeacher && onEditName && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditName(student);
              }}
              className="p-1 rounded-md text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 transition shrink-0"
              title="Chỉnh sửa tên học sinh"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-center gap-1 mt-1 text-xs">
          <span className="text-slate-500">Điểm tích lũy:</span>
          <span className="font-extrabold text-emerald-600 text-sm tabular-nums">
            +{student.totalPoints} đ
          </span>
        </div>
      </div>

      {/* Progress Bar to next level */}
      <div className="mt-3">
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden p-0.5">
          <div
            className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
          <span>Cấp {currentStage.level}</span>
          <span>{progressPercent}%</span>
          <span>Cấp {Math.min(7, currentStage.level + 1)}</span>
        </div>
      </div>

      {/* Action: Gieo mầm yêu thương button */}
      <div className="mt-3 pt-2 border-t border-slate-100">
        {canAwardPoints ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAwardClick(student);
            }}
            className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-sm hover:shadow hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Sprout className="w-4 h-4" />
            <span>Gieo mầm yêu thương</span>
          </button>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(student);
            }}
            className="w-full py-1.5 text-xs text-slate-500 hover:text-emerald-700 flex items-center justify-center gap-1 font-medium hover:bg-emerald-50 rounded-lg transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Xem chậu cây & nhật ký</span>
          </button>
        )}
      </div>
    </div>
  );
};
