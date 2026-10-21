import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { renderMarkdown } from './MarkdownRenderer';

describe('AI Tutor markdown rendering', () => {
  test('escapes untrusted HTML while preserving basic formatting', () => {
    const markup = renderToStaticMarkup(
      renderMarkdown('<img src=x onerror=alert(1)> **safe text**')
    );

    expect(markup).toContain('&lt;img src=x onerror=alert(1)&gt;');
    expect(markup).not.toContain('<img');
    expect(markup).toContain('<strong>safe text</strong>');
  });

  test('renders fenced code blocks as escaped code', () => {
    const markup = renderToStaticMarkup(renderMarkdown('```html\n<script>alert(1)</script>\n```'));

    expect(markup).toContain('<pre><code>&lt;script&gt;alert(1)&lt;/script&gt;</code></pre>');
    expect(markup).not.toContain('<script>');
  });
});
