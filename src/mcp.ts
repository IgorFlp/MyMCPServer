import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {z} from 'zod'
import { decrypt, encrypt } from "./service.ts";

export const server = new McpServer({
    name: 'IgorFlp/ciphersuite-mcp',
    version: '0.0.1'
})

server.registerTool(
    'encrypt_message',
    {
        description: 'Encrypt a message',
        inputSchema:{
            message: z.string().describe("Message to encrypt"),
            encryptionKey: z.string().describe("Any passpharase to use for encryption")
        },
        outputSchema:{
            encryptedMessage: z.string().describe(
                "Encrypted message format: iv:ciphertext"
            )
        }
    },
    async ({message,encryptionKey})=>{
        try {
            const encryptedMessage = encrypt(message, encryptionKey)
            return {
                content: [{type: 'text', text:'encryptedMessage'}],
                structuredContent: {encryptedMessage}
            }
        } catch (err) {
            return{
                isError: true,
                content:[
                    {
                        type: 'text',
                        text: `Failed to encrypt, please check message and encryption key: ${err instanceof Error? err.message : String(err)}`
                    }
                ]
            }
        }
    }
)