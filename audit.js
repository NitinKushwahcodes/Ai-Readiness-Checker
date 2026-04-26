// ── issue pool ────────────────────────────────────────────────────────────────
// Every audit picks 5 of these deterministically based on the URL hash.
// Keeping them here makes it easy to add / remove signals later.

const issuePool = [
  {
    severity: 'high',
    title: 'No structured data markup detected',
    desc: 'Schema.org JSON-LD tells AI crawlers exactly what your content is — product, article, FAQ, organisation. Without it, models have to guess your entity type from plain text, which is often wrong.',
    fix: 'Add schema.org JSON-LD to your key pages. Start with Organization and WebPage types.'
  },
  {
    severity: 'high',
    title: 'Missing FAQ section',
    desc: 'FAQ content is disproportionately represented in LLM training data and AI search snippets. Sites without FAQs get passed over when models look for concise, quotable answers to user queries.',
    fix: 'Add a FAQ section to your homepage and key landing pages using natural question phrasing.'
  },
  {
    severity: 'high',
    title: 'Weak or inconsistent heading hierarchy',
    desc: 'AI models use H1 → H2 → H3 structure to understand content priority and topic relationships. A flat or broken hierarchy makes it hard for retrieval systems to figure out what actually matters on a page.',
    fix: 'One H1 per page. H2s should map to primary topics, H3s to sub-points. Audit your structure now.'
  },
  {
    severity: 'medium',
    title: 'No clear entity definition on homepage',
    desc: 'If your homepage doesn\'t clearly state what you do and for whom in the first 100 words, AI systems often miscategorise you. You end up lumped with the wrong competitors in AI-generated comparisons.',
    fix: 'Add a one-sentence entity statement near the top: "We are a [type] that helps [audience] do [outcome]."'
  },
  {
    severity: 'medium',
    title: 'Thin content on primary pages',
    desc: 'Pages under ~400 words are frequently deprioritised by AI retrieval systems, which prefer pages with enough context to generate a meaningful summary or answer. Thin pages look like stubs.',
    fix: 'Expand key landing pages with specific, factual content. Depth beats breadth for AI discoverability.'
  },
  {
    severity: 'medium',
    title: 'Meta descriptions absent or generic',
    desc: 'AI summarisers and search features pull from meta descriptions when on-page content is ambiguous. Generic or missing descriptions force models to improvise — usually inaccurately.',
    fix: 'Write a unique, factual meta description for every indexed page. 140–155 characters, no filler.'
  },
  {
    severity: 'low',
    title: 'sitemap.xml not found or outdated',
    desc: 'AI crawlers follow the same discovery signals as traditional search bots. A missing or stale sitemap means new pages take longer to get indexed and evaluated by AI-powered search systems.',
    fix: 'Generate and submit an updated sitemap.xml that reflects your current URL structure.'
  },
  {
    severity: 'low',
    title: 'Images missing descriptive alt text',
    desc: 'Multimodal AI models and accessibility-focused retrieval systems use alt text as a content signal. Images with no alt text are opaque to these systems and reduce your overall content density.',
    fix: 'Add descriptive alt text to all meaningful images. Decorative images should use alt="".'
  }
];


// ── scoring ───────────────────────────────────────────────────────────────────

// djb2-style hash — fast, deterministic, good enough spread for our use case
function hashStr(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i);
    h = h & h; // keep it 32-bit signed
  }
  return Math.abs(h);
}

// same URL always gets the same score — feels like real analysis, not random
function calcScore(url) {
  const h = hashStr(url);
  // range 34–76: never perfect, never unusable — realistic audit territory
  return 34 + (h % 43);
}

