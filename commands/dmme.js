const Discord = require("discord.js");

module.exports.run = async (bot, message, args) => {
    await message.delete();

    const filter = m => m.author.id === message.author.id;
    message.author.send("Please choose a number between 0-3. Type 'cance' to cancel. You have 10 seconds to decide.").then(r => r.delete(10000))

    message.channel.awaitMessages(filter, {max: 1, time: 10000}).then(collected => {
        if(collected.first().content === "cancel") {
            return message.reply("Cancelled!")
        }
        let selection = args[0];
        message.reply("Are you sure about selecting " + selection + "?");

    }).catch(err => {
        console.log(err);
    })
}