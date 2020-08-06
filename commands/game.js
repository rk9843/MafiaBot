
const Discord = require('discord.js');
const filter = m => m.content.startsWith("m!");
const options = {max: 1, time: 6000, errors: ["time"]};

var players = [];
var gameStarted = false;
var lastDeath;
var arr = [];
var docChannel;
var mafiaChannel;
var copChannel;
var townHallChannel;


//Helper functions
////////////////////////////////
///////////////////////////////
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

    // players[2].TEAM = 'Mafia';
    // players[2].ROLE = 'Mafia';

    players[0].TEAM = 'Village';
    players[0].ROLE = 'Doctor';
    
    players[1].TEAM = 'Mafia';
    players[1].ROLE = 'Mafia';

    players[2].TEAM = 'Village';
    players[2].ROLE = 'Cop';

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

function getAlivePlayers() {
    retArr = [];
    for (user in players) {
        if (players[user].ALIVE === true) {
            retArr.push(players[user]);
        }
    }
    return retArr;
}

function getPlayersByTeam(team) {
    retArr = [];
    for (user in players) {
        if (players[user].TEAM === team && players[user].ALIVE === true) {
            retArr.push(players[user]);
        }
    }
    return retArr;
}

function getPlayersByRole(role) {
    retArr = [];
    for (user in players) {
        if (players[user].ROLE === role && players[user].ALIVE === true) {
            retArr.push(players[user]);
        }
    }
    return retArr;
}

function killPlayer(user) {
    lastDeath = user.USERNAME;
    user.ALIVE = false;
    client.channels.cache.get(townHallChannel.id).updateOverwrite(user.USER, { SEND_MESSAGES: false } );   
}

function savePlayer(user) {
    user.ALIVE = true;
    lastDeath = null;
}

function investigatePlayer(user) {
    return user.TEAM;
}

function checkWin() { //returns -1 for mafia win, 1 for village win, 0 for no win yet
    mafia = getPlayersByTeam('Mafia');
    village = getPlayersByTeam('Village');

    if (mafia.length == 0) {
        return 1;
    }
    else if (mafia.length >= village.length){
        return -1;
    } 
    else {
        return 0;
    }

}

function executeTasks() {
    var tasks = Array.prototype.concat.apply([], arguments);
    var task = tasks.shift();
    task(function() {
        if(tasks.length > 0)
            executeTasks.apply(this, tasks);
    });
}

//Gameplay functions
////////////////////////////////////////
////////////////////////////////////////

async function startGame(message) {
    try {
        gameStarted = true;
        assignRoles();
        guild = message.guild;
        await createChannels(guild);
        var winCon = checkWin();
        // while (winCon == 0) {  // TODO: Loop this under conditionals until mafia win or village win.
        //     await playGame();
        //     winCon = checkWin();
        // }
        await playGame();
    } catch (error) {
        console.error(error);
    }
}

