# Diagnostic de qualité des données

La source utilisée en production est `data/source/benchmark_from_mapping_pdf.xlsx` sur la VM. Elle rassemble des observations sur des plateformes et projets de jumeaux numériques locaux.

Ce document décrit l'état actuel des données avant leur utilisation dans un dashboard. Les nombres ci-dessous proviennent d'une lecture du classeur au 24 août 2026. Aucun nettoyage n'a encore été appliqué au fichier source.

## Accéder au dashboard

L'application est déployée uniquement avec Docker Compose sur la VM Debian. Elle est actuellement accessible à l'adresse `http://217.182.210.146:8088`.

À chaque démarrage du conteneur, le classeur monté depuis `data/source` est relu et `app/data/dashboard-data.js` est généré dans le conteneur. Les indicateurs, graphiques, constats synthétiques, scores de complétude et diagnostics d'import sont donc recalculés depuis la source présente sur la VM.

L'application n'a pas de mode de lancement local : l'ouverture directe de `app/index.html` et l'exécution directe du serveur Python ne sont pas prises en charge. Par défaut, l'interface présente les 197 solutions nommées. Le filtre correspondant peut être désactivé pour consulter les 199 observations analytiques.

L'interface est disponible en français et en anglais grâce au sélecteur `FR / EN` placé dans l'en-tête. Le choix est mémorisé dans le navigateur. Seuls les libellés de l'interface, les explications et les catégories consolidées sont traduits : les noms, descriptions et autres valeurs provenant du classeur restent strictement identiques à la source. Une version peut aussi être ouverte directement avec `?lang=fr` ou `?lang=en` dans l'adresse.

Les vues disponibles sont :

- vue d'ensemble ;
- géographie ;
- maturité et déploiement ;
- usages et écosystème ;
- catalogue des solutions ;
- qualité des données ;
- proposition d'un jumeau numérique.

### Formulaire de contribution

L'onglet **Proposer un jumeau** reprend uniquement les 14 colonnes visibles de la feuille `Observatoire`. Le formulaire contient 12 questions organisées en quatre étapes : projet, territoire, écosystème, puis usages et financement. Les colonnes `#` et `where_data_from` ne sont pas demandées à l'utilisateur.

Le nom de la solution est obligatoire. Les listes et choix multiples reprennent les validations et référentiels du classeur source. `#` est incrémenté automatiquement et `where_data_from` reçoit la valeur `Formulaire observatoire`.

Chaque validation ajoute une ligne au fichier `saisies_jumeaux_numeriques.xlsx`, créé lors de la première contribution. Ce fichier conserve exactement les 14 en-têtes visibles de `Observatoire`, dans le même ordre. Les lignes sont ajoutées de manière incrémentale et le fichier source `benchmark_from_mapping_pdf.xlsx` n'est jamais modifié.

Le fichier de contributions est distinct des données affichées par le dashboard : une saisie n'entre donc pas automatiquement dans les statistiques existantes. Après validation métier, ses colonnes peuvent être reportées directement dans les colonnes de même nom de `Observatoire` ; les colonnes masquées restent vides.

### Organisation du code

Le guide court pour l'exploitation courante est disponible dans [`README_MAINTENANCE.md`](./README_MAINTENANCE.md).

| Fichier | Rôle |
|---|---|
| `app/index.html` | Structure générale de l'interface |
| `app/assets/styles.css` | Mise en page, palette et adaptation mobile |
| `app/js/data-utils.js` | Fonctions de comptage, formatage et qualité |
| `app/js/i18n.js` | Traductions françaises et anglaises de l'interface |
| `app/js/charts.js` | Composants graphiques sans bibliothèque externe |
| `app/js/ui-components.js` | Petits composants HTML communs : cartes, KPI et messages |
| `app/js/dashboard-pages.js` | Calculs et affichage des six pages d'analyse |
| `app/js/submission-form.js` | Questions, affichage et envoi du formulaire |
| `app/js/record-interactions.js` | Fiche détaillée, groupes de points et zoom de la carte |
| `app/js/app.js` | Démarrage, état courant, navigation, filtres et événements |
| `app/data/dashboard-data.js` | Export généré dans le conteneur au démarrage |
| `app/data/world-countries.js` | Fond de carte mondial embarqué |
| `scripts/extract_dashboard_data.py` | Extraction reproductible des données XLSX |
| `scripts/build_world_map.py` | Préparation reproductible du fond de carte |
| `scripts/serve_dashboard.py` | Serveur Docker et ajout incrémental des contributions dans Excel |

