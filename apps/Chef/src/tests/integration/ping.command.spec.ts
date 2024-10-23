import { SocketInteractionAdapter } from '../../infrastructure/socket-interaction/socket-interaction-adapter';
import { InteractionBuilder } from './interaction-builder';
import { getTag } from './test-utils';
import { $t } from '../../domain';
import { frTranslations } from '../../domain/model/translations/fr';

describe('Ping interaction', () => {
  let socketInteractionAdapter: SocketInteractionAdapter;
  const ping = $t('ping.command.name');

  beforeEach(() => {
    socketInteractionAdapter = new SocketInteractionAdapter();
  });

  it('should reply with pong when interaction is directed to user', async () => {
    const interaction = InteractionBuilder.Default(ping).build();
    jest.spyOn(Math, 'random').mockReturnValue(0);

    const result = await socketInteractionAdapter.process(interaction);

    expect(result.message).toBe(frTranslations.ping.response[0]);
  });

  it('should reply with highlight when message is coming from a guild', async () => {
    const interaction = InteractionBuilder.Default(ping)
      .withUser('bob')
      .withGuild('1234')
      .build();
    const result = await socketInteractionAdapter.process(interaction);

    expect(result.message).toContain(getTag(interaction));
  });
});
