/*
 * Safe Markdown renderer for AI Tutor responses.
 *
 * Only elements produced by this module are inserted into the DOM. Untrusted
 * model output is escaped first, so arbitrary model-generated HTML is never
 * rendered. No external markdown/sanitize libraries are required.
 */

import React from 'react';

const escapeHtml = (text) =>
  String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const renderMarkdown = (text) => {
  if (text == null) return <p></p>;

  const codeBlocks = [];
  const source = String(text).replace(/```(?:[^\n]*\n)?([\s\S]*?)```/g, (match, code) => {
    const placeholder = `LERNICODEBLOCK${codeBlocks.length}END`;
    codeBlocks.push(`<pre><code>${escapeHtml(code.trim())}</code></pre>`);
    return `\n\n${placeholder}\n\n`;
  });
  const html = escapeHtml(source)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/^#### (.*?)$/gm, '<h4>$1</h4>')
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.+?)__/g, '<strong>$1</strong>')
    .replace(/(?:^\d+\. .*?$(?:\n^\d+\. .*?$)*)/gm, (block) => {
      const items = block
        .split('\n')
        .map((line) => line.replace(/^\d+\.\s*/, ''))
        .map((item) => `<li>${item}</li>`)
        .join('');
      return `<ol>${items}</ol>`;
    })
    .replace(/(?:^[-•] .*?$(?:\n^[-•] .*?$)*)/gm, (block) => {
      const items = block
        .split('\n')
        .map((line) => line.replace(/^[-•]\s*/, ''))
        .map((item) => `<li>${item}</li>`)
        .join('');
      return `<ul>${items}</ul>`;
    })
    .split(/\n\n+/)
    .map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return '';
      if (/^LERNICODEBLOCK\d+END$/.test(trimmed) || /^(<h[1-4]>|<ol>|<ul>)/.test(trimmed)) return trimmed;
      return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`;
    })
    .join('')
    .replace(/LERNICODEBLOCK(\d+)END/g, (placeholder, index) => codeBlocks[Number(index)]);

  return <div className="at-message-content" dangerouslySetInnerHTML={{ __html: html }} />;
};
