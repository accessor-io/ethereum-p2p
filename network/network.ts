// Network Management Implementation
import { Socket } from 'net';
import { EventEmitter } from 'events';
import { 
    MessageType,
    BlockHeader,
    NetworkPeer,
    PeerStatus
} from './protocol';

// Export the Peer interface
export interface Peer {
    id: string;
    host: string;
    port: number;
    status: PeerStatus;
}

// Base BlockData interface
export interface BlockData {
    hash: string;
    header: BlockHeader;
    body: {
        transactions: string[];
        uncles: string[];
    };
    transactions: Transaction[];
}

export interface Transaction {
    hash: string;
    nonce: number;
    from: string;
    to: string;
    value: bigint;
    data: Buffer;
}

// Network specific block data
export interface NetworkBlockData extends Omit<BlockData, 'header'> {
    header: NetworkBlockHeader;
}

export interface NetworkBlockHeader extends BlockHeader {
    receiptsRoot: string;    // Required
    stateRoot: string;       // Required
    miner: string;           // Required
    extraData: Buffer;       // Required
    gasLimit: bigint;        // Required
    gasUsed: bigint;         // Required
}

export class NetworkManager extends EventEmitter {
    private peers: Map<string, NetworkPeer>;
    private maxPeers: number;

    constructor(config: NetworkConfig) {
        super();
        this.peers = new Map();
        this.maxPeers = config.maxPeers || 25;
    }

    private parseEnode(enode: string): { host: string; port: number; id: string } {
        // Parse enode URL format: enode://nodeId@host:port
        const match = enode.match(/^enode:\/\/([a-f0-9]{128})@([^:]+):(\d+)$/i);
        if (!match) {
            throw new Error('Invalid enode format');
        }
        return {
            id: match[1],
            host: match[2],
            port: parseInt(match[3], 10)
        };
    }

    private createMessage(type: MessageType, payload: Buffer): Buffer {
        const header = Buffer.alloc(5);
        header.writeUInt8(type, 0);
        header.writeUInt32BE(payload.length, 1);
        return Buffer.concat([header, payload]);
    }

    private async sendMessage(peer: NetworkPeer, message: Buffer): Promise<void> {
        return new Promise((resolve, reject) => {
            peer.write(message, (error) => {
                if (error) reject(error);
                else resolve();
            });
        });
    }

    private createBlockMessage(block: NetworkBlockData): Buffer {
        // Serialize block data into a buffer
        const headerBuffer = Buffer.concat([
            Buffer.from(block.header.hash),
            Buffer.from(block.header.parentHash),
            Buffer.alloc(8).fill(block.header.number),
            Buffer.alloc(8).fill(block.header.timestamp),
            Buffer.from(block.header.difficulty.toString(16), 'hex'),
            block.header.nonce,
            Buffer.from(block.header.transactionsRoot)
        ]);

        return this.createMessage(MessageType.BLOCK, headerBuffer);
    }

    async connectToPeer(enode: string): Promise<void> {
        // GATEWAY_NET_TRANSFER
        const peerInfo = this.parseEnode(enode);
        
        // GATEWAY_VERIFY_GATEWAY
        if (this.peers.size >= this.maxPeers) {
            throw new Error('Maximum peer limit reached');
        }

        // Create a new peer connection
        const socket = new Socket() as NetworkPeer;
        socket.id = peerInfo.id;
        socket.host = peerInfo.host;
        socket.port = peerInfo.port;
        socket.status = 'connecting';

        // Connect and set up event handlers
        socket.connect(peerInfo.port, peerInfo.host);
        
        socket.on('connect', () => {
            socket.status = 'connected';
            this.peers.set(peerInfo.id, socket);
            this.emit('peer:connected', peerInfo.id);
        });

        socket.on('error', (error) => {
            socket.status = 'disconnected';
            this.peers.delete(peerInfo.id);
            this.emit('peer:error', peerInfo.id, error);
        });

        socket.on('close', () => {
            socket.status = 'disconnected';
            this.peers.delete(peerInfo.id);
            this.emit('peer:disconnected', peerInfo.id);
        });
    }

    async broadcastMessage(type: MessageType, payload: Buffer): Promise<void> {
        // TRANSFER_NET_VERIFY_MEMORY
        const message = this.createMessage(type, payload);
        
        // TRANSFER_ARRAY_FORWARD_SYNC
        const promises = Array.from(this.peers.values()).map(peer => 
            this.sendMessage(peer, message)
        );
        
        // TRANSFER_KEY_7_SECURE_VERIFY
        await Promise.all(promises);
    }

    getPeerList(): PeerInfo[] {
        // NETWORK_QUERY_PEERS
        return Array.from(this.peers.values())
            .filter(peer => peer.status === 'connected')
            .map(peer => ({
                id: peer.id,
                host: peer.host,
                port: peer.port,
                status: peer.status
            }));
    }

    async sendBlock(block: NetworkBlockData, peerId: string): Promise<void> {
        const peer = this.peers.get(peerId);
        if (!peer || peer.status !== 'connected') {
            throw new Error('Peer not connected');
        }

        // NETWORK_SECURE_SEND
        try {
            const message = this.createBlockMessage(block);
            await this.sendMessage(peer, message);
            this.emit('block:sent', block.header.hash, peerId);
        } catch (error) {
            this.emit('block:send:failed', block.header.hash, peerId, error);
            throw error;
        }
    }
}

interface PeerInfo {
    id: string;
    host: string;
    port: number;
    status: PeerStatus;
}

interface NetworkConfig {
    maxPeers?: number;
}

enum MessageType {
    BLOCK = 0x01,
    TRANSACTION = 0x02,
    HANDSHAKE = 0x03,
    PING = 0x04,
    PONG = 0x05
} 