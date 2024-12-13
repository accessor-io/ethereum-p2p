// Common Types for P2P Network

// Block Related Types
export interface BlockData {
    hash: string;
    header: BlockHeader;
    body: BlockBody;
    transactions: Transaction[];
}

export interface BlockHeader {
    number: number;
    parentHash: string;
    timestamp: number;
    miner: string;
    stateRoot: string;
    transactionsRoot: string;
    receiptsRoot: string;
    difficulty: bigint;
    totalDifficulty: bigint;
    size: number;
    gasLimit: bigint;
    gasUsed: bigint;
    extraData: Buffer;
}

export interface BlockBody {
    transactions: Transaction[];
    uncles: BlockHeader[];
}

// Transaction Related Types
export interface Transaction {
    hash: string;
    nonce: number;
    from: string;
    to: string;
    value: bigint;
    gasPrice: bigint;
    gasLimit: bigint;
    data: Buffer;
    v: number;
    r: string;
    s: string;
}

export interface TransactionReceipt {
    transactionHash: string;
    transactionIndex: number;
    blockHash: string;
    blockNumber: number;
    from: string;
    to: string;
    gasUsed: bigint;
    status: boolean;
    logs: Log[];
}

export interface Log {
    address: string;
    topics: string[];
    data: Buffer;
    blockNumber: number;
    blockHash: string;
    transactionHash: string;
    transactionIndex: number;
    logIndex: number;
}

// State Related Types
export interface StateDB {
    getRoot(): string;
    setRoot(root: string): Promise<void>;
    get(key: Buffer): Promise<Buffer>;
    put(key: Buffer, value: Buffer): Promise<void>;
    delete(key: Buffer): Promise<void>;
    commit(): Promise<void>;
    checkpoint(): void;
    revert(): void;
}

export interface ExecutionResult {
    gasUsed: bigint;
    status: boolean;
    logs: Log[];
}

// Metrics Related Types
export interface ConsensusMetrics {
    blockTime: number;
    blockSize: number;
    transactionCount: number;
    uncleCount: number;
    difficulty: bigint;
}

export interface LatencyMetrics {
    min: number;
    max: number;
    average: number;
    current: number;
}

export interface ConnectionMetrics {
    total: number;
    active: number;
    pending: number;
    failed: number;
}

export interface PeerMetrics {
    count: number;
    connected: number;
    disconnected: number;
    banned: number;
}

// Error Types
export interface PropagationError {
    blockHash: string;
    timestamp: number;
    type: PropagationErrorType;
    error: string;
    details?: any;
}

export type PropagationErrorType = 
    | 'validation_failed'
    | 'propagation_timeout'
    | 'network_error'
    | 'peer_disconnected'
    | 'invalid_format';

export interface PropagationErrorLog {
    errors: PropagationError[];
    timestamp: number;
    totalErrors: number;
}

// Validator Related Types
export interface BlockValidator {
    validateBlockStructure(block: BlockData): Promise<void>;
    validateBlockIntegrity(block: BlockData): Promise<void>;
    validateBlock(block: BlockData): Promise<ValidationResult>;
}

export interface ValidationTask {
    block: BlockData;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    startTime: number;
    result?: ValidationResult;
    error?: Error;
}

export interface ValidationResult {
    isValid: boolean;
    error?: string;
    details?: any;
}

// Chain Related Types
export interface ChainManager {
    processNewBlock(block: BlockData): Promise<void>;
    handlePotentialFork(block: BlockData): Promise<void>;
}

export interface ChainState {
    lastBlock: BlockData;
    height: number;
    totalDifficulty: bigint;
    forks: ForkData[];
}

export interface ForkData {
    startBlock: BlockData;
    blocks: BlockData[];
    totalDifficulty: bigint;
    isFork: boolean;
}

export interface ForkDetectionResult {
    isFork: boolean;
    commonAncestor?: BlockData;
    forkBlocks: BlockData[];
} 