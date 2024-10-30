import 'dotenv/config';
import express from 'express';
import {
  InteractionType,
  InteractionResponseType,
  verifyKeyMiddleware,
} from 'discord-interactions';
import Discord from 'discord.js';

// Create an express app
const app = express();
// Get port, or default to 3000
const PORT = process.env.PORT || 3000;

/**
 * Interactions endpoint URL where Discord will send HTTP requests
 * Parse request body and verifies incoming requests using discord-interactions package
 */
app.post('/interactions', verifyKeyMiddleware(process.env.PUBLIC_KEY), async function (req, res) {
  // Interaction type and data
  const { type, data } = req.body;

  /**
   * Handle verification requests
   */
  if (type === InteractionType.PING) {
    return res.send({ type: InteractionResponseType.PONG });
  }

  /**
   * Handle slash command requests
   * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
   */
  if (type === InteractionType.APPLICATION_COMMAND) {
    const { name } = data;

    // "test" command
    if (name === 'test') {
      // Send a message into the channel where command was triggered from
      return res.send({
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          // Fetches a random emoji to send from a helper function
          content: 'Ta gueule!',
        },
      });
    }

    console.error(`unknown command: ${name}`);
    return res.status(400).json({ error: 'unknown command' });
  }

  console.error('unknown interaction type', type);
  return res.status(400).json({ error: 'unknown interaction type' });
});

app.listen(PORT, () => {
  console.log('Listening on port', PORT);
});


async function fetchMessages() {
  const client = new Discord.Client();

  client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}`);
  });

  client.on('message', async (message) => {
    if (message.content === '!fetch-messages') {
      const channel = await client.channels.fetch('1300822795395137578');

      // Fetch messages from the channel
      const messages = await channel.messages.fetch({ limit: 100 }); // Fetching 100 most recent messages

      // Print the content of each message
      messages.forEach((message) => {
        console.log(`${message.author.username}: ${message.content}`);
      });
    }
  });

  // Log in the bot
  client.login(process.env.DISCORD_TOKEN);
}
