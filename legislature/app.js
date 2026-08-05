const api = (path) => `${window.NELEG_API_BASE.replace(/\/$/, "")}${path}`;
const apiFetch = (path, options = {}) => fetch(api(path), {
  ...options,
  headers: {...(window.NELEG_API_HEADERS || {}), ...(options.headers || {})},
});
const esc = (value) => String(value ?? "").replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const optionSources = [
  ['session', 'sessions', 'legislative_session', 'year', 'label'],
  ['agency', 'agencies', 'related_agency'],
  ['status', 'bill_statuses', 'bill_status'],
  ['topic', 'popular_topics', 'popular_topic'],
];

function fill(id, values = [], name, valueKey, labelKey) {
  const el = document.getElementById(id);
  el.replaceChildren();
  values.forEach(item => {
    const value = valueKey ? item[valueKey] : item;
    const label = document.createElement('label');
    const input = document.createElement('input');
    const text = document.createElement('span');
    input.type = 'checkbox';
    input.name = name;
    input.value = value;
    text.textContent = labelKey ? `${value} · ${item[labelKey]}` : value;
    label.append(input, text);
    el.appendChild(label);
  });
}

function renderOptions(data) {
  optionSources.forEach(([id, key, name, valueKey, labelKey]) => fill(id, data[key], name, valueKey, labelKey));
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
  const response = await apiFetch('/api/options');
  if (!response.ok) throw new Error('Options unavailable');
  renderOptions(await response.json());
}

async function refreshHistory() {
  const response = await apiFetch('/api/history');
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

const loadingPhrases = {
  standard: [
    'Selecting the relevant legislative files...',
    'Consulting statute...',
    'Fetching data from the Unicameral. No filibuster detected...',
    'Writing in our notebook...',
    'Parsing legal language into something resembling English...',
    'Harvesting data... may or may not contain corn.',
    'Getting visited by the ghost of legislatures past...',
    'Stopping for Runza...',
    'Checking the record and its citations...',
    'Getting distracted by Husker highlights...'
  ],
  deep: [
    'Selecting files across legislative sessions...',
    'Searching each session notebook...',
    'Consulting statute...',
    'Comparing findings across the Unicameral record...',
    'Fetching data from the Unicameral. No filibuster detected...',
    'Writing session briefs in our notebook...',
    'Synthesizing findings across sessions...',
    'Recalculating... somewhere, a fiscal note just got longer.',
    'Harvesting data... may or may not contain corn.',
    'Parsing legal language into something resembling English...',
    'Getting visited by the ghost of legislatures past...',
    'Stopping for Runza...',
    'Checking the final answer and its citations...',
    'Getting distracted by Husker highlights...'
  ]
};
let loadingTimer;

function showLoading(mode) {
  const modal = document.getElementById('loading-modal');
  const phrase = document.getElementById('loading-phrase');
  const phrases = loadingPhrases[mode] || loadingPhrases.standard;
  let index = 0;
  phrase.textContent = phrases[index];
  modal.classList.remove('hidden');
  document.body.classList.add('is-loading');
  clearInterval(loadingTimer);
  loadingTimer = setInterval(() => {
    index = (index + 1) % phrases.length;
    phrase.classList.add('is-changing');
    setTimeout(() => {
      phrase.textContent = phrases[index];
      phrase.classList.remove('is-changing');
    }, 180);
  }, 10000);
}

function hideLoading() {
  clearInterval(loadingTimer);
  document.getElementById('loading-modal').classList.add('hidden');
  document.body.classList.remove('is-loading');
}

document.getElementById('query-form').addEventListener('submit', async event => {
  event.preventDefault();
  const button = event.submitter;
  const formData = new FormData(event.currentTarget);
  let error;
  button.disabled = true;
  button.textContent = 'Researching...';
  showLoading(formData.get('answer_mode'));
  try {
    const payload = Object.fromEntries(formData);
    ['legislative_session', 'related_agency', 'bill_status', 'popular_topic']
      .forEach(name => { payload[name] = formData.getAll(name); });
    const response = await apiFetch('/api/ask', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('The research service could not complete this request.');
    showAnswer(await response.json());
    void refreshHistory().catch(() => {});
  } catch (caughtError) {
    error = caughtError;
  } finally {
    hideLoading();
    button.disabled = false;
    button.textContent = 'Research question';
  }
  if (error) alert(error.message);
});

void loadStaticData().catch(() => {
  renderLastUpdated(null);
  renderHistory([]);
});
void Promise.allSettled([
  refreshOptions(),
  refreshHistory(),
  apiFetch('/api/health'),
]);

