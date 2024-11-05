import 'dotenv/config';
import express from 'express';
import {InteractionResponseType, InteractionType, verifyKeyMiddleware,} from 'discord-interactions';

import {generatePresenceReport} from './presence-report/presence-report.js';
import {PRESENCE_COMMAND} from "./commands.js";

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
        if (name === PRESENCE_COMMAND.name) {
            console.log(data);
            // Send a message into the channel where command was triggered from
            const result = await generatePresenceReport();
            return res.send({
                type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                data: {
                    // Fetches a random emoji to send from a helper function
                    content: JSON.stringify(result, null, 2),
                },
            });
        }

        console.error(`unknown command: ${name}`);
        return res.status(400).json({error: 'unknown command'});
    }

    console.error('unknown interaction type', type);
    return res.status(400).json({error: 'unknown interaction type'});
});

app.get('/', (req, res) => {
    res.send("I'm alive!!");
    generatePresenceReport().then(result => console.log(result));
});

app.listen(PORT, () => {
    console.log('Listening on port', PORT);
});
