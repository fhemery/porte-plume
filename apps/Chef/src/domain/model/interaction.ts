export interface Interaction {
  readonly commandName: string;
  readonly guildId?: string;
  readonly user: {id: string};
}

export interface InteractionResponse {
  readonly message: string;
}
