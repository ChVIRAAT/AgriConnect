import { all, one } from "./db";

export type Crop = {
  id: number;
  farmer_id: number;
  title: string;
  category: string;
  description: string;
  price: number;
  unit: string;
  quantity: number;
  harvest_date: string;
  location: string;
  organic: number;
  is_active: number;
  created_at: string;
  farmer_name: string;
  farm_name: string | null;
  farmer_avatar: string;
  farmer_phone: string | null;
  farmer_bio: string | null;
};

export type Farmer = {
  id: number;
  name: string;
  email: string;
  role: string;
  phone: string | null;
  avatar: string;
  location: string | null;
  farm_name: string | null;
  bio: string | null;
  created_at: string;
  listings: number;
};

export type CropFilters = {
  q?: string;
  category?: string;
  organic?: boolean;
  location?: string;
  sort?: string;
  farmerId?: number;
};

const CROP_SELECT = `
  SELECT c.*, u.name AS farmer_name, u.farm_name, u.avatar AS farmer_avatar,
         u.phone AS farmer_phone, u.bio AS farmer_bio
  FROM crops c JOIN users u ON u.id = c.farmer_id
`;

export async function listCrops(filters: CropFilters = {}): Promise<Crop[]> {
  const where: string[] = ["c.is_active = 1"];
  const params: unknown[] = [];

  if (filters.q) {
    const like = `%${filters.q.trim()}%`;
    where.push("(c.title LIKE ? OR c.description LIKE ? OR c.category LIKE ? OR c.location LIKE ? OR u.name LIKE ? OR u.farm_name LIKE ?)");
    params.push(like, like, like, like, like, like);
  }
  if (filters.category && filters.category !== "All") {
    where.push("c.category = ?");
    params.push(filters.category);
  }
  if (filters.organic) {
    where.push("c.organic = 1");
  }
  if (filters.location && filters.location !== "All") {
    where.push("c.location LIKE ?");
    params.push(`%${filters.location}%`);
  }
  if (filters.farmerId) {
    where.push("c.farmer_id = ?");
    params.push(filters.farmerId);
  }

  const orderBy =
    filters.sort === "price-asc"
      ? "c.price ASC"
      : filters.sort === "price-desc"
        ? "c.price DESC"
        : filters.sort === "name"
          ? "c.title ASC"
          : "c.created_at DESC, c.id DESC";

  const sql = `${CROP_SELECT} WHERE ${where.join(" AND ")} ORDER BY ${orderBy}`;
  return all<Crop>(sql, params);
}

export async function getCrop(id: number): Promise<Crop | null> {
  return one<Crop>(`${CROP_SELECT} WHERE c.id = ?`, [id]);
}

export async function relatedCrops(crop: Crop, limit = 3): Promise<Crop[]> {
  return all<Crop>(
    `${CROP_SELECT} WHERE c.is_active = 1 AND c.id != ? AND (c.category = ? OR c.farmer_id = ?) ORDER BY c.id LIMIT ?`,
    [crop.id, crop.category, crop.farmer_id, limit]
  );
}

export async function priceRange(category?: string): Promise<{ min: number; max: number }> {
  const params: unknown[] = [];
  let sql = "SELECT MIN(price) AS min, MAX(price) AS max FROM crops WHERE is_active = 1";
  if (category && category !== "All") {
    sql += " AND category = ?";
    params.push(category);
  }
  const row = await one<{ min: number | null; max: number | null }>(sql, params);
  return { min: row?.min ?? 0, max: row?.max ?? 0 };
}

export async function listFarmers(q?: string): Promise<Farmer[]> {
  let sql = `
    SELECT u.*, COUNT(c.id) AS listings
    FROM users u LEFT JOIN crops c ON c.farmer_id = u.id AND c.is_active = 1
    WHERE u.role = 'farmer'`;
  const params: unknown[] = [];
  if (q && q.trim()) {
    const like = `%${q.trim()}%`;
    sql += " AND (u.name LIKE ? OR u.farm_name LIKE ? OR u.location LIKE ? OR u.bio LIKE ?)";
    params.push(like, like, like, like);
  }
  sql += " GROUP BY u.id ORDER BY listings DESC, u.name ASC";
  return all<Farmer>(sql, params);
}

export async function getFarmer(id: number): Promise<Farmer | null> {
  return one<Farmer>(
    `SELECT u.*, COUNT(c.id) AS listings
     FROM users u LEFT JOIN crops c ON c.farmer_id = u.id AND c.is_active = 1
     WHERE u.id = ? AND u.role = 'farmer'
     GROUP BY u.id`,
    [id]
  );
}

export async function categoriesWithCounts(): Promise<{ category: string; count: number }[]> {
  return all<{ category: string; count: number }>(
    `SELECT category, COUNT(*) AS count FROM crops WHERE is_active = 1 GROUP BY category ORDER BY count DESC`
  );
}

export async function locations(): Promise<string[]> {
  const rows = await all<{ location: string }>(
    `SELECT DISTINCT location FROM crops WHERE is_active = 1 ORDER BY location`
  );
  return rows.map((r) => r.location);
}

export async function platformStats(): Promise<{
  farmers: number;
  crops: number;
  categories: number;
  locations: number;
}> {
  const row = await one<{
    farmers: number;
    crops: number;
    categories: number;
    locations: number;
  }>(
    `SELECT
       (SELECT COUNT(*) FROM users WHERE role = 'farmer') AS farmers,
       (SELECT COUNT(*) FROM crops WHERE is_active = 1) AS crops,
       (SELECT COUNT(DISTINCT category) FROM crops WHERE is_active = 1) AS categories,
       (SELECT COUNT(DISTINCT location) FROM crops WHERE is_active = 1) AS locations`
  );
  return {
    farmers: row?.farmers ?? 0,
    crops: row?.crops ?? 0,
    categories: row?.categories ?? 0,
    locations: row?.locations ?? 0,
  };
}

export async function featuredCrops(limit = 6): Promise<Crop[]> {
  return all<Crop>(
    `${CROP_SELECT} WHERE c.is_active = 1 ORDER BY c.organic DESC, c.quantity DESC, c.id ASC LIMIT ?`,
    [limit]
  );
}

export async function topFarmers(limit = 4): Promise<Farmer[]> {
  return all<Farmer>(
    `SELECT u.*, COUNT(c.id) AS listings
     FROM users u LEFT JOIN crops c ON c.farmer_id = u.id AND c.is_active = 1
     WHERE u.role = 'farmer'
     GROUP BY u.id ORDER BY listings DESC, u.name ASC LIMIT ?`,
    [limit]
  );
}
