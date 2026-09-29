import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const CONFIG = {
  PORT: process.env.PORT || 5000,
  AI_PROVIDER_MODE: process.env.AI_PROVIDER_MODE || 'demo',
  ADMIN_TOKEN: process.env.ADMIN_TOKEN || 'jansetu-admin-token-2026',
  DB_FILE: process.env.DATABASE_FILE || path.join(__dirname, '../../jan_setu.db'),
  FRONTEND_URL: process.env.FRONTEND_URL || '*',
  DEFAULT_DISTRICTS: ['Nagapattinam', 'Mayiladuthurai', 'Thanjavur', 'Tiruchirappalli', 'Coimbatore', 'Chennai']
};