### Guide de maintenance du code

Le projet utilise uniquement du HTML, du CSS, du JavaScript classique et la bibliothèque standard Python. Il n'y a ni framework, ni commande de compilation, ni dépendance à installer. Les fichiers JavaScript sont chargés dans un ordre lisible à la fin de `app/index.html`.

Pour une modification courante :

| Besoin | Fichier à modifier |
|---|---|
| Changer une couleur, un espacement ou la disposition mobile | `app/assets/styles.css` |
| Changer un texte français ou anglais | `app/js/i18n.js` |
| Modifier un graphique générique | `app/js/charts.js` |
| Modifier le contenu ou le calcul d'une page d'analyse | `app/js/dashboard-pages.js` |
| Modifier une question du formulaire | `FORM_SECTIONS` dans `app/js/submission-form.js` |
| Modifier les champs de la fiche d'une solution | `DETAIL_FIELDS` dans `app/js/record-interactions.js` |
| Ajouter un filtre ou une page dans le menu | `app/js/app.js` |
| Modifier la correspondance entre colonnes Excel et champs internes | `FIELD_NAMES` dans `scripts/extract_dashboard_data.py` |
| Modifier les champs du score de complétude | `QUALITY_FIELDS` dans `scripts/extract_dashboard_data.py` |
| Modifier les colonnes du fichier de contributions | `FIELDS` dans `scripts/serve_dashboard.py` |

Chaque fichier commence par un commentaire indiquant sa responsabilité. Les données générées dans `app/data` ne doivent pas être corrigées manuellement : toute correction durable doit être faite dans le classeur source ou dans le script d'extraction, puis régénérée.

L'actualisation est automatique au démarrage du conteneur. Après une modification de la source sur la VM :

```bash
docker compose restart observatoire
docker compose logs --tail=50 observatoire
```

Le script d'extraction n'utilise que la bibliothèque standard Python et ne modifie jamais le fichier Excel source.

Le fond de carte des pays provient de **Natural Earth, Admin 0 – Countries, échelle 1:110m**. Il est embarqué localement afin que la carte reste disponible sans connexion internet. Natural Earth représente par défaut les frontières de fait ; cette couche est utilisée uniquement comme fond de repérage et ne modifie aucune donnée du classeur.

La carte peut être agrandie jusqu'à 800 %, déplacée avec ses commandes directionnelles et réinitialisée avec le bouton `1:1`. La molette permet également de zoomer autour du pointeur. Les solutions distantes de 15 km ou moins sont regroupées dans un marqueur numéroté ; un clic ouvre la liste complète des solutions concernées. Ce seuil permet notamment de regrouper Nice et Monaco.

## Résumé

Le classeur contient une base riche, mais plusieurs sources ont été assemblées avec des schémas qui ne sont pas toujours alignés. Les champs géographiques et les informations principales sur les projets sont globalement les plus fiables. Les dates, domaines d'usage, niveaux de maturité et certains champs situés vers la droite du tableau doivent être contrôlés avant visualisation.

Chiffres principaux :

| Indicateur | Valeur | Commentaire |
|---|---:|---|
| Observations analytiques | 199 | Lignes contenant autre chose qu'une simple mention de source |
| Solutions nommées | 197 | 2 observations n'ont pas de nom de solution |
| Pays renseignés | 199 | 28 pays distincts |
| Statuts renseignés | 198 | 17 libellés différents, à regrouper |
| Coordonnées valides complètes | 58 | Environ 29 % des observations |
| Prestataires renseignés | 189 | Contenu parfois multivalué dans une seule cellule |
| Technologies renseignées | 170 | Certaines valeurs sont manifestement décalées |
| Types d'utilisateurs renseignés | 169 | Casse, langue et pluriels non normalisés |
| Doublons exacts potentiels | 13 groupes | 19 lignes excédentaires si chaque groupe représente un même projet |

## Structure du classeur

Le classeur possède cinq feuilles :

- `Observatoire` : table principale de 32 colonnes ;
- `LDT providers` : référentiel de 265 prestataires ;
- `Used technologies Characterist` : référentiel de 129 technologies ou caractéristiques ;
- `Types_of_users` : référentiel de 108 types d'utilisateurs ;
- `Form Responses 3` : uniquement une ligne d'en-têtes, sans réponse.

