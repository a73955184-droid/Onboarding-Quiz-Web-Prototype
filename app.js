const SCORE_KEYS = ['BFO','GD','FT','GA','TO','IP','ES'];

const ARCHETYPES = {
  BFO: {
    name: 'Balanced Family Office',
    short: 'Intentional, stable, diversified long-term system',
    transition: 'You are moving from simply investing toward building a more intentional personal wealth system.',
    tradeoff: 'You gain clarity, structure, and resilience, while giving up some short-term upside chasing.',
    system: ['Core diversified foundation', 'Selective optimization layer', 'Small exploration allocation'],
    examples: ['Broad-market diversified funds', 'International diversification', 'Measured factor or thematic sleeve', 'Cash / stability reserve']
  },
  GD: {
    name: 'Global Diversified',
    short: 'Simple globally diversified compounding',
    transition: 'You are reinforcing a long-term diversified investing system rather than chasing constant changes.',
    tradeoff: 'You gain simplicity and staying power, while giving up the feeling of actively optimizing every opportunity.',
    system: ['Global core portfolio', 'Low-cost compounding engine', 'Periodic rebalancing'],
    examples: ['US total market', 'International equities', 'Broad bonds or cash buffer']
  },
  FT: {
    name: 'Factor Tilt',
    short: 'Research-driven systematic optimization',
    transition: 'You are moving from passive investing toward a more analytical system for improving portfolio quality.',
    tradeoff: 'You gain a clearer optimization framework, while accepting more complexity and tracking error.',
    system: ['Diversified core', 'Factor-based enhancement', 'Rules-based review process'],
    examples: ['Value/quality/momentum exposure', 'Small-cap tilt', 'Rebalance rules']
  },
  GA: {
    name: 'Growth + Alternatives',
    short: 'Growth-focused with openness to innovation',
    transition: 'You are becoming more growth-oriented and open to expanding beyond basic portfolio building blocks.',
    tradeoff: 'You gain upside participation, while accepting higher volatility and more uncertainty.',
    system: ['Long-term core', 'Growth innovation sleeve', 'Alternative opportunity sleeve'],
    examples: ['Growth equities', 'Innovation themes', 'Alternatives or private-market proxy exposure']
  },
  TO: {
    name: 'Tactical Opportunistic',
    short: 'Active opportunity-seeking and market responsiveness',
    transition: 'You are drawn toward active decision-making and using market changes as opportunities.',
    tradeoff: 'You gain flexibility and responsiveness, while increasing decision load and timing risk.',
    system: ['Base allocation', 'Tactical rotation sleeve', 'Opportunity/risk budget'],
    examples: ['Sector rotation', 'Cash for drawdowns', 'Cyclical or macro positioning']
  },
  IP: {
    name: 'Income Preservation',
    short: 'Capital protection and reliable income orientation',
    transition: 'You are prioritizing durability, preservation, and confidence over maximizing upside.',
    tradeoff: 'You gain stability and emotional ease, while giving up some aggressive growth potential.',
    system: ['Capital preservation core', 'Income generation layer', 'Lower-volatility growth sleeve'],
    examples: ['Dividend growth', 'High-quality bonds', 'Cash reserve', 'Defensive equity exposure']
  },
  ES: {
    name: 'Effortless & Simple',
    short: 'Low-maintenance investing designed for ease',
    transition: 'You are trying to reduce decision overload and keep investing simple enough to stay consistent.',
    tradeoff: 'You gain simplicity and peace of mind, while giving up customization and advanced optimization.',
    system: ['Set-and-forget core', 'Automated contribution habit', 'Minimal review cadence'],
    examples: ['Target-date style allocation', 'Simple ETF mix', 'Automated deposits']
  }
};

function emptyState() {
  return {
    scores: Object.fromEntries(SCORE_KEYS.map(k => [k, 0])),
    answers: {},
    metadata: {}
  };
}

function getState() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get('state');
  if (!raw) return emptyState();
  try {
    const parsed = JSON.parse(decodeURIComponent(raw));
    const base = emptyState();
    return {
      scores: { ...base.scores, ...(parsed.scores || {}) },
      answers: { ...(parsed.answers || {}) },
      metadata: { ...(parsed.metadata || {}) }
    };
  } catch (e) {
    console.error('State parse error', e);
    return emptyState();
  }
}

function goTo(page, state) {
  const encoded = encodeURIComponent(JSON.stringify(state));
  window.location.href = `${page}?state=${encoded}`;
}

function addScores(target, mapping) {
  for (const [key, value] of Object.entries(mapping || {})) {
    target[key] = (target[key] || 0) + value;
  }
}

function applyAgeModifier(scores, age) {
  const multiply = (key, factor) => { scores[key] = (scores[key] || 0) * factor; };
  if (age === 'under25') { multiply('GA', 1.2); multiply('TO', 1.2); multiply('FT', 1.1); }
  if (age === '25-34') { multiply('FT', 1.1); multiply('GA', 1.1); }
  if (age === '45-54') { multiply('BFO', 1.1); multiply('IP', 1.1); }
  if (age === '55plus') { multiply('IP', 1.3); multiply('GD', 1.1); multiply('TO', 0.7); }
}

function setupOptionScreen(config) {
  const state = getState();
  const grid = document.getElementById('options');
  const continueBtn = document.getElementById('continueBtn');
  const selected = new Set();
  const max = config.max || 1;
  const min = config.min || 1;

  grid.innerHTML = config.options.map(opt => `
    <button class="option-card" data-id="${opt.id}" type="button">
      <span class="option-card-title">${opt.label}</span>
      <span class="option-card-meta">${opt.helper || ''}</span>
      <span class="check">✓</span>
    </button>
  `).join('');

  grid.querySelectorAll('.option-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      if (selected.has(id)) {
        selected.delete(id);
        card.classList.remove('selected');
      } else {
        if (max === 1) {
          selected.clear();
          grid.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
        }
        if (selected.size < max) {
          selected.add(id);
          card.classList.add('selected');
        }
      }
      continueBtn.disabled = selected.size < min;
    });
  });

  continueBtn.disabled = true;
  continueBtn.addEventListener('click', () => {
    const selectedOptions = config.options.filter(opt => selected.has(opt.id));
    if (config.type === 'age') {
      state.answers[config.screenKey] = selectedOptions.map(o => ({ id: o.id, label: o.label, scores: o.scores || {}, screen: config.title }));
      state.metadata.age = selectedOptions[0]?.id || '';
      applyAgeModifier(state.scores, state.metadata.age);
    } else {
      selectedOptions.forEach(opt => addScores(state.scores, opt.scores));
      state.answers[config.screenKey] = selectedOptions.map(o => ({ id: o.id, label: o.label, scores: o.scores || {}, screen: config.title }));
    }
    state.metadata.lastStep = config.screenKey;
    goTo(config.next, state);
  });

  const backBtn = document.getElementById('backBtn');
  if (backBtn) backBtn.addEventListener('click', () => history.back());
}

function rankScores(scores) {
  return Object.entries(scores)
    .map(([id, score]) => ({ id, score: Number(score) || 0 }))
    .sort((a,b) => b.score - a.score);
}
