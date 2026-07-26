export type DeadlineCard = {
  id: string;
  label: string;
  due: string;
  action: string;
};

export const deadlineCards: DeadlineCard[] = [
  {
    id: 'merge-conflict-lab',
    label: 'Merge conflict lab',
    due: 'Saturday 10:00',
    action: 'Resolve the deadline clash while preserving both dashboard changes.',
  },
  {
    id: 'review',
    label: 'Review rotation',
    due: 'Saturday 12:00',
    action: 'Assign a teammate to review the next feature pull request.',
  },
  {
    id: 'release',
    label: 'Release rehearsal',
    due: 'Sunday 16:00',
    action: 'Check the workflow status before completing your submission.',
  },
];
