const api = (path) => `${window.NELEG_API_BASE.replace(/\/$/, "")}${path}`;
const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const optionSources = [
  ['session', 'sessions', 'year', 'label'],
  ['agency', 'agencies'],
  ['status', 'bill_statuses'],
  ['topic', 'popular_topics'],
];

function fill(id, values = [], valueKey, labelKey) {
  const el = document.getElementById(id);
  while (el.options.length > 1) el.remove(1);
  values.forEach(item => {
    const option = document.createElement('option');
    option.value = valueKey ? item[valueKey] : item;
    option.textContent = labelKey ? item[labelKey] : item;
    el.appendChild(option);
  });
}

function renderOptions(data) {
  optionSources.forEach(([id, key, valueKey, labelKey]) => fill(id, data[key], valueKey, labelKey));
}

function renderHistory(requests = []) {
  document.getElementById('history-count').textContent = requests.length;
  document.getElementById('history-list').innerHTML = requests.length
    ? requests.map(item => `<a class="history-item" href="${esc(item.permalink || `requests/${item.id}.html`)}"><p>${esc(item.original_question)}</p><span>${esc(item.created_at)} &middot; ${esc(item.sessions_searched)}</span></a>`).join('')
    : '<p class="empty-state">No published requests yet.</p>';
}

function renderLastUpdated(value) {
  const date = value ? new Date(value) : null;
  document.getElementById('api-status').textContent = date && !Number.isNaN(date.valueOf())
    ? `Last Updated: ${new Intl.DateTimeFormat(undefined, {dateStyle: 'medium', timeStyle: 'short'}).format(date)}`
    : 'Last Updated: unavailable';
}

async function loadStaticData() {
  const response = await fetch('site-data.json', {cache: 'no-store'});
  if (!response.ok) throw new Error('Static site data unavailable');
  const data = await response.json();
  renderLastUpdated(data.last_notebook_update);
  renderOptions(data);
  renderHistory(data.requests);
}

async function refreshOptions() {
  const response = await fetch(api('/api/options'));
  if (!response.ok) throw new Error('Options unavailable');
  renderOptions(await response.json());
}

async function refreshHistory() {
  const response = await fetch(api('/api/history'));
  if (!response.ok) throw new Error('History unavailable');
  renderHistory((await response.json()).requests);
}

function showAnswer(data) {
  document.getElementById('answer').classList.remove('hidden');
  document.getElementById('answer-question').textContent = data.question;
  document.getElementById('answer-content').innerHTML = data.response_html;
  document.getElementById('permalink').href = data.permalink || `requests/?id=${data.id}`;
  document.getElementById('applied-filters').innerHTML = Object.entries(data.filters || {}).map(([key, value]) => `<span>${esc(key)}: ${esc(value)}</span>`).join('');
  document.getElementById('citations').innerHTML = data.citations.length
    ? data.citations.map(citation => `<li>${citation.url ? `<a href="${esc(citation.url)}" rel="noopener noreferrer">${esc(citation.source)}</a>` : `<strong>${esc(citation.source)}</strong>`}${citation.location ? ` &middot; ${esc(citation.location)}` : ''}${citation.excerpt ? `<blockquote>${esc(citation.excerpt)}</blockquote>` : ''}</li>`).join('')
    : '<li>No source citations were returned.</li>';
  document.getElementById('answer').scrollIntoView({behavior: 'smooth'});
}

document.getElementById('query-form').addEventListener('submit', async event => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  button.textContent = 'Researching...';
  try {
    const payload = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch(api('/api/ask'), {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('The research service could not complete this request.');
    showAnswer(await response.json());
    void refreshHistory().catch(() => {});
  } catch (error) {
    alert(error.message);
  } finally {
    button.disabled = false;
    button.textContent = 'Research question';
  }
});

void loadStaticData().catch(() => {
  renderLastUpdated(null);
  renderHistory([]);
});
void Promise.allSettled([
  refreshOptions(),
  refreshHistory(),
  fetch(api('/api/health')),
]);

