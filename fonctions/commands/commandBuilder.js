// Charger les données de la commande depuis le fichier JSON
const fs = require('fs');
const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { DiscordPermissionFlagsBits } = require('../../permission');

function createCommande(commandeJsonFilePath) {
    const commandData = JSON.parse(fs.readFileSync(commandeJsonFilePath, 'utf8'));
    // Créer une instance de SlashCommandBuilder
    const commandBuilder = new SlashCommandBuilder()
        .setName(commandData.name)
        .setContexts(commandData.context || []) // Contextes si fournis
        .setDescription(commandData.description)
        .setDefaultMemberPermissions(DiscordPermissionFlagsBits(commandData.permissions.slashCommandPermissions || 0));

    // Ajouter dynamiquement les options
    commandData.options.forEach(option => {
        switch (option.type) {
            case 'STRING':
                commandBuilder.addStringOption(opt => {
                    opt.setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required || false);
                    
                    // Ajout de choix, si spécifiés
                    if (option.choices) {
                        option.choices.forEach(choice => 
                            opt.addChoices({ name: choice.name, value: choice.value }));
                    }
                    
                    // Validation de longueur
                    if (option.minLength) opt.setMinLength(option.minLength);
                    if (option.maxLength) opt.setMaxLength(option.maxLength);

                    return opt;
                });
                break;
            case 'INTEGER':
                commandBuilder.addIntegerOption(opt => {
                    opt.setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required || false);
                    
                    // Ajout de validation numérique
                    if (option.minValue) opt.setMinValue(option.minValue);
                    if (option.maxValue) opt.setMaxValue(option.maxValue);

                    // Ajout de choix
                    if (option.choices) {
                        option.choices.forEach(choice => 
                            opt.addChoices({ name: choice.name, value: choice.value }));
                    }

                    return opt;
                });
                break;
            case 'NUMBER':
                commandBuilder.addNumberOption(opt => {
                    opt.setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required || false);
                    
                    // Ajout de validation numérique
                    if (option.minValue) opt.setMinValue(option.minValue);
                    if (option.maxValue) opt.setMaxValue(option.maxValue);

                    return opt;
                });
                break;
            case 'BOOLEAN':
                commandBuilder.addBooleanOption(opt =>
                    opt.setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required || false)
                );
                break;
            case 'USER':
                commandBuilder.addUserOption(opt =>
                    opt.setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required || false)
                );
                break;
            case 'CHANNEL':
                commandBuilder.addChannelOption(opt => {
                    opt.setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required || false);

                    // Restriction sur les types de canal
                    if (option.channelTypes) {
                        opt.addChannelTypes(...option.channelTypes.map(type => ChannelType[type]));
                    }

                    return opt;
                });
                break;
            case 'ROLE':
                commandBuilder.addRoleOption(opt =>
                    opt.setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required || false)
                );
                break;
            case 'MENTIONABLE':
                commandBuilder.addMentionableOption(opt =>
                    opt.setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required || false)
                );
                break;
            case 'ATTACHMENT':
                commandBuilder.addAttachmentOption(opt =>
                    opt.setName(option.name)
                        .setDescription(option.description)
                        .setRequired(option.required || false)
                );
                break;
            case 'SUB_COMMAND':
                commandBuilder.addSubcommand(subcommand => {
                    subcommand.setName(option.name)
                        .setDescription(option.description);
                    
                    // Ajouter des options à la sous-commande
                    if (option.options) {
                        option.options.forEach(subOption => {
                            switch (subOption.type) {
                                case 'STRING':
                                    subcommand.addStringOption(opt => 
                                        opt.setName(subOption.name)
                                            .setDescription(subOption.description)
                                            .setRequired(subOption.required || false)
                                    );
                                    break;
                                // Ajouter d'autres types pour les sous-options si nécessaire
                                default:
                                    console.warn(`Type de sous-option inconnu: ${subOption.type}`);
                            }
                        });
                    }

                    return subcommand;
                });
                break;
            case 'SUB_COMMAND_GROUP':
                commandBuilder.addSubcommandGroup(group => {
                    group.setName(option.name)
                        .setDescription(option.description);

                    // Ajouter des sous-commandes au groupe
                    if (option.subcommands) {
                        option.subcommands.forEach(subCommand => {
                            group.addSubcommand(sub => 
                                sub.setName(subCommand.name)
                                    .setDescription(subCommand.description)
                            );
                        });
                    }

                    return group;
                });
                break;
            default:
                console.warn(`Type d'option inconnu: ${option.type}`);
        }
    });

    return commandBuilder;
}

module.exports = { createCommande };
