import 'dotenv/config';
import express from 'express';
import {
    InteractionType,
    InteractionResponseType,
    verifyKeyMiddleware,
} from 'discord-interactions';

import {Client, GatewayIntentBits, ChannelType} from 'discord.js';

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
    const {type, data} = req.body;

    /**
     * Handle verification requests
     */
    if (type === InteractionType.PING) {
        return res.send({type: InteractionResponseType.PONG});
    }

    /**
     * Handle slash command requests
     * See https://discord.com/developers/docs/interactions/application-commands#slash-commands
     */
    if (type === InteractionType.APPLICATION_COMMAND) {
        const {name} = data;

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
        return res.status(400).json({error: 'unknown command'});
    }

    console.error('unknown interaction type', type);
    return res.status(400).json({error: 'unknown interaction type'});
});

app.get('/prout', (req, res) => {
    fetchMessages().then();
    res.send('Hello from /prout!');
});

app.listen(PORT, () => {
    console.log('Listening on port', PORT);
});

async function fetchMessages() {
    const client = new Client({intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});

    client.on('ready', () => {
        console.log(`Logged in as ${client.user.tag}!`);
        getMessages(client, '1300822795395137578');
    });

    await client.login(process.env.DISCORD_TOKEN);
}

function getMessages(client, channelId) {
    client.channels.fetch(channelId).then(channel => {
        if (channel.type === ChannelType.GuildText) {
            channel.messages.fetch({limit: 100, cache: false})
                .then(messages => {
                    messages.forEach(message => {
                        console.log(message.cleanContent);
                    });
                });
        }
    });
}
