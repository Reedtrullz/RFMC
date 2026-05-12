import { LessonProgress } from './trainingTypes';

export class LessonProgressManager {
  private progress: Record<string, LessonProgress> = {};

  constructor() {
    this.load();
  }

  private load() {
    const saved = localStorage.getItem('rfms_training_progress');
    if (saved) {
      this.progress = JSON.parse(saved);
    }
  }

  private save() {
    localStorage.setItem('rfms_training_progress', JSON.stringify(this.progress));
  }

  getProgress(scenarioId: string): LessonProgress {
    return this.progress[scenarioId] || {
      scenarioId,
      completed: false,
      bestScore: 0,
      lastAttempt: 0,
      locked: false // Logic for locking could be added here
    };
  }

  completeLesson(scenarioId: string, score: number) {
    const current = this.getProgress(scenarioId);
    this.progress[scenarioId] = {
      ...current,
      completed: true,
      bestScore: Math.max(current.bestScore, score),
      lastAttempt: Date.now()
    };
    this.save();
  }
}

export const progressManager = new LessonProgressManager();
