/**
 * Rough token count for a Markdown document, for the `x-markdown-tokens`
 * header a client uses to budget a fetch before reading it.
 *
 * Deliberately an estimate, and named as one. Shipping a real BPE tokenizer to
 * produce this header would add a model-specific dependency to every Markdown
 * response, and the counts still would not match whichever tokenizer the
 * reading client uses. Four characters per token is the usual approximation for
 * English prose; code blocks and tables run denser, so a whitespace-run count
 * is taken too and the larger of the two wins, which keeps the header from
 * understating a document full of tables.
 */
export function estimateMarkdownTokens(markdown: string): number {
  const characters = markdown.length
  if (characters === 0) return 0

  const byCharacters = Math.ceil(characters / 4)
  // Punctuation and markup usually tokenize apart from the word beside them,
  // hence the multiplier on the whitespace-separated count rather than a plain
  // word count.
  const byWords = Math.ceil((markdown.trim().split(/\s+/).length || 0) * 1.3)

  return Math.max(byCharacters, byWords)
}
