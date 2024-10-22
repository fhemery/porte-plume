export interface Interaction {
  readonly commandName: string;
  readonly options: InteractionOptions;
  readonly guildId?: string;
  readonly user: { id: string };
}

export interface InteractionOptions {
  getSubcommand(): string | undefined;
  getNumber(fieldName: string): number | undefined;
}

export interface InteractionResponse {
  readonly message: string;
}
