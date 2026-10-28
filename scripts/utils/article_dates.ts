import type { ArticleAttributes } from '../types.ts';

export function normalizeDate(value: unknown, field: string): string | undefined {
  if (value == null || value === '') return undefined;
  if ((typeof value !== 'string' && !(value instanceof Date)) ||
      (value instanceof Date && !Number.isFinite(value.getTime()))) {
    throw new Error(`${field} 包含无效日期: ${String(value)}`);
  }
  const source = value instanceof Date ? value.toISOString() : String(value).trim();
  const date = new Date(source);
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(source);
  const calendar = /^(\d{4}-\d{2}-\d{2})(?:T|$)/.exec(source)?.[1];
  const day = calendar ? new Date(`${calendar}T00:00:00Z`) : undefined;
  if (!Number.isFinite(date.getTime()) || !day || !Number.isFinite(day.getTime()) ||
      day.toISOString().slice(0, 10) !== calendar ||
      (!dateOnly && !/(?:Z|[+-]\d{2}:\d{2})$/.test(source))) {
    throw new Error(`${field} 包含无效日期: ${source}`);
  }
  // 日期字段不补造具体时刻; 带时区的时间戳统一为 UTC.
  return dateOnly ? source : date.toISOString();
}

export function latestDate(values: (string | undefined)[]): string | undefined {
  return values.reduce<string | undefined>((latest, value) =>
    value && (!latest || Date.parse(value) > Date.parse(latest)) ? value : latest, undefined);
}

export function articleModifiedTime(attributes: ArticleAttributes): string | undefined {
  // 只采用作者声明的日期, 避免 Git checkout 或部署时间伪装成内容更新.
  return latestDate([
    normalizeDate(attributes.publish_time, 'publish_time'),
    normalizeDate(attributes.updated_time, 'updated_time'),
    ...(attributes.updates ?? []).map((update, index) => normalizeDate(update.time, `updates[${index}].time`)),
  ]);
}
