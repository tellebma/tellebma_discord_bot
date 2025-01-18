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


function addDetailOnMatches(events) {
    try {
        return events.map(event => ({
            id: event.id,
            title: event.title || 'Match sans titre',
            competition: event.competition_name || 'Compétition inconnue',
            teamDomicile: event.team_name_domicile || null,
            teamExterieur: event.team_name_exterieur || 'Une Equipe',
            logoDomicile: event.team_domicile === 'null' ? './images/Karmine_Corp.png' : event.team_domicile || null,
            logoExterieur: event.team_exterieur === 'null' ? null : event.team_exterieur || null,
            player: event.player !== 'null' ? event.player : null,
            start: event.date_start || new Date(),
            end: event.date_end || null,
            link: event.link || '#',
            streamLink: event.stream_link ? `https://twitch.tv/${event.stream_link}` : '#',
            game: GAME_MAPPING[event.initial] || 'UNKNOWN',
            color: GAME_COLOR[event.initial] || 0x3498db,
            gameIconURL: GAME_LINK[event.initial] || './images/bluewall.jpg',
            compet_clean: GAME_COMPET_CLEAN_NAME[event.competition_name] || event.competition_name || 'Compétition inconnue',

            // Ajout des résultats s'ils sont enregistrés
            scoreDomicile: event.score_domicile || null,
            scoreExterieur: event.score_exterieur || null,
            hasNotifBeenSend: event.has_notif_been_send || false,
            hasResultBeenSend: event.has_result_been_send || false
        }));
    } catch (error) {
        console.error('Erreur lors de la récupération des matchs:', error);
        return [];
    }
}





module.exports = {
    addDetailOnMatches
}