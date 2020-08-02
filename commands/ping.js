module.exports = {
    name: 'ping',
    desc: "basic ping command",
    execute(message, args){
        message.channel.send('pong!');
    }
}