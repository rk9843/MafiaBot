// const Discord = require("discord.js");

// module.exports = {
//     name: 'dmme',
//     desc: 'DMs me',
//     async execute(message, args) {
//         await message.delete();

//         const filter = m => m.author.id === message.author.id;
//         message.author.send("Please choose a number between 0-3. Type 'cancel' to cancel. You have 10 seconds to decide.").then(r => r.delete(10000))

//         message.channel.awaitMessages(filter, {max: 1, time: 10000}).then(collected => {
//             if (collected.first().content === "cancel") {
//                 return message.reply("Cancelled!")
//             }
//             message.author.send("Your Selection is: " + collected.first().content)
//             message.author.send(`Your Selection is: ${collected.first().content}`);
//             // message.reply("Are you sure about selecting " + selection + "?");

//         }).catch(err => {
//             message.channel.send('I did not get an answer.');
//             console.log(err);
//         })
//     }
// }