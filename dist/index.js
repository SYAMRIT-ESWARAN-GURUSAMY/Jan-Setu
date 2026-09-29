"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const config_1 = require("./config");
const seed_1 = require("./database/seed");
const complaints_1 = __importDefault(require("./routes/complaints"));
const clusters_1 = __importDefault(require("./routes/clusters"));
const districts_1 = __importDefault(require("./routes/districts"));
const priority_1 = __importDefault(require("./routes/priority"));
const review_1 = __importDefault(require("./routes/review"));
const briefs_1 = __importDefault(require("./routes/briefs"));
const verification_1 = __importDefault(require("./routes/verification"));
const audit_1 = __importDefault(require("./routes/audit"));
const demo_1 = __importDefault(require("./routes/demo"));
const app = (0, express_1.default)();
const allowedOrigins = config_1.CONFIG.FRONTEND_URL === '*'
    ? true
    : [config_1.CONFIG.FRONTEND_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'];
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Initialize database with demo seeds
(0, seed_1.seedDatabase)();
// Mount API routes
app.use('/api', complaints_1.default);
app.use('/api', clusters_1.default);
app.use('/api', districts_1.default);
app.use('/api', priority_1.default);
app.use('/api', review_1.default);
app.use('/api', briefs_1.default);
app.use('/api', verification_1.default);
app.use('/api', audit_1.default);
app.use('/api', demo_1.default);
// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'online',
        system: 'JAN-SETU AI Backend',
        mode: config_1.CONFIG.AI_PROVIDER_MODE,
        timestamp: new Date().toISOString()
    });
});
app.listen(config_1.CONFIG.PORT, () => {
    console.log(`====================================================`);
    console.log(` JAN-SETU AI Backend Command Center Running `);
    console.log(` Port: ${config_1.CONFIG.PORT} | Mode: ${config_1.CONFIG.AI_PROVIDER_MODE} `);
    console.log(`====================================================`);
});
