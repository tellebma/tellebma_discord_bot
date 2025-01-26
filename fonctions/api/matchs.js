const axios = require('axios');
const { upsertMatch } = require('../database/matchs')
const moment = require('moment');
const { ConnectionVisibility } = require('discord.js');


async function fetchAllInfos() {
    try {
        const response = await axios.get('https://api2.kametotv.fr/karmine/group_a');
        const events = response.data.events;
        const results = response.data.events_results;
        const data = events.concat(results);
        for (let index = 0; index < data.length; index++) {
            const event = data[index];
            
            // Remplacer "null" par null
            for (const key in event) {
                if (event.hasOwnProperty(key)) {
                    if (event[key] === "null") {
                        event[key] = null;
                    }
                }
            }

            if (event.start) {
                event.start = moment(event.start).add(1, 'hours').add(5, 'minutes').toISOString(); // Ajouter 1h05
            }

            if (event.end) {
                event.end = moment(event.end).add(1, 'hours').add(5, 'minutes').toISOString(); // Ajouter 1h05
            }

            // Suppression des doublons dans la liste des joueurs
            if (event.player) {
                const uniquePlayers = [...new Set(event.player.split(";"))];
                event.player = uniquePlayers.join(" ");
            }

            // Correction des URLs d'équipe
            if (event.team_domicile) {
                event.team_domicile = event.team_domicile.replace('https:///', 'https://');
            }
            if (event.team_exterieur) {
                event.team_exterieur = event.team_exterieur.replace('https:///', 'https://');
            }
            upsertMatch(event);
        }
    } catch (error) {
        console.error('❌Erreur lors de la récupération des matchs:', error);
        return;
    }
}


async function fetchPlayerInfoCompet(competition) {
    try {
        const response = await axios.get('https://api2.kametotv.fr/karmine/group_c');
        const players = response.data.players;
        let ret_player = [];
        for (let index = 0; index < players.length; index++) {
            const player = players[index];
            if (player.category_game != competition){
                continue;
            }
            ret_player.push(player)
        }
        return ret_player;
    } catch (error) {
        console.error('❌Erreur lors de la récupération des matchs:', error);
        return;
    }
}

async function fetchScoreInfo(competition) {
    try {
        const response = await axios.get('https://api2.kametotv.fr/karmine/group_c');
        const leaderboard = response.data.leaderboard;
        // console.log(competition);
        // console.log(leaderboard[0]);
        return leaderboard[0]?.[competition];
        
    } catch (error) {
        console.error('❌Erreur lors de la récupération des matchs:', error);
        return;
    }
}


module.exports = { fetchAllInfos, fetchPlayerInfoCompet, fetchScoreInfo };
