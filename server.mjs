import http from 'http';
import { createReadStream, existsSync, statSync, readFileSync, writeFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 8080);
const DIST_DIR = process.env.DIST_DIR || path.join(__dirname, 'dist');
const API_TARGET = process.env.API_TARGET || 'http://127.0.0.1:3001';
const MARKET_TARGET = process.env.MARKET_TARGET || 'https://finans.truncgil.com';
const DB_PATH = path.join(__dirname, 'db.json');

const ZIYNET_WEIGHTS = { quarter: 1.75, half: 3.50, full: 7.00 };
const ZIYNET_FINENESS = 0.916;

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
};

function send(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, {
    'content-type': 'text/plain; charset=utf-8',
    ...headers,
  });
  res.end(body);
}

function safeJoin(base, requestPath) {
  const decoded = decodeURIComponent(requestPath);
  const clean = decoded.split('?')[0].split('#')[0];
  const joined = path.join(base, clean);
  const normalizedBase = path.resolve(base);
  const normalizedJoined = path.resolve(joined);
  if (!normalizedJoined.startsWith(normalizedBase)) return null;
  return normalizedJoined;
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

async function proxy(req, res, targetBase, stripPrefix) {
  const url = new URL(req.url, 'http://localhost');
  const targetPath = stripPrefix ? url.pathname.replace(stripPrefix, '') : url.pathname;
  const targetUrl = new URL(targetPath + url.search, targetBase);

  const headers = { ...req.headers };
  delete headers.host;
  delete headers.connection;
  delete headers.upgrade;

  let body;
  const method = (req.method || 'GET').toUpperCase();
  if (!['GET', 'HEAD'].includes(method)) {
    const buf = await readRequestBody(req);
    if (buf.length > 0) {
      body = buf;
      headers['content-length'] = String(buf.length);
    } else {
      delete headers['content-length'];
    }
  }

  try {
    const r = await fetch(targetUrl, {
      method,
      headers,
      body,
      redirect: 'manual',
    });

    const outHeaders = {};
    r.headers.forEach((value, key) => {
      if (key.toLowerCase() === 'transfer-encoding') return;
      if (key.toLowerCase() === 'content-encoding') return;
      if (key.toLowerCase() === 'content-length') return;
      outHeaders[key] = value;
    });

    res.writeHead(r.status, outHeaders);

    if (r.body) {
      r.body.pipeTo(
        new WritableStream({
          write(chunk) {
            res.write(Buffer.from(chunk));
          },
          close() {
            res.end();
          },
          abort() {
            try {
              res.end();
            } catch {
              /* noop */
            }
          },
        })
      );
    } else {
      res.end();
    }
  } catch (e) {
    send(res, 502, `Proxy error: ${e?.message || String(e)}`);
  }
}

function serveFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const type = MIME[ext] || 'application/octet-stream';
  res.writeHead(200, { 'content-type': type });
  createReadStream(filePath).pipe(res);
}

function formatCurrency(val, cur = 'tl') {
  const num = Number(val || 0);
  if (cur === 'usd') return `$${num.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`;
  if (cur === 'eur') return `€${num.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`;
  return `₺${num.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}`;
}

