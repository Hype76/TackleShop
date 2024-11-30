import { getDb } from './schema';
import { getAllShops } from './shops';

async function viewDatabase() {
    const db = await getDb();

    // View all shops
    console.log('\n=== Shops ===');
    const shops = await db.execO('SELECT * FROM shops');
    console.log(JSON.stringify(shops, null, 2));

    // View all specialties
    console.log('\n=== Specialties ===');
    const specialties = await db.execO('SELECT * FROM specialties');
    console.log(JSON.stringify(specialties, null, 2));
    
    // View shops with their specialties
    console.log('\n=== Shops with Specialties ===');
    const shopsWithSpecialties = await getAllShops();
    console.log(JSON.stringify(shopsWithSpecialties, null, 2));
}

// Run the view function
viewDatabase()
    .catch(console.error)
    .finally(() => {
        process.exit(0);
    });