La feuille principale combine deux ensembles de données :

| Source | Observations | Particularités |
|---|---:|---|
| `Fiware4Cities_2024` | 147 | Bonne couverture géographique, mais plusieurs champs semblent décalés |
| `images_EDT` | 52 | Fiches plus détaillées et 51 observations géolocalisées |

## Lignes vides et lignes fantômes

La dimension physique de la feuille `Observatoire` va jusqu'à la ligne 943, mais elle contient encore 742 lignes sans valeur. Ces lignes semblent provenir de cellules formatées ou anciennement utilisées.

La table Excel principale couvre les lignes 1 à 200 :

- 199 lignes contiennent une observation analytique ;
- aucune ligne vide ne coupe plus la table principale ;
- une ligne hors de la table, à la ligne 281, contient encore uniquement une valeur dans `where_data_from`.

La ligne ne contenant qu'une source n'est pas comptée comme un projet.

## Doublons potentiels

Une comparaison exacte du nom de solution, sans tenir compte de la casse ni des espaces, fait ressortir les groupes suivants :

| Nom | Occurrences |
|---|---:|
| IUDX Platform | 4 |
| IUDX (India Urban Data Exchange) | 4 |
| IUDX Urban Data Exchange | 3 |
| Yggio | 3 |
| Jumeau Numérique Immobilière 3F | 2 |
| Jumeau Numérique Merlata Bloom Milano | 2 |
| Jumeau Numérique Autoroute A63 | 2 |
| FJNTS - Filière Jumeaux Numériques de Territoires en Santé | 2 |
| Snap4City | 2 |
| [ui!] Urban Pulse | 2 |
| IUDX India Urban Data Exchange Platform | 2 |
| La Palma Smart Island Platform | 2 |
| PAIS Platform | 2 |

Ces lignes ne doivent pas être supprimées automatiquement. Un même produit peut correspondre à plusieurs villes, territoires, versions ou sources. Inversement, les différentes variantes de nom autour d'IUDX montrent que la recherche exacte sous-estime probablement les doublons sémantiques.

Une clé de rapprochement devrait combiner au minimum le nom normalisé, le pays, le territoire, le prestataire et la source.

## Valeurs manquantes

Les taux suivants sont calculés sur les 199 observations analytiques :

| Champ | Renseigné | Complétude approximative |
|---|---:|---:|
| Pays | 199 | 100 % |
| Périmètre géographique | 197 | 99 % |
| Classification territoriale | 199 | 100 % |
| Statut de développement | 198 | 99 % |
| Nom de solution | 197 | 99 % |
| Prestataire ou consortium | 189 | 95 % |
| Technologies / caractéristiques | 170 | 85 % |
| Types d'utilisateurs | 169 | 85 % |
| Sources de financement | 143 | 72 % |
| Appartenance à l'Union européenne | 146 | 73 % |
| Niveau de maturité | 57 | 29 % |
| Coordonnées valides complètes | 58 | 29 % |
| Domaines d'usage consolidés | 24 | 12 % |
| Type de jumeau | 7 | 4 % |

Les cartes par pays peuvent couvrir toutes les observations. Une carte à l'adresse ou au point près ne pourra représenter directement qu'environ un quart de la base sans géocodage complémentaire.

## Colonnes décalées ou sémantiquement incohérentes

Plusieurs valeurs ne correspondent manifestement pas au sens de leur colonne. Cela indique probablement des décalages lors de la fusion des sources.

Exemples observés :

- `longitude` contient une fois la valeur `City` ;
- `City_Community_Region_Classification` contient `SpinalCom, Videlio`, qui correspond plutôt à des prestataires ;
- `Maturity_Level_[DUET_Framework]` contient `FIWARE4Cities Ed.6`, `Gestionnaires immobiliers, équipes internes` et `Sapporo Innovation Lab` ;
- `Used_technologies / Characteristics` contient `2026` à 26 reprises, ce qui ressemble à une date de création ;
- `Creation_date` contient des valeurs telles que `Gestion immobilière, optimisation des revenus`, `AI`, `Open APIs` ou `FIWARE NGSI-LD` ;
- `Types_of_users` contient parfois `FIWARE4Cities Ed.6`, qui ressemble à une référence de source ;
- `Funding_sources` contient fréquemment `citizens`, `city administration` ou `developers`, qui sont plutôt des utilisateurs ;
- les colonnes de domaines contiennent selon les lignes du texte descriptif, `True`, ou des nombres de 0 à 6.

