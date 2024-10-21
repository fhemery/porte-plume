import { Interaction } from '../../domain/model/interaction';

export class InteractionBuilder {
  private _command: string;
  private _userId = 'alice';
  private _guildId: string | undefined = undefined;

  private constructor(command: string) {
    this._command = command;
  }

  static Default(command: string): InteractionBuilder {
    return new InteractionBuilder(command);
  }

  withCommand(command: string): InteractionBuilder {
    this._command = command;
    return this;
  }

  withUser(userId: string): InteractionBuilder {
    this._userId = userId;
    return this;
  }

  withGuild(guildId: string): InteractionBuilder {
    this._guildId = guildId;
    return this;
  }

  build(): Interaction {
    return {
      commandName: this._command,
      user: { id: this._userId },
      guildId: this._guildId,
    };
  }
}
