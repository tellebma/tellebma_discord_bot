const token = process.env.DISCORD_TOKEN;
const updateFile = process.env.FICHIER_UPDATE_COMMANDE;

const { Client, GatewayIntentBits, Collection, Partials } = require('discord.js');
const fs = require("fs");
const { exec } = require('child_process');

// Initialisation du client Discord avec les intents et les partials
const bot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessagePolls,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

bot.commands = new Collection();

// Charger les fichiers de commandes de la racine de 'commands'
const commandFiles = fs.readdirSync('./commands/').filter(f => f.endsWith('.js'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    
    // Vérifier si 'data' est bien défini pour les Slash Commands
    if (command.data) {
        console.log(`${file} chargé en tant que Slash Command`);
        bot.commands.set(command.data.name, command);
    } else if (command.config) {
        console.log(`${file} chargé en tant que commande classique`);
        bot.commands.set(command.config.name, command);
    } else {
        console.error(`Le fichier ${file} ne contient pas de données valides pour une commande.`);
    }
}

// Charger les sous-dossiers de commandes
const commandSubFolders = fs.readdirSync('./commands/').filter(f => !f.endsWith('.js')).filter(f => !f.endsWith('.json'));
commandSubFolders.forEach(folder => {
    const commandFiles = fs.readdirSync(`./commands/${folder}/`).filter(f => f.endsWith('.js')).filter(f => f.endsWith('.json'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);

        // Vérifier si 'data' est bien défini pour les Slash Commands
        if (command.data) {
            console.log(`${file} chargé depuis ${folder} en tant que Slash Command`);
            bot.commands.set(command.data.name, command);
        } else if (command.config) {
            console.log(`${file} chargé depuis ${folder} en tant que commande classique`);
            bot.commands.set(command.config.name, command);
        } else {
            console.error(`Le fichier ${file} dans le dossier ${folder} ne contient pas de données valides pour une commande.`);
        }
    }
});


// Charger les fichiers d'événements depuis le dossier 'events'
const eventFiles = fs.readdirSync('./events/').filter(f => f.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        bot.once(event.name, (...args) => event.execute(...args, bot));
    } else {
        bot.on(event.name, (...args) => event.execute(...args, bot));
    }
    console.log(`${file} chargé`);
}

// Gestionnaire de commandes Slash
bot.on('interactionCreate', async interaction => {
    if (interaction.isModalSubmit()){
        // annonceModalEvent(interaction);
        // Mettre ici les autres Modal Event si il y en besoin.
        return;
    }
    if (interaction.isCommand()){
        const command = bot.commands.get(interaction.commandName);
        if (command) {
            try {
                //logCommand(interaction.commandName, interaction.user.id, interaction.channel.id);
                await command.execute(interaction);
            } catch (error) {
                console.error("Erreur bot", error)
            }
        }
        return;
    }
    
});

// Vérifier si le fichier existe
const runDeployScript = () => {
    return new Promise((resolve, reject) => {
        exec('node deploy-command.js', (error, stdout, stderr) => {
            if (error) {
                console.error(`Erreur lors de l'exécution de deploy-command.js : ${error.message}`);
                reject(error); // Rejeter la promesse en cas d'erreur
                return;
            }
            if (stderr) {
                console.error(`Stderr de deploy-command.js : ${stderr}`);
                reject(new Error(stderr)); // Rejeter la promesse si stderr existe
                return;
            }
            console.log(`Stdout de deploy-command.js : ${stdout}`);
            resolve(stdout); // Résoudre la promesse lorsque tout s'est bien passé
        });
    });
};

(async () => {
    // Vérifier si le fichier existe
    if (!fs.existsSync(updateFile)) {
        console.log(`Le fichier "${updateFile}" n'existe pas. Lancement du script deploy-command.js...`);
        
        try {
            await runDeployScript(); // Attendre la fin du script deploy-command.js
            console.log('Le script deploy-command.js a été exécuté avec succès');
        } catch (error) {
            console.error('Le script deploy-command.js a échoué:', error);
            process.exit(1); // Arrêter l'exécution si le script échoue
        }
    } else {
        console.log(`Le fichier "${updateFile}" existe. Aucun besoin de lancer deploy-command.js.`);
    }
    // Connexion du bot à Discord
    await bot.login(token); // Attendez que le bot se connecte à Discord avant de procéder au reste du script
})();

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
    console.error('Erreur non gérée :', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Rejet non géré à :', promise, 'raison :', reason);
});

bot.on('error', (error) => {
    console.error('Erreur client Discord :', error);
});
