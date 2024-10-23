import { SocketInteractionAdapter } from '../../infrastructure/socket-interaction/socket-interaction-adapter';
import { InteractionBuilder } from './interaction-builder';
import { InMemoryCountStorageService } from '../../infrastructure/count-storage/in-memory-count-storage.service';
import { getTag } from './test-utils';
import { $t } from '../../domain';

describe('Compte interaction', () => {
  let socketInteractionAdapter: SocketInteractionAdapter;

  beforeEach(() => {
    socketInteractionAdapter = new SocketInteractionAdapter(
      new InMemoryCountStorageService()
    );
  });

  describe('[ajoute] when user wants to add words', () => {
    it('should initialize a count if user did not have any', async () => {
      // Arrange
      const interaction = InteractionBuilder.Default('compte', 'ajoute')
        .withNumberOption('nombre-de-mots', 5)
        .build();

      // Act
      const result = await socketInteractionAdapter.process(interaction);

      // Assert
      expect(result.message).toBe(
        $t('wordCount.add.success', { nbWords: '5', initial: '0', total: '5' })
      );
    });

    it('should add to existing count if user has one', async () => {
      // Arrange
      const interaction = InteractionBuilder.Default('compte', 'ajoute')
        .withUser('bob')
        .withNumberOption('nombre-de-mots', 5)
        .build();

      // Act
      await socketInteractionAdapter.process(interaction);
      const result = await socketInteractionAdapter.process(interaction);

      // Assert
      const expectedMessage = $t('wordCount.add.success', {
        nbWords: '5',
        initial: '5',
        total: '10',
      });
      expect(result.message).toBe(expectedMessage);
    });

    it('should tag user if command is launched from a guild', async () => {
      // Arrange
      const interaction = InteractionBuilder.Default('compte', 'ajoute')
        .withGuild('1234')
        .withNumberOption('nombre-de-mots', 5)
        .build();

      // Act
      const result = await socketInteractionAdapter.process(interaction);

      // Assert
      const expectedMessage = $t('wordCount.add.success', {
        nbWords: '5',
        initial: '0',
        total: '5',
      });
      expect(result.message).toBe(`${getTag(interaction)}${expectedMessage}`);
    });

    describe('when user has defined an objective', () => {
      it('should give additional information regarding the objective', async () => {
        // Arrange
        const objective = InteractionBuilder.Default('compte', 'objectif')
          .withNumberOption('nombre-de-mots', 100)
          .build();
        const addWord = InteractionBuilder.Default('compte', 'ajoute')
          .withNumberOption('nombre-de-mots', 5)
          .build();

        // Act
        await socketInteractionAdapter.process(objective);
        const result = await socketInteractionAdapter.process(addWord);

        // Assert
        const progressMessage = $t('wordCount.view.progress', {
          nbWords: '5',
          objective: '100',
          progress: '5',
        });
        expect(result.message).toContain(progressMessage);
      });
    });
  });

  describe('[voir] when user wants to see total of words', () => {
    it('should tell user how many words they have', async () => {
      // Arrange
      const addWord = InteractionBuilder.Default('compte', 'ajoute')
        .withUser('bob')
        .withNumberOption('nombre-de-mots', 5)
        .build();
      const viewWord = InteractionBuilder.Default('compte', 'voir')
        .withUser('bob')
        .build();

      await socketInteractionAdapter.process(addWord);

      //Act
      const result = await socketInteractionAdapter.process(viewWord);

      //Assert
      const expectedMessage = $t('wordCount.view.baseMessage', {
        nbWords: '5',
      });
      expect(result.message).toBe(expectedMessage);
    });

    it('should say 0 by default', async () => {
      // Arrange
      const interaction = InteractionBuilder.Default('compte', 'voir')
        .withUser('bob')
        .build();

      // Act
      const result = await socketInteractionAdapter.process(interaction);

      // Assert
      const expectedMessage = $t('wordCount.view.baseMessage', {
        nbWords: '0',
      });
      expect(result.message).toBe(expectedMessage);
    });

    it('should tag user if message comes from guild', async () => {
      // Arrange
      const interaction = InteractionBuilder.Default('compte', 'voir')
        .withUser('bob')
        .withGuild('1234')
        .build();

      // Act
      const result = await socketInteractionAdapter.process(interaction);

      // Assert
      const expectedMessage = $t('wordCount.view.baseMessage', {
        nbWords: '0',
      });
      expect(result.message).toBe(`${getTag(interaction)}${expectedMessage}`);
    });

    describe('when user has set an objective', () => {
      it('should return count vs ratio and objective', async () => {
        const objective = InteractionBuilder.Default('compte', 'objectif')
          .withNumberOption('nombre-de-mots', 500)
          .build();
        const addWord = InteractionBuilder.Default('compte', 'ajoute')
          .withNumberOption('nombre-de-mots', 100)
          .build();

        const viewWord = InteractionBuilder.Default('compte', 'voir').build();

        await socketInteractionAdapter.process(objective);
        await socketInteractionAdapter.process(addWord);
        const result = await socketInteractionAdapter.process(viewWord);

        const expectedMessage = $t('wordCount.view.progress', {
          nbWords: '100',
          objective: '500',
          progress: '20',
        });
        expect(result.message).toContain(expectedMessage);
      });
    });

    describe('when user has set MoMo has objective', () => {
      beforeEach(async () => {
        const objective = InteractionBuilder.Default('compte', 'objectif')
          .withNumberOption('nombre-de-mots', 500)
          .withStringOption('évènement', 'MoMo')
          .build();
        await socketInteractionAdapter.process(objective);
      });

      it('should warn that challenge has not started', async () => {
        jest.useFakeTimers().setSystemTime(new Date('2024-10-10'));
        const viewWord = InteractionBuilder.Default('compte', 'voir').build();

        await socketInteractionAdapter.process(viewWord);
        const result = await socketInteractionAdapter.process(viewWord);

        const totalMessage = $t('wordCount.view.baseMessage', { nbWords: '0' });
        const progressMessage = $t('wordCount.view.progress', {
          nbWords: '0',
          objective: '500',
          progress: '0',
        });
        const eventMessage = $t('wordCount.view.objective.nano.notStarted');
        expect(result.message).toBe(
          [totalMessage, progressMessage, eventMessage].join(' ')
        );
      });

      it('should input a ratio if we are in November', async () => {
        jest.useFakeTimers().setSystemTime(new Date('2024-11-10'));

        const objective = InteractionBuilder.Default('compte', 'objectif')
          .withNumberOption('nombre-de-mots', 500)
          .withStringOption('évènement', 'MoMo')
          .build();
        const viewWord = InteractionBuilder.Default('compte', 'voir').build();

        await socketInteractionAdapter.process(objective);
        const result = await socketInteractionAdapter.process(viewWord);

        const ratioMessage = $t('wordCount.view.objective.nano.started', {
          ratio: '33',
        });

        expect(result.message).toContain(ratioMessage);
      });

      it.each([
        {
          ratio: -11,
          message: $t('wordCount.view.objective.nano.progress.veryLate'),
        },
        {
          ratio: -5,
          message: $t('wordCount.view.objective.nano.progress.slightlyLate'),
        },
        {
          ratio: 5,
          message: $t('wordCount.view.objective.nano.progress.onTime'),
        },
        {
          ratio: 11,
          message: $t('wordCount.view.objective.nano.progress.wayAhead'),
        },
      ])(
        'should put correct encouragement message ($ratio%)',
        async ({ ratio, message }) => {
          const targetWordCount = 50000;
          jest.useFakeTimers().setSystemTime(new Date('2024-11-10'));

          const objective = InteractionBuilder.Default('compte', 'objectif')
            .withNumberOption('nombre-de-mots', targetWordCount)
            .withStringOption('évènement', 'MoMo')
            .build();
          const addWord = InteractionBuilder.Default('compte', 'ajoute')
            .withNumberOption(
              'nombre-de-mots',
              Math.round(targetWordCount * (0.33 + ratio / 100))
            )
            .build();
          const viewWord = InteractionBuilder.Default('compte', 'voir').build();

          await socketInteractionAdapter.process(objective);
          await socketInteractionAdapter.process(addWord);
          await socketInteractionAdapter.process(viewWord);
          const result = await socketInteractionAdapter.process(viewWord);

          const eventProgressMessage = $t(
            'wordCount.view.objective.nano.started',
            {
              ratio: '33',
            }
          );
          expect(result.message).toContain(
            [eventProgressMessage, message].join(' ')
          );
        }
      );
    });
  });

  describe('[déclare] Setting the word count', () => {
    it('should tell user that count has been set', async () => {
      // Arrange
      const interaction = InteractionBuilder.Default('compte', 'déclare')
        .withNumberOption('nombre-de-mots', 5)
        .build();

      // Act
      const result = await socketInteractionAdapter.process(interaction);

      // Assert
      const baseMessage = $t('wordCount.view.baseMessage', { nbWords: '5' });
      expect(result.message).toContain(baseMessage);
    });

    it('should set the count to the number given', async () => {
      // Arrange
      const interaction = InteractionBuilder.Default('compte', 'déclare')
        .withNumberOption('nombre-de-mots', 5)
        .build();

      // Act
      await socketInteractionAdapter.process(interaction);
      const result = await socketInteractionAdapter.process(
        InteractionBuilder.Default('compte', 'voir').build()
      );

      // Assert
      expect(result.message).toContain(': 5');
    });

    it('should tag user if message comes from guild', async () => {
      // Arrange
      const interaction = InteractionBuilder.Default('compte', 'déclare')
        .withUser('bob')
        .withGuild('1234')
        .withNumberOption('nombre-de-mots', 5)
        .build();

      // Act
      const result = await socketInteractionAdapter.process(interaction);

      // Assert
      expect(result.message).toContain(`${getTag(interaction)}`);
    });

    it('should add the number of added words compared to previous declaration if number is positive', async () => {
      // Arrange
      const interaction = InteractionBuilder.Default('compte', 'déclare')
        .withNumberOption('nombre-de-mots', 5)
        .build();
      const addWord = InteractionBuilder.Default('compte', 'déclare')
        .withNumberOption('nombre-de-mots', 10)
        .build();

      // Act
      await socketInteractionAdapter.process(interaction);
      const result = await socketInteractionAdapter.process(addWord);

      // Assert
      const baseMessage = $t('wordCount.view.baseMessage', { nbWords: '10' });
      const progressMessage = $t('wordCount.set.increase.message', {
        nbWords: '5',
      });
      expect(result.message).toContain(
        [baseMessage, progressMessage].join(' ')
      );
    });

    it('should set a special message if user declares 0 words', async () => {
      const declaration = InteractionBuilder.Default('compte', 'déclare')
        .withNumberOption('nombre-de-mots', 0)
        .build();
      const result = await socketInteractionAdapter.process(declaration);

      const expectedMessage = $t('wordCount.set.reset.message');
      expect(result.message).toBe(expectedMessage);
    });

    it('should add objective data if an objective is defined', async () => {
      // Arrange
      jest.useFakeTimers().setSystemTime(new Date('2024-10-10'));
      const objective = InteractionBuilder.Default('compte', 'objectif')
        .withNumberOption('nombre-de-mots', 100)
        .withStringOption('évènement', 'MoMo')
        .build();
      const declaration = InteractionBuilder.Default('compte', 'déclare')
        .withNumberOption('nombre-de-mots', 5)
        .build();

      // Act
      await socketInteractionAdapter.process(objective);
      const result = await socketInteractionAdapter.process(declaration);

      // Assert
      const baseMessage = $t('wordCount.view.baseMessage', { nbWords: '5' });
      const increaseMessage = $t('wordCount.set.increase.message', {
        nbWords: '5',
      });
      const progressMessage = $t('wordCount.view.progress', {
        nbWords: '5',
        objective: '100',
        progress: '5',
      });
      const eventMessage = $t('wordCount.view.objective.nano.notStarted');
      expect(result.message).toBe(
        [baseMessage, increaseMessage, progressMessage, eventMessage].join(' ')
      );
    });
  });

  describe('[objectif] when user wants to set an objective', () => {
    it('should confirm that objective has been sent', async () => {
      const interaction = InteractionBuilder.Default('compte', 'objectif')
        .withNumberOption('nombre-de-mots', 100)
        .build();

      const result = await socketInteractionAdapter.process(interaction);

      const expectedMessage = $t('wordCount.objective.set.message', {
        nbWords: '100',
      });
      expect(result.message).toBe(expectedMessage);
    });

    it('should send back a specific message is count is 0', async () => {
      // Arrange
      const interaction = InteractionBuilder.Default('compte', 'objectif')
        .withNumberOption('nombre-de-mots', 0)
        .build();

      // Act
      const result = await socketInteractionAdapter.process(interaction);

      // Assert
      const expectedMessage = $t('wordCount.objective.reset.message');
      expect(result.message).toBe(expectedMessage);
    });
  });
});
