import { PlantStageInfo, CollectiveMilestone } from '../types';

export const PLANT_STAGES: PlantStageInfo[] = [
  {
    level: 1,
    name: 'Hạt giống hy vọng',
    minPoints: 0,
    maxPoints: 9,
    description: 'Chậu đất màu mỡ ôm ấp hạt giống hy vọng, bắt đầu hành trình gieo mầm tử tế.',
    icon: '🌱',
  },
  {
    level: 2,
    name: 'Mầm xanh',
    minPoints: 10,
    maxPoints: 19,
    description: 'Mầm xanh đầu tiên đã nhú lên đón ánh mặt trời rực rỡ.',
    icon: '🌿',
  },
  {
    level: 3,
    name: 'Chồi non',
    minPoints: 20,
    maxPoints: 39,
    description: 'Cây nhỏ vươn cao với những nhánh non và chồi biếc đầy sức sống.',
    icon: '🪴',
  },
  {
    level: 4,
    name: 'Cây trưởng thành',
    minPoints: 40,
    maxPoints: 69,
    description: 'Tán lá xum xuê, xanh mướt tràn trề năng lượng tích cực.',
    icon: '🌳',
  },
  {
    level: 5,
    name: 'Cây nở hoa',
    minPoints: 70,
    maxPoints: 99,
    description: 'Những bông hoa tươi thắm tỏa hương thơm ngát của nỗ lực và sự sẻ chia.',
    icon: '🌸',
  },
  {
    level: 6,
    name: 'Cây kết trái',
    minPoints: 100,
    maxPoints: 149,
    description: 'Cây trĩu quả ngọt ngào, minh chứng cho sự kiên trì và tiến bộ vượt bậc.',
    icon: '🍎',
  },
  {
    level: 7,
    name: 'Cây hạnh phúc',
    minPoints: 150,
    maxPoints: 9999,
    description: 'Khu vườn tâm hồn rực rỡ trọn vẹn hoa thơm quả ngọt, lan tỏa hạnh phúc tới mọi người.',
    icon: '✨',
  },
];

export function getPlantStage(points: number): PlantStageInfo {
  const safePoints = Math.max(0, points);
  for (let i = PLANT_STAGES.length - 1; i >= 0; i--) {
    if (safePoints >= PLANT_STAGES[i].minPoints) {
      return PLANT_STAGES[i];
    }
  }
  return PLANT_STAGES[0];
}

export function getNextStageProgress(points: number): {
  currentStage: PlantStageInfo;
  nextStage: PlantStageInfo | null;
  progressPercent: number;
  pointsNeeded: number;
} {
  const safePoints = Math.max(0, points);
  const currentStage = getPlantStage(safePoints);
  const currentIndex = PLANT_STAGES.findIndex(s => s.level === currentStage.level);
  
  if (currentIndex === PLANT_STAGES.length - 1) {
    return {
      currentStage,
      nextStage: null,
      progressPercent: 100,
      pointsNeeded: 0,
    };
  }

  const nextStage = PLANT_STAGES[currentIndex + 1];
  const range = nextStage.minPoints - currentStage.minPoints;
  const earnedInRange = safePoints - currentStage.minPoints;
  const progressPercent = Math.min(100, Math.max(0, Math.round((earnedInRange / range) * 100)));
  const pointsNeeded = Math.max(0, nextStage.minPoints - safePoints);

  return {
    currentStage,
    nextStage,
    progressPercent,
    pointsNeeded,
  };
}

export const COLLECTIVE_MILESTONES: CollectiveMilestone[] = [
  {
    level: 1,
    name: 'Khu đất yêu thương',
    minPoints: 0,
    maxPoints: 199,
    description: 'Lớp mình cùng nhau chuẩn bị mảnh đất tâm hồn chan chứa tình cảm.',
  },
  {
    level: 2,
    name: 'Vườn mầm xanh',
    minPoints: 200,
    maxPoints: 499,
    description: 'Cả lớp đã cùng nhau ươm mầm hàng trăm việc tốt rực rỡ.',
  },
  {
    level: 3,
    name: 'Vườn cây trưởng thành',
    minPoints: 500,
    maxPoints: 999,
    description: 'Cây đại thụ A11K65 vươn cao bóng mát che chở mọi ước mơ.',
  },
  {
    level: 4,
    name: 'Vườn hoa đoàn kết',
    minPoints: 1000,
    maxPoints: 1999,
    description: 'Trăm hoa đua nở, tập thể A11K65 gắn kết như một gia đình hạnh phúc.',
  },
  {
    level: 5,
    name: 'Khu vườn hạnh phúc',
    minPoints: 2000,
    maxPoints: 99999,
    description: 'Kỳ tích rực rỡ! Khu vườn hạnh phúc tỏa sáng và lan tỏa muôn nơi.',
  },
];

export function getCollectiveMilestone(totalPoints: number): {
  currentMilestone: CollectiveMilestone;
  nextMilestone: CollectiveMilestone | null;
  progressPercent: number;
  pointsNeeded: number;
} {
  const safePoints = Math.max(0, totalPoints);
  let currentMilestone = COLLECTIVE_MILESTONES[0];
  
  for (let i = COLLECTIVE_MILESTONES.length - 1; i >= 0; i--) {
    if (safePoints >= COLLECTIVE_MILESTONES[i].minPoints) {
      currentMilestone = COLLECTIVE_MILESTONES[i];
      break;
    }
  }

  const currentIndex = COLLECTIVE_MILESTONES.findIndex(m => m.level === currentMilestone.level);
  if (currentIndex === COLLECTIVE_MILESTONES.length - 1) {
    return {
      currentMilestone,
      nextMilestone: null,
      progressPercent: 100,
      pointsNeeded: 0,
    };
  }

  const nextMilestone = COLLECTIVE_MILESTONES[currentIndex + 1];
  const range = nextMilestone.minPoints - currentMilestone.minPoints;
  const earnedInRange = safePoints - currentMilestone.minPoints;
  const progressPercent = Math.min(100, Math.max(0, Math.round((earnedInRange / range) * 100)));
  const pointsNeeded = Math.max(0, nextMilestone.minPoints - safePoints);

  return {
    currentMilestone,
    nextMilestone,
    progressPercent,
    pointsNeeded,
  };
}
