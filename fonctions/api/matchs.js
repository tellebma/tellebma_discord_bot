const axios = require('axios');
const { parseISO, isSameDay, getISOWeek, getDay, startOfDay } = require('date-fns');
const { toZonedTime } = require('date-fns-tz');

const timeZone = 'Europe/Paris';

const GAME_MAPPING = {
    TFT: "TFT",
    VCT: "Valorant",
    LEC: "League Of Legends",
    DIV2: "League Of Legends",
    VCL: "Valorant",
    RL: "Rocket League",
    LFL: "League Of Legends",
    "VCT-GC": "Valorant",
    "TK/SF": "Tekken",
    FTN: "Fortnite"
};
const GAME_COLOR = {
    TFT: 0xfafa31,
    VCT: 0xfab731,
    LEC: 0x3165fa,
    DIV2: 0xcc31fa,
    VCL: 0x6531fa,
    RL: 0x92fa31,
    LFL: 0x31f4fa,
    'VCT-GC': 0xfa3183,
    'TK/SF': 0x5f31fa,
    FTN: 0xfa4f31
};

const GAME_LINK = {
    TFT: './images/TFT.png',
    VCT: './images/ValorantVCT.png',
    LEC: './images/LEC.png',
    DIV2: './images/LOLDiv2.png',
    VCL: './images/VCL_France.png',
    RL: './images/RL.png',
    LFL: './images/lfl.png',
    'VCT-GC': './images/Valorant_GC.png',
    'TK/SF': './images/Takken.png',
    FTN: './images/Fortnite.png'
};

const GAME_COMPET_CLEAN_NAME = {
    "Tekken8StreetFighter6": "Tekken",
    "RocketLeague": "Rocket League",
    "Fortnite": "Fortnite",
    "LeagueOfLegendsLFL": "LFL",
    "ValorantVCL": "VCL",
    "LeagueOfLegendsDiv2": "LFL Div2",
    "ValorantVCT": "VCT",
    "TFT": "TFT",
    "LeagueOfLegendsLEC": "LEC",

};

function addMinutesToDate(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
}

async function fetchMatches() {
    try {
        const response = await axios.get('https://api2.kametotv.fr/karmine/events');
        const events = response.data;

        return events.map(event => ({
            id: event.id,
            title: event.title,
            competition: event.competition_name,
            teamDomicile: event.team_name_domicile || null,
            teamExterieur: event.team_name_exterieur || 'Une Equipe',
            logoDomicile: event.team_domicile === 'null' ? './images/Karmine_Corp.png' : event.team_domicile || null,
            logoExterieur: event.team_exterieur === 'null' ? null : event.team_exterieur || null,
            player: event.player !== 'null' ? event.player : null,
            start: addMinutesToDate(toZonedTime(new Date(event.start), timeZone), 5),
            end: addMinutesToDate(toZonedTime(new Date(event.end), timeZone), 5),
            link: event.link,
            streamLink: 'https://twitch.tv/'+event.streamLink,
            game: GAME_MAPPING[event.initial] || 'UNKNOWN',
            color: GAME_COLOR[event.initial] || 0x3498db,
            gameIconURL: GAME_LINK[event.initial] || './images/bluewall.jpg',
            compet_clean: GAME_COMPET_CLEAN_NAME[event.competition_name] || event.competition_name
        }));
    } catch (error) {
        console.error('Erreur lors de la récupération des matchs:', error);
        return [];
    }
}


async function filterMatchesByDate(date) {
    const matches = await fetchMatches();
    
    try{
        // Troncature de la date filtrée pour ne conserver que le jour
        const parsedDate = new Date(date);  // Utilise un objet Date
        const startOfDate = startOfDay(parsedDate); // Tronque la date pour ignorer l'heure

        // Vérifier chaque match avant de le filtrer
        const filteredMatches = matches.filter(match => {
            const matchStartOfDay = startOfDay(match.start); // Tronque également la date du match

            // Afficher les détails de chaque match et du filtrage
            //console.log(`Match: ${match.start} -> Date filtrée : ${date} -> Est-ce le même jour ? ${isSameDay(matchStartOfDay, startOfDate)}`);
            return isSameDay(matchStartOfDay, startOfDate);
        });

        console.log(`Nombre de matchs filtrés pour la date ${date} : ${filteredMatches.length}`);
        return filteredMatches;
    } catch (error) {
        // Si une erreur se produit, on l'affiche
        console.error("Erreur lors du filtrage des matchs par date : ", error);
        throw error; // relance l'erreur après l'avoir loggée
    }
}


async function filterMatchesByWeek(weekNumber) {
    const matches = await fetchMatches();
    const weekMatches = {};
    const daysOfWeek = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

    matches.forEach(match => {
        const matchDate = parseISO(match.start);
        if (getISOWeek(matchDate) === weekNumber) {
            const dayName = daysOfWeek[getDay(matchDate)];
            if (!weekMatches[dayName]) {
                weekMatches[dayName] = [];
            }
            weekMatches[dayName].push(match);
        }
    });

    return weekMatches;
}

module.exports = { fetchMatches, filterMatchesByDate, filterMatchesByWeek };
