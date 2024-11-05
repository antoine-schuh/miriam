import 'dotenv/config';
import express from 'express';
import {InteractionResponseType, InteractionType, verifyKeyMiddleware,} from 'discord-interactions';

import {generatePresenceReport} from './presence-report/presence-report.js';
import {PRESENCE_COMMAND} from "./commands.js";
import {CHANNEL_OPTION_NAME} from "./constants.js";

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
        if (data.name === PRESENCE_COMMAND.name) {
            console.log("Data", data);
            const channelOption = data.options.find(option => option.name === CHANNEL_OPTION_NAME);
            if (channelOption && channelOption.value) {
                console.log("Options", channelOption);
                const result = await generatePresenceReport(channelOption.value);
                return res.send({
                    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
                    data: {content: JSON.stringify(result, null, 2)}
                });
            }
        }

        console.error(`unknown command: ${name}`);
        return res.status(400).json({error: 'unknown command'});
    }

    console.error('unknown interaction type', type);
    return res.status(400).json({error: 'unknown interaction type'});
});

app.get('/', (req, res) => {
    res.send("I'm alive!!");
    generatePresenceReport('1300822795395137578').then(result => console.log(result));
});

app.listen(PORT, () => {
    console.log('Listening on port', PORT);
});
