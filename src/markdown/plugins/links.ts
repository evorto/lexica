import * as Markdown from "markdown-it";

export default (md: Markdown): void => {
  let hasOpenExternalLink = false;

  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const hrefIndex = token.attrIndex("href");
    if (token.attrs && hrefIndex >= 0) {
      const link = token.attrs[hrefIndex];
      const href = link[1];
      if (isExternal(href)) {
        token.tag = "ExternalLink";
        token.attrSet("target", "_blank");
        token.attrSet("rel", "noopener noreferrer");
        hasOpenExternalLink = true;
      }
    }
    return self.renderToken(tokens, idx, options);
  };

  md.renderer.rules.link_close = (tokens, idx, options, env, self) => {
    if (hasOpenExternalLink) {
      hasOpenExternalLink = false;
      return "</ExternalLink>";
    }
    return self.renderToken(tokens, idx, options);
  };
};

function isExternal(link: string): boolean {
  return /^https?:/.test(link);
}
