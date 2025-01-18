const { set_cron_get_results, set_cron_get_matchs, set_cron_check_new_events, set_cron_check_new_results } = require('../fonctions/cron/matches');

const ttv_channel = process.env.ttv || "chokolaolais"

module.exports = {
    name: 'ready',
    once: true,
    execute(bot) {
        //Log Bot's username and the amount of servers its in to console
        console.log(`${bot.user.username} is online on ${bot.guilds.cache.size} servers!`);
        set_cron_get_results()
        set_cron_get_matchs()
        set_cron_check_new_events()
        set_cron_check_new_results()
        /**
         * PLAYING : Affiche le jeu que le bot "joue".
         * STREAMING : Affiche le stream en direct (nécessite un lien Twitch par exemple).
         * LISTENING : Affiche ce que le bot "écoute", parfait pour des playlists ou des musiques.
         * WATCHING : Affiche ce que le bot "regarde", pour des vidéos ou événements en cours.
         */

        //Set the Presence of the bot user
        // bot.user.setPresence({
        //     activities: [
        //         { name: 'En live Twitch !', type: 'STREAMING', url: `https://www.twitch.tv/${ttv_channel}` }
        //     ],
        //     status: 'online'
        // });
        
        // bot.user.setPresence({
        //     activities: [
        //         { name: 'Esport Tournament: League Finals', type: 'WATCHING' }
        //     ],
        //     status: 'online'
        // });

        
        // bot.user.setPresence({
        //     activities: [
        //         { name: 'League of Legends', type: 'PLAYING' },
        //         { name: 'Counter Strike: Global Offensive', type: 'PLAYING' },
        //         { name: 'Valorant', type: 'PLAYING' }
        //     ],
        //     status: 'online'
        // });
        

    }
}
