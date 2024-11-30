import initSqlJs from 'sql.js';
import type { Database } from 'sql.js';

const SQL_WASM_PATH = '/sql-wasm.wasm';
let dbPromise: Promise<Database> | null = null;

export async function getDb(): Promise<Database> {
  try {
    if (!dbPromise) {
      // Initialize SQL.js with explicit WASM path
      dbPromise = initSqlJs({
        locateFile: () => SQL_WASM_PATH
      }).then(SQL => {
        const db = new SQL.Database();
        
        // Create tables
        db.run(`
          CREATE TABLE IF NOT EXISTS shops (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            address TEXT NOT NULL UNIQUE,
            city TEXT NOT NULL,
            postcode TEXT NOT NULL,
            region TEXT NOT NULL,
            phone TEXT UNIQUE,
            website TEXT
          );

          CREATE TABLE IF NOT EXISTS specialties (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            shop_id INTEGER,
            specialty TEXT NOT NULL,
            FOREIGN KEY (shop_id) REFERENCES shops(id)
          );
        `);
        
        return db;
      });
    }

    return await dbPromise;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}