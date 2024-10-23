import {
  Client,
  GatewayIntentBits,
  REST,
  Routes,
  SlashCommandBuilder,
} from 'discord.js';

import { config } from 'dotenv';
import { SocketInteractionAdapter } from './infrastructure/socket-interaction/socket-interaction-adapter';
import { FiledbCountStorageService } from './infrastructure/count-storage/filedb-count-storage.service';
import { $t } from './domain';

config(); // Load environment variables

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.APP_ID;

const pingCommand = new SlashCommandBuilder()
  .setName($t('ping.command.name'))
  .setDescription($t('ping.command.description'));
const wordCountCommand = new SlashCommandBuilder()
  .setName($t('wordCount.command.name'))
  .setDescription($t('wordCount.command.description'))
  .addSubcommand((subcommand) =>
    subcommand
      .setName($t('wordCount.command.subCommands.add.name'))
      .setDescription($t('wordCount.command.subCommands.add.description'))
      .addNumberOption((option) =>
        option
          .setName(
            $t('wordCount.command.subCommands.add.options.wordCount.name')
          )
          .setDescription(
            $t(
              'wordCount.command.subCommands.add.options.wordCount.description'
            )
          )
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName($t('wordCount.command.subCommands.objective.name'))
      .setDescription($t('wordCount.command.subCommands.objective.description'))
      .addNumberOption((option) =>
        option
          .setName(
            $t('wordCount.command.subCommands.objective.options.wordCount.name')
          )
          .setDescription(
            $t(
              'wordCount.command.subCommands.objective.options.wordCount.description'
            )
          )
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName(
            $t('wordCount.command.subCommands.objective.options.event.name')
          )
          .setDescription(
            $t(
              'wordCount.command.subCommands.objective.options.event.description'
            )
          )
          .setRequired(false)
          .addChoices([{ name: 'MoMo', value: 'MoMo' }])
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName($t('wordCount.command.subCommands.declare.name'))
      .setDescription($t('wordCount.command.subCommands.declare.description'))
      .addNumberOption((option) =>
        option
          .setName(
            $t('wordCount.command.subCommands.declare.options.wordCount.name')
          )
          .setDescription(
            $t(
              'wordCount.command.subCommands.declare.options.wordCount.description'
            )
          )
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName($t('wordCount.command.subCommands.view.name'))
      .setDescription($t('wordCount.command.subCommands.view.description'))
  );

const rest = new REST({ version: '10' }).setToken(token!);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(clientId!), {
      body: [pingCommand.toJSON(), wordCountCommand.toJSON()],
    });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

// Handle the command
const socketInteractionAdapter = new SocketInteractionAdapter(
  new FiledbCountStorageService()
);
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { message } = await socketInteractionAdapter.process(interaction);
  await interaction.reply(message);
});

client.login(token);
