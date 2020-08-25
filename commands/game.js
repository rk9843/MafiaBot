/*
 * Constants and Variables 
 */

const Discord = require('discord.js');
const filter = m => m.content.startsWith("m!");
const options = {max: 1, time: 6000, errors: ["time"]};

var players = [];
var arr = [];
var gameStarted = false;
var docSelfHealed = false;
var lastDeath = null;
var guild = null;
var docChannel;
var mafiaChannel;
var copChannel;
var townHallChannel;


/*
 * Helper functions 
 */

/**
 * A simple sleeper function
 * @param {int} ms 
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * A helper shuffle function for when assigning roles
 */
function rng() {  // TODO: Increase the hardcoded value of 6 players cap for future when there are more than 6 players
    while (arr.length < 6) {
        var r = Math.floor(Math.random() * 6);
        if (arr.indexOf(r) === -1) {
            arr.push(r);
        }
    }
}

/**
 * Returns a boolean statement given a Discord User's unique ID to see if they are in the list of players
 * @param {int} ID 
 */
function playerExists(ID) {
    for (user in players) {
        if (players[user].ID === ID) {
            return true;
        } 
    }
    return false;
}

/**
 * Returns a Discord User given a Discord User's unique ID is in the list of players
 * @param {int} ID 
 */
function findPlayer(ID) {
    for (user in players) {
        if (players[user].ID === ID) {
            return players[user];
        }
    }
    console.log("This player could not be found.")
}

/**
 * Assigns each player in Players roles accordingly using a shuffled array
 */
function assignRoles() {  // TODO: Figure out what to do in games of more than 6 players
    rng();

    players[arr[0]].TEAM = 'Mafia';
    players[arr[0]].ROLE = 'Mafia';

    players[arr[1]].TEAM = 'Mafia';
    players[arr[1]].ROLE = 'Mafia';
    
    players[arr[2]].TEAM = 'Village';
    players[arr[2]].ROLE = 'Doctor';

    players[arr[3]].TEAM = 'Village';
    players[arr[3]].ROLE = 'Sheriff';

    players[arr[4]].TEAM = 'Village';
    players[arr[4]].ROLE = 'Villager';

    players[arr[5]].TEAM = 'Village';
    players[arr[5]].ROLE = 'Villager';
}

/**
 * Returns an array of players that are alive regardless of team or role
 */
function getAlivePlayers() {
    retArr = [];
    for (user in players) {
        if (players[user].ALIVE === true) {
            retArr.push(players[user]);
        }
    }
    return retArr;
}

/**
 * Returns an array of players of a specified team given that team's name
 * @param {newUser.TEAM} team 
 */
function getPlayersByTeam(team) {
    retArr = [];
    for (user in players) {
        if (players[user].TEAM === team && players[user].ALIVE === true) {
            retArr.push(players[user]);
        }
    }
    return retArr;
}

/**
 * Returns an array of players of a specified role given that role's name
 * @param {newUser.ROLE} role 
 */
function getPlayersByRole(role) {
    retArr = [];
    for (user in players) {
        if (players[user].ROLE === role && players[user].ALIVE === true) {
            retArr.push(players[user]);
        }
    }
    return retArr;
}

/**
 * Sets the player's ALIVE property to false, essentially "killing" them
 * Does NOT remove the player from the players array
 * @param {newUser} user 
 */
function killPlayer(user) {
    lastDeath = user.USERNAME;
    user.ALIVE = false;
    client.channels.cache.get(townHallChannel.id).updateOverwrite(user.USER, { SEND_MESSAGES: false } );
}

/**
 * Returns a specified player's team
 * @param {newUser} user 
 */
function investigatePlayer(user) {
    return user.TEAM;
}

/**
 * Returns -1 for mafia win, 1 for village win, 0 for no win yet
 */
async function checkWin() {
    mafia = getPlayersByTeam('Mafia');
    village = getPlayersByTeam('Village');
    if (mafia.length === 0) {
        return 1;
    }
    else if (mafia.length >= village.length){
        return -1;
    } 
    else {
        return 0;
    }

}


/*
 * Gameplay functions 
 */

/**
 * Starts up the game
 * @param {Discord.Message} message 
 */
