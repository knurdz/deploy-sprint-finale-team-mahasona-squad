export type ReleaseReadinessItem = {
  label: string;
  status: 'ready' | 'watch' | 'blocked';
};

export const releaseReadinessItems: ReleaseReadinessItem[] = [
  { label: 'Artifact traceability', status: 'ready' },
  { label: 'Rollback rehearsal', status: 'watch' },
  { label: 'Secret review', status: 'ready' },
];
