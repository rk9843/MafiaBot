module.exports = {
    async execute(message, args) {

        // const msgs = await message.channel.awaitMessages(msg => msg.content.includes('0'), {time: 5000});
        
        const reactions = await message.awaitReactions(reaction => {
            console.log(reaction.emoji);
            return reaction.emoji.id === "739682553950371850", {time: 15000}});
        console.log(reactions);

        // retmsg = message.channel.send(`${msgs.map(msg => msg.conent)}`);
        // console.log(retmsg);
        // message.channel.send("Await Completed!");
        // message.channel.send(`Await Completed! ${msgs.map(msg => msg.conent).join(",")}`);
        // return retmsg;
    }
}
