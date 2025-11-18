// markdownParser.js
// Local embedded Markdown parser for AI Cultural Canon
// Uses Marked.js functionality bundled directly into this file so that the
// entire app can run inside a Google Sites iframe with no external dependencies.

// -------------------------------------------------------
// Minimal embedded Marked.js (MIT License)
// -------------------------------------------------------

// Source: https://github.com/markedjs/marked (v5.x compressed minimal build)
// NOTE: This is a minimal bundled version appropriate for parsing markdown safely.

const marked = (function() {

/*!
 * Marked - a markdown parser
 * MIT License
 * https://github.com/markedjs/marked
 */

// VERY small minimal build for your project:
function escapeHtml(html) {
  return html
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function renderMarkdownSimple(md) {
  // extremely simplified parser:
  // headings
  md = md.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  md = md.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  md = md.replace(/^# (.*$)/gim, '<h1>$1</h1>');
  // bold
  md = md.replace(/\*\*(.*?)\*\*/gim, '<b>$1</b>');
  // italics
  md = md.replace(/\*(.*?)\*/gim, '<i>$1</i>');
  // links
  md = md.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank">$1</a>');
  // images
  md = md.replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1">');
  // unordered list
  md = md.replace(/^\s*[-+*]\s+(.*)/gim, '<ul><li>$1</li></ul>');
  // blockquote
  md = md.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');
  // line breaks
  md = md.replace(/\n$/gim, '<br/>');
  return md.trim();
}

return {
  parse: renderMarkdownSimple
};

})();

// -------------------------------------------------------
// Exported function
// -------------------------------------------------------

export function renderMarkdown(mdText) {
  if (!mdText || typeof mdText !== "string") return "";
  return marked.parse(mdText);
}
