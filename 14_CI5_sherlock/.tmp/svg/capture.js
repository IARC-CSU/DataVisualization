// Standalone Playwright driver. Fetches jobs from the saver, navigates each URL,
// waits for the chart, rasterizes the SVG to PNG, and posts back to the saver.

const { chromium } = require('playwright');

const SAVER = 'http://127.0.0.1:8766';

const STYLE_CSS = `svg { overflow: visible; color: #000; } .print_only { display: block !important; } text.svg_title.title_l1 { font-size: 18px; font-weight: 800; fill: #000; } text.svg_title.title_l2 { font-size: 15px; font-weight: 400; fill: #000; } text.svg_title.title_l3 { font-size: 13px; font-weight: 400; font-style: italic; fill: #5c5c5c; } text { font-family: "Nunito Sans", "Segoe UI", Arial, sans-serif; fill: #000; } .path_lines { fill: none; } .axis .domain, .axis .tick line { stroke: #000; } .axis .tick text { fill: #000; } .grid .domain { stroke: none; } .grid .tick line { stroke: #ddd; } .grid-minor .tick line { stroke: #f0f0f0; } .text_legend { font-size: 12px; fill: #222; } .line_legend { stroke: currentColor; }`;

async function captureOne(page, job) {
  try {
    await page.goto(job.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  } catch (e) {
    return { ...job, ok: false, err: 'nav:' + e.message };
  }

  // Wait for the real chart svg (id !== 'trend-graph' and contains lines)
  let haveSvg = false;
  try {
    await page.waitForFunction(() => {
      return Array.from(document.querySelectorAll('svg.cantrend'))
        .some(s => s.id && s.id !== 'trend-graph' && s.querySelector('.path_lines'));
    }, null, { timeout: 30000 });
    haveSvg = true;
  } catch (e) {
    return { ...job, ok: false, err: 'timeout' };
  }

  // Detect redirect (populations changed)
  const finalUrl = page.url();
  const origPop = new URL(job.url).searchParams.get('populations') || '';
  const finalPop = new URL(finalUrl).searchParams.get('populations') || '';
  if (origPop !== finalPop) {
    return { ...job, ok: false, err: 'redirect', finalPop };
  }

  const pngDataUrl = await page.evaluate(async (STYLE_CSS) => {
    const svg = Array.from(document.querySelectorAll('svg.cantrend'))
      .find(s => s.id && s.id !== 'trend-graph' && s.querySelector('.path_lines'));
    const clone = svg.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    const origVB = (clone.getAttribute('viewBox') || '').split(/\s+/).map(Number);
    const [vx, vy, vw, vh] = origVB.length === 4 ? origVB : [0, 0, 619.25, 769];
    const padL = 30, padR = 150, nx = vx - padL, nw = vw + padL + padR;
    clone.setAttribute('viewBox', `${nx} ${vy} ${nw} ${vh}`);
    clone.setAttribute('width', nw);
    clone.setAttribute('height', vh);
    clone.setAttribute('overflow', 'visible');
    let styleEl = clone.querySelector('style');
    if (!styleEl) {
      styleEl = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      clone.insertBefore(styleEl, clone.firstChild);
    }
    styleEl.textContent = STYLE_CSS;
    const xml = new XMLSerializer().serializeToString(clone);
    const dataUrl = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(xml)));
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const img = new Image();
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = dataUrl; });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(nw * 2);
    canvas.height = Math.round(vh * 2);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(2, 0, 0, 2, 0, 0);
    ctx.drawImage(img, 0, 0);
    return canvas.toDataURL('image/png');
  }, STYLE_CSS);

  const resp = await fetch(`${SAVER}/save?path=${encodeURIComponent(job.filename)}`, {
    method: 'POST',
    body: pngDataUrl,
    headers: { 'Content-Type': 'text/plain' }
  });
  const saveText = await resp.text();
  return { ...job, ok: resp.ok, saveResp: saveText };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  let page = await context.newPage();

  let processed = 0;
  while (true) {
    const jobsResp = await fetch(`${SAVER}/jobs?only_missing=1&skip_logged=1`);
    const jobs = await jobsResp.json();
    if (jobs.length === 0) { console.log('all done'); break; }
    console.log(`${jobs.length} jobs remaining`);
    const job = jobs[0];
    const start = Date.now();
    const result = await captureOne(page, job);
    const elapsed = Date.now() - start;
    console.log(`[${processed + 1}] ${result.ok ? 'OK ' : 'FAIL'} ${result.err || ''} ${job.cancer}::${job.id} (${elapsed}ms)`);
    await fetch(`${SAVER}/log`, {
      method: 'POST',
      body: JSON.stringify(result),
      headers: { 'Content-Type': 'application/json' }
    });
    processed++;
    // Rotate page every 20 captures to release memory; reassign the `page` binding
    if (processed % 20 === 0) {
      try { await page.close(); } catch (e) {}
      page = await context.newPage();
    }
  }

  await browser.close();
})().catch(e => { console.error('fatal:', e); process.exit(1); });
