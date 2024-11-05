"use strict";
/**
 * llm-agent-node service
 */
Object.defineProperty(exports, "__esModule", { value: true });
const strapi_1 = require("@strapi/strapi");
exports.default = strapi_1.factories.createCoreService('api::llm-agent-node.llm-agent-node');
