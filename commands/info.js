module.exports = {
    name: 'info',
    desc: "sends the information of the bot",
    execute(message, args){
        if (args[0] == null) {
            message.channel.send('KoolAid Discord Bot');
        } else {
            switch (args[0].toLowerCase()) {
                case 'version':
                    message.channel.send('Version 1.0.8');  // TODO: Update version through getting the version value in the json file
                    break;

                case 'author':
                    message.channel.send('Ryan Kim and Justin Deng');
                    break;

                default:
                    message.channel.send('Invalid Arguments');
                    break;
            }
        }
    }
}