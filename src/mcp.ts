import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {z} from 'zod'
import { decrypt, encrypt } from "./service.ts";

export const server = new McpServer({
    name: 'IgorFlp/ciphersuite-mcp',
    version: '0.0.1'
})

