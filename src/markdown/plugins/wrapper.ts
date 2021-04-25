import * as Markdown from "markdown-it";

export default (md: Markdown): void => {
  console.log('init')
  md.renderer.rules.table_open = function () {
    console.log('opened!')
    return '<div class="table-wrapper"><table class="table">\n';
  };
  md.renderer.rules.table_close = function () {
    return '</table></div>\n';
  };
}
