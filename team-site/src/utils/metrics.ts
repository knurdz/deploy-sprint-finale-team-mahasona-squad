import type { Course } from '../data/courses';

export function getAverageProgress(courses: Course[]) {
  if (courses.length === 0) {
    return 0;
  }

  const total = courses.reduce((sum, course) => sum + course.progress, 0);
  const average = Math.round(total / courses.length);
  return Math.min(100, Math.max(0, average));
}
