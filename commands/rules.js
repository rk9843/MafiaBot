module.exports = {
    name: 'rules',
    desc: "Sends user the rules of Mafia.",
    execute(message, args){
        message.author.send('https://www.instructables.com/id/How-To-Play-Mafia-with-And-Without-Cards/');
    }
}