import { getDb } from './schema';
import type { TackleShop } from '../types/shops';
import { initialShops } from '../data/shops';

export async function getAllShops(): Promise<TackleShop[]> {
    const db = await getDb();
    try {
        const result = db.exec(`
            SELECT s.*, GROUP_CONCAT(sp.specialty) as specialties
            FROM shops s
            LEFT JOIN specialties sp ON s.id = sp.shop_id
            GROUP BY s.id
        `);

        if (!result.length) return [];

        return result[0].values.map(row => {
            const [id, name, address, city, postcode, region, phone, website, specialties] = row;
            return {
                name: name as string,
                address: address as string,
                city: city as string,
                postcode: postcode as string,
                region: region as string,
                phone: phone as string || undefined,
                website: website as string || undefined,
                specialties: specialties ? (specialties as string).split(',') : []
            };
        });
    } catch (error) {
        console.error('Error getting shops:', error);
        throw error;
    }
}

export async function addShop(shop: TackleShop) {
    const db = await getDb();
    const { specialties, ...shopData } = shop;
    const phone = shopData.phone?.trim();

    try {
        db.run('BEGIN TRANSACTION');

        // Check for existing shop
        const existingShop = db.exec(
            `SELECT id FROM shops WHERE address = ? OR (phone IS NOT NULL AND phone = ?)`,
            [shopData.address, phone]
        );

        if (existingShop.length > 0) {
            throw new Error('A shop with this address or phone number already exists');
        } else {
            // Insert shop
            db.run(
                `INSERT INTO shops (name, address, city, postcode, region, phone, website)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    shopData.name,
                    shopData.address,
                    shopData.city,
                    shopData.postcode,
                    shopData.region,
                    phone || null,
                    shopData.website || null
                ]
            );

            // Get the inserted shop's ID
            const shopId = db.exec('SELECT last_insert_rowid()')[0].values[0][0] as number;

            // Insert specialties
            if (specialties) {
                for (const specialty of specialties) {
                    db.run(
                        'INSERT INTO specialties (shop_id, specialty) VALUES (?, ?)',
                        [shopId, specialty]
                    );
                }
            }
        }

        db.run('COMMIT');
    } catch (error) {
        db.run('ROLLBACK');
        throw error;
    }
}

export async function initializeShops() {
    const db = await getDb();
    const result = db.exec('SELECT COUNT(*) as count FROM shops');
    const count = result[0].values[0][0] as number;

    if (count === 0) {
        // Clean initial data to prevent duplicates
        const uniqueShops = new Map();

        for (const shop of initialShops) {
            const key = `${shop.address}|${shop.phone || ''}`;
            uniqueShops.set(key, shop);
        }

        // Insert only unique shops
        for (const shop of uniqueShops.values()) {
            try {
                await addShop(shop);
            } catch (error) {
                console.warn(`Skipping duplicate shop: ${shop.name}`);
            }
        }
    }
}