export interface ArticleAttributes {
  title?: string;
  publish_time?: string;
  hidden?: boolean;
  updates?: { time: string; content: string }[];
}

export interface ArticleSummary {
  id: string;
  title: string;
  description: string;
  publishTime?: string;
}