Ces anomalies sont trop systématiques pour être corrigées cellule par cellule sans règles propres à chaque source.

## Statuts et catégories non normalisés

La colonne de statut contient 17 libellés. Les deux principaux sont :

- `Implemented/Operating LDT Platform` : 174 observations ;
- `Planned or under development LDT Platform` : 10 observations.

Les autres valeurs utilisent des formulations comme `Operational platform`, `Operational data hub`, `Strategy` ou `Operational tourism intelligence platform`. Pour un dashboard, une catégorie normalisée devrait être ajoutée, par exemple :

- opérationnel ;
- planifié ou en développement ;
- stratégie ou initiative ;
- autre ;
- inconnu.

La valeur source doit être conservée dans une colonne séparée.

## Problèmes de normalisation

Plusieurs dimensions sont stockées comme des listes séparées par des virgules dans une seule cellule : prestataires, technologies, utilisateurs, financements et domaines d'usage. Cela empêche un comptage fiable sans transformation en tables de liaison.

On observe aussi :

- un mélange de français et d'anglais ;
- des variantes de casse : `Citizens`, `citizens`, `Chercheurs`, `chercheurs` ;
- des variantes singulier/pluriel : `Municipality`, `Municipalities` ;
- des variantes typographiques ou fautes probables : `sustainaibility`, `Smart ligthing`, `Photovolcaic`, `Cherboug`, `Contentin`, `SCNF`/`SNFC` ;
- des noms de pays et de villes dans plusieurs langues ;
- des dates au format année, texte libre, `Not specified` ou numéro de série Excel, par exemple `44896` ;
- des cellules qui mélangent plusieurs concepts dans une phrase descriptive.

## Points fiables ou prometteurs

Malgré ces limites, plusieurs dimensions sont utilisables après un nettoyage raisonnable :

- le pays est renseigné pour les 199 observations ;
- le périmètre géographique est presque complet ;
- le statut est largement renseigné et peut être regroupé ;
- la classification territoriale est disponible pour 90 % des observations ;
- les référentiels de prestataires, technologies et utilisateurs ne contiennent pas de doublons exacts ;
- la colonne `where_data_from` permet de conserver la provenance et d'appliquer des règles de nettoyage différentes par source.

## Recommandations avant création du dashboard

1. Ne jamais modifier directement les valeurs brutes : créer une table nettoyée séparée.
2. Exclure les lignes entièrement vides et la ligne ne contenant qu'une source.
3. Créer un identifiant technique stable pour chaque observation.
4. Conserver `source_value` et `clean_value` pour chaque champ corrigé important.
5. Définir des règles de réalignement différentes pour `images_EDT` et `Fiware4Cities_2024`.
6. Normaliser les statuts, pays, classifications territoriales, langues et valeurs manquantes.
7. Transformer prestataires, technologies, utilisateurs, financements et domaines en tables de liaison plusieurs-à-plusieurs.
8. Examiner manuellement les 13 groupes de doublons potentiels.
9. Ajouter un score de complétude et un indicateur de fiabilité par observation.
10. Utiliser une carte par pays pour la couverture globale et réserver la carte ponctuelle aux 58 coordonnées validées.

## Règles conseillées pour les indicateurs

Dans le futur dashboard :

- afficher le nombre d'observations et le nombre de solutions nommées comme deux indicateurs distincts ;
- toujours permettre un filtre par source ;
- signaler les valeurs inconnues au lieu de les masquer ;
- ne pas additionner directement les colonnes de domaines tant que leurs formats ne sont pas harmonisés ;
- distinguer les données observées, corrigées et enrichies ;
- afficher les doublons potentiels comme des alertes, pas comme des suppressions certaines ;
- documenter la date du dernier nettoyage et les règles appliquées.

## Conclusion

La base convient à la construction d'un observatoire exploratoire, notamment pour comparer les pays, les territoires, les statuts et les écosystèmes technologiques. Elle ne doit toutefois pas être utilisée telle quelle pour produire des statistiques fines sur la maturité, les dates ou les domaines d'usage. La première version du dashboard devra rendre visible la qualité des données et permettre de filtrer les observations selon leur source et leur niveau de complétude.
