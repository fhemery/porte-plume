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

config(); // Load environment variables

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.APP_ID;

const pingCommand = new SlashCommandBuilder()
  .setName('ping')
  .setDescription('Replies with Pong!');
const wordCountCommand = new SlashCommandBuilder()
  .setName('compte')
  .setDescription('Gère le décompte des mots')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('ajoute')
      .setDescription('Ajoute un compte de mots au décompte')
      .addNumberOption((option) =>
        option
          .setName('nombre-de-mots')
          .setDescription('Le nombre de mots à ajouter')
          .setRequired(true)
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('objectif')
      .setDescription("Fixe l'objectif de mots à atteindre")
      .addNumberOption((option) =>
        option
          .setName('nombre-de-mots')
          .setDescription('Le nombre de mots cible. 0 pour annuler')
          .setRequired(true)
      )
      .addStringOption((option) =>
        option
          .setName('évènement')
          .setDescription(
            "le nom de l'événement associé. Valeur possible : MoMo"
          )
          .setRequired(false)
          .addChoices([{ name: 'MoMo', value: 'MoMo' }])
      )
  )
  .addSubcommand((subcommand) =>
    subcommand.setName('reset').setDescription('Réinitialise le décompte')
  )
  .addSubcommand((subcommand) =>
    subcommand.setName('voir').setDescription('Voir le décompte')
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