async function startGame(message) {
    gameStarted = true;
    assignRoles();
    guild = message.guild;

    await createChannels(guild);
    let destination = client.channels.cache.get(townHallChannel.id);
    destination.send("As this is the first night, nothing will happen. Feel free to introduce yourselves to one another. One minute until the game starts.");  // TODO: Generate a bypass condition in case people wish not to talk with each other for that one minute duration
    await sleep("6000");
    
    try {
        await playGame();
    } catch (error) {
        console.error(error);
    }
}

/**
 * //Creates text channels that are only visible to people in certain roles and allows them to perform their functions
 * @param {Discord.Guild} guild 
 */
async function createChannels(guild) {  // TODO: See if we can simplify the permissionOverwrites for all other potential players AND update if and wen we increase player cap to more than 6
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
            {
                id: mafia[1].ID,
                allow: ['VIEW_CHANNEL'],
            },
        ],
    }
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
            {
                id: players[3].ID,
                allow: ['VIEW_CHANNEL'],
            },
            {
                id: players[4].ID,
                allow: ['VIEW_CHANNEL'],
            },
            {
                id: players[5].ID,
                allow: ['VIEW_CHANNEL'],
            },
        ]
    }

    async function getMafiaChannel() {
        try {
            const mafiaChannel = await guild.channels.create(String.fromCodePoint(0x1F52A) + " mafia", mafiaPermissions);
            return mafiaChannel;
        } catch (error) {
            console.error(error);
        }
    }
    async function getDocChannel() {
        try {
            const docChannel = await guild.channels.create(String.fromCodePoint(0x1F3E5) + " doctor", doctorPermissions);
            return docChannel;
        } catch (error) {
            console.error(error);
        }
    }
    async function getCopChannel() {
        try {
            const copChannel = await guild.channels.create(String.fromCodePoint(0x1F575) + " cop", copPermissions);
            return copChannel;
        } catch (error) {
            console.error(error);
        }
    }
    async function getTownHallChannel() {
        try {
            const townHallChannel = await guild.channels.create(String.fromCodePoint(0x1F3E1) + " town hall", townHallPermissions);
            return townHallChannel;
        } catch (error) {
            console.error(error);
        }
    }

    try {
        mafiaChannel = await getMafiaChannel();
        docChannel = await getDocChannel();
        copChannel = await getCopChannel();
        townHallChannel = await getTownHallChannel();
    } catch (error) {
        console.error(error);
    }

}

/**
 * Checks to see if the game end condition is fulfilled
 * Loops until end condition is met
 */
async function playGame() {
    let destination = client.channels.cache.get(townHallChannel.id);
    destination.send("Everyone, Go to sleep.");
    await sleep(3000);

    alivePlayers = getAlivePlayers();
    for (user in alivePlayers) {
        client.channels.cache.get(townHallChannel.id).updateOverwrite(alivePlayers[user].USER, { SEND_MESSAGES: false } );
    }
    
    await mafiaTurn();
}

/**
 * This is the mafia's turn
 * Creates a message collector which waits until kill!<target> is called
 * At the end of the mafia's turn, it passes it's victim to the doctor's turn and starts it
 */
async function mafiaTurn() {
    villagers = getPlayersByTeam('Village');
    mafia = getPlayersByTeam('Mafia');
    target = undefined;

    let filter = m => !m.author.bot;
    let destination = client.channels.cache.get(mafiaChannel.id);
    let collector = destination.createMessageCollector(filter, { time: 30000 });

    destination.send("Mafia, Wake up.");
    destination.send("You have 30 seconds to decide. Who do you wish to target?");
    
    for (user in villagers) {
        destination.send("Type kill!" + user + " to kill " + villagers[user].USERNAME);
    }

    collector.on('collect', m => {
        console.log(`Collected ${m.content}`);
        if (m.content.startsWith("kill!")) {
            target = villagers[parseInt(m.content.slice(5), 10)];
            if (target === undefined) {
                destination.send("Invalid Target. Select again.");
            }
            if (target !== undefined) {
                destination.send("Target set to " + target.USERNAME + ".");
            }
        }
    });

    collector.on('end', collected => {
        destination.send("Time is up.");

        if (target === undefined) {
            target = villagers[0];
            destination.send("You have failed to select a player. By default, " + target.USERNAME + " will be killed tonight.");
        }

        destination.send("Killing " + target.USERNAME + " tonight.");
        destination.send("End of Mafia Turn... go back to sleep.");

        (async () => {
            await doctorTurn(target);
        })();
    });
    
}

