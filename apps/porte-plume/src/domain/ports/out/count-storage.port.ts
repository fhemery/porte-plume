import { WordCount } from '../../model/count';

export interface CountStoragePort {
  getCount(userId: string): Promise<WordCount>;
  saveCount(userId: string, count: WordCount): Promise<void>;
}
