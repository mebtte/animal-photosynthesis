/** lrc 行 */
interface LrcLine {
  /** 行号 */
  lineNumber: number;
  /** 行原始数据 */
  raw: string;
}

/** 元数据行 */
interface MetadataLine extends LrcLine {
  key: string;
  value: string;
}

/** 歌词行 */
interface LyricLine extends LrcLine {
  /** 开始时间, 毫秒 */
  startMillisecond: number;
  /** 歌词 */
  content: string;
}

const LYRIC_LINE = /^((?:\[\d+:\d+(?:\.\d+)?\])+)(.*)$/;
const METADATA_LINE = /^\[(.+?):(.*?)\]$/;

function parse(lrc: string) {
  const metadataLines: MetadataLine[] = []; // 元数据行
  const lyricLines: LyricLine[] = []; // 歌词行
  const invalidLines: LrcLine[] = []; // 无法解析的行

  const lines = lrc.split("\n"); // 分隔成独立的行

  for (let i = 0, { length } = lines; i < length; i += 1) {
    const line = lines[i];

    // 歌词行
    const lyricLineMatch = line.match(LYRIC_LINE);
    if (lyricLineMatch) {
      /***
       * 利用了正则的分组
       * 第一个分组是所有时间标签
       * 第二个分组是歌词文本
       */
      const timeTagPart = lyricLineMatch[1];
      const content = lyricLineMatch[2];

      /**
       * 分割多个时间标签
       * 每一个时间标签对应一行歌词
       * 正则表示右方括号和左方括号的位置, 也就是两个时间标签中间位置
       */
      for (const timeTag of timeTagPart.split(/(?<=\])(?=\[)/)) {
        /**
         * 利用了正则的分组
         * 第一个分组是分
         * 第二个分组是秒
         * 第三个分组是百分之一秒, 可能没有
         */
        const timeMatch = timeTag.match(/\[(\d+):(\d+)(?:\.(\d+))?\]/);

        const minute = timeMatch[1];
        const second = timeMatch[2];
        const centisecond = timeMatch[3] || "00"; // 没有的话默认 00

        /** 字符串前面添加 + 可以将字符串转换成数字 */
        lyricLines.push({
          lineNumber: i,
          raw: line,
          startMillisecond:
            +minute * 60 * 1000 + +second * 1000 + +centisecond * 10,
          content,
        });
      }

      continue;
    }

    // 元数据行
    const metadataLineMatch = line.match(METADATA_LINE);
    if (metadataLineMatch) {
      const key = metadataLineMatch[1];
      const value = metadataLineMatch[2];

      metadataLines.push({
        lineNumber: i,
        raw: line,
        key,
        value,
      });

      continue;
    }

    // 无法解析
    invalidLines.push({
      lineNumber: i,
      raw: line,
    });
  }

  return {
    metadataLines,
    lyricLines,
    invalidLines,
  };
}
