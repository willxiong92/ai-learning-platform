export type CrmLessonStatus = "ready" | "planned";

export interface CrmMaterial {
  id: string;
  title: string;
  date: string;
  body: string;
}

export interface CrmFeedbackQuestion {
  question: string;
  options: {
    text: string;
    correct: boolean;
    feedback: string;
  }[];
}

export interface CrmLesson {
  id: string;
  title: string;
  status: CrmLessonStatus;
  duration: string;
  goal: string;
  businessProblem: string;
  inputs: string[];
  steps: string[];
  outputs: string[];
  acceptance: string[];
  sections: { title: string; body: string }[];
  prompts: { title: string; text: string }[];
  reference: { title: string; body: string }[];
  feedback: CrmFeedbackQuestion[];
  practiceFeedback: { symptom: string; repair: string }[];
  futureWork: string[];
}

export interface CrmCurriculum {
  version: string;
  title: string;
  subtitle: string;
  status: string;
  caseName: string;
  caseDisclaimer: string;
  materials: CrmMaterial[];
  factRules: string[];
  lessons: CrmLesson[];
}
