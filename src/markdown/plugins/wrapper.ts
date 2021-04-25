import * as Markdown from "markdown-it";

export default (md: Markdown): void => {
  md.renderer.rules.table_open = function () {
    return '<div class="table-wrapper"><table class="table">\n';
  };
  md.renderer.rules.table_close = function () {
    return '</table></div>\n';
  };
}
