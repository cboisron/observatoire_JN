# Maintenance technique sur la VM

L'application fonctionne uniquement avec Docker Compose sur la VM Debian `217.182.210.146`. Exécuter les commandes depuis la racine du dépôt :

```bash
cd /home/debian/observatoire_JN
```

## Vérifier ou mettre à jour

```bash
docker compose ps
curl http://127.0.0.1:8088/api/health
docker compose logs --tail=50 observatoire
```

Pour déployer une nouvelle version :

```bash
git pull
docker compose up -d --build
```

Les logs Docker sont limités automatiquement à trois fichiers de 10 Mo.

## Sauvegarder les données

Créer immédiatement une archive :

```bash
sh scripts/backup_vm.sh
```

Les archives sont placées dans `data/backups` et supprimées après 30 jours. Pour automatiser la sauvegarde chaque nuit, ouvrir `crontab -e` et ajouter :

```cron
15 2 * * * cd /home/debian/observatoire_JN && /bin/sh scripts/backup_vm.sh >> data/backups/backup.log 2>&1
```

## Remplacer la source Excel

```bash
sh scripts/backup_vm.sh
cp /chemin/nouveau_fichier.xlsx data/source/benchmark_from_mapping_pdf.xlsx.tmp
mv data/source/benchmark_from_mapping_pdf.xlsx.tmp data/source/benchmark_from_mapping_pdf.xlsx
docker compose restart observatoire
docker compose logs --tail=50 observatoire
```

Le dashboard est entièrement recalculé au redémarrage. Ne pas renommer la feuille `Observatoire` ni ses colonnes.

## Récupérer les contributions

Le fichier persistant est `data/contributions/saisies_jumeaux_numeriques.xlsx`. Depuis un autre poste :

```bash
scp debian@217.182.210.146:/home/debian/observatoire_JN/data/contributions/saisies_jumeaux_numeriques.xlsx .
```

Après validation métier, reporter ses 14 colonnes dans les colonnes de même nom de la source, puis appliquer la procédure de remplacement ci-dessus.

Ne jamais modifier `app/data/dashboard-data.js` : ce fichier est généré dans le conteneur et n'est pas conservé dans Git.
