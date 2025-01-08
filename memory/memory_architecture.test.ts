import { MemoryArchitecture } from './memory_architecture';

describe('MemoryArchitecture', () => {
  let memoryArchitecture: MemoryArchitecture;

  beforeEach(() => {
    memoryArchitecture = new MemoryArchitecture();
  });

  test('should initialize with empty buffers', () => {
    expect(memoryArchitecture['primaryBuffers'].size).toBe(0);
    expect(memoryArchitecture['secondaryBuffers'].size).toBe(0);
  });

  test('should add a buffer to primaryBuffers', () => {
    const buffer = Buffer.from('test');
    memoryArchitecture['primaryBuffers'].set('testKey', buffer);
    expect(memoryArchitecture['primaryBuffers'].get('testKey')).toBe(buffer);
  });

  test('should remove a buffer from primaryBuffers', () => {
    const buffer = Buffer.from('test');
    memoryArchitecture['primaryBuffers'].set('testKey', buffer);
    memoryArchitecture['primaryBuffers'].delete('testKey');
    expect(memoryArchitecture['primaryBuffers'].has('testKey')).toBe(false);
  });

  // Add more tests for other methods and event emissions
}); 