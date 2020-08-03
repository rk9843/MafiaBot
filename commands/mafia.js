module.exports = {
    name: 'mafia',
    desc: "command to listen for 5 text",
    execute(message, args) {
        message.channel.send('Send up to 5 messages to MAFIA CHANNEL!!!');
        let counter = 0;
        let filter = m => !m.author.bot;
        let collector = message.channel.createMessageCollector(filter, { time: 15000 });
        let destination = client.channels.cache.get('739656072679391383');
        collector.on('collect', m => {
            console.log(`Collected ${m.content}`);
            if (destination) {
                destination.send(m.content);
            }
            counter ++;
            if (counter === 5) {
                collector.stop();
            }
        });
        collector.on('end', collected => {
            console.log(`Collected ${collected.size} items`);
        });
    }
}
            