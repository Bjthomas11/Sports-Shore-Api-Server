"use strict";
exports.DATABASE_URL =
  process.env.MONGODB_URI || "mongodb://localhost/sports-shore";
exports.TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || "mongodb://localhost/test-sports-shore-app";
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = "OperationTopSecret";
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || "7d";
exports.CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:3000";
