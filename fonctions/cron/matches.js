const cron = require('node-cron');
const { fetchMatches, fetchResults } = require('../api/matchs')
const { addDetailOnMatches, generateEmbedAlert, generateEmbedResult, manageBotPresence } = require('../matchs/utils')
const { checkUpcomingMatches, markNotificationAsSent, checkNewResults, markResultAsSent } = require('../database/matchs')
const { NOTIF_CHANNEL, RESULT_CHANNEL } = require('../config/channel')

function set_cron_get_matchs(bot) {
    // Planification d'une tâche toutes les 5 minutes
    cron.schedule('*/30 * * * *', async () => {
        console.log(`1️⃣[CRON] mise a jour des matchs`);
        fetchMatches()
    });
}

function set_cron_get_results(bot) {
    // Planification d'une tâche toutes les 5 minutes
    cron.schedule('*/30 * * * *', async () => {
        console.log(`2️⃣[CRON] mise a jour des résultats`);
        fetchResults()
    });
}

function set_cron_check_new_events(bot) {
    // Planification d'une tâche toutes les 5 minutes
    cron.schedule('0 */1 * * *', async () => {
        console.log(`3️⃣[CRON] verification d'une alerte à envoyer`);
        try {
            let matchs = await checkUpcomingMatches();
            if (!matchs) {
                return;
            }
    
            matchs = addDetailOnMatches(matchs);
            const channel = bot.channels.cache.get(NOTIF_CHANNEL);
            let embed;
            let attachment;
    
            for (let index = 0; index < matchs.length; index++) {
                const match = matchs[index];
                
                try {
                    [embed, attachment] = await generateEmbedAlert(match);
                    await channel.send({
                        embeds: [embed],
                        files: attachment
                    });
    
                } catch (error) {
                    console.error(`⚠️ Erreur lors de l'envoi du message pour le match ID ${match.id}`, error);
    
                    // Vérifie si c'est un timeout et retente l'opération après un délai
                    if (error.message.includes("Request timed out")) {
                        console.log(`🔄 Tentative de renvoi pour le match ID ${match.id} dans 5 secondes...`);
                        await new Promise(resolve => setTimeout(resolve, 5000)); // Attendre 5 sec
                        try {
                            await channel.send({
                                embeds: [embed],
                                files: attachment
                            });
                        } catch (retryError) {
                            console.error(`❌ Échec de la nouvelle tentative pour le match ID ${match.id}`, retryError);
                        }
                    }
                }
            }
    
            for (let index = 0; index < matchs.length; index++) {
                const match = matchs[index];
                await markNotificationAsSent(match.id);
            }
            
            await manageBotPresence(bot, matchs);
            
        } catch (error) {
            console.error('3️⃣[CRON] Erreur lors de l\'exécution du cron verification d\'une alerte à envoyer', error);
        }
    });
    
}

function set_cron_check_new_results(bot) {
    // Planification d'une tâche toutes les 5 minutes
    cron.schedule('5 */1 * * *', async () => {
        console.log(`4️⃣[CRON] verification de résultat à envoyer`);
        try{
            let matchs = await checkNewResults();
            if (!matchs){
                return;
            }
            
            matchs = addDetailOnMatches(matchs);
            const channel = bot.channels.cache.get(RESULT_CHANNEL);
            let embed;
            let attachment;
            for (let index = 0; index < matchs.length; index++) {
                const match = matchs[index];

                try {
                    [embed, attachment] = await generateEmbedResult(match);
                    await channel.send({
                        embeds: [embed],
                        files: attachment
                    });
    
                } catch (error) {
                    console.error(`⚠️ Erreur lors de l'envoi du message pour le match ID ${match.id}`, error);
    
                    // Vérifie si c'est un timeout et retente l'opération après un délai
                    if (error.message.includes("Request timed out")) {
                        console.log(`🔄 Tentative de renvoi pour le match ID ${match.id} dans 5 secondes...`);
                        await new Promise(resolve => setTimeout(resolve, 5000)); // Attendre 5 sec
                        try {
                            await channel.send({
                                embeds: [embed],
                                files: attachment
                            });
                        } catch (retryError) {
                            console.error(`❌ Échec de la nouvelle tentative pour le match ID ${match.id}`, retryError);
                        }
                    }
                }
            }
            
            for (let index = 0; index < matchs.length; index++) {
                const match = matchs[index];
                await markResultAsSent(match.id)
            }
        }catch (error) {
            console.error('4️⃣[CRON] Erreur lors de l\'exécution du cron verification d\'un résultat à envoyer', error);
        }
    });
}

module.exports = {
    set_cron_get_matchs,
    set_cron_get_results,
    set_cron_check_new_events,
    set_cron_check_new_results
}