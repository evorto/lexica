import * as Markdown from "markdown-it";

export default (md: Markdown): void => {
  md.inline.ruler.before('emphasis', 'math', (state, silent): boolean => {
    let pos = state.pos
    if (state.src[pos] !== "$" || (state.src[pos + 1] !== "(" && state.src[pos + 1] !== "[")) {
      return false
    }
    const display = state.src[++pos] === "["
    const end = state.src.indexOf("$", pos)
    if (end > 0) {
      const math = state.src.slice(pos + 1, end - 1)
      if (!silent) {
        const token: any = state.push('math', '', 0)
        token.contentV = math.replace(/\n/g, ' ').replace(/^ (.+) $/, '$1').replace(/\\/g, "\\\\")
        if (display) {
          token.attrSet('display-mode', 'true')
        }
      }
      state.pos = end + 1;
      return true
    }
    throw new Error('Math not closes')
  })

  // Don't render math here, the document will be way to huge
  md.renderer.rules['math'] = (tokens, idx, _options, env) => {
    env.hasMath = true
    const token = tokens[idx] as any
    const start = token.attrGet('display-mode') ? "$[" : "$("
    const end = token.attrGet('display-mode') ? "]$" : ")$"
    const out = '{`' + start + token.contentV + end + '`}'
    return out
  }
}
