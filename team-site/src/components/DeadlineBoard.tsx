import { CalendarClock, CheckCircle2 } from 'lucide-react';
import type { DeadlineCard } from '../data/deadlines';

type DeadlineBoardProps = {
  deadlines: DeadlineCard[];
};

export function DeadlineBoard({ deadlines }: DeadlineBoardProps) {
  return (
    <aside className="panel deadlinePanel" id="deadlines">
      <div className="panelHeader">
        <div>
          <p className="eyebrow">Deadlines</p>
          <h2>Release readiness</h2>
        </div>
        <CalendarClock size={22} />
      </div>

      <div className="deadlineList">
        {deadlines.map((deadline) => (
          <article className="deadlineItem" key={deadline.id}>
            <div className="deadlineIcon">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <h3>{deadline.label}</h3>
              <p>{deadline.action}</p>
              <span>{deadline.due}</span>
            </div>
          </article>
        ))}
      </div>
    </aside>
  );
}
