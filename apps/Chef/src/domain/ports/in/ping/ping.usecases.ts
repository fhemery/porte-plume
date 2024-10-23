import { Interaction, InteractionResponse } from '../../../model/interaction';

export class PingUsecases {
  ping(interaction: Interaction): Promise<InteractionResponse> {
    const prefix = interaction.guildId ? `<@${interaction.user.id}> ` : '';

    return Promise.resolve({ message: `${prefix}Pong!` });
  }
}
