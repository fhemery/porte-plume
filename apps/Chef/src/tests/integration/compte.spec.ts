import { SocketInteractionAdapter } from '../../infrastructure/socket-interaction/socket-interaction-adapter';
import { InteractionBuilder } from './interaction-builder';
import { InMemoryCountStorageService } from '../../infrastructure/count-storage/in-memory-count-storage.service';
import { getTag } from './test-utils';

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
        .withUser('bob')
        .withNumberOption('nombre-de-mots', 5)
        .build();

      // Act
      const result = await socketInteractionAdapter.process(interaction);

      // Assert
      expect(result.message).toBe('Ajout de 5 mots au décompte, 0 -> 5');
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
      expect(result.message).toBe('Ajout de 5 mots au décompte, 5 -> 10');
    });

    it('should tag user if command is launched from a guild', async () => {
      // Arrange
      const interaction = InteractionBuilder.Default('compte', 'ajoute')
        .withUser('bob')
        .withGuild('1234')
        .withNumberOption('nombre-de-mots', 5)
        .build();

      // Act
      const result = await socketInteractionAdapter.process(interaction);

      // Assert
      expect(result.message).toBe(
        `${getTag(interaction)}Ajout de 5 mots au décompte, 0 -> 5`
      );
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
        expect(result.message).toContain(
          'Ajout de 5 mots au décompte, 0 -> 5 / 100 (5%)'
        );
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
      expect(result.message).toBe('Total de mots : 5');
    });

    it('should say 0 by default', async () => {
      // Arrange
      const interaction = InteractionBuilder.Default('compte', 'voir')
        .withUser('bob')
        .build();

      // Act
      const result = await socketInteractionAdapter.process(interaction);

      // Assert
      expect(result.message).toBe('Total de mots : 0');
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
      expect(result.message).toBe(`${getTag(interaction)}Total de mots : 0`);
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

        expect(result.message).toContain('Total de mots : 100 / 500 (20%)');
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

      it('should not output anything if we are not in November', async () => {
        const viewWord = InteractionBuilder.Default('compte', 'voir').build();

        await socketInteractionAdapter.process(viewWord);
        const result = await socketInteractionAdapter.process(viewWord);

        expect(result.message).toBe('Total de mots : 0 / 500 (0%)');
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

        expect(result.message).toContain(
          'Total de mots : 0 / 500 (0%). Progression évènement : 33%'
        );
      });

      it.each([
        {
          ratio: -11,
          message: ". Allez, on ne lâche rien, ce n'est pas fini !",
        },
        {
          ratio: -5,
          message: ". Un peu de retard, mais rien d'inquiétant !",
        },
        { ratio: 5, message: '. Tu es au top !' },
        {
          ratio: 11,
          message: '. Piece of Cake, comme ils disent au Nord de la Manche !',
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

          expect(result.message).toContain(message);
        }
      );
    });
  });

  describe('[reset] when user wants to reset word count', () => {
    it('should tell count has been reset', async () => {
      // Arrange
      const interaction = InteractionBuilder.Default('compte', 'reset')
        .withUser('bob')
        .build();

      // Act
      const result = await socketInteractionAdapter.process(interaction);

      // Assert
      expect(result.message).toBe('Réinitialisation du décompte');
    });

    it('should reset the count to 0', async () => {
      // Arrange
      const addWord = InteractionBuilder.Default('compte', 'ajoute')
        .withNumberOption('nombre-de-mots', 5)
        .build();
      const resetWord = InteractionBuilder.Default('compte', 'reset').build();
      const viewWord = InteractionBuilder.Default('compte', 'voir').build();

      // Act
      await socketInteractionAdapter.process(addWord);
      await socketInteractionAdapter.process(resetWord);

      const result = await socketInteractionAdapter.process(viewWord);
      // Assert
      expect(result.message).toContain(': 0');
    });

    it('should tag user if message comes from guild', async () => {
      // Arrange
      const interaction = InteractionBuilder.Default('compte', 'reset')
        .withUser('bob')
        .withGuild('1234')
        .build();

      // Act
      const result = await socketInteractionAdapter.process(interaction);

      // Assert
      expect(result.message).toBe(
        `${getTag(interaction)}Réinitialisation du décompte`
      );
    });
  });

  describe('[objectif] when user wants to set an objective', () => {
    it('should confirm that objective has been sent', async () => {
      const interaction = InteractionBuilder.Default('compte', 'objectif')
        .withNumberOption('nombre-de-mots', 100)
        .build();

      const result = await socketInteractionAdapter.process(interaction);

      expect(result.message).toBe(
        'Objectif fixé à : **100 mots**. Au travail, go go go !'
      );
    });

    it('should send back a specific message is count is 0', async () => {
      // Arrange
      const interaction = InteractionBuilder.Default('compte', 'objectif')
        .withNumberOption('nombre-de-mots', 0)
        .build();

      // Act
      const result = await socketInteractionAdapter.process(interaction);

      // Assert
      expect(result.message).toBe(
        "Objectif désactivé. Travailler sans pression, c'est bien aussi !"
      );
    });
  });
});
