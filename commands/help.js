const fs = require('fs');

module.exports = {
    name: 'help',
    desc: "Sends user the different commands for the bot",
    execute(message, args){
        const path = "./commands/help.txt";
        const content = fs.readFileSync(path, 'utf-8');
        message.author.send(content);

        message.author.send("This is a list of all the possible commands for the mafia bot dumbass!");
    }
}