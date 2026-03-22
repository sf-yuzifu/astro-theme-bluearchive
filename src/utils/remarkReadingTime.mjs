import { toString } from 'mdast-util-to-string';
import readingTime from 'reading-time';

export function remarkReadingTime() {
  return function (tree, { data }) {
    const textOnPage = toString(tree);
    const readingTimeResult = readingTime(textOnPage);
    // readingTime.words 给出了大概的字数
    // readingTimeResult.text 原本是 "x min read"，这里我们替换成中文
    const minutes = Math.ceil(readingTimeResult.minutes);
    data.astro.frontmatter.minutesRead = `预计 ${minutes} 分钟`;
    data.astro.frontmatter.wordCount = readingTimeResult.words;
  };
}