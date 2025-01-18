#!/usr/bin/env sh

# Vérifier si servers.json existe, sinon le créer
if [ ! -f /var/lib/pgadmin/servers.json ]; then
    cp /tmp/servers.json.template /var/lib/pgadmin/servers.json
fi

# Remplacer les variables d'environnement dans le fichier
sed -i "s/\${POSTGRES_USER}/$POSTGRES_USER/g" /var/lib/pgadmin/servers.json
sed -i "s/\${POSTGRES_PASSWORD}/$POSTGRES_PASSWORD/g" /var/lib/pgadmin/servers.json
sed -i "s/\${POSTGRES_DB}/$POSTGRES_DB/g" /var/lib/pgadmin/servers.json

# Démarrer pgAdmin
exec /entrypoint.sh "$@"
