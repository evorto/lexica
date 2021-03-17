import * as filepath from "path";
import * as fs from "fs";
import * as ejs from "ejs";
import { check, LexicaError, loadYaml } from "../util";
import { renderArticle } from "../markdown";
import * as yaml from "yaml";

type Author = {
  id: string;
  name: string;
};

type Category = {
  type: string;
  slug: string;
  url: string;
  title: string;
  build: (dest: string, children: any) => void;
};

export type Lecture = {
  slug: string;
  url: string;
  title: string;
  description: string;
  pages: string[];
};

export type Article = {
  path: string;
  slug: string;
  url: string;
  title: string;
  description: string;
};

export type Options = {
  source: string;
  authors: string;
  dest: string;
  assetDest: string;
  app: string;
  domain: string;
  baseUrl: string;
};

export const build = (options: Options) => {
  const authors: Author[] = [];
  const categories: Category[] = [];
  let current: Lecture | null;

  check(options.source, "No source has been set");
  check(options.dest, "No dest has been set");
  options.baseUrl = options.baseUrl || "";
  options.assetDest = options.assetDest || filepath.join(options.dest, "_assets");

  if (options.authors) {
    fs.readdirSync(options.authors).forEach((file) => {
      authors.push({
        id: file.split(".").slice(0, -1).join("."),
        ...yaml.parse(fs.readFileSync(filepath.join(options.authors, file), "utf8")),
      });
    });
  }

  const tmpCategory = fs.readFileSync(filepath.join(__dirname, "../../template/category.ejs"), "utf8");
  const tmpArticle = fs.readFileSync(filepath.join(__dirname, "../../template/article.ejs"), "utf8");

  const traverse = (path: string) => {
    const files = fs.readdirSync(path);

    let file = loadYaml("category", [path]);
    if (file) {
      const slug = filepath.basename(path);
      const category: Category = {
        type: "category",
        slug: slug,
        url: categories.length === 0 ? `${options.baseUrl}/de/${slug}` : `${categories[0].url}/${slug}`,
        ...file,
        build(dest: string, children: any) {
          fs.mkdirSync(filepath.join(dest, this.url), { recursive: true });
          const out = ejs.render(tmpCategory, {
            app: options.app,
            domain: options.domain,
            category: this,
            categories: categories,
            children,
          });
          fs.writeFileSync(filepath.join(dest, this.url, "index.svelte"), out);
        },
      };

      categories.push(category);

      const children: any[] = [];
      for (const file of files) {
        if (fs.statSync(filepath.join(path, file)).isDirectory()) {
          children.push(traverse(filepath.join(path, file)));
        }
      }

      category.build(options.dest, children);
      categories.pop();
      return category;
    }

    file = loadYaml("lecture", [path]);
    if (file) {
      check(categories.length > 0, "Lecture must be inside category: " + path);

      const slug = filepath.basename(path);
      const lecture = {
        slug: slug,
        url: `${categories[0].url}/${slug}`,
        ...file,
      };

      current = lecture;

      const pages: any[] = [];
      for (const file of files) {
        if (fs.statSync(filepath.join(path, file)).isDirectory()) {
          const page = traverse(filepath.join(path, file));
          page && pages.push(page);
        }
      }

      const pageList = pages.map((page) => str(page));

      let nx;
      let pr;
      for (const page of pages) {
        pr = page.index > 0 ? str(pages.find((_) => _.index === page.index - 1)) : "undefined";
        nx = page.index < lecture.pages.length - 1 ? str(pages.find((_) => _.index === page.index + 1)) : "undefined";
        const aut = authors.filter((_) => page.authors && page.authors.indexOf(_.id) >= 0);
        page.build(options.dest, pages, pageList, aut, nx, pr);
      }

      current = null;
      return lecture;
    }

    file = loadYaml("article", [path]);
    if (file) {
      if (!current) {
        throw new LexicaError("Article must be inside lecture: " + path);
      }

      const slug = filepath.basename(path);
      const article: Article = {
        type: "article",
        path: path,
        slug: slug,
        url: current.pages.length > 0 && current.pages[0] === slug ? current.url : `${current.url}/${slug}`,
        index: current.pages.findIndex((page) => page === slug),
        ...file,
        build(dest: string, pages: any, pageList: string[], authors: Author[], previous: string, next: string) {
          fs.mkdirSync(filepath.join(dest, this.url), { recursive: true });
          const md = fs.readFileSync(filepath.join(this.path, "README.md"), "utf8");
          const { content, env } = renderArticle(options, this, current!, md);
          const out = ejs.render(tmpArticle, {
            app: options.app,
            domain: options.domain,
            lecture: current,
            article: this,
            hasMath: env.hasMath,
            toc: env.generatedToc,
            path: filepath.relative(options.source, this.path),
            content,
            categories,
            pages,
            pageList,
            authors,
            previous,
            next,
          });
          fs.writeFileSync(filepath.join(dest, this.url, "index.svelte"), out);
        },
      };
      return article;
    }

    for (const file of files) {
      if (fs.statSync(filepath.join(path, file)).isDirectory()) {
        traverse(filepath.join(path, file));
      }
    }

    return null;
  };

  return traverse(options.source);
};

function str(page: any) {
  if (!page) {
    return "undefined";
  }
  return JSON.stringify({
    title: page.title,
    type: page.type,
    slug: page.slug,
    url: page.url,
  });
}
