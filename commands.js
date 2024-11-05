import 'dotenv/config';
import { InstallGlobalCommands } from './utils.js';

// Simple test command
export const PRESENCE_COMMAND = {
  name: 'presence',
  description: 'Command to generate a presence report',
  type: 1,
  integration_types: [0, 1],
  contexts: [0, 1, 2],
  options: [
    {
      name: 'channel',
      description: 'The channel to generate the presence report for',
      type: 7, // Type 7 represents a channel option
      required: false
    },
  ]
};

const ALL_COMMANDS = [PRESENCE_COMMAND];

InstallGlobalCommands(process.env.APP_ID, ALL_COMMANDS);
