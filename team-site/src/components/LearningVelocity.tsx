import { TrendingUp } from 'lucide-react';
import type { Course } from '../data/courses';

type LearningVelocityProps = {
  courses: Course[];
};

export function LearningVelocity({ courses }: LearningVelocityProps) {
  const readyModules = courses.filter((course) => course.progress >= 60).length;

  return (
    <section className="velocityBand" aria-label="Learning Velocity">
      <div>
        <p className="eyebrow">Learning Velocity</p>
        <h2>{readyModules} modules are moving at release pace</h2>
        <p>
          Teams can use this signal to decide where to focus reviews before the
          next deployment window.
        </p>
      </div>
      <div className="velocityMeter">
        <TrendingUp size={28} />
        <strong>{Math.round((readyModules / courses.length) * 100)}%</strong>
        <span>review-ready</span>
      </div>
    </section>
  );
}
