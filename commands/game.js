const Discord = require('discord.js');
const filter = m => m.content.startsWith("m!");
const options = {max: 1, time: 6000, errors: ["time"]};

players = [];

gameStarted = false;

var arr = [];


function rng() {
    while (arr.length < 6) {
        var r = Math.floor(Math.random() * 6);
        if (arr.indexOf(r) === -1) {
            arr.push(r);
        }
    }
}
    
function playerExists(ID) {
    for (user in players) {
        if (players[user].ID === ID) {
            return true;
        } 
    }
    return false;
}

function findPlayer(ID) {
    for (user in players) {
        if (players[user].ID === ID) {
            return players[user];
        }
    }
    console.log("This player could not be found.")
}

function assignRoles() {
    rng();

    players[0].TEAM = 'Mafia';
    players[0].ROLE = 'Mafia';

    players[1].TEAM = 'Mafia';
    players[1].ROLE = 'Mafia';
    
    players[2].TEAM = 'Village';
    players[2].ROLE = 'Doctor';

    // players[3].TEAM = 'Village';
    // players[3].ROLE = 'Cop';

    // players[4].TEAM = 'Village';
    // players[4].ROLE = 'Villager';

    // players[5].TEAM = 'Village';
    // players[5].ROLE = 'Villager';

    // players[arr[0]].TEAM = 'Mafia';
    // players[arr[0]].ROLE = 'Mafia';

    // players[arr[1]].TEAM = 'Mafia';
    // players[arr[1]].ROLE = 'Mafia';
    
    // players[arr[2]].TEAM = 'Village';
    // players[arr[2]].ROLE = 'Doctor';

    // players[arr[3]].TEAM = 'Village';
    // players[arr[3]].ROLE = 'Sheriff';

    // players[arr[4]].TEAM = 'Village';
    // players[arr[4]].ROLE = 'Villager';

    // players[arr[5]].TEAM = 'Village';
    // players[arr[5]].ROLE = 'Villager';
}

function startGame() {
    console.log(players);
    mafiaTurn();
    doctorTurn();
    copTurn();
}

function getPlayersByTeam(team) {
    retArr = [];
    for (user in players) {
        if (players[user].TEAM === team) {
            retArr.push(players[user]);
        }
    }
    return retArr;
}

function getPlayersByRole(role) {
    retArr = [];
    for (user in players) {
        if (players[user].ROLE === role) {
            retArr.push(players[user]);
        }
    }
    return retArr;
}

function mafiaTurn() {
    villagers = getPlayersByTeam('Village');
    mafia = getPlayersByTeam('Mafia');
    for (user in mafia) {
        mafia[user].USER.send("The two mafia members are " + mafia[0].USERNAME + " and " + mafia[1].USERNAME);
        mafia[user].USER.send("Who do you wish to target?");
    }

    var i = 0;
    for (user in villagers) {

        mafia[0].USER.send("Press m!game " + i + " to kill " + villagers[user].USERNAME)

        // const waitingAct = async cmd => {
        //     try {
        //         await require('./await.js').execute(message, args);
        //     } catch (err) {
        //         console.error(err);
        //     }
        // }
        // ;(async () => {
        //     const cmd = 'await';
        //     await waitingAct(cmd);
        // })()

        // dmc0 = new Discord.DMChannel(mafia[0].USER, message);
        // if (dmc0.message === "0") {
        //     console.log('dmc0 said 0');
        // }
        
        mafia[1].USER.send("Press m!game " + i + " to kill " + villagers[user].USERNAME);
        dmc1 = new Discord.DMChannel(mafia[1].USER, message);
        if (dmc1.message === "0") {
            console.log('dmc1 said 0');
        }

        i++;

    }
    // mafiaResponse(mafia[0]);
    
    
    // client.on('message', message => {
    //     console.log(message);
    //     if(!message.content.startsWith(prefix) || message.author.bot) return;
    //     switch (message.content) {
    //         case "0" :
                
    //             break;
    //         case "1":

    //             break;
    //         default:
    //             message.channel.send("Invalid Argument.");
    //     }
    // });
}

