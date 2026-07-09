import { db } from '../firebase/config';
import { collection, doc, getDoc, getDocs, limit, query, orderBy } from 'firebase/firestore';
import { IConversationRepository } from '../../domain/repository/IConversationRepository';
import { AssistantConversation } from '../../domain/models/AssistantConversation';
import { localDB } from '../../shared/utils/indexedDB';
import { syncQueue } from '../../shared/utils/syncQueue';
import { container } from '../di/container';

export class FirestoreConversationRepository extends IConversationRepository {
  constructor() {
    super();
    this.logger = container.resolve('ILogger');
    this.env = container.resolve('environment');
  }

  _metadataKey(uid) { return `assistant_conv_meta_${uid}`; }

  // Helper to load/save flat thread metadata list cached locally in localStorage
  _getMetaCache(uid) {
    try {
      const cached = localStorage.getItem(this._metadataKey(uid));
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  }

  _saveMetaCache(uid, list) {
    try {
      localStorage.setItem(this._key = this._metadataKey(uid), JSON.stringify(list));
    } catch {}
  }

  async getConversation(uid, conversationId) {
    try {
      // 1. Load messages list from local IndexedDB (assistantHistory store)
      const cachedMessages = await localDB.get('assistantHistory', conversationId) || [];

      // 2. Load metadata from cache
      const list = this._getMetaCache(uid);
      const meta = list.find(c => c.id === conversationId);

      if (meta) {
        return new AssistantConversation({
          ...meta,
          messages: cachedMessages
        });
      }

      // If not in cache and online, read from Firestore
      if (this.env.isMock || !navigator.onLine) {
        if (cachedMessages.length > 0) {
          return new AssistantConversation({ id: conversationId, title: 'Local Chat', messages: cachedMessages });
        }
        return null;
      }

      const docRef = doc(db, 'users', uid, 'assistantConversations', conversationId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const snapData = snap.data();
        // Add to cache
        const updatedList = [snapData, ...list.filter(c => c.id !== conversationId)];
        this._saveMetaCache(uid, updatedList);

        return new AssistantConversation({
          ...snapData,
          messages: cachedMessages
        });
      }
      return null;
    } catch (err) {
      this.logger.error(`[FirestoreConversationRepository] getConversation error: ${err.message}`);
      return null;
    }
  }

  async saveConversation(uid, conversation) {
    try {
      const serializedMessages = conversation.messages.map(m => ({
        id: m.id,
        sender: m.sender,
        text: m.text,
        timestamp: m.timestamp.toISOString()
      }));

      // 1. Save messages list to IndexedDB
      await localDB.put('assistantHistory', conversation.id, serializedMessages);

      // 2. Save metadata to local cache
      const metadata = {
        id: conversation.id,
        title: conversation.title,
        type: conversation.type,
        pinned: conversation.pinned,
        lastActiveAt: conversation.lastActiveAt.toISOString(),
        metadata: conversation.metadata
      };

      const list = this._getMetaCache(uid);
      const idx = list.findIndex(c => c.id === conversation.id);
      if (idx >= 0) {
        list[idx] = metadata;
      } else {
        list.unshift(metadata);
      }
      this._saveMetaCache(uid, list);

      // 3. Queue metadata sync to Firestore
      await syncQueue.enqueue('assistant', uid, {
        subtype: 'conversationMetadata',
        ...metadata
      });
    } catch (err) {
      this.logger.error(`[FirestoreConversationRepository] saveConversation error: ${err.message}`);
    }
  }

  async deleteConversation(uid, conversationId) {
    try {
      // 1. Delete messages from IndexedDB
      await localDB.delete('assistantHistory', conversationId);

      // 2. Delete metadata from local cache
      const list = this._getMetaCache(uid).filter(c => c.id !== conversationId);
      this._saveMetaCache(uid, list);

      // 3. Queue deletion sync
      await syncQueue.enqueue('assistant', uid, {
        subtype: 'deleteConversation',
        id: conversationId
      });
    } catch (err) {
      this.logger.error(`[FirestoreConversationRepository] deleteConversation error: ${err.message}`);
    }
  }

  async listConversations(uid) {
    // Return cached metadata list first
    const cached = this._getMetaCache(uid);
    if (cached.length > 0) {
      return cached.map(c => new AssistantConversation(c));
    }

    if (this.env.isMock || !navigator.onLine) {
      return [];
    }

    try {
      const colRef = collection(db, 'users', uid, 'assistantConversations');
      const q = query(colRef, orderBy('lastActiveAt', 'desc'), limit(50));
      const snap = await getDocs(q);
      const list = [];
      snap.forEach((docSnap) => {
        list.push(docSnap.data());
      });
      this._saveMetaCache(uid, list);
      return list.map(c => new AssistantConversation(c));
    } catch (err) {
      this.logger.error(`[FirestoreConversationRepository] listConversations error: ${err.message}`);
      return [];
    }
  }

  async togglePin(uid, conversationId) {
    const list = this._getMetaCache(uid);
    const item = list.find(c => c.id === conversationId);
    if (item) {
      item.pinned = !item.pinned;
      this._saveMetaCache(uid, list);

      await syncQueue.enqueue('assistant', uid, {
        subtype: 'conversationMetadata',
        id: conversationId,
        pinned: item.pinned
      });
      return item.pinned;
    }
    return false;
  }

  async getConversationDraft(uid, topicId) {
    return await localDB.get('conversationDrafts', topicId) || '';
  }

  async saveConversationDraft(uid, topicId, text) {
    await localDB.put('conversationDrafts', topicId, text);
  }
}

export default FirestoreConversationRepository;
