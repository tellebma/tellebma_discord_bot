const cron = require('node-cron');

function set_cron_get_nb_users(bot) {
    // Planification d'une tâche à 12h00 chaque jour
    cron.schedule('', async () => {
        console.log(`[CRON] matchs de la semaine`);
    });
}

module.exports = {
    set_cron_get_nb_users
}