async function createChannels(guild) {
    var doctor = getPlayersByRole('Doctor')[0];
    var doctorPermissions = {
        type: 'text',
        permissionOverwrites: [
            {
                id: guild.id,
                deny: ['VIEW_CHANNEL'],
            },
            {
                id: doctor.ID,
                allow: ['VIEW_CHANNEL'],
            },
        ],
    }
    var cop = getPlayersByRole('Cop')[0];
    var copPermissions = {
        type: 'text',
        permissionOverwrites: [
            {
                id: guild.id,
                deny: ['VIEW_CHANNEL'],
            },
            {
                id: cop.ID,
                allow: ['VIEW_CHANNEL'],
            },
        ],
    }
    var mafia = getPlayersByRole('Mafia');
    var mafiaPermissions = {
        type: 'text',
        permissionOverwrites: [
            {
                id: guild.id,
                deny: ['VIEW_CHANNEL'],
            },
            {
                id: mafia[0].ID,
                allow: ['VIEW_CHANNEL'],
            },
            // {
            //     id: mafia[1].ID,
            //     allow: ['VIEW_CHANNEL'],  TODO: add back in
            // },
        ],
    }
    var townHallPermissions = {
        type: 'text',
        permissionOverwrites: [
            {
                id: guild.id,
                deny: ['VIEW_CHANNEL'],
            },
            {
                id: players[0].ID,
                allow: ['VIEW_CHANNEL'],
            },
            {
                id: players[1].ID,
                allow: ['VIEW_CHANNEL'],
            },
            {
                id: players[2].ID,
                allow: ['VIEW_CHANNEL'],
            },
            // {
            //     id: players[3].ID,
            //     allow: ['VIEW_CHANNEL'],
            // },
            // {
            //     id: players[4].ID,
            //     allow: ['VIEW_CHANNEL'],
            // },
            // {
            //     id: players[5]].ID,
            //     allow: ['VIEW_CHANNEL'],
            // },
        ]
    }

    async function getDocChannel() {
        const docChannel = await guild.channels.create(String.fromCodePoint(0x1F3E5) + " doctor", doctorPermissions);
        return docChannel;
    }
    async function getMafiaChannel() {
        const mafiaChannel = await guild.channels.create(String.fromCodePoint(0x1F52A) + " mafia", mafiaPermissions);
        return mafiaChannel;
    }
    async function getCopChannel() {
        const copChannel = await guild.channels.create(String.fromCodePoint(0x1F575) + " cop", copPermissions);
        return copChannel;
    }
    async function getTownHallChannel() {
        const townHallChannel = await guild.channels.create(String.fromCodePoint(0x1F3E1) + " town hall", townHallPermissions);
        return townHallChannel;
    }

    try {
        docChannel = await getDocChannel();
        mafiaChannel = await getMafiaChannel();
        copChannel = await getCopChannel();
        townHallChannel = await getTownHallChannel();
    } catch (error) {
        console.error(error);
    }

}

async function playGame() {  //TODO: figure out how to run async func in series
    try {
        await dayTime();
    } catch (error) {
        console.error(error);
    }
}

async function mafiaTurn() {
    villagers = getPlayersByTeam('Village');
    mafia = getPlayersByTeam('Mafia');

    try {
        let counter = 0;
        let filter = m => !m.author.bot;
        let destination = client.channels.cache.get(mafiaChannel.id);
        let collector = destination.createMessageCollector(filter, { time: 30000 });

        destination.send("Mafia, Wake up.");
        destination.send("You have 30 seconds to decide. Who do you wish to target?");
        
        var i = 0;
        for (user in villagers) {
            destination.send("Press " + i + " to kill " + villagers[user].USERNAME);
            i++;
        }

        collector.on('collect', m => {
            console.log(`Collected ${m.content}`);
            destination.send("You have selected to kill " + villagers[parseInt(m.content, 10)].USERNAME + " tonight."); // TODO: villager selection ambiguity case string not int within range
            killPlayer(villagers[parseInt(m.content, 10)]);
            counter ++;
            if (counter === 1) {
                collector.stop();
            }
        });
        collector.on('end', collected => {
            destination.send("Ending Mafia Turn... go back to sleep.");
        });
    } catch (error) {
        console.error(error);
    }

}

async function doctorTurn() {
    doctor = getPlayersByRole('Doctor');
    alivePlayers = getAlivePlayers();

    try {
        mafiaTurn();
        let counter = 0;
        let filter = m => !m.author.bot;
        let destination = client.channels.cache.get(docChannel.id);
        let collector = destination.createMessageCollector(filter, { time: 30000 });
        
        destination.send("Doctor, wake up.");
        destination.send("You have 30 seconds to decide. Who do you wish to save tonight?");
        
        var i = 0;
        for (user in alivePlayers) {
            destination.send("Press " + i + " to heal " + alivePlayers[user].USERNAME);
            i++;
        }

        collector.on('collect', m => {
            console.log(`Collected ${m.content}`);
            destination.send("You have selected to save " + alivePlayers[parseInt(m.content, 10)].USERNAME + " tonight."); // TODO: player selection ambiguity case string not int within range, AND doctor self heal limit to one
            savePlayer(alivePlayers[parseInt(m.content, 10)]);
            counter ++;
            if (counter === 1) {
                collector.stop();
            }
        });
        collector.on('end', collected => {
            destination.send("Ending Doctor Turn... go back to sleep.");
        });
    } catch (error) {
        console.error(error);
    }

}

