export type DeadlineCard = {
  id: string;
  label: string;
  due: string;
  action: string;
};

export const deadlineCards: DeadlineCard[] = [
  {
    id: 'repo-setup-checkpoint',
    label: 'Repo setup checkpoint',
    due: 'Friday 20:00',
    action: 'Verify your assigned repository, remotes, and all challenge branches before feature work.',
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
