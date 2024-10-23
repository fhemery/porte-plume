import { CountStoragePort } from '../../domain/ports/out/count-storage.port';
import { WordCount } from '../../domain/model/count';
import { Config, JsonDB } from 'node-json-db';

export class FiledbCountStorageService implements CountStoragePort {
  private static prefix = '/User_';
  private db: JsonDB;

  constructor(pathName = './count-db.json') {
    this.db = new JsonDB(new Config(pathName, true, true, '/'));
  }

  async getCount(userId: string): Promise<WordCount> {
    try {
      const currentValue = await this.db.getData(
        FiledbCountStorageService.prefix + userId
      );
      return new WordCount(
        currentValue.count,
        currentValue.objective,
        currentValue.eventName
      );
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e: unknown) {
      return new WordCount();
    }
  }

  async saveCount(userId: string, count: WordCount): Promise<void> {
    await this.db.push(FiledbCountStorageService.prefix + userId, { ...count });
  }
}
