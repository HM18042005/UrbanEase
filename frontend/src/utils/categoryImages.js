// Centralized category -> image mapping with size variants
// Preferred approach: Fixed Unsplash photo URLs (images.unsplash.com) for reliability.
// Fallback: Unsplash Source keyword queries for categories without fixed photos.

const buildUnsplashQuery = (query, w, h, sig) => {
  const size = `${w}x${h}`;
  const q = encodeURIComponent(query);
  const s = typeof sig === 'number' ? `&sig=${sig}` : '';
  return `https://source.unsplash.com/${size}/?${q}${s}`;
};

// Build a sized image URL from a known-good images.unsplash.com photo path
const buildFixedUnsplash = (photoPath, w, h) => {
  // photoPath example: "photo-1682345262055-8f95f3c513ea"
  const base = `https://images.unsplash.com/${photoPath}`;
  const params = new URLSearchParams({
    q: '80',
    w: String(w),
    h: String(h),
    auto: 'format',
    fit: 'crop',
    ixlib: 'rb-4.1.0',
  });
  return `${base}?${params.toString()}`;
};

// Known categories (lowercase canonical keys) -> query terms
const CATEGORY_QUERIES = {
  cleaning: 'house cleaning, cleaning service',
  plumbing: 'plumber, plumbing tools',
  electrical: 'electrician, electrical wiring',
  carpentry: 'carpentry, woodwork tools',
  painting: 'home painting, paint roller',
  'appliance repair': 'appliance repair, technician',
  hvac: 'hvac, air conditioning, ventilation',
  gardening: 'gardening, landscaping yard',
  'home security': 'home security, cctv',
  'pest control': 'pest control, exterminator',
  roofing: 'roofing, roofer',
  flooring: 'flooring, hardwood floor',
  'interior design': 'interior design, home decor',
  moving: 'moving, movers, boxes',
  'general maintenance': 'home maintenance, handyman',
};

// Aliases and common typos mapped to canonical keys
const CATEGORY_ALIASES = {
  'appliance-repair': 'appliance repair',
  appliances: 'appliance repair',
  'electrical services': 'electrical',
  'general maintainence': 'general maintenance',
  'home maintenance': 'general maintenance',
  maintenance: 'general maintenance',
  'interior-design': 'interior design',
  'roof repairs': 'roofing',
  mover: 'moving',
  movers: 'moving',
  'plumbing services': 'plumbing',
};

// Fixed, free Unsplash photos (images.unsplash.com) for key categories
// Use the images.unsplash.com "photo-<id>" path portion without query params
const FIXED_PHOTOS = {
  // Verified free images:
  electrical: 'photo-1682345262055-8f95f3c513ea', // Jimmy Nilsson Masth – electrician wires
  'interior design': 'photo-1656122381069-9ec666d95cf1', // Jake Goossen – living room
  roofing: 'photo-1635424709961-f3a150459ad4', // Raze Solar – roofing/solar install
  plumbing: 'photo-1521207418485-99c705420785', // Imani – faucet/sink (plumbing)
  'general maintenance': 'photo-1530124566582-a618bc2615dc', // Kenny Eliason – tools/maintenance

  // Reasonable representatives (temporary until a more specific photo is curated):
  // Using interior design as a safe default visual for these two to avoid 404s.
  hvac: 'photo-1656122381069-9ec666d95cf1',
  moving: 'photo-1656122381069-9ec666d95cf1',
  'appliance repair': 'photo-1530124566582-a618bc2615dc',
};

const VARIANT_SIZES = {
  card: { w: 300, h: 200 },
  grid: { w: 300, h: 200 },
  detail: { w: 800, h: 500 },
  thumb: { w: 150, h: 100 },
};

export function getCategoryImage(category, variant = 'card') {
  const { w, h } = VARIANT_SIZES[variant] || VARIANT_SIZES.card;
  if (!category || typeof category !== 'string') {
    // Prefer a pleasant, reliable default interior if possible
    return buildFixedUnsplash(
      FIXED_PHOTOS['interior design'] || 'photo-1656122381069-9ec666d95cf1',
      w,
      h
    );
  }
  const raw = category.toLowerCase().trim();
  const canonical = CATEGORY_QUERIES[raw] ? raw : CATEGORY_ALIASES[raw] || raw;
  // If we have a fixed photo for this category, use it
  if (FIXED_PHOTOS[canonical]) {
    return buildFixedUnsplash(FIXED_PHOTOS[canonical], w, h);
  }
  // Otherwise, fall back to a robust Unsplash Source keyword query
  const query = CATEGORY_QUERIES[canonical] || `${canonical}, home service`;
  const sig = hashString(canonical) % 97; // small stable range
  return buildUnsplashQuery(query, w, h, sig);
}

export function getDefaultImage(variant = 'card') {
  const { w, h } = VARIANT_SIZES[variant] || VARIANT_SIZES.card;
  return buildFixedUnsplash(
    FIXED_PHOTOS['interior design'] || 'photo-1656122381069-9ec666d95cf1',
    w,
    h
  );
}

export const CATEGORY_IMAGE_KEYS = Object.keys(CATEGORY_QUERIES);
// Utility: simple deterministic hash for signature stability
function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// Exported API updated below
