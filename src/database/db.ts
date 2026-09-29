import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { CONFIG } from '../config';

const dbPath = CONFIG.DB_FILE;
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  const possiblePaths = [
    path.join(__dirname, 'schema.sql'),
    path.join(__dirname, '../../src/database/schema.sql'),
    path.join(__dirname, '../src/database/schema.sql'),
    path.resolve(process.cwd(), 'src/database/schema.sql')
  ];
  const schemaPath = possiblePaths.find(p => fs.existsSync(p)) || possiblePaths[0];
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);
  console.log('Database initialized successfully from:', schemaPath);
}