function generateDailyReport() {
  try {
    if (!existsSync(DB_PATH)) {
      console.log('[CRON] db.json not found, skipping report generation');
      return null;
    }

    const db = JSON.parse(readFileSync(DB_PATH, 'utf-8'));
    const today = new Date().toISOString().split('T')[0];
    
    if (db.dailyReports && db.dailyReports.some(r => r.date === today)) {
      console.log(`[CRON] Report for ${today} already exists, skipping`);
      return null;
    }

    const cash = db.cash || { tl: 0, usd: 0, eur: 0 };
    const gold = db.gold || { quarter: 0, half: 0, full: 0 };
    const gramItems = db.gramItems || [];
    const finance = db.finance || [];
    const transactions = (db.transactions || []).filter(t => t.date && t.date.startsWith(today));

    const totalZiynetWeight = (gold.quarter * ZIYNET_WEIGHTS.quarter) +
      (gold.half * ZIYNET_WEIGHTS.half) +
      (gold.full * ZIYNET_WEIGHTS.full);
    const totalZiynetHas = totalZiynetWeight * ZIYNET_FINENESS;

    const totalGramHas = gramItems.reduce((sum, g) => sum + (g.weight * g.fineness / 1000), 0);

    const overdueReceivables = finance.filter(f => {
      if (f.type !== 'receivable') return false;
      if (!f.date) return false;
      return f.date <= today;
    });

    const warnings = [];
    if (overdueReceivables.length > 0) {
      warnings.push(`${overdueReceivables.length} adet vadesi geçmiş/bugüne kadar olan alacak var.`);
    }
    if (transactions.length === 0) {
      warnings.push('Bugün işlem kaydı yapılmadı.');
    }

    const report = {
      id: Date.now().toString(),
      date: today,
      generatedAt: new Date().toISOString(),
      cashBalance: { ...cash },
      goldBalance: { ...gold },
      ziynetSummary: {
        totalWeight: totalZiynetWeight,
        totalHas: totalZiynetHas,
        details: {
          quarter: { count: gold.quarter, weight: gold.quarter * ZIYNET_WEIGHTS.quarter },
          half: { count: gold.half, weight: gold.half * ZIYNET_WEIGHTS.half },
          full: { count: gold.full, weight: gold.full * ZIYNET_WEIGHTS.full },
        }
      },
      gramSummary: {
        itemCount: gramItems.length,
        totalHas: totalGramHas,
      },
      transactionCount: transactions.length,
      transactions: transactions,
      overdueReceivables: overdueReceivables,
      warnings: warnings,
      reportText: generateReportText({
        date: today,
        generatedAt: new Date().toISOString(),
        cash,
        gold,
        totalZiynetWeight,
        totalZiynetHas,
        gramItems,
        totalGramHas,
        transactions,
        overdueReceivables,
        warnings,
      }),
    };

    if (!db.dailyReports) db.dailyReports = [];
    db.dailyReports.push(report);
    writeFileSync(DB_PATH, JSON.stringify(db, null, 2), 'utf-8');

    console.log(`[CRON] Daily report generated for ${today}`);
    return report;
  } catch (err) {
    console.error('[CRON] Error generating daily report:', err);
    return null;
  }
}

function generateReportText(data) {
  const formatDate = (d) => new Date(d).toLocaleDateString('tr-TR');
  
  let text = `═══════════════════════════════════════════════════════════════\n`;
  text += `                    GÜNLÜK RAPOR\n`;
  text += `                    ${formatDate(data.date)}\n`;
  text += `═══════════════════════════════════════════════════════════════\n\n`;

  text += `📅 Rapor Oluşturma: ${new Date(data.generatedAt).toLocaleString('tr-TR')}\n\n`;

  text += `───────────────────────────────────────────────────────────────\n`;
  text += `                    KASA DURUMU\n`;
  text += `───────────────────────────────────────────────────────────────\n`;
  text += `TL:  ${formatCurrency(data.cash.tl, 'tl')}\n`;
  text += `USD: ${formatCurrency(data.cash.usd, 'usd')}\n`;
  text += `EUR: ${formatCurrency(data.cash.eur, 'eur')}\n\n`;

  text += `───────────────────────────────────────────────────────────────\n`;
  text += `                    ZİYNET ALTIN STOKU\n`;
  text += `───────────────────────────────────────────────────────────────\n`;
  text += `Çeyrek: ${data.gold.quarter} adet (${(data.gold.quarter * ZIYNET_WEIGHTS.quarter).toFixed(2)} gr)\n`;
  text += `Yarım:  ${data.gold.half} adet (${(data.gold.half * ZIYNET_WEIGHTS.half).toFixed(2)} gr)\n`;
  text += `Tam:    ${data.gold.full} adet (${(data.gold.full * ZIYNET_WEIGHTS.full).toFixed(2)} gr)\n`;
  text += `Toplam Brüt: ${data.totalZiynetWeight.toFixed(2)} gr\n`;
  text += `Toplam Has (916 milyem): ${data.totalZiynetHas.toFixed(2)} gr\n\n`;

  text += `───────────────────────────────────────────────────────────────\n`;
  text += `                    GRAM ALTIN\n`;
  text += `───────────────────────────────────────────────────────────────\n`;
  text += `Toplam Kayıt: ${data.gramItems.length} adet\n`;
  text += `Toplam Has: ${data.totalGramHas.toFixed(2)} gr\n`;
  if (data.gramItems.length > 0) {
    text += `\nDetay:\n`;
    data.gramItems.forEach(g => {
      text += `  - ${g.weight} gr (${g.fineness} milyem) = ${(g.weight * g.fineness / 1000).toFixed(2)} gr has\n`;
    });
  }
  text += `\n`;

  text += `───────────────────────────────────────────────────────────────\n`;
  text += `                    GÜNLÜK İŞLEMLER\n`;
  text += `───────────────────────────────────────────────────────────────\n`;
  
  if (data.transactions.length === 0) {
    text += `Bugün işlem yapılmadı.\n\n`;
  } else {
    data.transactions.forEach(tx => {
      const time = new Date(tx.date).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
      let detail = '';
      if (tx.type === 'cash_in') detail = `NAKİT GİRİŞ: ${formatCurrency(tx.amount, tx.currency)}`;
      else if (tx.type === 'cash_out') detail = `NAKİT ÇIKIŞ: ${formatCurrency(tx.amount, tx.currency)}`;
      else if (tx.type === 'gold_sale') detail = `ALTIN SATIŞ: ${tx.goldCount} ${tx.goldType === 'quarter' ? 'Çeyrek' : tx.goldType === 'half' ? 'Yarım' : 'Tam'}`;
      else if (tx.type === 'gold_buy') detail = `ALTIN ALIŞ: ${tx.goldCount} ${tx.goldType === 'quarter' ? 'Çeyrek' : tx.goldType === 'half' ? 'Yarım' : 'Tam'}`;
      else if (tx.type === 'gram_in') detail = `GRAM GİRİŞ: ${tx.gramWeight} gr (${tx.gramFineness} milyem)`;
      else if (tx.type === 'gram_out') detail = `GRAM ÇIKIŞ: ${tx.gramWeight} gr (${tx.gramFineness} milyem)`;
      text += `[${time}] ${detail}${tx.description ? ' - ' + tx.description : ''}\n`;
    });
    text += `\n`;
  }

  if (data.overdueReceivables.length > 0) {
    text += `───────────────────────────────────────────────────────────────\n`;
    text += `              ⚠️ VADESİ GEÇEN ALACAKLAR\n`;
    text += `───────────────────────────────────────────────────────────────\n`;
    data.overdueReceivables.forEach(r => {
      text += `• ${r.name}: ${formatCurrency(r.amount, r.currency || 'tl')} (Vade: ${r.date})\n`;
    });
    text += `\n`;
  }

  if (data.warnings.length > 0) {
    text += `───────────────────────────────────────────────────────────────\n`;
    text += `                    ⚠️ UYARILAR\n`;
    text += `───────────────────────────────────────────────────────────────\n`;
    data.warnings.forEach(w => {
      text += `• ${w}\n`;
    });
    text += `\n`;
  }

  text += `═══════════════════════════════════════════════════════════════\n`;
  text += `                    RAPOR SONU\n`;
  text += `═══════════════════════════════════════════════════════════════\n`;

  return text;
}

