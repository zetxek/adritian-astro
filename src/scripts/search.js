/**
 * Client-side search — ports static/js/search.js. Fetches the build-time
 * JSON index (src/pages/<locale>/index.json.js) and filters/scores it
 * in-memory. No Fuse.js/DOMPurify/mark.js dependency: results only ever
 * reach the DOM via textContent, so there's no HTML injection surface to
 * sanitize, and a title/tag substring match is enough signal for a demo
 * corpus this size (see NOTE.md, Phase 5, for the full rationale).
 */

const MIN_QUERY_LENGTH = 2;
const SNIPPET_RADIUS = 60;
const DEBOUNCE_MS = 300;

function debounce(fn, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

function getMessages() {
  const el = document.getElementById('search-i18n');
  if (!el || !el.textContent) return {};
  try {
    return JSON.parse(el.textContent);
  } catch {
    return {};
  }
}

function updateUrlParam(query) {
  const url = new URL(window.location.href);
  if (query && query.length >= MIN_QUERY_LENGTH) {
    url.searchParams.set('s', query);
  } else {
    url.searchParams.delete('s');
  }
  window.history.replaceState({}, '', url.toString());
}

function scoreEntry(entry, query) {
  const q = query.toLowerCase();
  const title = (entry.title || '').toLowerCase();
  const tags = (entry.tags || []).join(' ').toLowerCase();
  const description = (entry.description || '').toLowerCase();
  if (title.includes(q)) return 3;
  if (tags.includes(q)) return 2;
  if (description.includes(q)) return 1;
  return 0;
}

function runSearch(index, query) {
  return index
    .map((entry) => ({ entry, score: scoreEntry(entry, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ entry }) => entry);
}

function snippet(text, query) {
  if (!text) return '';
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, SNIPPET_RADIUS * 2);
  const start = Math.max(0, idx - SNIPPET_RADIUS);
  const end = Math.min(text.length, idx + query.length + SNIPPET_RADIUS);
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
}

function renderResults(container, template, results, query, messages) {
  container.innerHTML = '';

  if (results.length === 0) {
    const alert = document.createElement('div');
    alert.className = 'alert';
    alert.textContent = messages.noMatches || 'No matches found';
    container.appendChild(alert);
    return;
  }

  for (const entry of results) {
    const node = template.content.cloneNode(true);
    const link = node.querySelector('.search-result__link');
    link.href = entry.url;
    link.textContent = entry.title || messages.untitled || 'Untitled';

    const snippetEl = node.querySelector('.search-result__snippet');
    snippetEl.textContent = snippet(entry.description, query) || messages.noPreview || '';

    const tagsEl = node.querySelector('.search-result__tags');
    for (const tag of entry.tags || []) {
      const badge = document.createElement('span');
      badge.className = 'badge bg-primary me-1';
      badge.textContent = tag;
      tagsEl.appendChild(badge);
    }

    container.appendChild(node);
  }
}

async function search(indexUrl, container, template, query, messages) {
  container.innerHTML = `<div class="spinner-border text-primary" role="status"><span class="visually-hidden">${
    messages.loading || 'Loading...'
  }</span></div>`;

  try {
    const response = await fetch(indexUrl);
    if (!response.ok) {
      throw new Error(`Search index request failed: ${response.status}`);
    }
    const index = await response.json();
    renderResults(container, template, runSearch(index, query), query, messages);
  } catch (error) {
    console.error('Search failed', error);
    const alert = document.createElement('div');
    alert.className = 'alert alert-danger';
    alert.textContent = messages.errorGeneric || 'There was a problem with search. Please try again later.';
    container.innerHTML = '';
    container.appendChild(alert);
  }
}

function showMinCharsMessage(container, messages) {
  const alert = document.createElement('div');
  alert.className = 'alert';
  alert.textContent = messages.minChars || 'Please enter at least 2 characters to search';
  container.innerHTML = '';
  container.appendChild(alert);
}

function init() {
  const input = document.getElementById('search-query');
  const results = document.getElementById('search-results');
  const template = document.getElementById('search-result-template');
  if (!input || !results || !template) return;

  const messages = getMessages();
  const indexUrl = results.dataset.indexUrl || input.closest('form')?.dataset.indexUrl || '/index.json';

  const runOrPrompt = (query) => {
    if (query.length >= MIN_QUERY_LENGTH) {
      search(indexUrl, results, template, query, messages);
    } else {
      showMinCharsMessage(results, messages);
    }
  };

  const debouncedSearch = debounce((query) => {
    updateUrlParam(query);
    runOrPrompt(query);
  }, DEBOUNCE_MS);

  input.addEventListener('input', () => debouncedSearch(input.value.trim()));

  const form = input.closest('form');
  if (form) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const query = input.value.trim();
      updateUrlParam(query);
      runOrPrompt(query);
    });
  }

  const initialQuery = new URLSearchParams(window.location.search).get('s') || '';
  if (initialQuery) {
    input.value = initialQuery;
    runOrPrompt(initialQuery);
  } else {
    showMinCharsMessage(results, messages);
  }
}

document.addEventListener('DOMContentLoaded', init);