function doctorTurn(){
    doctor = getPlayersByRole('Doctor');
    doctor[user].USER.send("Hello Doctor, Who do you wish to heal?");   
    var i = 0;
    for (user in players) {
        doctor[0].USER.send("Press " + i + " to heal " + players[user].USERNAME);
        i++;
    }
}

function copTurn() {
    Cop = getPlayersByRole('Cop');
    Cop.USER.send("You are the cop. You may investigate one person to see which team they are on.")
    var i = 0
    for (user in players) {
        if (player[user].USERNAME !== Cop.USERNAME) {
            Cop.USER.send("Press " + i + " to investigate " + players[user]);
            i++;
        }
    }
}

function mafiaResponse(member){
    // let response = member.COLLECTOR.on("collect", message => {
    // console.log(response);
    //     switch (message) {
    //         case '0':
    //             console.log('0');
    //             break;
    //         case '1':
    //             console.log('1');
    //             break;
    //         case '2':
    //             console.log('2');
    //             break; 
    //         case '3':
    //             console.log('3');
    //             break;
    //     }
    // });
}

function createChannels(guild){
    var permissions = {
        VIEW_CHANNEL: true // Denies visibility to everyone
        // allow: 0x00000001 // Allows instant invites to be created
    }
    var townHall = guild.channels.create("Town Hall", permissions); //Add emojis here if desired
    var mafiaChannel = guild.channels.create("Mafia", permissions);
    var doctorChannel = guild.channels.create("Doctor", permissions);
    var copChannel =guild.channels.create("Cop", permissions);
    doctorChannel.overwritePermissions(players[0].USER ,{
        VIEW_CHANNEL: true,
        SEND_MESSAGES: true
    });
    

}


module.exports = {
    name: 'game',
    desc: "The Mafia Game",    

    execute(message, args){
        if(args[0] == null) {
            message.reply('Mafia Game!');
            
        } else {
            switch (args[0].toLowerCase()) {
                
                case 'join':
                    if (gameStarted){
                        message.reply("Too late to join. Game already started!")
                        break;
                    }
                    username = message.member.user.tag.toString();  
                    userid = message.author.id.toString();
                    user = message.author;
                    const collector = new Discord.MessageCollector(message.channel, m => m.author.id === message.author.id, {time: 60000});
                    var newUser = {
                        USERNAME: username,
                        ID: userid,
                        USER : user,
                        COLLECTOR : collector,
                        TEAM: null,
                        ROLE: null,
                    }

                    players.push(newUser);

                    // if (players.length == 0) {
                    //     players.push(newUser);
                    //     message.reply("You are the first player to join!")
                    //     client = message.Client;
                    //     console.log(players);
                    // } else {
                    //     if (playerExists(userid)) {
                    //         message.reply("You are already in the game!");
                    //     } else {
                    //         players.push(newUser);
                    //         message.reply("You have been added to the game!");
                    //     }
                    // }

                    break;

                case 'start':
                    if (players.length == 3 && !gameStarted) { //change back to 6
                        assignRoles();
                        message.channel.send("Mafia Game Start!");
                        console.log(players);
                        guild = message.guild;
                        createChannels(guild);
                        //startGame();
                    } else if (!gameStarted) { 
                        message.channel.send(players.length + "/6 minimum players in Mafia Lobby. Waiting for more players...");
                    } else {
                        message.reply("The game has already started. Join later!");
                    }


                    
                    break;
                    
                case 'role':
                    if (playerExists(message.author.id)) {
                        message.author.send("Your Team is " + findPlayer(message.author.id).Team);
                        message.author.send("Your Role is " + findPlayer(message.author.id).Role);
                    } else {
                        message.author.send("You're not in the game. Do 'm!game join' to join the game.");
                    }
                    break;
                default:
                    // console.log(message.channel.id);
                    message.channel.send('Invalid Arguments.');
            }
        }
    }
}