// pick 5 issues from the pool using the hash as a deterministic shuffle seed
function pickIssues(url) {
  const h = hashStr(url);
  const indices = issuePool.map((_, i) => i);

  for (let i = indices.length - 1; i > 0; i--) {
    const j = ((h >> (i % 16)) + i * 31) % (i + 1);
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  return indices.slice(0, 5).map(i => issuePool[i]);
}


// ── score interpretation ──────────────────────────────────────────────────────

function scoreLabel(n) {
  if (n >= 70) return {
    label: 'Fairly Ready',
    blurb: 'Your site has reasonable AI discoverability but a handful of gaps that cost you visibility in AI-powered search and retrieval contexts.'
  };
  if (n >= 55) return {
    label: 'Needs Work',
    blurb: 'Several structural issues are making it harder for AI systems to understand and surface your content. The issues below are costing you real visibility.'
  };
  return {
    label: 'Low Readiness',
    blurb: 'Significant structural gaps mean AI search engines and retrieval systems are likely misunderstanding or skipping your content entirely. Fix the high-severity items first.'
  };
}

function ringColour(n) {
  if (n >= 70) return '#1A7A4A'; // green
  if (n >= 55) return '#B7580A'; // amber
  return '#C0392B';              // red
}

// the highest-severity issue's fix becomes the priority recommendation
function priorityFix(issues) {
  const high = issues.find(i => i.severity === 'high');
  return high ? high.fix : issues[0].fix;
}


// ── DOM helpers ───────────────────────────────────────────────────────────────

function setRunning(state) {
  const btn = document.getElementById('runBtn');
  btn.disabled    = state;
  btn.textContent = state ? 'Analysing…' : 'Run Audit →';
}

// animates the score number counting up from 0
function countUp(el, target) {
  let current = 0;
  const step  = Math.ceil(target / 30);
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    if (current >= target) clearInterval(timer);
  }, 30);
}

// animates the SVG ring filling in
function animateRing(score, colour) {
  const circum = 289; // 2 * π * 46
  const ring   = document.getElementById('ringFill');
  ring.style.stroke          = colour;
  ring.style.strokeDashoffset = circum - (circum * score / 100);
}

// renders one issue card and schedules its slide-in animation
function renderIssue(issue, idx, container) {
  const card = document.createElement('div');
  card.className = `issue-card sev-${issue.severity}`;
  card.innerHTML = `
    <span class="severity-dot"></span>
    <div>
      <p class="issue-title">
        ${issue.title}
        <span class="issue-tag">${issue.severity}</span>
      </p>
      <p class="issue-desc">${issue.desc}</p>
    </div>`;

  container.appendChild(card);
  // stagger each card so they slide in one after another
  setTimeout(() => card.classList.add('in'), 80 + idx * 90);
}


// ── main audit function ───────────────────────────────────────────────────────

function runAudit() {
  const input = document.getElementById('urlInput');
  let url     = input.value.trim();

  if (!url) return;
  if (!url.startsWith('http')) url = 'https://' + url;

  try {
    new URL(url); // throws if not a valid URL
  } catch {
    input.classList.add('error');
    setTimeout(() => input.classList.remove('error'), 800);
    return;
  }

  setRunning(true);

  // small delay so it feels like real analysis, not instant mock
  setTimeout(() => {
    const score  = calcScore(url);
    const issues = pickIssues(url);
    const meta   = scoreLabel(score);
    const colour = ringColour(score);

    // show which URL was audited and when
    let display = url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
    if (display.length > 42) display = display.slice(0, 42) + '…';
    document.getElementById('displayUrl').textContent = display;
    document.getElementById('runTime').textContent    = new Date().toLocaleTimeString([], {
      hour: '2-digit', minute: '2-digit'
    });

    // ring + number
    animateRing(score, colour);
    countUp(document.getElementById('scoreDisplay'), score);

    // score label
    document.getElementById('scoreLabel').textContent = meta.label;
    document.getElementById('scoreBlurb').textContent = meta.blurb;

    // issues
    const list = document.getElementById('issuesList');
    list.innerHTML = '';
    issues.forEach((issue, idx) => renderIssue(issue, idx, list));

    // recommendation
    document.getElementById('recText').textContent = priorityFix(issues);

    // reveal the results section
    document.getElementById('results').classList.add('visible');

    setRunning(false);
  }, 1100);
}


// ── keyboard shortcut ─────────────────────────────────────────────────────────

document.getElementById('urlInput').addEventListener('keydown', e => {
  if (e.key === 'Enter') runAudit();
});