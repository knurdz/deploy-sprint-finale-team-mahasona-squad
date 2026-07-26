export type SprintStat = {
  label: string;
  value: string;
  detail: string;
  tone: 'teal' | 'amber' | 'blue';
};

export const sprintStats: SprintStat[] = [
  {
    label: 'Active learners',
    value: '128',
    detail: '+12 this week',
    tone: 'teal',
  },
  {
    label: 'Pending reviews',
    value: '24',
    detail: '8 need inline notes',
    tone: 'amber',
  },
  {
    label: 'Release checks',
    value: '91%',
    detail: 'healthy pipeline',
    tone: 'blue',
  },
];
