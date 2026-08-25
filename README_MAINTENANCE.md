# Maintenance technique sur la VM

L'application publique fonctionne dans Docker sur la VM Debian `217.182.210.146`. Toutes les commandes ci-dessous sont à exécuter depuis le dépôt :

```bash
cd ~/observatoire_JN
```

## Vérifier l'application

```bash
docker compose ps
docker compose logs --tail=50 observatoire
curl http://127.0.0.1:8088/api/health
```

L'adresse publique actuelle est `http://217.182.210.146:8088`. Si `APP_PORT` change dans `.env`, adapter l'URL et le pare-feu.

## Mettre à jour le code

```bash
git pull
docker compose up -d --build
```

Le conteneur redémarre automatiquement après un redémarrage de la VM. Pour un redémarrage manuel :

```bash
docker compose restart observatoire
```

## Remplacer les données sources

Déposer le nouveau classeur sur la VM, puis le remplacer sans changer son nom :

```bash
cp /chemin/nouveau_fichier.xlsx data/source/benchmark_from_mapping_pdf.xlsx.tmp
mv data/source/benchmark_from_mapping_pdf.xlsx.tmp data/source/benchmark_from_mapping_pdf.xlsx
docker compose restart observatoire
docker compose logs --tail=50 observatoire
```

Au démarrage, tous les indicateurs sont recalculés depuis ce fichier. Ne pas renommer la feuille `Observatoire` ni ses colonnes.

## Récupérer et traiter les contributions

Les réponses sont conservées sur la VM, hors de l'image Docker :

```text
data/contributions/saisies_jumeaux_numeriques.xlsx
```

Depuis un autre poste, le fichier peut être récupéré par SSH :

```bash
scp debian@217.182.210.146:~/observatoire_JN/data/contributions/saisies_jumeaux_numeriques.xlsx .
```

Après validation métier, reporter ses 14 colonnes dans les colonnes de même nom du classeur source, puis remplacer la source et redémarrer le conteneur. Le formulaire renseigne automatiquement `#` et `where_data_from`.

## Sauvegarde minimale

Sauvegarder régulièrement ces éléments avant un remplacement :

```text
.env
data/source/benchmark_from_mapping_pdf.xlsx
data/contributions/saisies_jumeaux_numeriques.xlsx
```

Ne pas modifier `app/data/dashboard-data.js` : il est généré automatiquement au démarrage. Le guide de première installation reste disponible dans `DEPLOIEMENT_DOCKER.md`.
