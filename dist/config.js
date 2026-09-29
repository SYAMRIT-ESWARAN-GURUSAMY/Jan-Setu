"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
exports.CONFIG = {
    PORT: process.env.PORT || 5000,
    AI_PROVIDER_MODE: process.env.AI_PROVIDER_MODE || 'demo',
    ADMIN_TOKEN: process.env.ADMIN_TOKEN || 'jansetu-admin-token-2026',
    DB_FILE: process.env.DATABASE_FILE || path_1.default.join(__dirname, '../../jan_setu.db'),
    FRONTEND_URL: process.env.FRONTEND_URL || '*',
    DEFAULT_DISTRICTS: ['Nagapattinam', 'Mayiladuthurai', 'Thanjavur', 'Tiruchirappalli', 'Coimbatore', 'Chennai']
};
