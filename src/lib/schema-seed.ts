import { hashPassword } from "./auth";

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('farmer','consumer')),
  phone TEXT,
  avatar TEXT,
  location TEXT,
  farm_name TEXT,
  bio TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS crops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  farmer_id INTEGER NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  price REAL NOT NULL,
  unit TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  harvest_date TEXT NOT NULL,
  location TEXT NOT NULL,
  organic INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  crop_id INTEGER NOT NULL REFERENCES crops(id),
  consumer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  farmer_id INTEGER NOT NULL REFERENCES users(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  message TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','closed')),
  farmer_response TEXT,
  responded_at TEXT,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  crop_id INTEGER NOT NULL REFERENCES crops(id),
  consumer_id INTEGER NOT NULL REFERENCES users(id),
  farmer_id INTEGER NOT NULL REFERENCES users(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price REAL NOT NULL CHECK (unit_price > 0),
  total_price REAL NOT NULL CHECK (total_price > 0),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending','accepted','rejected','completed','cancelled')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS order_status_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL
    CHECK (status IN ('pending','accepted','rejected','completed','cancelled')),
  note TEXT,
  changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS schema_migrations (
  id TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS crops_farmer_active_created_idx
  ON crops (farmer_id, is_active, created_at);
CREATE INDEX IF NOT EXISTS sessions_user_idx
  ON sessions (user_id);
CREATE INDEX IF NOT EXISTS inquiries_crop_idx
  ON inquiries (crop_id);
CREATE INDEX IF NOT EXISTS inquiries_farmer_created_idx
  ON inquiries (farmer_id, created_at);
CREATE INDEX IF NOT EXISTS inquiries_consumer_created_idx
  ON inquiries (consumer_id, created_at);
CREATE INDEX IF NOT EXISTS orders_consumer_created_idx
  ON orders (consumer_id, created_at);
CREATE INDEX IF NOT EXISTS orders_farmer_created_idx
  ON orders (farmer_id, created_at);
CREATE INDEX IF NOT EXISTS order_status_history_order_idx
  ON order_status_history (order_id, created_at);
`;

type SeedUser = {
  name: string; email: string; role: "farmer" | "consumer"; phone: string;
  avatar: string; location: string; farmName?: string; bio: string;
};

const SEED_USERS: SeedUser[] = [
  {
    name: "Ramesh Patil", email: "ramesh@agriconnect.farm", role: "farmer", phone: "+91 98220 41123",
    avatar: "🌾", location: "Nashik, Maharashtra", farmName: "Sunrise Valley Farm", bio: "Third-generation grape and onion farmer practicing natural farming for 22 years. I believe good soil grows good food.",
  },
  {
    name: "Sunita Devi", email: "sunita@agriconnect.farm", role: "farmer", phone: "+91 94510 77834",
    avatar: "🥬", location: "Varanasi, Uttar Pradesh", farmName: "Ganga Green Growers", bio: "Organic vegetable grower along the Ganges plains. Every morning starts with hand-weeding and a cup of chai.",
  },
  {
    name: "Karthik Reddy", email: "karthik@agriconnect.farm", role: "farmer", phone: "+91 90000 34521",
    avatar: "🥭", location: "Rajahmundry, Andhra Pradesh", farmName: "Godavari Mango Estates", bio: "Mango and banana orchards on the Godavari delta. I ship tree-ripened fruit within 48 hours of picking.",
  },
  {
    name: "Meera Nair", email: "meera@agriconnect.farm", role: "farmer", phone: "+91 98470 22109",
    avatar: "🫒", location: "Wayanad, Kerala", farmName: "Western Ghats Spice Garden", bio: "Spice, coffee and coconut grower in the misty hills of Wayanad. Shade-grown, bird-friendly, chemical-free.",
  },
  {
    name: "Gurpreet Singh", email: "gurpreet@agriconnect.farm", role: "farmer", phone: "+91 98140 66542",
    avatar: "🚜", location: "Ludhiana, Punjab", farmName: "Five Rivers Wheat Farms", bio: "Wheat, rice and maize on 40 acres of fertile Punjab soil. Happy to host farm visits for families and schools.",
  },
  {
    name: "Anita Sharma", email: "anita@agriconnect.farm", role: "farmer", phone: "+91 94120 58763",
    avatar: "🍅", location: "Baramati, Maharashtra", farmName: "Sunshine Kitchen Garden", bio: "Tomatoes, leafy greens and strawberries grown in polyhouses. Picked at dawn, delivered the same day.",
  },
  {
    name: "Devi Lal", email: "devilal@agriconnect.farm", role: "farmer", phone: "+91 92510 43398",
    avatar: "🐄", location: "Bikaner, Rajasthan", farmName: "Thar Desert Dairy & Farm", bio: "Dairy farmer and millet grower. Our Gir cows are raised free-range with love, and it shows in the milk.",
  },
  {
    name: "Lakshmi Iyer", email: "lakshmi@agriconnect.farm", role: "farmer", phone: "+91 94430 19875",
    avatar: "🌾", location: "Thanjavur, Tamil Nadu", farmName: "Kaveri Delta Paddy Fields", bio: "Traditional rice farmer preserving native paddy varieties. Two acres are fully organic certified.",
  },
  {
    name: "Priya Menon", email: "priya@example.com", role: "consumer", phone: "+91 98450 12345",
    avatar: "👩", location: "Bengaluru, Karnataka", bio: "Home cook looking for fresh, honest produce straight from the people who grow it.",
  },
  {
    name: "Arjun Kapoor", email: "arjun@example.com", role: "consumer", phone: "+91 99870 43210",
    avatar: "👨", location: "Delhi", bio: "Restaurant owner sourcing directly from farmers across north India.",
  },
];

export const SEED_USER_EMAILS = SEED_USERS.map((user) => user.email);

type SeedCrop = {
  farmerEmail: string; title: string; category: string; description: string;
  price: number; unit: string; quantity: number; harvestDate: string;
  location: string; organic: boolean;
};

const SEED_CROPS: SeedCrop[] = [
  { farmerEmail: "ramesh@agriconnect.farm", title: "Onions", category: "Vegetables", description: "Cured red onions with deep purple skins and a strong, sweet flavour. Grown in black cotton soil of Nashik — India's onion bowl. Excellent storage life of up to 3 months.", price: 28, unit: "kg", quantity: 2400, harvestDate: "2026-09-18", location: "Nashik, Maharashtra", organic: false },
  { farmerEmail: "ramesh@agriconnect.farm", title: "Thompson Seedless Grapes", category: "Fruits", description: "Crisp, emerald-green grapes with high sweetness (18° Brix). Trellis-grown and sun-ripened on the vine. Packed in 4 kg food-grade crates the same day they are cut.", price: 95, unit: "kg", quantity: 800, harvestDate: "2026-09-25", location: "Nashik, Maharashtra", organic: false },
  { farmerEmail: "sunita@agriconnect.farm", title: "Organic Spinach (Palak)", category: "Vegetables", description: "Tender baby spinach harvested at dawn with dew still on the leaves. Grown in river-silt soil with only cow-dung compost and neem spray. No chemical fertilisers, ever.", price: 35, unit: "kg", quantity: 220, harvestDate: "2026-10-05", location: "Varanasi, Uttar Pradesh", organic: true },
  { farmerEmail: "sunita@agriconnect.farm", title: "Organic Cauliflower", category: "Vegetables", description: "Dense, snow-white curds grown under shade net. irrigated with Ganga canal water. Size runs 700g–1.2kg per head. Perfect for aloo-gobi, pickles or roasting whole.", price: 30, unit: "kg", quantity: 450, harvestDate: "2026-10-08", location: "Varanasi, Uttar Pradesh", organic: true },
  { farmerEmail: "karthik@agriconnect.farm", title: "Banganapalli Mangoes", category: "Fruits", description: "The king of mangoes — golden, fibreless and honey-sweet. Tree-ripened, never carbide-forced. Each fruit is hand-picked with a 2cm stem to prevent sap burn and boxed in straw.", price: 160, unit: "kg", quantity: 1500, harvestDate: "2026-09-30", location: "Rajahmundry, Andhra Pradesh", organic: true },
  { farmerEmail: "karthik@agriconnect.farm", title: "Robusta Bananas", category: "Fruits", description: "Thick-skinned, creamy Robusta bananas from the Godavari delta. Cut green and ripen naturally within 3–4 days at home. Bulk rates available for juice shops and restaurants.", price: 45, unit: "dozen", quantity: 900, harvestDate: "2026-10-02", location: "Rajahmundry, Andhra Pradesh", organic: false },
  { farmerEmail: "meera@agriconnect.farm", title: "Wayanad Black Pepper", category: "Spices", description: "The original 'black gold' of Malabar. Bold 550 g/l berries, sun-dried on bamboo mats, with a sharp pungent aroma that supermarket pepper has lost. Grown under forest shade with coffee.", price: 680, unit: "kg", quantity: 150, harvestDate: "2026-09-10", location: "Wayanad, Kerala", organic: true },
  { farmerEmail: "meera@agriconnect.farm", title: "Green Cardamom (8mm Bold)", category: "Spices", description: "Hand-picked queen of spices, cured slowly to keep the chlorophyll green. Deep, camphor-sweet aroma. One kilo needs 40 hours of careful drying — that is where the flavour lives.", price: 2400, unit: "kg", quantity: 60, harvestDate: "2026-09-05", location: "Wayanad, Kerala", organic: true },
  { farmerEmail: "meera@agriconnect.farm", title: "Sun-Dried Coffee Beans (Arabica)", category: "Spices", description: "Single-estate Arabica from 900m elevation, fully sun-dried on raised beds. Notes of dark chocolate and orange peel. Sold as parchment; roasting guidance included with every order.", price: 750, unit: "kg", quantity: 200, harvestDate: "2026-09-12", location: "Wayanad, Kerala", organic: true },
  { farmerEmail: "gurpreet@agriconnect.farm", title: "Sharbati Wheat", category: "Grains", description: "Golden Sharbati wheat from Punjab's canal-irrigated fields. High protein (12.5%), chakki-fresh aroma. Stone-milled atta available on request at +₹4/kg. Min order 10kg.", price: 32, unit: "kg", quantity: 6000, harvestDate: "2026-09-20", location: "Ludhiana, Punjab", organic: false },
  { farmerEmail: "gurpreet@agriconnect.farm", title: "Basmati 1509 Paddy Rice", category: "Grains", description: "Aged 12 months, extra-long grain Basmati that doubles in length when cooked. Fields flooded twice for natural weed control — no herbicide needed. Aroma fills the whole kitchen.", price: 85, unit: "kg", quantity: 3200, harvestDate: "2026-09-15", location: "Ludhiana, Punjab", organic: false },
  { farmerEmail: "gurpreet@agriconnect.farm", title: "Sweet Corn (Bhutta)", category: "Grains", description: "Golden sweet corn picked at milk stage, best roasted within 48 hours of harvest. Great for roadside stalls, hostels and caterers. Husk-on packing keeps it fresh.", price: 24, unit: "kg", quantity: 1100, harvestDate: "2026-10-01", location: "Ludhiana, Punjab", organic: false },
  { farmerEmail: "anita@agriconnect.farm", title: "Vine Tomatoes", category: "Vegetables", description: "Deep-red cluster tomatoes still on the vine, grown in drip-irrigated polyhouses. Uniform 90–110g fruit with thick pulp — ideal for gravies, sauces and salads. Acid-sweet balance.", price: 40, unit: "kg", quantity: 700, harvestDate: "2026-10-06", location: "Baramati, Maharashtra", organic: false },
  { farmerEmail: "anita@agriconnect.farm", title: "Fresh Strawberries", category: "Fruits", description: "Mahabaleshvari-style winter strawberries from raised beds under net houses. Picked with calyx and chilled within 30 minutes. Sweet-tart, fragrant, gorgeous on cake.", price: 240, unit: "kg", quantity: 180, harvestDate: "2026-10-09", location: "Baramati, Maharashtra", organic: false },
  { farmerEmail: "anita@agriconnect.farm", title: "Baby Spinach & Methi Mix", category: "Vegetables", description: "A washed-and-ready mix of baby spinach, methi and palak cut at 8cm height. Grown in coco-peat troughs with drip fertigation. Ready to cook — no sand, no grit.", price: 60, unit: "kg", quantity: 160, harvestDate: "2026-10-05", location: "Baramati, Maharashtra", organic: true },
  { farmerEmail: "devilal@agriconnect.farm", title: "A2 Gir Cow Ghee", category: "Dairy", description: "Bilona-method ghee churned from curd, not cream. Golden-grain texture, nutty aroma, 2kg of ghee per 30 litres of milk. Poured into glass jars while still warm.", price: 1450, unit: "litre", quantity: 120, harvestDate: "2026-10-03", location: "Bikaner, Rajasthan", organic: true },
  { farmerEmail: "devilal@agriconnect.farm", title: "Pearl Millet (Bajra)", category: "Grains", description: "Desert-hardy bajra grown with rainwater alone. Small, iron-grey grains with an earthy sweetness. High iron and fibre — the traditional winter rotla flour of Rajasthan.", price: 38, unit: "kg", quantity: 2000, harvestDate: "2026-09-28", location: "Bikaner, Rajasthan", organic: true },
  { farmerEmail: "devilal@agriconnect.farm", title: "Fresh Desi Cow Milk", category: "Dairy", description: "Raw, single-herd A2 milk from Gir cows grazed on khejri trees and desert herbs. Delivered in chilled glass bottles within Bikaner city every morning at 6 AM.", price: 70, unit: "litre", quantity: 400, harvestDate: "2026-10-10", location: "Bikaner, Rajasthan", organic: true },
  { farmerEmail: "lakshmi@agriconnect.farm", title: "Mappillai Samba Rice (Native Paddy)", category: "Grains", description: "A heritage Tamil red rice once served to bridegrooms for strength. Grown in the Kaveri delta without any chemicals for 3 seasons. Nutty, chewy and slow-cooking — a true taste of history.", price: 120, unit: "kg", quantity: 600, harvestDate: "2026-09-22", location: "Thanjavur, Tamil Nadu", organic: true },
  { farmerEmail: "lakshmi@agriconnect.farm", title: "Country Eggs (Free Range)", category: "Dairy", description: "Eggs from desi hens that roam the paddy bunds all day. Deep-orange yolks that stand tall in the pan. Collected twice daily, never washed — bloom intact for longer shelf life.", price: 9, unit: "egg", quantity: 5000, harvestDate: "2026-10-07", location: "Thanjavur, Tamil Nadu", organic: true },
  { farmerEmail: "lakshmi@agriconnect.farm", title: "Coconut (Fresh Harvest)", category: "Fruits", description: "Tender-to-mature coconuts from 60-year-old palms with sweet, jelly-like kernel. De-husked on request. Coconut water keeps us and our soil cool — every palm is mulched with its own fronds.", price: 25, unit: "piece", quantity: 3000, harvestDate: "2026-10-04", location: "Thanjavur, Tamil Nadu", organic: false },
  { farmerEmail: "sunita@agriconnect.farm", title: "Organic Fenugreek Leaves (Methi)", category: "Vegetables", description: "Aromatic methi bundles cut young and tender. Slightly bitter in the best way — magic with garlic and jowar flour. Bunches are tied the size of a working woman's palm, generous.", price: 20, unit: "bunch", quantity: 500, harvestDate: "2026-10-06", location: "Varanasi, Uttar Pradesh", organic: true },
];

export type SeedStatement = { sql: string; params: unknown[] };

/**
 * The database initializer applies these statements transactionally and
 * checks existing rows so partially initialized databases can be completed.
 */
export function seedStatements(): SeedStatement[] {
  const out: SeedStatement[] = [];
  const userParams = (u: SeedUser): unknown[] => [
    u.name, u.email, hashPassword("farm123"), u.role, u.phone, u.avatar,
    u.location, u.farmName ?? null, u.bio, new Date().toISOString().slice(0, 10),
  ];
  const cropParams = (c: SeedCrop): unknown[] => [
    c.title, c.category, c.description, c.price, c.unit,
    c.quantity, c.harvestDate, c.location, c.organic ? 1 : 0,
    new Date().toISOString().slice(0, 10), c.farmerEmail, c.title,
  ];

  for (const u of SEED_USERS) {
    out.push({
      sql: `INSERT OR IGNORE INTO users (name, email, password_hash, role, phone, avatar, location, farm_name, bio, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      params: userParams(u),
    });
  }
  for (const c of SEED_CROPS) {
    out.push({
      sql: `INSERT INTO crops (farmer_id, title, category, description, price, unit, quantity, harvest_date, location, organic, is_active, created_at)
            SELECT u.id, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?
            FROM users u
            WHERE u.email = ?
              AND NOT EXISTS (
                SELECT 1 FROM crops existing
                WHERE existing.farmer_id = u.id AND existing.title = ?
              )`,
      params: cropParams(c),
    });
  }
  return out;
}
