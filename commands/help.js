const fs = require('fs');
const Discord = require('discord.js');

module.exports = {
    name: 'help',
    desc: "Sends user the different commands for the bot",
    execute(message, args){
        const helpEmbed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('Help!')
            .setDescription('The list of the possible commands!')
            
            .addFields(
                { name: 'Game commands.', value: 'Commands for the Mafia Game' },
                { name: '\u200B', value: '\u200B' },
                { name: 'm!game join', value: 'Join a game of mafia.', inline: true },
                { name: 'm!game start', value: 'Start the mafia game.', inline: true },
                { name: 'm!game role', value: 'Receive a direct message with your role.', inline: true },
            )
            .addFields(
                { name: 'External commands.', value: 'General commands for the MafiaBot' },
                { name: '\u200B', value: '\u200B' },
                { name: 'm!help', value: 'Shows this message.', inline: true },
                { name: 'm!rules', value: 'Shows the rules.', inline: true },
            )
            .setTimestamp()
            .setFooter('MafiaBot Version 1.0.5 by Ryan Kim and Justin Deng');

        message.channel.send(helpEmbed);
    
    }
}