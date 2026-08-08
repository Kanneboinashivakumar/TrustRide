export interface ComplianceStandard {
  id: string;
  name: string;
  fullName: string;
  description: string;
  score: number;
  status: 'ALIGNED' | 'IN_PROGRESS' | 'PENDING';
  controls: Array<{
    id: string;
    title: string;
    description: string;
    status: 'passed' | 'warning' | 'failed';
    evidence: string;
  }>;
}
