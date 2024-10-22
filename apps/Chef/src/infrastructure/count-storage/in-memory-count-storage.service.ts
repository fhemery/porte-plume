import { CountStoragePort } from '../../domain/ports/out/count-storage.port';
import { WordCount } from '../../domain/model/count';

export class InMemoryCountStorageService implements CountStoragePort {
  private _counts: Map<string, WordCount> = new Map();

  async getCount(userId: string): Promise<WordCount> {
    return this._counts.get(userId) ?? new WordCount(0);
  }

  async saveCount(userId: string, count: WordCount): Promise<void> {
    this._counts.set(userId, count);
  }
}
