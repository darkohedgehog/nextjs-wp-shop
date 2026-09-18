import sanitizeHtml from 'sanitize-html';

/** Keep editorial formatting while removing active content, forms and inline code. */
export function safeHtml(value: string): string {
  return sanitizeHtml(value, {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'img'],
    allowedAttributes: {
      a: ['href', 'title'], img: ['src', 'alt', 'width', 'height', 'loading'],
      th: ['colspan', 'rowspan', 'scope'], td: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['https', 'http', 'mailto', 'tel'],
    allowProtocolRelative: false,
  });
}
