/**
 * Protocol message types
 */
export enum MessageType {
    // Connection messages
    HELLO = 0x00,
    DISCONNECT = 0x01,
    PING = 0x02,
    PONG = 0x03,

    // Chain messages
    GET_BLOCKS = 0x10,
    BLOCKS = 0x11,
    NEW_BLOCK = 0x12,
    GET_BLOCK_HEADERS = 0x13,
    BLOCK_HEADERS = 0x14,

    // Transaction messages
    TRANSACTIONS = 0x20,
    GET_POOLED_TRANSACTIONS = 0x21,
    POOLED_TRANSACTIONS = 0x22,

    // State messages
    GET_NODE_DATA = 0x30,
    NODE_DATA = 0x31,
    GET_RECEIPTS = 0x32,
    RECEIPTS = 0x33,

    // Consensus messages
    CONSENSUS_STATUS = 0x40,
    CONSENSUS_DATA = 0x41,
    CONSENSUS_VOTE = 0x42
}

/**
 * Protocol error types
 */
export class MessageError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'MessageError';
    }
}

/**
 * Protocol constants
 */
export const PROTOCOL_VERSION = 1;
export const MAX_MESSAGE_SIZE = 1024 * 1024; // 1MB
export const MIN_MESSAGE_SIZE = 8; // Minimum header size
export const HEADER_SIZE = 8;

/**
 * Protocol message status codes
 */
export enum MessageStatus {
    SUCCESS = 0x00,
    DECODE_ERROR = 0x01,
    INVALID_FORMAT = 0x02,
    CHECKSUM_MISMATCH = 0x03,
    SIZE_EXCEEDED = 0x04,
    COMPRESSION_ERROR = 0x05,
    ENCRYPTION_ERROR = 0x06,
    VERSION_MISMATCH = 0x07,
    INVALID_TYPE = 0x08
} 