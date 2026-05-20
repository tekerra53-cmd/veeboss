const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001;
const STORAGE_PATH = process.env.STORAGE_PATH || path.join(__dirname, 'content-store.json');
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'veeboss-admin';

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

function readStore() {
  try {
    if (!fs.existsSync(STORAGE_PATH)) return null;
    const raw = fs.readFileSync(STORAGE_PATH, 'utf8');
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeStore(obj) {
  fs.writeFileSync(STORAGE_PATH, JSON.stringify(obj, null, 2), 'utf8');
}

function sanitizePayload(body) {
  // minimal structural validation
  if (!body || typeof body !== 'object') return null;
  if (!body.heroSubtitle || !body.heroDescription) return null;
  if (!Array.isArray(body.services)) return null;
  if (!Array.isArray(body.collections)) return null;
  if (!Array.isArray(body.process)) return null;
  return body;
}

// A minimal fallback;
const fallbackContent = {
  heroSubtitle: 'welcome to',
  heroDescription:
    'Luxury runway language translated through street instinct. Every silhouette is engineered to move with confidence, precision, and unapologetic identity.',
  services: [
    { title: 'Bespoke & Custom', description: 'One-of-a-kind pieces crafted to your exact measurements and vision.' },
    { title: 'Asoebi & Ankara', description: 'Traditional fabrics reimagined with contemporary tailoring and modern silhouettes.' },
    { title: 'Casual Wears', description: 'Effortless two-piece sets and everyday pieces with couture-level finishing.' },
    { title: 'Ready to Wear', description: 'Curated collections designed for immediate impact and everyday luxury.' },
  ],
  aboutNarrative:
    'Veeboss Stitches designs from the inside out, beginning with construction, movement, and emotional intent.',
  contactIntro: 'For bespoke commissions, editorial pulls, and creative collaborations.',
  contactEmail: 'vbosssiere@gmail.com',
  contactWhatsapp: '+234 7013169283',
  contactLocation: 'Basic estate lokogoma, Abuja, Nigeria',
  socialInstagram: 'https://www.instagram.com/veeboss_stitches/',
  socialTikTok: 'https://www.tiktok.com/@veebosssiere83',
  socialPinterest: 'https://pinterest.com/veebossstitches',
  collections: [],
  process: [
    { id: 'process-01', step: '01', title: 'Research and Mood', detail: 'References are translated into palettes, silhouette maps, and narrative direction.' },
    { id: 'process-02', step: '02', title: 'Pattern and Drape', detail: 'Every cut is developed on-body for precision movement and controlled volume.' },
    { id: 'process-03', step: '03', title: 'Finish and Styling', detail: 'Hand-finished detailing and styling calibration shape the final statement look.' },
  ],
};


app.get('/api/content', (req, res) => {
  const store = readStore();
  if (store && store.content) return res.json(store.content);
  // First run: return fallback; admin can then persist real content.
  return res.json(fallbackContent);
});

app.post('/api/content', (req, res) => {
  const passcode = req.headers['x-admin-passcode'];
  if (!passcode || String(passcode) !== String(ADMIN_PASSCODE)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const body = req.body;
  if (!body) return res.status(400).json({ error: 'Missing body' });

  // Minimal validation: ensure key fields exist.
  if (!body.heroSubtitle || !body.heroDescription || !Array.isArray(body.services)) {
    return res.status(400).json({ error: 'Invalid content payload' });
  }

  const next = body;
  writeStore({ content: next, updatedAt: new Date().toISOString() });
  return res.json({ ok: true });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`VeeBoss admin API listening on http://localhost:${PORT}`);
});

