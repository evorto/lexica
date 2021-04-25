import * as Markdown from "markdown-it";
import * as emoji from "markdown-it-emoji";
import * as attrs from "markdown-it-attrs";
import containers from "./plugins/containers";
import math from "./plugins/math";
import assets from "./plugins/assets";
import links from "./plugins/links";
import toc from "./plugins/toc";
import wrapper from "./plugins/wrapper";
import { Article, Lecture, Options } from "../tools/build";

const buildBasic = () => {
  return new Markdown({
    html: true,
    quotes: "„“‚‘",
  });
};

const mdArticle = buildBasic();
mdArticle.use(emoji);
mdArticle.use(attrs);
mdArticle.use(wrapper);
mdArticle.use(containers)
mdArticle.use(math);
mdArticle.use(assets);
mdArticle.use(links);
mdArticle.use(toc);

export const renderArticle = (options: Options, article: Article, lecture: Lecture, content: string) => {
  const env = {
    assetDest: options.assetDest,
    path: article.path,
    lectureUrl: lecture.url,
    hasMath: false,
    generatedToc: [],
  };
  const html = mdArticle.render(content, env)
  return { content: html, env };
};
