# Maintenance technique

Pour l'installation sur une VM, voir `DEPLOIEMENT_DOCKER.md`.

## Démarrer et actualiser

Double-cliquer sur `ouvrir_dashboard.bat`.

À chaque lancement, le script `scripts/extract_dashboard_data.py` relit `benchmark_from_mapping_pdf.xlsx`, recalcule les indicateurs et remplace `app/data/dashboard-data.js`.

## Ajouter des données à l'observatoire

1. Fermer le dashboard et ouvrir `benchmark_from_mapping_pdf.xlsx`.
2. Ajouter les observations dans la feuille `Observatoire`, sans renommer les colonnes ni les feuilles.
3. Enregistrer et fermer Excel.
4. Relancer `ouvrir_dashboard.bat`.

Les nouvelles lignes, valeurs et entrées ajoutées aux feuilles de référentiels sont lues automatiquement. Pour ajouter un choix au formulaire, modifier la liste ou la validation correspondante dans le classeur.

## Traiter les réponses du formulaire

Le formulaire ajoute les réponses dans `saisies_jumeaux_numeriques.xlsx`. Ce fichier est séparé de la source et n'alimente pas directement les statistiques.

Pour publier une contribution :

1. contrôler et valider sa ligne dans `saisies_jumeaux_numeriques.xlsx` ;
2. reporter les valeurs compatibles dans une nouvelle ligne de la feuille `Observatoire` ;
3. compléter les champs nécessaires, notamment la provenance ;
4. relancer `ouvrir_dashboard.bat`.

Cette étape reste manuelle car les 9 questions du formulaire ne correspondent pas directement aux 32 colonnes de `Observatoire`.

## Fichiers principaux

| Besoin | Fichier |
|---|---|
| Données sources | `benchmark_from_mapping_pdf.xlsx` |
| Import et calculs | `scripts/extract_dashboard_data.py` |
| Pages et indicateurs | `app/js/dashboard-pages.js` |
| Formulaire | `app/js/submission-form.js` |
| Traductions | `app/js/i18n.js` |
| Mise en page | `app/assets/styles.css` |
| Serveur et fichier de réponses | `scripts/serve_dashboard.py` |

Ne jamais modifier manuellement les fichiers du dossier `app/data` : ils sont générés automatiquement.
