import { Interaction, InteractionResponse } from '../../../model/interaction';
import { CountStoragePort } from '../../out/count-storage.port';
import { WordCount } from '../../../model/count';
import { utils } from '../../../model/utils';
import { $t } from '../../../model';

export class CountCommand {
  constructor(private readonly _countStorage: CountStoragePort) {}

  process(interaction: Interaction): Promise<InteractionResponse> {
    switch (interaction.options.getSubcommand()) {
      case $t('wordCount.command.subCommands.add.name'):
        return this.add(interaction);
      case $t('wordCount.command.subCommands.view.name'):
        return this.view(interaction);
      case $t('wordCount.command.subCommands.objective.name'):
        return this.setObjective(interaction);
      case $t('wordCount.command.subCommands.declare.name'):
        return this.setWordCount(interaction);
      default:
        return Promise.resolve({ message: $t('wordCount.unknownSubCommand') });
    }
  }

  private async add(interaction: Interaction): Promise<InteractionResponse> {
    const nbWords = interaction.options.getNumber('nombre-de-mots') || 0;
    const userId = interaction.user.id;
    const existingCount = await this._countStorage.getCount(userId);
    const newCount = existingCount.addWords(nbWords);

    await this._countStorage.saveCount(userId, newCount);

    const prefix = this.computePrefix(interaction);
    const suffix = this.computeReportSuffix(newCount);

    const message = $t('wordCount.add.success', {
      nbWords: nbWords,
      initial: existingCount.count,
      total: newCount.count,
    });
    return Promise.resolve({
      message: [...prefix, message, ...suffix].join(' '),
    });
  }

  private async view(interaction: Interaction): Promise<InteractionResponse> {
    const userId = interaction.user.id;
    const existingCount = await this._countStorage.getCount(userId);

    const prefix = this.computePrefix(interaction);
    const suffix = this.computeReportSuffix(existingCount);

    const message = $t('wordCount.view.baseMessage', {
      nbWords: existingCount.count,
    });
    return Promise.resolve({
      message: [...prefix, message, ...suffix].join(' '),
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

    const prefix = this.computePrefix(interaction);

    if (nbWords === 0) {
      return Promise.resolve({
        message: [...prefix, $t('wordCount.objective.reset.message')].join(' '),
      });
    }

    return Promise.resolve({
      message: [
        ...prefix,
        $t('wordCount.objective.set.message', {
          nbWords: nbWords,
        }),
      ].join(' '),
    });
  }

  private computePrefix(interaction: Interaction) {
    return interaction.guildId ? [utils.getTag(interaction.user.id)] : [];
  }

  private computeReportSuffix(existingCount: WordCount): string[] {
    if (!existingCount.objective) {
      return [];
    }
    const ratio = Math.round(
      (existingCount.count / existingCount.objective) * 100
    );
    const progressStr = $t('wordCount.view.progress', {
      nbWords: existingCount.count,
      objective: existingCount.objective,
      progress: ratio,
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
        ratio: expectedRatio,
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

    const prefix = this.computePrefix(interaction);

    if (nbWords === 0) {
      return {
        message: [...prefix, $t('wordCount.set.reset.message')].join(' '),
      };
    }

    const body = [$t('wordCount.view.baseMessage', { nbWords: nbWords })];
    if (nbWords > existingCount.count) {
      body.push(
        $t('wordCount.set.increase.message', {
          nbWords: nbWords - existingCount.count,
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
