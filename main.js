const Discord = require('discord.js');

const client = new Discord.Client();

const prefix = 'm!';

const fs = require('fs');

client.commands = new Discord.Collection();

require('dotenv').config()

const commandFiles = fs.readdirSync('./commands/').filter(file => file.endsWith('js'));
for(const file of commandFiles){
    const command = require(`./commands/${file}`);

    client.commands.set(command.name, command);
}


client.once('ready', () => {
    console.log('Mafia Bot is Online!');
});

client.on('message', message => {
    if(!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).split(/ +/);
    const command = args.shift().toLowerCase();

    switch(command) {
        case 'ping':
            client.commands.get('ping').execute(message, args);
            break;
        case 'game':
            client.commands.get('game').execute(message, args);
            break;
        case 'help':
            client.commands.get('help').execute(message, args);
            break;
        case 'rules':
            client.commands.get('rules').execute(message, args);
            break;
        case 'info':
            client.commands.get('info').execute(message, args);
            break;
        case 'mafia':
            client.commands.get('mafia').execute(message, args);
            break;
        // case 'dmme':
        //     const dmAct = async cmd => {
        //         try {
        //             await require('./commands/dmme.js').execute(message, args);
        //         } catch (err) {
        //             console.error(err)
        //         }
        //     }
        //     ;(async () => {
        //         const cmd = 'dmme';
        //         await dmAct(cmd);
        //     })()
        //     break;
        default:
            message.channel.send("Invalid Arguments.");
            break;
    }
});

client.login(process.env.TOKEN);

global.client = client;

// module.exports = {
//     getClient: () => {
//         return client;
//     },
//     CLIENT: this.client
// }