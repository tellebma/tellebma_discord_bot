const axios = require('axios');
const { upsertMatch } = require('../database/matchs')
const moment = require('moment');


async function fetchMatches() {
    try {
        const response = await axios.get('https://api2.kametotv.fr/karmine/events');
        const events = response.data;

        for (let index = 0; index < events.length; index++) {
            const event = events[index];
            
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
        console.error('Erreur lors de la récupération des matchs:', error);
        return;
    }
}

async function fetchResults() {
    try {
        const response = await axios.get('https://api2.kametotv.fr/karmine/events_results');
        const events = response.data;

        for (let index = 0; index < events.length; index++) {
            const event = events[index];
            
            // Remplacer "null" ou "[null]" par null
            for (const key in event) {
                if (event.hasOwnProperty(key)) {
                    if (event[key] === "null") {
                        event[key] = null;
                    }
                }
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
        console.error('Erreur lors de la récupération des matchs:', error);
        return;
    }
}

module.exports = { fetchMatches, fetchResults };