/**
 * This is the doctor's turn
 * Creates a message collector which waits until save!<target> is called
 * If the healing target is the same as the mafia's target, it passes nothing to the cop's turn and starts it
 * Otherwise, it passes the mafia's target to the cop's turn and starts it
 * @param {newUser} mafiaTarget 
 */
async function doctorTurn(mafiaTarget) {
    Doctor = getPlayersByRole('Doctor');
    healablePlayers = getAlivePlayers();
    if (docSelfHealed) {
        for (player in healablePlayers) {
            if (healablePlayers[player] === Doctor) {
                healablePlayers.splice(player,1);
            }
        }    
    }
    target = undefined;

    let filter = m => !m.author.bot;
    let destination = client.channels.cache.get(docChannel.id);
    let collector = destination.createMessageCollector(filter, { time: 30000 });
    
    destination.send("Doctor, wake up.");
    destination.send("You have 30 seconds to decide. Who do you wish to save tonight?");
    
    for (user in healablePlayers) {
        destination.send("Type heal!" + user + " to heal " + healablePlayers[user].USERNAME);
    }

    collector.on('collect', m => {
        console.log(`Collected ${m.content}`);
        if (m.content.startsWith("heal!")) {
            target = healablePlayers[parseInt(m.content.slice(5), 10)];
            if (target === undefined) {
                destination.send("Invalid Target. Select again.");
            }
            if (target !== undefined) {
                destination.send("Target set to " + target.USERNAME + ".");
            }
        }
    });

    collector.on('end', collected => {
        destination.send("Time is up.");
        
        if (target === undefined) {
            target = healablePlayers[0];
            destination.send("You have failed to select a player. By default, " + target.USERNAME + " will be saved tonight.");
        }
        
        destination.send("Saving " + target.USERNAME + " tonight.");
        destination.send("End of Doctor Turn... go back to sleep.");

        if (target === Doctor) {
            docSelfHealed = true;
        }

        if (mafiaTarget === target) {
            (async () => {
                await copTurn(null);
            })();
        } else {
            (async () => {
                await copTurn(mafiaTarget);
            })();
        }

    });

}

/**
 * This is the cop's turn
 * Creates a message collector which waits until check!<target> is called
 * check!<target> then returns the target's team
 * Then it kills the mafia's target
 * @param {newUser} deathTarget 
 */
async function copTurn(deathTarget) {
    checkablePlayers = getAlivePlayers();
    for (player in checkablePlayers) {
        if (checkablePlayers[player].ROLE === "Cop") {
            checkablePlayers.splice(player,1);
        }
    }
    target = undefined;

    let filter = m => !m.author.bot;
    let destination = client.channels.cache.get(copChannel.id);
    let collector = destination.createMessageCollector(filter, { time: 30000 });

    destination.send("Cop, wake up.");
    destination.send("You have 30 seconds to decide. Who do you want to investigate to see which team they are on.")

    for (user in checkablePlayers) {
        destination.send("Type check!" + user + " to investigate " + checkablePlayers[user].USERNAME);
    }

    collector.on('collect', m => {
        console.log(`Collected ${m.content}`);
        if (m.content.startsWith("check!")) {
            target = checkablePlayers[parseInt(m.content.slice(6), 10)];
            if (target === undefined) {
                destination.send("Invalid Target. Select again.");
            }
            if (target !== undefined) {
                destination.send("Target set to " + target.USERNAME + ".");
            }
        }
    });

    collector.on('end', collected => {
        destination.send("Time is up.");

        if (target === undefined) {
            target = checkablePlayers[0];
            destination.send("You have failed to select a player. By default, " + target.USERNAME + " will be investigated tonight.");
        }
        
        destination.send("Investigating " + target.USERNAME + " tonight.");
        destination.send(target.USERNAME + " is on team " + investigatePlayer(target));
        destination.send("End of Cop Turn... go back to sleep.");

        if (deathTarget != null){
            killPlayer(deathTarget);
        }   

        (async () => {
            await dayTime();
        })();
    });

}

/**
 * Checks to see if win condition is met and allows for players to vote to execute someone
 */
