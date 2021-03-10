import * as filepath from "path";
import * as fs from "fs";
import * as Markdown from "markdown-it";
import { logger } from "../../logger";

export default (md: Markdown): void => {
  md.renderer.rules.image = function (tokens, idx, options, env, self) {
    const src = tokens[idx].attrGet("src");
    if (src && isRelative(src)) {
      const asset = filepath.join(env.path, src);
      if (fs.existsSync(asset) && !fs.statSync(asset).isFile()) {
        logger.warn("Asset " + asset + " could not not found");
      } else {
        const path = filepath.join(env.lectureUrl, filepath.basename(src));
        copyAsset(env.assetDest, asset, path, src);
        tokens[idx].attrSet("src", decodeURI(path.replace(/\\/g, "/")));
      }
    }
    return self.renderToken(tokens, idx, options);
  };

  // Handles <img> tag
  md.core.ruler.push("images", (state) => {
    for (const token of state.tokens) {
      if (token.type !== "html_block") {
        continue;
      }
      // @ts-ignore
      token.content = token.content.replace(/src="(.+?(?="))"/g, (match, p1) => {
        if (p1 && isRelative(p1)) {
          const asset = filepath.join(state.env.path, p1);
          if (fs.existsSync(asset) && !fs.statSync(asset).isFile()) {
            logger.warn("Asset " + asset + " could not not found");
            return;
          }
          const path = filepath.join(state.env.lectureUrl, filepath.basename(p1));
          copyAsset(state.env.assetDest, asset, path, p1);
          return 'src="' + decodeURI(path.replace(/\\/g, "/")) + '"';
        } else {
          return match;
        }
      });
    }
    return true;
  });
};

function isRelative(link: string) {
  return link.startsWith("./") || link.startsWith("../");
}

function copyAsset(dest: string, from: string, path: string, src: string) {
  const out = filepath.join(dest, filepath.dirname(path));
  if (!fs.existsSync(out)) {
    fs.mkdirSync(out, { recursive: true });
  }
  fs.copyFileSync(from, filepath.join(out, decodeURI(filepath.basename(src))));
}
