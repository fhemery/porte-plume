import {
  Interaction,
  InteractionResponse,
} from '../../domain/model/interaction';
import { PingUsecases } from '../../domain/ports/in/ping/ping.usecases';
import { CountUsecases } from '../../domain/ports/in/count/count.usecases';
import { CountStoragePort } from '../../domain/ports/out/count-storage.port';
import { InMemoryCountStorageService } from '../count-storage/in-memory-count-storage.service';

export class SocketInteractionAdapter {
  constructor(
    private readonly _countStorageService: CountStoragePort = new InMemoryCountStorageService()
  ) {}

  private readonly pingUsecases = new PingUsecases();
  private readonly countUsecases = new CountUsecases(this._countStorageService);

  async process(interaction: Interaction): Promise<InteractionResponse> {
    switch (interaction.commandName) {
      case 'ping':
        return await this.pingUsecases.ping(interaction);
      case 'compte':
        return await this.countUsecases.process(interaction);
      default:
        return { message: 'Commande inconnue!' };
    }
  }
}
