export interface ArticleAttributes {
  title?: string;
  publish_time?: string;
  updated_time?: string;
  hidden?: boolean;
  updates?: { time: string; description: string }[];
}

export interface ArticleSummary {
  id: string;
  title: string;
  description: string;
  publishTime?: string;
  modifiedTime?: string;
}
