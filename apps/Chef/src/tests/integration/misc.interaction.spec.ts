import { SocketInteractionAdapter } from '../../infrastructure/socket-interaction/socket-interaction-adapter';
import { InteractionBuilder } from './interaction-builder';
import { $t } from '../../domain';

describe('Miscellaneous regarding interactions', () => {
  let socketInteractionAdapter: SocketInteractionAdapter;

  beforeEach(() => {
    socketInteractionAdapter = new SocketInteractionAdapter();
  });

  it('should reply with unknown message if command does not exist', async () => {
    const interaction = InteractionBuilder.Default('unknown').build();

    const result = await socketInteractionAdapter.process(interaction);

    expect(result.message).toBe($t('unknownCommand'));
  });
});
