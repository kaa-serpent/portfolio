export type Locale = "fr" | "en";
export type Localized = Record<Locale, string>;
export type Visibility = "public" | "private" | "fork";
export type ProjectCategory = "ai" | "data" | "automation" | "maker";

export interface Project {
  id: string;
  index?: string;
  title: string;
  visibility: Visibility;
  categories: ProjectCategory[];
  subtitle: Localized;
  overview: Localized;
  challenge: Localized;
  solution: Localized;
  impact: Localized;
  status: Localized;
  tech: string[];
  url?: string;
  media?: string;
  featured?: boolean;
}

export interface Experience {
  period: string;
  role: Localized;
  company: string;
  location: string;
  summary: Localized;
  highlights: Localized[];
  tech: string[];
}

export interface SkillGroup {
  title: Localized;
  intro: Localized;
  items: string[];
}
