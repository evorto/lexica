import * as Markdown from "markdown-it";
import * as container from "markdown-it-container";

export default (md: Markdown): void => {
  const boxes = ["info", "warning", "danger", "theme"];
  for (const box of boxes) {
    const regex = new RegExp(`^${box}+(.*)$`);
    md.use(container, box, {
      validate: (params: any) => {
        return params.trim().match(regex);
      },
      render: (tokens: any, idx: any) => {
        const match = tokens[idx].info.trim().match(regex);
        if (tokens[idx].nesting === 1) {
          let out = `<div class="box box-${box}">`;
          if (match[1]) {
            out += `<span class="box-header">${md.utils.escapeHtml(match[1])}</span>`;
          }
          return out + "\n";
        } else {
          return "</div>\n";
        }
      },
    });
  }
};
