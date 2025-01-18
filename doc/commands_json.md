### Documentation : Fonction `createCommande`

La fonction `createCommande` permet de générer dynamiquement une commande slash Discord à partir d'un fichier JSON. Elle prend en charge plusieurs types d'options, des validations avancées, des sous-commandes, ainsi que des groupes de sous-commandes. Voici une documentation complète en français.

---

### **Signature de la fonction**

```javascript
function createCommande(commandeJsonFilePath)
```

#### **Paramètres**

- `commandeJsonFilePath` (string) : Le chemin d'accès au fichier JSON contenant les données de la commande.

#### **Retour**

- Une instance de `SlashCommandBuilder` représentant la commande configurée.

---

### **Structure du fichier JSON attendu**

Voici un exemple de fichier JSON illustrant les données nécessaires pour configurer une commande :

```json
{
    "name": "nom_de_la_commande",
    "context": ["GUILD_COMMAND"],
    "description": "Description de la commande",
    "permissions": {
        "slashCommandPermissions": 8
    },
    "options": [
        {
            "type": "STRING",
            "name": "nom_option",
            "description": "Description de l'option",
            "required": true,
            "minLength": 1,
            "maxLength": 200
        }
    ]
}
```

### **Clés acceptées dans le fichier JSON**

| **Clé**              | **Type attendu**              | **Description**                                                                                                                                     |
|-----------------------|-------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| `name`               | String                       | Nom unique de la commande. Doit être en minuscules et sans espaces (utiliser `_` ou `-` pour séparer les mots).                                    |
| `context`            | Array                        | Contextes dans lesquels la commande est disponible (`GUILD_COMMAND`, `DM_COMMAND`, etc.).                                                          |
| `description`        | String                       | Description de la commande affichée à l'utilisateur.                                                                                               |
| `permissions`        | Object                       | Définit les permissions requises pour exécuter la commande. Exemple : `{ "slashCommandPermissions": 8 }`.                                          |
| `options`            | Array d'objets               | Liste des options configurables pour la commande (voir section **Types d'options** ci-dessous).                                                    |

---

### **Types d'options supportés**

| **Type**       | **Description**                                                                                  | **Propriétés supplémentaires**                                                                                                                                       |
|-----------------|--------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `STRING`       | Texte libre.                                                                                     | `minLength`, `maxLength`, `choices`                                                                                                                                |
| `INTEGER`      | Nombre entier.                                                                                   | `minValue`, `maxValue`, `choices`                                                                                                                                   |
| `NUMBER`       | Nombre décimal ou entier.                                                                        | `minValue`, `maxValue`                                                                                                                                              |
| `BOOLEAN`      | Vrai ou faux.                                                                                    | Aucune                                                                                                                                                              |
| `USER`         | Sélection d'un utilisateur Discord.                                                              | Aucune                                                                                                                                                              |
| `CHANNEL`      | Sélection d'un canal Discord.                                                                    | `channelTypes` (ex. : `["GuildText", "GuildVoice"]`)                                                                                                                |
| `ROLE`         | Sélection d'un rôle Discord.                                                                     | Aucune                                                                                                                                                              |
| `MENTIONABLE`  | Sélection d'un utilisateur ou d'un rôle.                                                         | Aucune                                                                                                                                                              |
| `ATTACHMENT`   | Fichier joint par l'utilisateur lors de l'exécution de la commande.                              | Aucune                                                                                                                                                              |
| `SUB_COMMAND`  | Sous-commande avec des options spécifiques.                                                      | `options` : Liste des options spécifiques à la sous-commande.                                                                                                       |
| `SUB_COMMAND_GROUP` | Groupe de sous-commandes.                                                                    | `subcommands` : Liste des sous-commandes à inclure dans le groupe.                                                                                                   |

---

### **Validation et contraintes avancées**

#### Options `STRING`
- `minLength` (Nombre) : Longueur minimale du texte accepté.
- `maxLength` (Nombre) : Longueur maximale du texte accepté.
- `choices` (Array) : Liste de choix prédéfinis. Exemple :
  ```json
  "choices": [
      { "name": "Option 1", "value": "valeur1" },
      { "name": "Option 2", "value": "valeur2" }
  ]
  ```

#### Options `INTEGER` et `NUMBER`
- `minValue` (Nombre) : Valeur minimale autorisée.
- `maxValue` (Nombre) : Valeur maximale autorisée.
- `choices` (Array) : Liste de choix prédéfinis similaires à `STRING`.

#### Options `CHANNEL`
- `channelTypes` (Array) : Types de canaux acceptés, comme `GuildText`, `GuildVoice`, etc.

#### Sous-commandes (`SUB_COMMAND`)
Chaque sous-commande peut avoir ses propres options. Exemple d'entrée JSON :

```json
{
    "type": "SUB_COMMAND",
    "name": "sous_commande",
    "description": "Description de la sous-commande",
    "options": [
        {
            "type": "STRING",
            "name": "option_string",
            "description": "Option pour la sous-commande",
            "required": true
        }
    ]
}
```

#### Groupes de sous-commandes (`SUB_COMMAND_GROUP`)
Permet de regrouper plusieurs sous-commandes sous un même groupe. Exemple :

```json
{
    "type": "SUB_COMMAND_GROUP",
    "name": "groupe",
    "description": "Description du groupe",
    "subcommands": [
        {
            "name": "sous_commande_1",
            "description": "Première sous-commande"
        },
        {
            "name": "sous_commande_2",
            "description": "Deuxième sous-commande"
        }
    ]
}
```

---

### **Exemple complet**

Fichier JSON pour une commande complexe :

```json
{
    "name": "example",
    "context": ["GUILD_COMMAND"],
    "description": "Une commande avancée",
    "permissions": {
        "slashCommandPermissions": 8
    },
    "options": [
        {
            "type": "STRING",
            "name": "texte",
            "description": "Texte à afficher",
            "required": true,
            "minLength": 1,
            "maxLength": 200
        },
        {
            "type": "INTEGER",
            "name": "nombre",
            "description": "Un nombre à traiter",
            "minValue": 1,
            "maxValue": 10,
            "choices": [
                { "name": "Un", "value": 1 },
                { "name": "Deux", "value": 2 }
            ]
        },
        {
            "type": "CHANNEL",
            "name": "cible",
            "description": "Canal cible",
            "required": true,
            "channelTypes": ["GuildText"]
        },
        {
            "type": "SUB_COMMAND",
            "name": "sous_commande",
            "description": "Sous-commande exemple",
            "options": [
                {
                    "type": "STRING",
                    "name": "option",
                    "description": "Une option pour la sous-commande",
                    "required": true
                }
            ]
        }
    ]
}
```

---

### **Conclusion**

La fonction `createCommande` est un outil puissant pour générer dynamiquement des commandes Discord complexes. Elle s'adapte à différents scénarios grâce à sa prise en charge complète des types d'options et des hiérarchies de sous-commandes.