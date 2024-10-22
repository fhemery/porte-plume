import {
  Interaction,
  InteractionOptions,
} from '../../domain/model/interaction';

export class InteractionOptionsFakeImpl implements InteractionOptions {
  private _subcommand: string | undefined;
  private _numberFields: Map<string, number> = new Map();
  private _stringFields: Map<string, string> = new Map();

  constructor(subcommand?: string) {
    this._subcommand = subcommand;
  }

  getNumber(fieldName: string): number | undefined {
    return this._numberFields.get(fieldName);
  }

  getString(fieldName: string): string | undefined {
    return this._stringFields.get(fieldName);
  }

  setNumberField(fieldName: string, value: number): void {
    this._numberFields.set(fieldName, value);
  }

  setSubcommand(subcommand: string): void {
    this._subcommand = subcommand;
  }

  getSubcommand(): string | undefined {
    return this._subcommand;
  }

  setStringField(fieldName: string, value: string) {
    this._stringFields.set(fieldName, value);
  }
}

export class InteractionBuilder {
  private _command: string;
  private _userId = 'alice';
  private _guildId: string | undefined = undefined;
  private _options: InteractionOptionsFakeImpl;

  private constructor(command: string, subcommand?: string) {
    this._command = command;
    this._options = new InteractionOptionsFakeImpl(subcommand);
  }

  static Default(command: string, subcommand?: string): InteractionBuilder {
    return new InteractionBuilder(command, subcommand);
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

  withNumberOption(fieldName: string, value: number): InteractionBuilder {
    this._options.setNumberField(fieldName, value);
    return this;
  }

  build(): Interaction {
    return {
      commandName: this._command,
      user: { id: this._userId },
      options: this._options,
      guildId: this._guildId,
    };
  }

  withStringOption(fieldName: string, value: string): InteractionBuilder {
    this._options.setStringField(fieldName, value);
    return this;
  }
}
