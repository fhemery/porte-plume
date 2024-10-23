import {
  Interaction,
  InteractionResponse,
} from '../../domain/model/interaction';
import { PingCommand } from '../../domain/ports/in/ping/ping.command';
import { CountCommand } from '../../domain/ports/in/count/count.command';
import { CountStoragePort } from '../../domain/ports/out/count-storage.port';
import { InMemoryCountStorageService } from '../count-storage/in-memory-count-storage.service';
import { $t } from '../../domain';

export class SocketInteractionAdapter {
  constructor(
    private readonly _countStorageService: CountStoragePort = new InMemoryCountStorageService()
  ) {}

  private readonly pingCommand = new PingCommand();
  private readonly countCommand = new CountCommand(this._countStorageService);

  async process(interaction: Interaction): Promise<InteractionResponse> {
    switch (interaction.commandName) {
      case 'ping':
        return await this.pingCommand.ping(interaction);
      case 'compte':
        return await this.countCommand.process(interaction);
      default:
        return { message: $t('unknownCommand') };
    }
  }
}
