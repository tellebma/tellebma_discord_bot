const axios = require('axios');
const { upsertMatch } = require('../database/matchs')



async function fetchMatches() {
    try {
        const response = await axios.get('https://api2.kametotv.fr/karmine/events');
        const events = response.data;

        for (let index = 0; index < events.length; index++) {
            const event = events[index];
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
