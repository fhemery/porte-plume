import { Interaction, InteractionResponse } from '../../../model/interaction';
import { CountStoragePort } from '../../out/count-storage.port';

export class CountUsecases {
  constructor(private readonly _countStorage: CountStoragePort) {}

  process(interaction: Interaction): Promise<InteractionResponse> {
    switch (interaction.options.getSubcommand()) {
      case 'ajoute':
        return this.add(interaction);
      case 'voir':
        return this.view(interaction);
      case 'reset':
        return this.reset(interaction);
      default:
        return Promise.resolve({ message: '[Compte] Sous-commande inconnue!' });
    }
  }

  private async add(interaction: Interaction): Promise<InteractionResponse> {
    const nbWords = interaction.options.getNumber('nombre-de-mots') || 0;
    const userId = interaction.user.id;
    const existingCount = await this._countStorage.getCount(userId);
    const newCount = existingCount.addWords(nbWords);

    await this._countStorage.saveCount(userId, newCount);

    const prefix = interaction.guildId ? `@${userId} ` : '';

    return Promise.resolve({
      message: `${prefix}Ajout de ${nbWords} mots au décompte, ${existingCount.count} -> ${newCount.count}`,
    });
  }

  private async reset(interaction: Interaction) {
    const userId = interaction.user.id;
    const existingCount = await this._countStorage.getCount(userId);
    const newCount = existingCount.reset();

    await this._countStorage.saveCount(userId, newCount);

    const prefix = interaction.guildId ? `@${userId} ` : '';

    return Promise.resolve({
      message: `${prefix}Réinitialisation du décompte`,
    });
  }

  private async view(interaction: Interaction): Promise<InteractionResponse> {
    const userId = interaction.user.id;
    const existingCount = await this._countStorage.getCount(userId);

    const prefix = interaction.guildId ? `@${userId} ` : '';

    return Promise.resolve({
      message: `${prefix}Total de mots : ${existingCount.count}`,
    });
  }
}