function scheduleDailyReport() {
  const now = new Date();
  const target = new Date();
  target.setHours(20, 0, 0, 0);
  
  if (now >= target) {
    target.setDate(target.getDate() + 1);
  }
  
  const msUntilTarget = target.getTime() - now.getTime();
  
  console.log(`[CRON] Next daily report scheduled for: ${target.toLocaleString('tr-TR')}`);
  console.log(`[CRON] Time until next report: ${Math.round(msUntilTarget / 1000 / 60)} minutes`);
  
  setTimeout(() => {
    generateDailyReport();
    setInterval(generateDailyReport, 24 * 60 * 60 * 1000);
  }, msUntilTarget);
}

const server = http.createServer(async (req, res) => {
  if (!req.url) return send(res, 400, 'Bad Request');

  if (!existsSync(DIST_DIR)) {
    return send(res, 500, `dist not found at: ${DIST_DIR}. Run: npm run build`);
  }

  if (req.url.startsWith('/api/')) {
    return proxy(req, res, API_TARGET, '/api');
  }

  if (req.url === '/api') {
    return proxy(req, res, API_TARGET, '/api');
  }

  if (req.url.startsWith('/market-api/')) {
    return proxy(req, res, MARKET_TARGET, '/market-api');
  }

  if (req.url === '/market-api') {
    return proxy(req, res, MARKET_TARGET, '/market-api');
  }

  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname === '/' ? '/index.html' : url.pathname;

  const candidate = safeJoin(DIST_DIR, pathname);
  if (!candidate) return send(res, 400, 'Bad path');

  if (existsSync(candidate) && statSync(candidate).isFile()) {
    return serveFile(res, candidate);
  }

  const indexPath = path.join(DIST_DIR, 'index.html');
  if (existsSync(indexPath)) {
    return serveFile(res, indexPath);
  }

  return send(res, 404, 'Not Found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Production server listening on http://0.0.0.0:${PORT}`);
  console.log(`Serving: ${DIST_DIR}`);
  console.log(`API_TARGET: ${API_TARGET}`);
  console.log(`MARKET_TARGET: ${MARKET_TARGET}`);
  
  scheduleDailyReport();
});
