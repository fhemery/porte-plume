import { Interaction, InteractionResponse } from '../../../model/interaction';
import { utils } from '../../../model/utils';
import { $t } from '../../../model';

export class PingUsecases {
  ping(interaction: Interaction): Promise<InteractionResponse> {
    const prefix = interaction.guildId ? utils.getTag(interaction.user.id) : '';

    return Promise.resolve({
      message: `${prefix}${$t('ping.response')}`,
    });
  }
}
