import { readFileSync } from 'node:fs';

const app = readFileSync('src/App.tsx', 'utf8');
const data = readFileSync('src/data/releaseReadiness.ts', 'utf8');

if (!app.includes('ReleaseReadiness')) {
  throw new Error('ReleaseReadiness component is not integrated into App.tsx');
}

if (!data.includes('Artifact traceability')) {
  throw new Error('Release readiness data is missing expected item');
}

console.log('release readiness validation passed');
