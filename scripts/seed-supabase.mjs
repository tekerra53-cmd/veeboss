import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const initialContent = {
  heroSubtitle: 'welcome to',
  heroDescription:
    'Luxury runway language translated through street instinct. Every silhouette is engineered to move with confidence, precision, and unapologetic identity.',
  services: [
    { title: 'Bespoke & Custom', description: 'One-of-a-kind pieces crafted to your exact measurements and vision.' },
    { title: 'Asoebi & Ankara', description: 'Traditional fabrics reimagined with contemporary tailoring and modern silhouettes.' },
    { title: 'Casual Wears', description: 'Effortless two-piece sets and everyday pieces with couture-level finishing.' },
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
  process: [],
};

async function run() {
  try {
    const { data, error } = await supabase
      .from('site_content')
      .upsert({ id: 'veeboss-site', content: initialContent }, { onConflict: 'id' });

    if (error) {
      console.error('Supabase upsert error:', error.message || error);
      process.exit(1);
    }

    console.log('Seeded site_content row:', data);
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

run();
