import {ChannelType, Client, GatewayIntentBits, MessageType} from "discord.js";
import {
    DATE_LINE_REGEX,
    INSCRIPTION_LINE_REGEX,
    LINE_SEPARATOR,
    RAID_HELPER_USERNAME,
    WOW_CLASSES
} from "../constants.js";


export function generatePresenceReport(channelId) {
    const client = new Client({intents: [GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]});

    client.on('ready', () => console.log(`Logged in as ${client.user.tag}!`));

    return client.login(process.env.DISCORD_TOKEN)
        .then(() => processMessages(client, channelId));
}

function processMessages(client, channelId) {
    return client.channels.fetch(channelId)
        .then(channel => channel.messages.fetch({limit: 100, cache: false}))
        .then(messages => {
            const result = {};
            messages.forEach(message => {
                if (message.type === MessageType.Default && message.author.username === RAID_HELPER_USERNAME) {
                    processRaidHelperMessage(result, message);
                }
            });
            return result;
        });
}

function processRaidHelperMessage(result, message) {
    const fields = message.embeds[0].fields;
    const eventDate = getEventDate(fields);
    Object.keys(WOW_CLASSES).forEach(wowClass => {
        const classField = fields.filter(field => field.value.startsWith(`<:${wowClass}`));
        if (classField.length === 1) {
            processClass(result, eventDate, wowClass, classField[0].value)
        }
    });
}

function getEventDate(fields) {
    const dateField = fields.find(field => field.value.startsWith('<:LeaderX'));
    if (dateField) {
        const match = dateField.value.match(DATE_LINE_REGEX)
        if (match && match[1]) {
            const eventDate = new Date( match[1] * 1000);
            return eventDate.toISOString();
        }
    }
    return undefined;
}

function processClass(result, eventDate, wowClass, data) {
    const specializations = WOW_CLASSES[wowClass];
    const rows = data.split(LINE_SEPARATOR);
    rows.forEach(row => {
        const match = row.match(INSCRIPTION_LINE_REGEX);
        if (match && specializations.includes(match[1])) {
            const specialization = match[1];
            const name = match[2];
            if (result[name]) {
                result[name].push({eventDate, wowClass, specialization});
            } else {
                result[name] = [{eventDate, wowClass, specialization}];
            }
        }
    });
}
