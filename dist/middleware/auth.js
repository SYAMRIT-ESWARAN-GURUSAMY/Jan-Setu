"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdminAuth = requireAdminAuth;
const config_1 = require("../config");
function requireAdminAuth(req, res, next) {
    const token = req.headers['authorization'] || req.headers['x-admin-token'] || req.query.admin_token;
    const expectedToken = config_1.CONFIG.ADMIN_TOKEN;
    if (!token) {
        return res.status(403).json({
            error: 'Forbidden: Admin authorization token required.',
            code: 'ADMIN_TOKEN_MISSING'
        });
    }
    const cleanToken = String(token).replace('Bearer ', '').trim();
    if (cleanToken !== expectedToken) {
        return res.status(403).json({
            error: 'Forbidden: Invalid admin token.',
            code: 'INVALID_ADMIN_TOKEN'
        });
    }
    next();
}
