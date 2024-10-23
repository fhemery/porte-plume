import { Interaction, InteractionResponse } from '../../../model/interaction';
import { CountStoragePort } from '../../out/count-storage.port';
import { WordCount } from '../../../model/count';
import { utils } from '../../../model/utils';

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
      case 'objectif':
        return this.setObjective(interaction);
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

    const prefix = interaction.guildId ? utils.getTag(userId) : '';
    const suffix = this.computeReportSuffix(newCount);

    return Promise.resolve({
      message: `${prefix}Ajout de ${nbWords} mots au décompte, ${existingCount.count} -> ${newCount.count}${suffix}`,
    });
  }

  private async reset(interaction: Interaction) {
    const userId = interaction.user.id;
    const existingCount = await this._countStorage.getCount(userId);
    const newCount = existingCount.reset();

    await this._countStorage.saveCount(userId, newCount);

    const prefix = interaction.guildId ? utils.getTag(userId) : '';

    return Promise.resolve({
      message: `${prefix}Réinitialisation du décompte`,
    });
  }

  private async view(interaction: Interaction): Promise<InteractionResponse> {
    const userId = interaction.user.id;
    const existingCount = await this._countStorage.getCount(userId);

    const prefix = interaction.guildId ? utils.getTag(userId) : '';
    const suffix = this.computeReportSuffix(existingCount);

    return Promise.resolve({
      message: `${prefix}Total de mots : ${existingCount.count}${suffix}`,
    });
  }

  private async setObjective(
    interaction: Interaction
  ): Promise<InteractionResponse> {
    const nbWords = interaction.options.getNumber('nombre-de-mots') || 0;
    const eventName = interaction.options.getString('évènement') || undefined;
    const userId = interaction.user.id;
    const existingCount = await this._countStorage.getCount(userId);
    const newCount = existingCount.setObjective(nbWords, eventName);
    await this._countStorage.saveCount(userId, newCount);

    if (nbWords === 0) {
      return Promise.resolve({
        message: `Objectif désactivé. Travailler sans pression, c'est bien aussi !`,
      });
    }

    return Promise.resolve({
      message: `Objectif fixé à : **${nbWords} mots**. Au travail, go go go !`,
    });
  }

  private computeReportSuffix(existingCount: WordCount): string {
    if (!existingCount.objective) {
      return '';
    }
    const ratio = Math.round(
      (existingCount.count / existingCount.objective) * 100
    );
    const ratioStr = ` / ${existingCount.objective} (${ratio}%)`;

    const eventSuffix = this.getMoMoDedicatedSuffix(existingCount, ratio);

    return `${ratioStr}${eventSuffix}`;
  }

  private getMoMoDedicatedSuffix(existingCount: WordCount, ratio: number) {
    if (existingCount.eventName !== 'MoMo') {
      return '';
    }

    const today = new Date();
    if (today.getMonth() !== 10) {
      return '. Dès que le MoMo commence, je te dirai où tu en es !';
    }

    const dayNumber = today.getDate();
    const expectedRatio = Math.round((dayNumber / 30) * 100);

    let eventSuffix = `. Progression évènement : ${expectedRatio}%`;

    if (expectedRatio > ratio + 10) {
      eventSuffix += ". Allez, on ne lâche rien, ce n'est pas fini !";
    } else if (expectedRatio >= ratio) {
      eventSuffix += ". Un peu de retard, mais rien d'inquiétant !";
    } else if (expectedRatio >= ratio - 10) {
      eventSuffix += '. Tu es au top !';
    } else {
      eventSuffix += '. Piece of Cake, comme ils disent au Nord de la Manche !';
    }
    return eventSuffix;
  }
}
