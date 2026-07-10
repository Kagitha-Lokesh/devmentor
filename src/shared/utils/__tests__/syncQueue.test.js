import { describe, it, expect, vi, beforeEach } from 'vitest';
import { localDB } from '../indexedDB';
import { syncQueue } from '../syncQueue';

vi.mock('../indexedDB', () => ({
  localDB: {
    get: vi.fn(),
    put: vi.fn()
  }
}));

describe('SyncQueue Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should correctly format the user-isolated queue storage keys', () => {
    const key = syncQueue._getQueueKey('user123');
    expect(key).toBe('pending_mutations_user123');
  });

  it('should get an empty array if no queue cache is present', async () => {
    localDB.get.mockResolvedValueOnce(null);
    const queue = await syncQueue.getQueue('user123');
    expect(queue).toEqual([]);
    expect(localDB.get).toHaveBeenCalledWith('executionCache', 'pending_mutations_user123');
  });

  it('should queue and enrich mutation items correctly', async () => {
    localDB.get.mockResolvedValueOnce([]);
    localDB.put.mockResolvedValueOnce();

    const mockData = { id: 'note_1', content: 'test note' };
    await syncQueue.enqueue('notes', 'user123', mockData);

    expect(localDB.put).toHaveBeenCalled();
    const putCallArgs = localDB.put.mock.calls[0];
    expect(putCallArgs[0]).toBe('executionCache');
    expect(putCallArgs[1]).toBe('pending_mutations_user123');
    
    const enrichedList = putCallArgs[2];
    expect(enrichedList.length).toBe(1);
    expect(enrichedList[0].type).toBe('notes');
    expect(enrichedList[0].uid).toBe('user123');
    expect(enrichedList[0].data).toEqual(mockData);
    expect(enrichedList[0].status).toBe('pending');
    expect(enrichedList[0].retryCount).toBe(0);
    expect(typeof enrichedList[0].id).toBe('string');
  });
});