async function copTurn() {
    Cop = getPlayersByRole('Cop');
    alivePlayers = getAlivePlayers();
    
    try {
        doctorTurn();
        let counter = 0;
        let filter = m => !m.author.bot;
        let destination = client.channels.cache.get(copChannel.id);
        let collector = destination.createMessageCollector(filter, { time: 30000 });

        destination.send("Cop, wake up.");
        destination.send("You have 30 seconds to decide. Who do you want to investigate to see which team they are on.")

        var i = 0;
        for (user in alivePlayers) {
            destination.send("Press " + i + " to investigate " + alivePlayers[user].USERNAME);
            i++;
        }

        collector.on('collect', m => {
            console.log(`Collected ${m.content}`);
            destination.send("You have selected to investigate " + alivePlayers[parseInt(m.content, 10)].USERNAME + " tonight."); // TODO: player selection ambiguity case string not int within range, AND doctor self heal limit to one
            destination.send(alivePlayers[parseInt(m.content, 10)].USERNAME + " is on team " + investigatePlayer(alivePlayers[parseInt(m.content, 10)]));
            counter ++;
            if (counter === 1) {
                collector.stop();
            }
        });
        collector.on('end', collected => {
            destination.send("Ending Cop Turn... go back to sleep.");
        });
    } catch (error) {
        console.error(error);
    }

}

async function dayTime() {
    
    try {
        copTurn();
        let destination = client.channels.cache.get(townHallChannel.id);
        let collector = destination.createMessageCollector(filter, { time: 30000 });
        var alivePlayers = getAlivePlayers();
        var i = 0;

        destination.send("Good morning");
        if (lastDeath == null){
            destination.send("Luckily, no one was killed last night.")
        } else {
            destination.send("Unfortunately, " + lastDeath + " was killed last night.");
            lastDeath = null;
        }
        destination.send("You now have two minutes to decide on a course of action. A simple majority is needed to execute someone. If a majority can not be reached, no one will be executed.")
        for (player in alivePlayers) {
            destination.send("Press " + i + " to kill " + alivePlayers[player].USERNAME);
        }
    } catch (erorr) {
        console.error(error);
    }
}

async function deleteChannels() {
    let destination = client.channels.cache.get(townHallChannel.id);
    destination.send("The text channels will be deleted in 5 seconds");
    await sleep(5000);
    try {
        await docChannel.delete();
        await mafiaChannel.delete();
        await copChannel.delete();
        await townHallChannel.delete();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}


module.exports = {
    name: 'game',
    desc: "The Mafia Game",    

    execute(message, args) {
        if(args[0] == null) {
            message.reply('Mafia Game!');
        } else {
            switch (args[0].toLowerCase()) {
                case 'join':
                    if (gameStarted) {
                        message.reply("Too late to join. Game already started!")
                        break;
                    }
                    if (players.length == 3) { //TODO: change back to 6
                        message.reply("Game lobby is full.");
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
                        ALIVE: true
                    }

                    players.push(newUser);  // TODO: Remove after testing

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
                    if (players.length == 3 && !gameStarted) {  // TODO: change back to >= 6 after testing
                        message.channel.send("Mafia Game Start!");
                        (async function(){
                            await startGame(message);
                        })();                   
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
                
                case 'delete':
                    (async function(){
                        await deleteChannels();
                    })();
                    break;

                default:
                    // console.log(message.channel.id);
                    message.channel.send('Invalid Arguments.');
                    break;
            }
        }
    }
}

