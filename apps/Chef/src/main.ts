import { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } from 'discord.js';

import { config } from 'dotenv';
import { SocketInteractionAdapter } from './infrastructure/socket-interaction/socket-interaction-adapter';

config(); // Load environment variables

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const token = process.env.DISCORD_TOKEN;
const clientId = process.env.APP_ID;

const pingCommand = new SlashCommandBuilder().setName('ping').setDescription('Replies with Pong!');
const wordCountCommand = new SlashCommandBuilder().setName('compte')
  .setDescription('Gère le décompte des mots')
  .addSubcommand(subcommand =>
    subcommand.setName('ajoute')
      .setDescription('Ajoute un compte de mots au décompte')
      .addNumberOption(option =>
        option.setName('nombre-de-mots')
          .setDescription('Le nombre de mots à ajouter')
          .setRequired(true))
  )
  .addSubcommand(subcommand => subcommand.setName('reset').setDescription('Réinitialise le décompte'));


const rest = new REST({ version: '10' }).setToken(token!);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(clientId!),
      { body: [pingCommand.toJSON(), wordCountCommand.toJSON()] },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

// Handle the command
let count = 0;
const socketInteractionAdapter = new SocketInteractionAdapter();
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'compte') {
    if (interaction.options.getSubcommand() === 'ajoute') {
      const toAdd = interaction.options.getNumber('nombre-de-mots') || 0;
      count += toAdd;
      await interaction.reply(`<@${interaction.user.id}> Ajout de ${toAdd} mots au décompte, ${count} -> ${count + toAdd}`);
    } else {
      await interaction.reply('Réinitialisation du décompte');
    }
  } else {
    const {message} = await socketInteractionAdapter.process(interaction);
    await interaction.reply(message);
  }
});

client.login(token);
