import * as Markdown from "markdown-it";
import { slugify } from "../../util";

// TODO Improve this
export default (md: Markdown): void => {
  md.core.ruler.push("toc", (rule) => {
    const root = { children: [] };
    let path: any[] = [root];

    rule.tokens
      .filter((token) => token.type === "heading_open")
      .forEach((token) => {
        const lastLevel = path.length - 1;
        const el = createElement(md, rule, token);
        const level = parseInt(token.tag.substr(1));
        token.attrPush(["id", el.id]);

        if (level > lastLevel) {
          if (!path[path.length - 1].children) {
            path[path.length - 1].children = [];
          }
          path[path.length - 1].children.push(el);
          path.push(el);
        } else if (level < lastLevel) {
          path = path.splice(0, level);
          if (!path[level - 1].children) {
            path[level - 1].children = [];
          }
          path[level - 1].children.push(el);
          path.push(el);
        } else if (level === lastLevel) {
          path.pop();
          if (!path[path.length - 1].children) {
            path[path.length - 1].children = [];
          }
          path[path.length - 1].children.push(el);
          path.push(el);
        }
      });

    rule.env.generatedToc = root.children;

    return false;
  });
};

function createElement(md: any, rule: any, token: any) {
  const tokens = rule.tokens[rule.tokens.indexOf(token) + 1].children;
  const text = md.renderer.render(tokens, md.options, {});
  return {
    title: text,
    id: slugify(text),
  };
}
