export interface LogFile {
  name: string;
  content: string;
  type: 'log' | 'config' | 'code';
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: number;
  isThinking?: boolean;
}

export interface RepoContext {
  repoUrl: string;
  branch: string;
  buildVersion: string;
  hasAccess: boolean;
  customSnippet?: string;
}

export enum AnalysisType {
  UNKNOWN = 'UNKNOWN',
  CONFIGURATION = 'CONFIGURATION',
  BUG = 'BUG',
}

export interface AnalysisResult {
  type: AnalysisType;
  summary: string;
  fixSuggestion: string;
  patchCode?: string; // If it's a bug
}