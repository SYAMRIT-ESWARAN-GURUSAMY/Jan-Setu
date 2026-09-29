"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.initDatabase = initDatabase;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("../config");
const dbPath = config_1.CONFIG.DB_FILE;
const dbDir = path_1.default.dirname(dbPath);
if (!fs_1.default.existsSync(dbDir)) {
    fs_1.default.mkdirSync(dbDir, { recursive: true });
}
exports.db = new better_sqlite3_1.default(dbPath);
exports.db.pragma('journal_mode = WAL');
exports.db.pragma('foreign_keys = ON');
function initDatabase() {
    const possiblePaths = [
        path_1.default.join(__dirname, 'schema.sql'),
        path_1.default.join(__dirname, '../../src/database/schema.sql'),
        path_1.default.join(__dirname, '../src/database/schema.sql'),
        path_1.default.resolve(process.cwd(), 'src/database/schema.sql')
    ];
    const schemaPath = possiblePaths.find(p => fs_1.default.existsSync(p)) || possiblePaths[0];
    const schema = fs_1.default.readFileSync(schemaPath, 'utf8');
    exports.db.exec(schema);
    console.log('Database initialized successfully from:', schemaPath);
}
