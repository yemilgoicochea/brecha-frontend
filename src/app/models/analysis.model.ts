export interface GapResult {
  name: string;
  score: number; // 0..1
  reason?: string;
}

export interface ProjectAnalysis {
  id: string;
  projectName: string;
  projectCode?: string;
  municipality?: string;
  description?: string;
  fileName?: string;
  createdAt: string; // ISO date
  gaps: GapResult[];
}

export type ProjectAnalysisHistory = ProjectAnalysis[];