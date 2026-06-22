import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {z} from 'zod'
import { decrypt, encrypt } from "./service.ts";
import { MIMEType } from "node:util";
import { PromptMessageSchema } from "@modelcontextprotocol/sdk/types.js";

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
server.registerTool(
    'decrypt_message',
    {
        description: 'Decrypt a message encrypted with encrypt_message tool',
        inputSchema:{
            encryptedMessage: z.string().describe("The encrypted message (format: iv:ciphertext)"),
            encryptionKey: z.string().describe("The same passphrase used on encryption"),
        },
        outputSchema:{
            decryptedMessage: z.string().describe("Decrypted message")
        },
    },
    async ({encryptedMessage, encryptionKey})=>{
            try {
                const decryptedMessage = decrypt(encryptedMessage, encryptionKey)
                return{
                    content: [{type:"text",text:decryptedMessage}],
                    structuredContent:{decryptedMessage},
                }
            }catch (err) {
                return{
                    isError: true,
                    content:[{
                        type:'text',
                        text: `Failed to encrypt, please check message and encryption key: ${err instanceof Error? err.message : String(err)}`
                     }
                    ]
                }
            }
        },
    
)
server.registerResource(
    'encryption://info',
    'encryption://info',
    {
        description: 'Describes the encryption algorithm, key requirements, and output format.'

    },
    async ()=>({
        contents:[
            {
                uri: "encryption://info",
                mimeType: 'text/plain',
                text: `
                    Algorithm: AES-=256-CBC
                    Key derivation: scrypt (passphrase + fixed server salt -> 32-byte key)
                    Output format: <16-byte IV in hex>:<ciphertext in hex> (separated by ":")
                    Notes:
                        - User pass any passphrase - Server derives a string 32-byte key aytomatically using scrypt
                        - A random IV is generated for every encryption
                        - Use the exact same passphrase to decrypt.
                        - Keep the full "iv:ciphertext" string to decrypt later.
                       
                       `.trim()
            }

        ]
    })
)
server.registerPrompt(
    "encrypt_message_prompt",
    {
        description: "Prompt to encrypt a plain-text message using the encrypt_message tool",
        argsSchema: {
            message: z.string().describe("Message to encrypt"),
            encryptionKey: z.string().describe("Any passpharase to use for encryption")
        }
    },
    ({message, encryptionKey})=>({
        messages: [
            {
                role:"user",
                content:{
                    type:"text",
                    text:`Please encrypt the following message using the encrypt_message tool. \nMessage: ${message}\nEncryption key: ${encryptionKey}`
                }
            }
        ]
    })
)
