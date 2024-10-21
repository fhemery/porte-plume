import { Interaction, InteractionResponse } from '../../domain/model/interaction';
import { PingUsecases } from '../../domain/ping/ping.usecases';

export class SocketInteractionAdapter {
    private readonly pingUsecases = new PingUsecases();

  async process(interaction: Interaction): Promise<InteractionResponse> {
      return await this.pingUsecases.ping(interaction);
    }
}
