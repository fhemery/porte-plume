import { Interaction, InteractionResponse } from '../../../model/interaction';
import { CountStoragePort } from '../../out/count-storage.port';
import { WordCount } from '../../../model/count';
import { utils } from '../../../model/utils';
import { $t } from '../../../model';

export class CountUsecases {
  constructor(private readonly _countStorage: CountStoragePort) {}

  process(interaction: Interaction): Promise<InteractionResponse> {
    switch (interaction.options.getSubcommand()) {
      case 'ajoute':
        return this.add(interaction);
      case 'voir':
        return this.view(interaction);
      case 'objectif':
        return this.setObjective(interaction);
      case 'déclare':
        return this.setWordCount(interaction);
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
      message: `${prefix}${$t('wordCount.add.success', {
        nbWords: nbWords.toString(10),
        initial: existingCount.count.toString(10),
        total: newCount.count.toString(10),
      })}${suffix}`,
    });
  }

  private async view(interaction: Interaction): Promise<InteractionResponse> {
    const userId = interaction.user.id;
    const existingCount = await this._countStorage.getCount(userId);

    const prefix = interaction.guildId ? utils.getTag(userId) : '';
    const suffix = this.computeReportSuffix(existingCount);

    const message = $t('wordCount.view.baseMessage', {
      nbWords: existingCount.count.toString(10),
    });
    const fullMessage = [`${prefix}${message}`, ...suffix].join(' ');
    return Promise.resolve({
      message: fullMessage,
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
        message: $t('wordCount.objective.reset.message'),
      });
    }

    return Promise.resolve({
      message: $t('wordCount.objective.set.message', {
        nbWords: nbWords.toString(10),
      }),
    });
  }

  private computeReportSuffix(existingCount: WordCount): string[] {
    if (!existingCount.objective) {
      return [];
    }
    const ratio = Math.round(
      (existingCount.count / existingCount.objective) * 100
    );
    const progressStr = $t('wordCount.view.progress', {
      nbWords: existingCount.count.toString(10),
      objective: existingCount.objective.toString(10),
      progress: ratio.toString(10),
    });

    const eventSuffix = this.getMoMoDedicatedSuffix(existingCount, ratio);

    return [progressStr, ...eventSuffix];
  }

  private getMoMoDedicatedSuffix(
    existingCount: WordCount,
    ratio: number
  ): string[] {
    if (existingCount.eventName !== 'MoMo') {
      return [];
    }

    const today = new Date();
    if (today.getMonth() !== 10) {
      return [$t('wordCount.view.objective.nano.notStarted')];
    }

    const dayNumber = today.getDate();
    const expectedRatio = Math.round((dayNumber / 30) * 100);

    const eventSuffix = [
      $t('wordCount.view.objective.nano.started', {
        ratio: expectedRatio.toString(10),
      }),
    ];

    if (expectedRatio > ratio + 10) {
      eventSuffix.push($t('wordCount.view.objective.nano.progress.veryLate'));
    } else if (expectedRatio >= ratio) {
      eventSuffix.push(
        $t('wordCount.view.objective.nano.progress.slightlyLate')
      );
    } else if (expectedRatio >= ratio - 10) {
      eventSuffix.push($t('wordCount.view.objective.nano.progress.onTime'));
    } else {
      eventSuffix.push($t('wordCount.view.objective.nano.progress.wayAhead'));
    }
    return eventSuffix;
  }

  private async setWordCount(
    interaction: Interaction
  ): Promise<InteractionResponse> {
    const nbWords = interaction.options.getNumber('nombre-de-mots') || 0;
    const userId = interaction.user.id;
    const existingCount = await this._countStorage.getCount(userId);
    const newCount = existingCount.setWordCount(nbWords);
    await this._countStorage.saveCount(userId, newCount);

    const prefix = interaction.guildId ? [utils.getTag(userId)] : [];

    if (nbWords === 0) {
      return {
        message: [...prefix, $t('wordCount.set.reset.message')].join(' '),
      };
    }

    const body = [
      $t('wordCount.view.baseMessage', { nbWords: nbWords.toString(10) }),
    ];
    if (nbWords > existingCount.count) {
      body.push(
        $t('wordCount.set.increase.message', {
          nbWords: (nbWords - existingCount.count).toString(10),
        })
      );
    }

    return {
      message: [...prefix, ...body, ...this.computeReportSuffix(newCount)].join(
        ' '
      ),
    };
  }
}
