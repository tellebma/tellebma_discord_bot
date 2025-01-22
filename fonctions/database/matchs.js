const { Pool } = require('pg');
const { dbConfig } = require('../config/database')

// Configuration de la base de données PostgreSQL
const pool = new Pool(dbConfig);

// Fonction pour insérer ou mettre à jour un match
async function upsertMatch(match) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN'); // Démarrer une transaction

        // Insertion ou mise à jour avec `ON CONFLICT`
        const query = `
        INSERT INTO events (
            id, title, initial, competition_name, team_domicile, team_exterieur, 
            team_name_domicile, team_name_exterieur, score_domicile, score_exterieur, 
            player, date_start, date_end, link, has_notif_been_send, has_result_been_send, stream_link
        ) 
        VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
            $11, $12, $13, $14, $15, $16, $17
        )
        ON CONFLICT (id) 
        DO UPDATE SET 
            title = COALESCE(EXCLUDED.title, events.title),
            initial = COALESCE(EXCLUDED.initial, events.initial),
            competition_name = COALESCE(EXCLUDED.competition_name, events.competition_name),
            team_domicile = COALESCE(EXCLUDED.team_domicile, events.team_domicile),
            team_exterieur = COALESCE(EXCLUDED.team_exterieur, events.team_exterieur),
            team_name_domicile = COALESCE(EXCLUDED.team_name_domicile, events.team_name_domicile),
            team_name_exterieur = COALESCE(EXCLUDED.team_name_exterieur, events.team_name_exterieur),
            score_domicile = COALESCE(EXCLUDED.score_domicile, events.score_domicile),
            score_exterieur = COALESCE(EXCLUDED.score_exterieur, events.score_exterieur),
            player = COALESCE(EXCLUDED.player, events.player),
            date_start = COALESCE(EXCLUDED.date_start, events.date_start),
            date_end = COALESCE(EXCLUDED.date_end, events.date_end),
            link = COALESCE(EXCLUDED.link, events.link),
            stream_link = COALESCE(EXCLUDED.stream_link, events.stream_link);        
        `;

        const values = [
            match.id, match.title, match.initial, match.competition_name, match.team_domicile,
            match.team_exterieur, match.team_name_domicile, match.team_name_exterieur,
            match.score_domicile || null, match.score_exterieur || null, match.player,
            match.start, match.end || null, match.link, match.hasNotifBeenSend || false, 
            match.hasResultBeenSend || false, match.streamLink || null
        ];

        await client.query(query, values);
        await client.query('COMMIT'); // Valider la transaction

        //console.log(`✅ Match ID ${match.id} inséré ou mis à jour.`);
    } catch (error) {
        await client.query('ROLLBACK'); // Annuler en cas d'erreur
        console.error("❌ Erreur lors de l'ajout/mise à jour du match :", error);
    } finally {
        client.release(); // Libérer la connexion
    }
}

/**
 * Récupère les matchs pour une date donnée
 * @param {Date} date - La date des matchs à récupérer
 * @returns {Promise<Array>} - Liste des matchs trouvés
 */
async function getMatchesByDate(date) {
    try {
        // Convertir l'objet Date en format PostgreSQL (YYYY-MM-DD)
        const formattedDate = date.toISOString().split('T')[0]; // Garde uniquement "YYYY-MM-DD"

        const query = `
            SELECT * FROM events
            WHERE date_start::DATE = $1::DATE
            ORDER BY date_start ASC;
        `;

        const { rows } = await pool.query(query, [formattedDate]);
        return rows;
    } catch (error) {
        console.error('Erreur lors de la récupération des matchs:', error);
        return [];
    }
}
async function getNextMatch(jeu, compet) {
    try {
        const query = `
            SELECT * 
            FROM events
            WHERE date_start >= NOW()
              AND ($1::TEXT IS NULL OR competition_name ILIKE $1) 
              AND ($2::TEXT IS NULL OR competition_name ILIKE $2)
            ORDER BY date_start ASC
            LIMIT 1;
        `;

        // Gestion des valeurs nulles pour éviter les erreurs SQL
        const values = [
            compet || null,  // Si compet est défini, ajoute un wildcard (%) pour ILIKE
            jeu ? `${jeu}%` : null                    // Si jeu est vide, passe null
        ];

        const { rows } = await pool.query(query, values);

        console.log("✅ SQL Query:", query);
        console.log("📌 Paramètres:", values);
        console.log("👀 résultats?:", rows.length);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('❌ Erreur lors de la récupération du prochain match:', error);
        return null;
    }
}




async function checkUpcomingMatches() {
    try {
        // Heure actuelle + 1 heure (2h mais 1h car ??? jsp)
        const currentTimePlusOneHour = new Date(new Date().getTime() + 120 * 60 * 1000);
        
        // Format de la date pour la requête (YYYY-MM-DD HH:MM:SS)
        const formattedTimePlusOneHour = currentTimePlusOneHour.toISOString().slice(0, 19).replace('T', ' ');

        // Requête SQL pour récupérer les matchs où `has_notif_been_send` est false
        // et où `date_start` est dans moins d'une heure
        const query = `
            SELECT * 
            FROM events 
            WHERE has_notif_been_send = false 
                AND date_start >= NOW()  
                AND date_start <= $1 
            ORDER BY date_start ASC;
        `;

        const { rows } = await pool.query(query, [formattedTimePlusOneHour]);

        if (rows.length > 0) {
            console.log(`Matchs à notifier dans une heure  :`, rows);
            return rows;
        } else {
            console.log(`Aucun match à notifier dans une heure. (${formattedTimePlusOneHour})`);
            return [];
        }
    } catch (error) {
        console.error('Erreur lors de la vérification des matchs à notifier:', error);
        return [];
    }
}

// Fonction pour marquer un match comme notifié
async function markNotificationAsSent(matchId) {
    try {
        const query = `
            UPDATE events 
            SET has_notif_been_send = true 
            WHERE id = $1;
        `;
        await pool.query(query, [matchId]);
        console.log(`Notification marquée comme envoyée pour le match avec l'ID ${matchId}`);
    } catch (error) {
        console.error(`Erreur lors de la mise à jour du match ${matchId} :`, error);
    }
}

// Fonction pour vérifier si un match a un résultat non envoyé
async function checkNewResults() {
    try {
        // Requête SQL pour récupérer les matchs dont `has_result_been_send` est false
        const query = `
            SELECT * 
            FROM events 
            WHERE has_notif_been_send = true
			    AND has_result_been_send = false
                AND date_start > NOW() - INTERVAL '1 week'
            ORDER BY date_start ASC;
        `;

        const { rows } = await pool.query(query);

        if (rows.length > 0) {
            console.log('Matchs avec résultats non envoyés :', rows.length);
            return rows;
        } else {
            console.log('Aucun match avec des résultats non envoyés.');
            return [];
        }
    } catch (error) {
        console.error('Erreur lors de la vérification des résultats non envoyés :', error);
        return [];
    }
}

// Fonction pour marquer un résultat comme envoyé pour un match
async function markResultAsSent(matchId) {
    try {
        const query = `
            UPDATE events 
            SET has_result_been_send = true 
            WHERE id = $1;
        `;
        await pool.query(query, [matchId]);
        console.log(`Résultat marqué comme envoyé pour le match avec l'ID ${matchId}`);
    } catch (error) {
        console.error(`Erreur lors de la mise à jour du résultat du match ${matchId} :`, error);
    }
}

module.exports = {
    upsertMatch,
    getMatchesByDate,
    getNextMatch,
    checkUpcomingMatches,
    markNotificationAsSent,
    markResultAsSent,
    checkNewResults
}