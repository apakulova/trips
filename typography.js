/* Shared, deliberately limited typography for every guide page. */
(() => {
  'use strict';

  const typograf = new Typograf({locale: ['ru']});
  typograf.disableRule('*');
  [
    'common/punctuation/quote',
    'ru/dash/*',
    'common/nbsp/afterNumber',
    'common/nbsp/afterShortWord',
    'common/nbsp/afterShortWordByList',
    'ru/nbsp/afterNumberSign'
  ].forEach(rule => typograf.enableRule(rule));

  const ignored = 'script, style, template, noscript, code, pre, textarea, svg, math, [contenteditable]:not([contenteditable="false"]), [data-no-typography]';

  function processText(node) {
    if (node.nodeType !== Node.TEXT_NODE || !node.nodeValue?.trim()) return;
    if (node.parentElement?.closest(ignored)) return;

    // Numeric intervals take an en dash; a spaced hyphen between words takes an em dash.
    const source = node.nodeValue
      .replace(
        /(?<![\p{L}\d])(\d{1,4}(?::\d{2})?)[ \t]+[-–—][ \t]+(\d{1,4}(?::\d{2})?)(?![\p{L}\d])/gu,
        '$1–$2'
      )
      .replace(
        /(?<![\p{L}\d])(\d{1,2}(?::\d{2})?|\d{4})[-–—](\d{1,2}(?::\d{2})?|\d{4})(?![\p{L}\d])/gu,
        '$1–$2'
      );
    const result = typograf.execute(source).replace(
      /(?<![\p{L}\p{N}])(через|перед|после|между|вокруг|около|среди|вдоль|внутри|вместо|чтобы|когда|поскольку|потому)[ \t]+/giu,
      '$1\u00a0'
    );
    if (result !== node.nodeValue) node.nodeValue = result;
  }

  function processTree(root) {
    if (root.nodeType === Node.TEXT_NODE) {
      processText(root);
      return;
    }
    if (root.nodeType !== Node.ELEMENT_NODE || root.closest(ignored)) return;

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(processText);
  }

  function start() {
    processTree(document.body);
    new MutationObserver(records => {
      records.forEach(record => {
        if (record.type === 'characterData') processText(record.target);
        record.addedNodes.forEach(processTree);
      });
    }).observe(document.body, {childList: true, characterData: true, subtree: true});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, {once: true});
  } else {
    start();
  }
})();