async function dayTime() {  // TODO: Create a poll-style collector for the 2 minutes during general discussion for the daytime

    (async () => {
        var winCon = await checkWin();
        if (winCon === 1) {
            destination.send("All Mafia are dead, Villagers Win!");
            return;
        }
        if (winCon === -1) {
            destination.send("Mafia takes over the Village and kills everyone, Mafia Wins!");
            return;
        }    
    })();

    let filter = m => !m.author.bot;
    let destination = client.channels.cache.get(townHallChannel.id);
    let collector = destination.createMessageCollector(filter, { time: 60000 });
    
    var alivePlayers = getAlivePlayers();
    for (user in alivePlayers) {
        client.channels.cache.get(townHallChannel.id).updateOverwrite(alivePlayers[user].USER, { SEND_MESSAGES: true } );
    }

    await sleep(1000);

    destination.send("Everybody, Wake up.");
    if (lastDeath === null) {
        destination.send("Luckily, no one was killed last night.")
    } else {
        destination.send("Unfortunately, " + lastDeath + " was killed last night.");
        lastDeath = null;
    }

    let msg = await destination.send("You now have two minutes to decide on a course of action. A simple majority is needed to execute someone. If a majority can not be reached, no one will be executed.");    
    for (user in alivePlayers) {
        destination.send("Press vote!" + user + " to kill " + alivePlayers[user].USERNAME);
    }

    collector.on('collect', m => {
        console.log(`Collected ${m.content}`);
        if (m.content.startsWith("vote!")) {
            if (findPlayer(m.author.id).VOTED) {
                destination.send("You already voted!");
            } else {
                target = alivePlayers[parseInt(m.content.slice(5), 10)];
                if (target === undefined) {
                    destination.send("Invalid Target. Vote again.");
                }
                if (target !== undefined) {
                    destination.send(findPlayer(m.author.id).USERNAME + " voted for " + target.USERNAME + ".");
                    target.VOTES += 1;
                    findPlayer(m.author.id).VOTED = true;
                }
            }
        }
    });

    collector.on('end', collected => {
        destination.send("Time is up.");
        for (user in alivePlayers) {
            console.log(alivePlayers[user].VOTES);
            if (alivePlayers[user].VOTES >= Math.ceil(alivePlayers.length / 2)) {
                destination.send(alivePlayers[user] = " has been killed!")
                killPlayer(alivePlayers[user]);
            }
        }
        (async () => {
            var winCon = await checkWin();

            if (winCon === 0) {
                (async () => {
                    await mafiaTurn();
                })();
            } else if (winCon === 1) {
                destination.send("All Mafia are dead, Villagers Win!");
                (async () => {
                    await deleteChannels();
                })();
            } else {
                destination.send("Mafia takes over the Village and kills everyone, Mafia Wins!");
                (async () => {
                    await deleteChannels();
                })();
            }    
        })();
    });
}

/**
 * Function that deletes all text channels created for the game and resets game variables
 */
async function deleteChannels() {
    let destination = client.channels.cache.get(townHallChannel.id);
    destination.send("The text channels will be deleted in 5 seconds");
    await sleep(5000);
    try {
        await mafiaChannel.delete();
        await docChannel.delete();
        await copChannel.delete();
        await townHallChannel.delete();
        players = [];
        arr = [];
        gameStarted = false;
        docSelfHealed = false;
        lastDeath = null;
        guild = null;
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}


/**
 * Reads and executes m!game <args> commands
 */
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
                    if (players.length == 6) { //TODO: change to allow higher player cap
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
                        ALIVE: true,
                        VOTED: false,
                        VOTES: 0
                    }

                    

                    if (players.length == 0) {
                        players.push(newUser);
                        message.reply("You are the first player to join!")
                        client = message.Client;
                        console.log(players);
                    } else {
                        if (playerExists(userid)) {
                            message.reply("You are already in the game!");
                        } else {
                            players.push(newUser);
                            message.reply("You have been added to the game!");
                        }
                    }
                    break;

                case 'start':
                    if (players.length == 6 && !gameStarted) {  // TODO: When increasing playercap for future update check this condition
                        message.channel.send("Mafia Game Start!");
                        (async function(){
                            await startGame(message);
                        })();                   
                    } else if (!gameStarted) { 
                        message.channel.send(players.length + "/6 minimum players in Mafia Lobby. Waiting for more players...");  // TODO: When increasing playercap for future update check this condition
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
                    players = [];
                    gameStarted = false;
                    break;

                default:
                    message.channel.send('Invalid Arguments.');
                    break;
            }
        }
    }
}