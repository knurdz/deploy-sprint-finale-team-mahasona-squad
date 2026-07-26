import { ArrowUpRight, Clock3 } from 'lucide-react';
import type { Course } from '../data/courses';

type CourseCardProps = {
  course: Course;
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <article className="courseCard">
      <div>
        <div className="courseMeta">
          <span>{course.track}</span>
          <span>{course.cohort}</span>
        </div>
        <h3>{course.title}</h3>
        <p>{course.nextAction}</p>
      </div>

      <div className="courseFooter">
        <div className="progressWrap" aria-label={`${course.progress}% complete`}>
          <span style={{ width: `${course.progress}%` }} />
        </div>
        <span className="deadline">
          <Clock3 size={15} />
          {course.deadline}
        </span>
        <button aria-label={`Open ${course.title}`}>
          <ArrowUpRight size={18} />
        </button>
      </div>
    </article>
  );
}
