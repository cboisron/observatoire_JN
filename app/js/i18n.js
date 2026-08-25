(function () {
  "use strict";

  // Tous les textes visibles sont regroupés ici, d'abord en français puis en anglais.
  // Une même clé doit toujours être présente dans les deux dictionnaires.

  const dictionaries = {
    fr: {
      "brand.tagline": "Climat & territoires de demain",
      "header.eyebrow": "Observatoire",
      "header.title": "Jumeaux numériques territoriaux",
      "meta.title": "Observatoire des jumeaux numériques territoriaux",
      "meta.description": "Observatoire interactif des jumeaux numériques territoriaux",
      "a11y.skip": "Aller au contenu",
      "a11y.brand": "Cerema, climat et territoires de demain",
      "a11y.menu": "Ouvrir le menu",
      "a11y.navigation": "Navigation principale",
      "a11y.filters": "Filtres globaux",
      "a11y.closeRecord": "Fermer la fiche",
      "nav.explore": "Explorer",
      "nav.overview": "Vue d'ensemble",
      "nav.geography": "Géographie",
      "nav.maturity": "Maturité & déploiement",
      "nav.ecosystem": "Usages & écosystème",
      "nav.catalog": "Catalogue des solutions",
      "nav.quality": "Qualité des données",
      "nav.submit": "Proposer un jumeau",
      "local.title": "Données locales",
      "local.detail": "Aucun envoi vers un service externe",
      "filter.scope": "Périmètre affiché",
      "filter.result.one": "{count} solution",
      "filter.result.many": "{count} solutions",
      "filter.reset": "Réinitialiser",
      "filter.search": "Rechercher",
      "filter.searchPlaceholder": "Solution, territoire, prestataire…",
      "filter.source": "Source",
      "filter.country": "Pays",
      "filter.stage": "Statut",
      "filter.named": "Solutions nommées uniquement",
      "filter.allSources": "Toutes les sources",
      "filter.allCountries": "Tous les pays",
      "filter.allStages": "Tous les statuts",
      "stage.operational": "Opérationnelle",
      "stage.development": "En développement",
      "stage.strategy": "Stratégie / initiative",
      "stage.other": "Autre",
      "common.missing": "Non renseigné",
      "common.observation.one": "observation",
      "common.observation.many": "observations",
      "common.informed": "Renseigné",
      "common.knownValues": "valeurs connues",
      "common.source": "Source",
      "common.view": "Consulter",
      "common.previous": "Précédent",
      "common.next": "Suivant",
      "common.close": "Fermer",
      "common.statuses": "statuts",
      "common.noData": "Aucune donnée disponible.",
      "common.noFilteredData": "Aucune donnée disponible pour ce filtre.",
      "common.noField": "Aucun champ à analyser.",
      "page.scope": "Périmètre : {count} observations",
      "overview.kicker": "Pilotage",
      "overview.title": "Vue d'ensemble",
      "overview.defaultNotice": "<strong>Sélection par défaut :</strong> les {named} solutions nommées. {excluded} observations sans nom sont exclues mais restent accessibles en désactivant le filtre.",
      "overview.solutions": "Solutions affichées",
      "overview.sourceTotal": "{count} observations dans la source",
      "overview.countries": "Pays représentés",
      "overview.topCountry": "{country} arrive en tête avec {count} solutions",
      "overview.noCountry": "Aucun pays disponible",
      "overview.operational": "Plateformes opérationnelles",
      "overview.knownStatuses": "{value} sur {total} statuts renseignés",
      "overview.completeness": "Complétude moyenne",
      "overview.structuredFields": "Sur {count} champs structurants",
      "overview.deployment": "Statut de déploiement",
      "overview.deploymentSub": "Regroupement de {count} libellés sources en cinq catégories",
      "overview.decision": "Repères pour la décision",
      "overview.decisionSub": "Lecture automatique du périmètre filtré",
      "overview.statusInsight": "{percent} des statuts connus sont opérationnels",
      "overview.statusInsightSub": "Les libellés ont été regroupés sans modifier la valeur source.",
      "overview.mapInsight": "{count} observations sont positionnables",
      "overview.mapInsightSub": "Les autres restent visibles dans les analyses par pays et territoire.",
      "overview.duplicateInsight": "{count} lignes appartiennent à un groupe de doublons potentiel",
      "overview.duplicateInsightSub": "Ces lignes sont conservées en attendant une validation métier.",
      "overview.topCountries": "Pays les plus représentés",
      "overview.countryCount": "Nombre d'observations par pays",
      "overview.origins": "Origine des données",
      "overview.originsSub": "Répartition des observations affichées",
      "geo.kicker": "Territoires",
      "geo.title": "Géographie",
      "geo.missingNotice": "<strong>{count} observations sans coordonnées valides.</strong> Elles ne figurent pas sur la carte ponctuelle. Aucun géocodage ni enrichissement externe n'a été appliqué.",
      "geo.knownLocations": "Implantations connues",
      "geo.mapSub": "Frontières Natural Earth 1:110m · les marqueurs numérotés regroupent les solutions distantes de 15 km ou moins",
      "geo.byCountry": "Répartition par pays",
      "geo.byCountrySub": "Tous les pays renseignés sont comptabilisés, avec ou sans coordonnées",
      "geo.eu": "Appartenance à l'Union européenne",
      "geo.euMissing": "{count} valeurs non renseignées",
      "geo.euYes": "Union européenne",
      "geo.euNo": "Hors Union européenne",
      "geo.territories": "Types de territoires",
      "geo.territoriesSub": "Classification fournie par les différentes sources",
      "map.countryShown": "Pays représenté",
      "map.solution": "Solution",
      "map.group": "Groupe ≤ 15 km",
      "map.zoom": "Zoom {value} %",
      "map.zoomIn": "Zoomer",
      "map.zoomOut": "Dézoomer",
      "map.west": "Déplacer vers l'ouest",
      "map.east": "Déplacer vers l'est",
      "map.north": "Déplacer vers le nord",
      "map.south": "Déplacer vers le sud",
      "map.reset": "Réinitialiser la carte",
      "map.positioned": "{positioned} points positionnés sur {total} observations affichées",
      "map.clusterAria": "{count} solutions dans un rayon de 15 kilomètres",
      "map.clusterTitle": "{count} solutions regroupées dans un rayon de 15 km",
      "map.clusterPanel": "{count} solutions à proximité",
      "map.clusterHelp": "Regroupement dans un rayon de 15 km. Sélectionnez une solution pour consulter sa fiche.",
      "maturity.kicker": "Cycle de vie",
      "maturity.title": "Maturité & déploiement",
      "maturity.notice": "<strong>Couverture limitée :</strong> {maturity} niveaux de maturité sont renseignés, mais seulement {duet} correspondent clairement aux libellés DUET attendus. Le type de jumeau n'est disponible que pour {twin} observations.",
      "maturity.statusKnown": "Statut renseigné",
      "maturity.levelKnown": "Maturité renseignée",
      "maturity.missingValues": "{count} valeurs manquantes",
      "maturity.duet": "Libellé DUET plausible",
      "maturity.duetSub": "Valeurs prédictives ou expérimentales",
      "maturity.twinKnown": "Type de jumeau renseigné",
      "maturity.grouped": "Statuts regroupés",
      "maturity.groupedSub": "Lecture consolidée des libellés de développement",
      "maturity.levels": "Niveaux de maturité — valeurs sources",
      "maturity.levelsSub": "Les valeurs atypiques sont volontairement visibles",
      "maturity.twins": "Types de jumeaux",
      "maturity.twinsSub": "Valeurs disponibles sans extrapolation",
      "eco.kicker": "Capacités",
      "eco.title": "Usages & écosystème",
      "eco.notice": "<strong>Règles de calcul :</strong> les cellules multivaluées sont séparées avant comptage. Les années manifestes et « Not specified » sont exclues des technologies. Les domaines consolidés sont renseignés pour {count} observations dans le périmètre affiché.",
      "eco.technologies": "Technologies les plus citées",
      "eco.technologiesSub": "Comptage des termes séparés dans les cellules sources",
      "eco.findings": "Principaux constats",
      "eco.findingsSub": "Lecture synthétique des données disponibles",
      "eco.techCount": "{count} technologies ou caractéristiques distinctes",
      "eco.techCountSub": "Après exclusion des années manifestes et de « Not specified ».",
      "eco.userCount": "{count} types d'utilisateurs cités",
      "eco.userCountSub": "Les variantes de langue et de casse restent distinctes.",
      "eco.providerCount": "{count} prestataires ou libellés de consortium",
      "eco.providerCountSub": "Les organisations sont comptées telles qu'elles apparaissent dans la source.",
      "eco.users": "Types d'utilisateurs",
      "eco.usersSub": "Publics et acteurs mentionnés dans la source",
      "eco.providers": "Prestataires et consortiums",
      "eco.providersSub": "Les organisations composées peuvent apparaître sous plusieurs formes",
      "eco.domains": "Domaines d'usage consolidés",
      "eco.domainsSub": "Disponibilité de l'information et classement des domaines cités",
      "eco.availability": "Disponibilité du champ",
      "eco.domainRanking": "Domaines les plus mentionnés",
      "eco.domainEmpty": "Aucun domaine consolidé pour ce filtre.",
      "catalog.kicker": "Répertoire",
      "catalog.title": "Catalogue des solutions",
      "catalog.solutions": "Solutions et territoires",
      "catalog.sub": "La qualité correspond à la complétude de {count} champs structurants",
      "catalog.solution": "Solution",
      "catalog.location": "Pays / territoire",
      "catalog.status": "Statut",
      "catalog.provider": "Prestataire",
      "catalog.quality": "Qualité",
      "catalog.sheet": "Fiche",
      "catalog.unnamed": "Solution non nommée",
      "catalog.duplicate": "Doublon potentiel ({count})",
      "catalog.empty": "Aucune solution ne correspond aux filtres actifs.",
      "quality.kicker": "Transparence",
      "quality.title": "Qualité des données",
      "quality.notice": "<strong>Calcul de la qualité :</strong> le score est recalculé sur la présence d'une valeur dans {count} champs structurants. Il mesure la complétude, pas l'exactitude du contenu.",
      "quality.average": "Complétude moyenne",
      "quality.low": "Complétude faible",
      "quality.lowSub": "Observations sous le seuil de 50 %",
      "quality.duplicates": "Doublons potentiels",
      "quality.duplicatesSub": "Groupes visibles dans le périmètre filtré",
      "quality.invalidCoords": "Coordonnées invalides",
      "quality.invalidCoordsSub": "Valeur présente mais non positionnable",
      "quality.byField": "Complétude par champ",
      "quality.byFieldSub": "Calculée sur le périmètre actuellement filtré",
      "quality.bySource": "Qualité moyenne par source",
      "quality.bySourceSub": "Score moyen de complétude des observations",
      "quality.shown": "{count} observations affichées",
      "quality.importDiagnostics": "Diagnostic calculé à l'import",
      "quality.importDiagnosticsSub": "Mesures portant sur la feuille Observatoire complète, indépendamment des filtres",
      "quality.physicalRows": "{count} lignes physiques analysées",
      "quality.physicalRowsSub": "Nombre de lignes situées sous l'en-tête dans la plage utilisée.",
      "quality.emptyRowsCalculated": "{count} lignes physiquement vides",
      "quality.emptyRowsCalculatedSub": "Lignes sans aucune valeur dans la plage utilisée.",
      "quality.excludedRows": "{count} lignes hors observations",
      "quality.excludedRowsSub": "Lignes contenant uniquement une provenance, exclues automatiquement des analyses.",
      "quality.stageLabels": "{count} libellés de statut distincts",
      "quality.stageLabelsSub": "Valeurs sources non vides avant regroupement analytique.",
      "quality.exactDuplicates": "Doublons exacts potentiels",
      "quality.exactDuplicatesSub": "Même nom après normalisation de la casse et des espaces",
      "quality.noDuplicates": "Aucun groupe de doublons dans le périmètre filtré.",
      "form.kicker": "Contribution",
      "form.title": "Renseigner un jumeau numérique",
      "form.checking": "Vérification du service d'enregistrement local…",
      "form.readyOne": "<strong>Enregistrement local prêt.</strong> 1 contribution dans le fichier {file}.",
      "form.readyMany": "<strong>Enregistrement local prêt.</strong> {count} contributions dans le fichier {file}.",
      "form.unavailable": "<strong>Enregistrement indisponible.</strong> Ouvrez le dashboard avec ouvrir_dashboard.bat pour pouvoir ajouter une ligne au fichier Excel.",
      "form.invalidWorkbook": "<strong>Fichier de contributions incompatible.</strong> Le fichier saisies_jumeaux_numeriques.xlsx existant n'a pas la structure attendue et ne sera pas écrasé.",
      "form.success": "<strong>Contribution {id} enregistrée.</strong> Elle a été ajoutée au fichier {file}.",
      "form.error": "<strong>Échec de l'enregistrement.</strong> Vérifiez les champs puis assurez-vous que le fichier Excel n'est pas ouvert dans une autre application.",
      "form.rateLimited": "<strong>Trop d'envois rapprochés.</strong> Attendez quelques minutes avant de réessayer.",
      "form.required": "Champ obligatoire",
      "form.requiredHelp": "* Le nom de la solution est obligatoire. Le numéro et la provenance « Formulaire observatoire » sont ajoutés automatiquement.",
      "form.choose": "Sélectionner…",
      "form.yes": "Oui",
      "form.no": "Non",
      "form.confirm": "Je confirme que les informations saisies peuvent être ajoutées au fichier local de contributions.",
      "form.submit": "Enregistrer dans Excel",
      "form.saving": "Enregistrement…",
      "form.clear": "Effacer le formulaire",
      "form.selectedOne": "{count} choix sélectionné",
      "form.selectedMany": "{count} choix sélectionnés",
      "form.filterChoices": "Filtrer les choix…",
      "form.section.project": "1. Le projet",
      "form.section.projectHelp": "Identifiez d'abord la solution, son avancement et le type de jumeau.",
      "form.section.territory": "2. Le territoire",
      "form.section.territoryHelp": "Localisez ensuite la solution et précisez l'échelle du territoire.",
      "form.section.ecosystem": "3. Écosystème technique et acteurs",
      "form.section.ecosystemHelp": "Indiquez les organisations, technologies et publics concernés.",
      "form.section.uses": "4. Usages et financement",
      "form.section.usesHelp": "Terminez par les domaines d'usage et les modes de financement.",
      "detail.kicker": "Fiche solution",
      "detail.unnamed": "Solution non nommée",
      "detail.noLocation": "Localisation non renseignée",
      "detail.completeness": "{score} % de complétude",
      "detail.duplicate": "Doublon potentiel × {count}",
      "detail.noCoordinates": "<strong>Localisation ponctuelle indisponible :</strong> les coordonnées sont absentes ou invalides dans la source.",
      "detail.missing": "! Non renseigné dans la source",
      "footer.generated": "Export généré le {date}",
      "qualityBand.good": "Bonne complétude",
      "qualityBand.medium": "Complétude moyenne",
      "qualityBand.low": "Complétude faible",
      "field.solutionName": "Nom de la solution",
      "field.developmentStage": "Statut de développement"
      ,"field.country": "Pays"
      ,"field.geographicScope": "Périmètre géographique"
      ,"field.territoryClassification": "Type de territoire"
      ,"field.providers": "Prestataire ou consortium"
      ,"field.projectReference": "Référence du projet"
      ,"field.technologies": "Technologies"
      ,"field.userTypes": "Types d'utilisateurs"
      ,"field.fundingSources": "Sources de financement"
      ,"field.maturityLevel": "Niveau de maturité"
      ,"field.useCaseDomains": "Domaines d'usage"
      ,"field.standards": "Normes et standardisation"
      ,"field.targets": "Objectifs"
      ,"field.creationDate": "Date de création (valeur source)"
      ,"field.twinType": "Type de jumeau"
      ,"field.dataModelsPublication": "Publication des modèles de données"
      ,"field.dataPublication": "Publication des données"
      ,"field.frenchPlaceName": "Nom français du lieu"
      ,"field.latitude": "Latitude"
      ,"field.longitude": "Longitude"
      ,"field.inEu": "Dans l'Union européenne"
      ,"field.domainMobility": "Mobilité urbaine et trafic"
      ,"field.domainPlanning": "Planification urbaine et infrastructures"
      ,"field.domainEnvironment": "Environnement, durabilité et résilience"
      ,"field.domainEnergy": "Gestion de l'énergie"
      ,"field.domainEngagement": "Participation citoyenne"
      ,"field.domainWater": "Gestion de l'eau"
      ,"field.domainLogistics": "Logistique urbaine"
      ,"field.totalDomains": "Nombre total de domaines"
      ,"field.dataSource": "Provenance des données"
      ,"field.formSolutionName": "Quel est le nom de votre solution ?"
      ,"field.formDevelopmentStage": "Quel est le stade de développement de votre plateforme ?"
      ,"field.formTwinType": "Quel est le type de jumeau numérique ?"
      ,"field.formCountry": "Dans quel pays se situe la solution ?"
      ,"field.formGeographicScope": "Quel territoire est concerné ?"
      ,"field.formTerritoryClassification": "À quelle catégorie appartient ce territoire ?"
      ,"field.formInEu": "Le territoire se situe-t-il dans l'Union européenne ?"
      ,"field.formProviders": "Quels prestataires ou membres du consortium participent au projet ?"
      ,"field.formTechnologies": "Quelles technologies ou caractéristiques sont utilisées ?"
      ,"field.formUserTypes": "Quels types d'utilisateurs sont concernés ?"
      ,"field.formUseCaseDomains": "Quels sont les domaines d'usage ?"
      ,"field.formFundingSources": "Quelles sont les sources de financement ?"
    },
    en: {
      "brand.tagline": "Climate & regions: the future",
      "header.eyebrow": "Observatory",
      "header.title": "Local digital twins",
      "meta.title": "Local digital twins observatory",
      "meta.description": "Interactive observatory of local digital twins",
      "a11y.skip": "Skip to content",
      "a11y.brand": "Cerema, climate and regions: the future",
      "a11y.menu": "Open menu",
      "a11y.navigation": "Main navigation",
      "a11y.filters": "Global filters",
      "a11y.closeRecord": "Close record",
      "nav.explore": "Explore",
      "nav.overview": "Overview",
      "nav.geography": "Geography",
      "nav.maturity": "Maturity & deployment",
      "nav.ecosystem": "Uses & ecosystem",
      "nav.catalog": "Solutions catalogue",
      "nav.quality": "Data quality",
      "nav.submit": "Submit a digital twin",
      "local.title": "Local data",
      "local.detail": "No data sent to an external service",
      "filter.scope": "Displayed scope",
      "filter.result.one": "{count} solution",
      "filter.result.many": "{count} solutions",
      "filter.reset": "Reset",
      "filter.search": "Search",
      "filter.searchPlaceholder": "Solution, territory, provider…",
      "filter.source": "Source",
      "filter.country": "Country",
      "filter.stage": "Status",
      "filter.named": "Named solutions only",
      "filter.allSources": "All sources",
      "filter.allCountries": "All countries",
      "filter.allStages": "All statuses",
      "stage.operational": "Operational",
      "stage.development": "Under development",
      "stage.strategy": "Strategy / initiative",
      "stage.other": "Other",
      "common.missing": "Not provided",
      "common.observation.one": "observation",
      "common.observation.many": "observations",
      "common.informed": "Provided",
      "common.knownValues": "known values",
      "common.source": "Source",
      "common.view": "View",
      "common.previous": "Previous",
      "common.next": "Next",
      "common.close": "Close",
      "common.statuses": "statuses",
      "common.noData": "No data available.",
      "common.noFilteredData": "No data available for this filter.",
      "common.noField": "No field to analyse.",
      "page.scope": "Scope: {count} observations",
      "overview.kicker": "Steering",
      "overview.title": "Overview",
      "overview.defaultNotice": "<strong>Default selection:</strong> {named} named solutions. {excluded} unnamed observations are excluded but remain accessible by disabling the filter.",
      "overview.solutions": "Displayed solutions",
      "overview.sourceTotal": "{count} observations in the source",
      "overview.countries": "Countries represented",
      "overview.topCountry": "{country} ranks first with {count} solutions",
      "overview.noCountry": "No country available",
      "overview.operational": "Operational platforms",
      "overview.knownStatuses": "{value} of {total} provided statuses",
      "overview.completeness": "Average completeness",
      "overview.structuredFields": "Across {count} key fields",
      "overview.deployment": "Deployment status",
      "overview.deploymentSub": "{count} source labels grouped into five categories",
      "overview.decision": "Decision-making highlights",
      "overview.decisionSub": "Automated reading of the filtered scope",
      "overview.statusInsight": "{percent} of known statuses are operational",
      "overview.statusInsightSub": "Labels were grouped without altering the source value.",
      "overview.mapInsight": "{count} observations can be positioned",
      "overview.mapInsightSub": "The others remain visible in country and territory analyses.",
      "overview.duplicateInsight": "{count} rows belong to a potential duplicate group",
      "overview.duplicateInsightSub": "These rows are retained pending business validation.",
      "overview.topCountries": "Most represented countries",
      "overview.countryCount": "Number of observations by country",
      "overview.origins": "Data origins",
      "overview.originsSub": "Distribution of displayed observations",
      "geo.kicker": "Territories",
      "geo.title": "Geography",
      "geo.missingNotice": "<strong>{count} observations have no valid coordinates.</strong> They are not shown on the point map. No geocoding or external enrichment was applied.",
      "geo.knownLocations": "Known locations",
      "geo.mapSub": "Natural Earth 1:110m boundaries · numbered markers group solutions within 15 km",
      "geo.byCountry": "Distribution by country",
      "geo.byCountrySub": "All provided countries are counted, with or without coordinates",
      "geo.eu": "European Union membership",
      "geo.euMissing": "{count} values not provided",
      "geo.euYes": "European Union",
      "geo.euNo": "Outside the European Union",
      "geo.territories": "Territory types",
      "geo.territoriesSub": "Classification supplied by the different sources",
      "map.countryShown": "Country represented",
      "map.solution": "Solution",
      "map.group": "Group ≤ 15 km",
      "map.zoom": "Zoom {value}%",
      "map.zoomIn": "Zoom in",
      "map.zoomOut": "Zoom out",
      "map.west": "Move west",
      "map.east": "Move east",
      "map.north": "Move north",
      "map.south": "Move south",
      "map.reset": "Reset map",
      "map.positioned": "{positioned} points positioned out of {total} displayed observations",
      "map.clusterAria": "{count} solutions within 15 kilometres",
      "map.clusterTitle": "{count} solutions grouped within 15 km",
      "map.clusterPanel": "{count} nearby solutions",
      "map.clusterHelp": "Grouped within a 15 km radius. Select a solution to open its record.",
      "maturity.kicker": "Life cycle",
      "maturity.title": "Maturity & deployment",
      "maturity.notice": "<strong>Limited coverage:</strong> {maturity} maturity levels are provided, but only {duet} clearly match expected DUET labels. Twin type is available for only {twin} observations.",
      "maturity.statusKnown": "Status provided",
      "maturity.levelKnown": "Maturity provided",
      "maturity.missingValues": "{count} missing values",
      "maturity.duet": "Plausible DUET label",
      "maturity.duetSub": "Predictive or experimental values",
      "maturity.twinKnown": "Twin type provided",
      "maturity.grouped": "Grouped statuses",
      "maturity.groupedSub": "Consolidated view of development labels",
      "maturity.levels": "Maturity levels — source values",
      "maturity.levelsSub": "Atypical values are intentionally visible",
      "maturity.twins": "Twin types",
      "maturity.twinsSub": "Available values without extrapolation",
      "eco.kicker": "Capabilities",
      "eco.title": "Uses & ecosystem",
      "eco.notice": "<strong>Calculation rules:</strong> multi-value cells are split before counting. Obvious years and 'Not specified' are excluded from technologies. Consolidated domains are provided for {count} observations in the displayed scope.",
      "eco.technologies": "Most cited technologies",
      "eco.technologiesSub": "Count of terms separated within source cells",
      "eco.findings": "Key findings",
      "eco.findingsSub": "Summary of available data",
      "eco.techCount": "{count} distinct technologies or characteristics",
      "eco.techCountSub": "After excluding obvious years and 'Not specified'.",
      "eco.userCount": "{count} cited user types",
      "eco.userCountSub": "Language and case variants remain separate.",
      "eco.providerCount": "{count} provider or consortium labels",
      "eco.providerCountSub": "Organisations are counted as they appear in the source.",
      "eco.users": "User types",
      "eco.usersSub": "Audiences and stakeholders mentioned in the source",
      "eco.providers": "Providers and consortiums",
      "eco.providersSub": "Composite organisations may appear in several forms",
      "eco.domains": "Consolidated use domains",
      "eco.domainsSub": "Information availability and ranking of cited domains",
      "eco.availability": "Field availability",
      "eco.domainRanking": "Most mentioned domains",
      "eco.domainEmpty": "No consolidated domain for this filter.",
      "catalog.kicker": "Directory",
      "catalog.title": "Solutions catalogue",
      "catalog.solutions": "Solutions and territories",
      "catalog.sub": "Quality represents completeness across {count} key fields",
      "catalog.solution": "Solution",
      "catalog.location": "Country / territory",
      "catalog.status": "Status",
      "catalog.provider": "Provider",
      "catalog.quality": "Quality",
      "catalog.sheet": "Record",
      "catalog.unnamed": "Unnamed solution",
      "catalog.duplicate": "Potential duplicate ({count})",
      "catalog.empty": "No solution matches the active filters.",
      "quality.kicker": "Transparency",
      "quality.title": "Data quality",
      "quality.notice": "<strong>Quality calculation:</strong> the score is recalculated from the presence of a value across {count} key fields. It measures completeness, not content accuracy.",
      "quality.average": "Average completeness",
      "quality.low": "Low completeness",
      "quality.lowSub": "Observations below the 50% threshold",
      "quality.duplicates": "Potential duplicates",
      "quality.duplicatesSub": "Groups visible within the filtered scope",
      "quality.invalidCoords": "Invalid coordinates",
      "quality.invalidCoordsSub": "Value present but cannot be positioned",
      "quality.byField": "Completeness by field",
      "quality.byFieldSub": "Calculated over the currently filtered scope",
      "quality.bySource": "Average quality by source",
      "quality.bySourceSub": "Average observation completeness score",
      "quality.shown": "{count} displayed observations",
      "quality.importDiagnostics": "Diagnostics calculated at import",
      "quality.importDiagnosticsSub": "Measures for the full Observatory sheet, independently of filters",
      "quality.physicalRows": "{count} physical rows analysed",
      "quality.physicalRowsSub": "Number of rows below the header in the used range.",
      "quality.emptyRowsCalculated": "{count} physically empty rows",
      "quality.emptyRowsCalculatedSub": "Rows containing no value in the used range.",
      "quality.excludedRows": "{count} non-observation rows",
      "quality.excludedRowsSub": "Rows containing only a source value and automatically excluded from analyses.",
      "quality.stageLabels": "{count} distinct status labels",
      "quality.stageLabelsSub": "Non-empty source values before analytical grouping.",
      "quality.exactDuplicates": "Potential exact duplicates",
      "quality.exactDuplicatesSub": "Same name after normalising case and spaces",
      "quality.noDuplicates": "No duplicate group within the filtered scope.",
      "form.kicker": "Contribution",
      "form.title": "Submit a digital twin",
      "form.checking": "Checking the local recording service…",
      "form.readyOne": "<strong>Local recording is ready.</strong> 1 contribution in {file}.",
      "form.readyMany": "<strong>Local recording is ready.</strong> {count} contributions in {file}.",
      "form.unavailable": "<strong>Recording unavailable.</strong> Open the dashboard with ouvrir_dashboard.bat to add a row to the Excel file.",
      "form.invalidWorkbook": "<strong>Incompatible contributions file.</strong> The existing saisies_jumeaux_numeriques.xlsx file does not have the expected structure and will not be overwritten.",
      "form.success": "<strong>Contribution {id} saved.</strong> It was added to {file}.",
      "form.error": "<strong>Unable to save.</strong> Check the fields and make sure the Excel file is not open in another application.",
      "form.rateLimited": "<strong>Too many submissions.</strong> Wait a few minutes before trying again.",
      "form.required": "Required field",
      "form.requiredHelp": "* The solution name is required. The number and “Observatory form” source are added automatically.",
      "form.choose": "Select…",
      "form.yes": "Yes",
      "form.no": "No",
      "form.confirm": "I confirm that the information entered may be added to the local contributions file.",
      "form.submit": "Save to Excel",
      "form.saving": "Saving…",
      "form.clear": "Clear form",
      "form.selectedOne": "{count} selected choice",
      "form.selectedMany": "{count} selected choices",
      "form.filterChoices": "Filter choices…",
      "form.section.project": "1. The project",
      "form.section.projectHelp": "Start by identifying the solution, its progress and the type of twin.",
      "form.section.territory": "2. Territory",
      "form.section.territoryHelp": "Then locate the solution and specify the territorial scale.",
      "form.section.ecosystem": "3. Technical ecosystem and stakeholders",
      "form.section.ecosystemHelp": "Indicate the organisations, technologies and audiences involved.",
      "form.section.uses": "4. Uses and funding",
      "form.section.usesHelp": "Finish with the use domains and funding sources.",
      "detail.kicker": "Solution record",
      "detail.unnamed": "Unnamed solution",
      "detail.noLocation": "Location not provided",
      "detail.completeness": "{score}% complete",
      "detail.duplicate": "Potential duplicate × {count}",
      "detail.noCoordinates": "<strong>Point location unavailable:</strong> coordinates are missing or invalid in the source.",
      "detail.missing": "! Not provided in the source",
      "footer.generated": "Export generated on {date}",
      "qualityBand.good": "Good completeness",
      "qualityBand.medium": "Medium completeness",
      "qualityBand.low": "Low completeness",
      "field.solutionName": "Solution name",
      "field.developmentStage": "Development status"
      ,"field.country": "Country"
      ,"field.geographicScope": "Geographic scope"
      ,"field.territoryClassification": "Territory type"
      ,"field.providers": "Provider or consortium"
      ,"field.projectReference": "Project reference"
      ,"field.technologies": "Technologies"
      ,"field.userTypes": "User types"
      ,"field.fundingSources": "Funding sources"
      ,"field.maturityLevel": "Maturity level"
      ,"field.useCaseDomains": "Use domains"
      ,"field.standards": "Standards and standardisation"
      ,"field.targets": "Objectives"
      ,"field.creationDate": "Creation date (source value)"
      ,"field.twinType": "Twin type"
      ,"field.dataModelsPublication": "Data model publication"
      ,"field.dataPublication": "Data publication"
      ,"field.frenchPlaceName": "French place name"
      ,"field.latitude": "Latitude"
      ,"field.longitude": "Longitude"
      ,"field.inEu": "In the European Union"
      ,"field.domainMobility": "Urban mobility and traffic"
      ,"field.domainPlanning": "Urban planning and infrastructure"
      ,"field.domainEnvironment": "Environment, sustainability and resilience"
      ,"field.domainEnergy": "Energy management"
      ,"field.domainEngagement": "Community engagement"
      ,"field.domainWater": "Water management"
      ,"field.domainLogistics": "Urban logistics"
      ,"field.totalDomains": "Total number of domains"
      ,"field.dataSource": "Data source"
      ,"field.formSolutionName": "What is the name of your solution?"
      ,"field.formDevelopmentStage": "What is your platform's development stage?"
      ,"field.formTwinType": "What type of digital twin is it?"
      ,"field.formCountry": "In which country is the solution located?"
      ,"field.formGeographicScope": "Which territory is concerned?"
      ,"field.formTerritoryClassification": "Which category does this territory belong to?"
      ,"field.formInEu": "Is the territory located in the European Union?"
      ,"field.formProviders": "Which providers or consortium members are involved?"
      ,"field.formTechnologies": "Which technologies or characteristics are used?"
      ,"field.formUserTypes": "Which types of users are concerned?"
      ,"field.formUseCaseDomains": "What are the use domains?"
      ,"field.formFundingSources": "What are the funding sources?"
    }
  };

  let language;
  try {
    const requestedLanguage = new URLSearchParams(window.location.search).get("lang");
    language = dictionaries[requestedLanguage] ? requestedLanguage : localStorage.getItem("observatory-language");
  } catch (_) {
    language = null;
  }
  if (!dictionaries[language]) language = "fr";

  function t(key, parameters = {}) {
    const template = dictionaries[language][key] ?? dictionaries.fr[key] ?? key;
    return Object.entries(parameters).reduce(
      (result, [name, value]) => result.replaceAll(`{${name}}`, String(value)),
      template
    );
  }

  function setLanguage(nextLanguage) {
    if (!dictionaries[nextLanguage] || nextLanguage === language) return;
    language = nextLanguage;
    document.documentElement.lang = language;
    try {
      localStorage.setItem("observatory-language", language);
    } catch (_) {}
    window.dispatchEvent(new CustomEvent("languagechange", { detail: { language } }));
  }

  function getLanguage() {
    return language;
  }

  document.documentElement.lang = language;
  window.I18n = { getLanguage, setLanguage, t };
})();
