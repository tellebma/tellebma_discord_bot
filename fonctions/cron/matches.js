const cron = require('node-cron');
const { fetchMatches, fetchResults } = require('../api/matchs')
const { addDetailOnMatches } = require('../matchs/utils')
const { checkUpcomingMatches, markNotificationAsSent, checkNewResults, markResultAsSent } = require('../database/matchs')
const { NOTIF_CHANNEL, RESULT_CHANNEL } = require('../config/channel')

function set_cron_get_matchs(bot) {
    // Planification d'une tâche toutes les 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        console.debug(`[CRON] mise a jour des matchs`);
        fetchMatches()
    });
}

function set_cron_get_results(bot) {
    // Planification d'une tâche toutes les 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        console.debug(`[CRON] mise a jour des résultats`);
        fetchResults()
    });
}

function set_cron_check_new_events(bot) {
    // Planification d'une tâche toutes les 5 minutes
    cron.schedule('0 */1 * * *', async () => {
        console.debug(`[CRON] verification d'une alerte à envoyer`);
        let matchs = await checkUpcomingMatches();
        if (!matchs){
            return;
        }
        
        matchs = addDetailOnMatches(matchs);
        const channel = bot.channels.get(NOTIF_CHANNEL);
        let embeds = [];
        let attachments = [];
        for (let index = 0; index < matchs.length; index++) {
            const match = matchs[index];
            embeds.push(new EmbedBuilder()
                .setTitle(match.title)
                .setThumbnail(`attachment://gameIconUrl${index}.png`)
                .setDescription(`**Compétition :** [${match.compet_clean}](${match.link})\n**Jeu :** ${match.game}`)
                .setImage(`attachment://match${index}.png`)
                .setFooter({ text: `Date : ${format(match.start, "EEEE dd MMMM yyyy HH:mm", { locale: fr })}` })
                .setURL(match.streamLink)
                .setColor(match.color));
            if (match.player){
                embed.addFields(
                    { name: ` `, value: ` `, inline: true },
                    { name: ` ${match.player}`, value: ` `, inline: true },
                    { name: ` `, value: ` `, inline: true },
                )
            }else{
                embed.addFields(
                        { name: ` ${match.teamDomicile}`, value: ` `, inline: true },
                        { name: ` Contre`, value: ` `, inline: true },
                        { name: ` ${match.teamExterieur}`, value: ` `, inline: true },
                )
            }
            imageBuffer = await generateMatchImage(match);
            attachments.push({ attachment: match.gameIconURL, name: `gameIconUrl${index}.png` })
            attachments.push({ attachment: imageBuffer, name: `match${index}.png` })
        }
        await channel.send({
            embeds: embeds,
            files: attachments
        });

        for (let index = 0; index < matchs.length; index++) {
            const match = matchs[index];
            await markNotificationAsSent(match.id)
        }
    });
}

function set_cron_check_new_results(bot) {
    // Planification d'une tâche toutes les 5 minutes
    cron.schedule('0 */1 * * *', async () => {
        console.debug(`[CRON] verification de résultat à envoyer`);
        let matchs = await checkNewResults();
        if (!matchs){
            return;
        }
        
        matchs = addDetailOnMatches(matchs);
        const channel = bot.channels.get(RESULT_CHANNEL);
        let embed;
        let embeds = [];
        let attachments = [];
        for (let index = 0; index < matchs.length; index++) {
            const match = matchs[index];
            embed = new EmbedBuilder()
                .setTitle(match.title)
                .setThumbnail(`attachment://gameIconUrl${index}.png`)
                .setDescription(`**Compétition :** [${match.compet_clean}](${match.link})\n**Jeu :** ${match.game}`)
                .setImage(`attachment://match${index}.png`)
                .setFooter({ text: `Date : ${format(match.start, "EEEE dd MMMM yyyy HH:mm", { locale: fr })}` })
                .setURL(match.streamLink)
                .setColor(match.color);
            if (match.player){
                embed.addFields(
                    { name: ` `, value: ` `, inline: true },
                    { name: ` ${match.player}`, value: `${match.scoreDomicile}`, inline: true },
                    { name: ` `, value: ` `, inline: true },
                )
            }else{
                if (match.scoreExterieur == '[null]') {
                    embed.addFields(
                        { name: ` ${match.teamDomicile}`, value: ` `, inline: true },
                        { name: ` Contre`, value: ` ${match.scoreDomicile}`, inline: true },
                        { name: ` ${match.teamExterieur}`, value: ` `, inline: true },
                    )
                } else {
                    embed.addFields(
                        { name: ` ${match.teamDomicile}`, value: ` ${match.scoreDomicile}`, inline: true },
                        { name: ` Contre`, value: ` à`, inline: true },
                        { name: ` ${match.teamExterieur}`, value: ` ${match.scoreExterieur}`, inline: true },
                    )
                }
            }
            
            embeds.push(embed);
            imageBuffer = await generateMatchImage(match);
            attachments.push({ attachment: match.gameIconURL, name: `gameIconUrl${index}.png` })
            attachments.push({ attachment: imageBuffer, name: `match${index}.png` })
        }
        await channel.send({
            embeds: embeds,
            files: attachments
        });
        
        for (let index = 0; index < matchs.length; index++) {
            const match = matchs[index];
            await markResultAsSent(match.id)
        }
    });
}

module.exports = {
    set_cron_get_matchs,
    set_cron_get_results,
    set_cron_check_new_events,
    set_cron_check_new_results
}