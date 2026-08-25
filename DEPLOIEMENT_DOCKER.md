# Déploiement Docker sur Debian

## 1. Trouver un port libre

Afficher les ports utilisés :

```bash
sudo ss -ltnp
```

Tester uniquement le port `8088` :

```bash
sudo ss -H -ltn 'sport = :8088'
```

Si cette commande ne renvoie rien, le port est libre. Choisir de préférence un port supérieur à `1024`.

## 2. Préparer la première installation

Depuis la racine du dépôt :

```bash
cp .env.example .env
nano .env
id -u
id -g
cp benchmark_from_mapping_pdf.xlsx data/source/
docker compose up -d --build
```

Reporter dans `.env` le port choisi et les nombres donnés par `id -u` et `id -g`.

Vérifier le fonctionnement :

```bash
docker compose ps
docker compose logs --tail=50 observatoire
curl http://127.0.0.1:PORT/api/health
```

Remplacer `PORT` par la valeur de `APP_PORT`. Ouvrir ce port dans le pare-feu de la VM, puis accéder à `http://IP_DE_LA_VM:PORT`.

## 3. Mettre à jour le code

```bash
git pull
docker compose up -d --build
```

Si un fichier de contributions a été créé avec l'ancienne version à 11 colonnes, le conserver sous un autre nom avant le premier démarrage de cette version. Le nouveau formulaire utilise les 14 colonnes visibles de `Observatoire` et refuse d'écraser un ancien schéma incompatible.

## 4. Remplacer les données sources

```bash
cp /chemin/nouveau_fichier.xlsx data/source/benchmark_from_mapping_pdf.xlsx.tmp
mv data/source/benchmark_from_mapping_pdf.xlsx.tmp data/source/benchmark_from_mapping_pdf.xlsx
docker compose restart observatoire
docker compose logs --tail=50 observatoire
```

Le dashboard est recalculé au redémarrage. En cas d'erreur Excel, le conteneur s'arrête au lieu d'afficher d'anciennes données.

## 5. Récupérer les contributions

Le fichier est directement disponible sur la VM :

```text
data/contributions/saisies_jumeaux_numeriques.xlsx
```

Il n'est jamais inclus dans l'image Docker ni accessible depuis le site.

## Protection du formulaire

Par défaut, une adresse IP peut effectuer 5 tentatives toutes les 10 minutes. Ces valeurs sont modifiables dans `.env`. La taille des requêtes et des champs est également limitée.

Quand le domaine sera disponible, ajouter un reverse proxy HTTPS et ne plus exposer directement le port de l'application.
