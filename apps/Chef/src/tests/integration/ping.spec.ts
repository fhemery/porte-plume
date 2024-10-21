import { SocketInteractionAdapter } from '../../infrastructure/socket-interaction/socket-interaction-adapter';
import { InteractionBuilder } from './interaction-builder';

describe('Ping interaction', () => {
  let socketInteractionAdapter: SocketInteractionAdapter;

  beforeEach(() => {
    socketInteractionAdapter = new SocketInteractionAdapter();
  });

  it('should reply with pong when interaction is directed to user', async () => {
    const interaction = InteractionBuilder.Default('ping').build();

    const result = await socketInteractionAdapter.process(interaction);

    expect(result.message).toBe('Pong!');
  });

  it('should reply with highlight when message is coming from a guild', async () => {
    const interaction = InteractionBuilder.Default('ping')
      .withUser('bob')
      .withGuild('1234')
      .build();
    const result = await socketInteractionAdapter.process(interaction);

    expect(result.message).toBe(`@${interaction.user.id} Pong!`);
  });
});
