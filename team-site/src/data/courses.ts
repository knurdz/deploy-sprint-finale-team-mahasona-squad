export type Course = {
  id: string;
  title: string;
  track: string;
  cohort: string;
  progress: number;
  deadline: string;
  nextAction: string;
};

export const courses: Course[] = [
  {
    id: 'git-foundations',
    title: 'Git Foundations',
    track: 'Version Control',
    cohort: 'Qualifier A',
    progress: 72,
    deadline: 'Friday 18:00',
    nextAction: 'Complete the branching lab and push your latest changes.',
  },
  {
    id: 'github-collaboration',
    title: 'GitHub Collaboration',
    track: 'Pull Requests',
    cohort: 'Qualifier B',
    progress: 64,
    deadline: 'Saturday 10:00',
    nextAction: 'Review a teammate pull request and leave an inline comment.',
  },
  {
    id: 'gitops-delivery',
    title: 'GitOps Delivery',
    track: 'Automation',
    cohort: 'Qualifier C',
    progress: 58,
    deadline: 'Sunday 16:00',
    nextAction: 'Inspect the release workflow before enabling deployment.',
  },
];
