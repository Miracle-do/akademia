# Journal des changements d'Akademia

Format : `MAJEUR.MINEUR.CORRECTIF`. MAJEUR = refonte ou changement qui casse quelque chose ; MINEUR = nouveauté visible (module, formation, fonctionnalité) ; CORRECTIF = correction ou retouche de contenu.
Les nouveautés en cours s'écrivent sous « Non publié » ; la commande `npm run release -- minor` les range sous un nouveau numéro.

## [Non publié]

## [1.15.0] — 2026-11-23

### Ajouté
- Module Bases de données Oracle (3ᵉ année) : formation « Les triggers de A à Z » (9 leçons, 15 exercices) : anatomie, 12 types et ordre d'exécution, :OLD / :NEW / WHEN, journal d'audit, règles métier, ORA-04091 et ORA-04092, gestion (USER_TRIGGERS, ENABLE/DISABLE), INSTEAD OF et trigger composé, défi final.

## [1.14.0] — 2026-11-22

### Ajouté
- Notifications : cloche dans l'en-tête, page « Notifications » (boîte de réception avec lu / non lu) et entrée dans le menu.
- Nouveau module ou nouvelle formation : annonce aux étudiants de l'année concernée (push et boîte de réception).
- Classement : en plus de « X t'a dépassé », notification quand on devient n°1 ou qu'on entre sur le podium.
- Rappels de Nimbo après 24 h sans activité, puis à 3, 7 et 14 jours, jamais la nuit, puis silence jusqu'au retour de l'étudiant.
- Route `/api/cron/tick` protégée par `CRON_SECRET`, appelée chaque heure par un workflow GitHub.

### Modifié
- L'invitation à activer les notifications ne parle plus seulement de messages.

## [1.13.0] — 2026-11-22

### Ajouté
- Module Bases de données Oracle (3ᵉ année) : trois nouvelles formations coachées.
  - « Créer sa base : DDL et contraintes » : types, CREATE TABLE, PRIMARY KEY, FOREIGN KEY, CHECK, ALTER, TRUNCATE et DROP (5 leçons, 16 exercices).
  - « Modifier les données : DML et transactions » : INSERT, UPDATE, DELETE, COMMIT, ROLLBACK, SAVEPOINT (5 leçons, 15 exercices).
  - « Les packages PL/SQL » : spécification et corps, public et privé, variables de session, surcharge (4 leçons, 5 exercices).

## [1.12.0] — 2026-11-22

### Ajouté
- Mot de passe oublié : après le clic sur le lien reçu par e-mail, une fenêtre permet de choisir le nouveau mot de passe (jusque-là, aucun écran ne le permettait).

### Modifié
- Connexion : un appareil déjà utilisé ouvre directement l'écran de connexion, sans l'écran de démarrage ni le diaporama. L'écran de démarrage se passe d'un clic.
- Mot de passe oublié : le message indique maintenant qu'un e-mail est envoyé ; l'ancien texte annonçait à tort un mot de passe par défaut.

## [1.11.0] — 2026-11-22

### Ajouté
- Accueil : carte « Pour bien démarrer » (lire un chapitre, faire un QCM, essayer une formation) pour les nouveaux utilisateurs ; elle disparaît quand les trois étapes sont faites ou après 500 XP.

## [1.10.0] — 2026-11-22

### Modifié
- Lecture d'un chapitre : sur mobile, sommaire « Dans ce chapitre » repliable (jusque-là réservé à l'ordinateur).
- Fin de QCM : boutons « Refaire un QCM », « Autres exercices » et « Retour au cours » ; le message « Bravo champion ! » n'apparaît plus quand le score est sous 50 %.

## [1.9.0] — 2026-11-22

### Modifié
- Page Formations : bloc « Reprendre où tu t'es arrêté », recherche, filtre par statut (en cours, à commencer, terminées), et cartes avec résumé, durée, nombre de leçons et barre de progression.

## [1.8.0] — 2026-11-22

### Modifié
- Page d'un module : trois onglets (Cours, S'entraîner, Formations) au lieu d'une longue page. Le cours s'ouvre par défaut ; l'onglet est conservé dans l'adresse (`?tab=`).

## [1.7.0] — 2026-11-22

### Modifié
- Navigation mobile : l'onglet « Cours » (modules) remplace « Actu », qui passe dans l'en-tête.
- Menu latéral regroupé en trois parties : Apprendre, Communauté, Mon espace.
- Accueil : les révisions à faire passent en premier, puis les modules ; Formations et Battle sont regroupées sous « Découvrir ».

### Corrigé
- Accueil : suppression du faux classement « #5 » et du faux compteur « 14 parcours » (valeurs écrites en dur).

## [1.6.0] — 2026-11-22

### Nouveautés
- Deuxième matière de 2ᵉ année : **Programmation web** (IG2) — 13 chapitres (JavaScript, PHP, formulaires, MySQL avec PDO, ReactJS, Laravel), 119 QCM, 59 cartes mémoire et 3 épreuves : le sujet réel « Session normale 2024-2025 » corrigé et 2 épreuves d'entraînement.
- Formation « Du formulaire à la base de données » (3 leçons).

## [1.5.1] — 2026-11-22

### Corrections
- Administration : les statistiques (étudiants, XP, séries, QCM, cartes) sont maintenant lues dans Supabase quand `SUPABASE_SERVICE_ROLE_KEY` est configurée sur le backend ; elles restaient à 0 car la page ne lisait qu'un fichier local.

## [1.5.0] — 2026-11-21

### Nouveautés
- Première matière de 2ᵉ année : **Bases de données** (IG2) — 14 chapitres (Merise, dépendances fonctionnelles, MCD, passage au relationnel, normalisation, algèbre relationnelle, SQL, injections et privilèges), 136 QCM, 70 cartes mémoire et 5 épreuves ENEAM corrigées (SQL exécuté pour vérification).
- Formation « Réussir les requêtes SQL d'examen » (3 leçons, 9 exercices).
- Ce module n'apparaît que pour les étudiants de 2ᵉ année.

## [1.4.0] — 2026-11-21

### Nouveautés
- Battle hebdomadaire ARI contre AIP séparée par année : chaque étudiant voit la Battle de sa 2ᵉ ou 3ᵉ année, avec son propre historique. Migration Supabase : `frontend/supabase/migration-annee.sql` (à rejouer, elle est sans danger).

## [1.3.0] — 2026-11-21

### Nouveautés
- Années d'études : à l'inscription, l'étudiant choisit sa 2ᵉ ou 3ᵉ année, puis sa filière. Les modules, la recherche, les formations et les résultats suivent son année ; les modules des autres années apparaissent verrouillés (accès payant à venir).
- Classement par année (ARI et AIP mélangés) avec un sélecteur pour consulter l'autre année.
- Profil : l'année est modifiable (passage de 2ᵉ en 3ᵉ année), la filière reste verrouillée.
- Les comptes et modules existants passent en 3ᵉ année. Migration Supabase à exécuter : `frontend/supabase/migration-annee.sql`.

## [1.2.0] — 2026-11-20

### Nouveautés
- Réseaux avancés : formation « Bilan de liaison et calculs radio » (5 leçons : dBm, FSPL, bilan de liaison, Fresnel, pointage).

## [1.1.0] — 2026-11-20

### Nouveautés
- Réseaux avancés : nouvelle « Partie 5 · Réseaux sans fil » (7 chapitres : radio et dBm, architecture Wi-Fi, normes 802.11 Wi-Fi 4 à 7, sous-couche MAC, conception WLAN, sécurité WPA3/802.1X, liaisons longue distance), 168 QCM, 56 cartes mémoire et 3 épreuves corrigées.
- IoT : formations « Choisir une technologie réseau », « Concevoir une solution IoT complète » et « Sécurité IoT ».

## [1.0.0] — 2026-11-20

Première version numérotée : état de la plateforme au 20 novembre 2026.

### Nouveautés
- Modules de cours : Internet des Objets (14 chapitres, 609 QCM), Cryptographie et sécurité informatique (30 chapitres, 120 QCM, 100 cartes, 4 épreuves), Réseaux avancés, Intelligence Artificielle, Administration Linux, Bases de données Oracle, Java SE et POO.
- Formations interactives avec exercices corrigés, indices et prérequis cliquables (réseaux, Linux, SQL Oracle, IA, IoT).
- Recherche plein texte dans les cours (`/` ou Ctrl+K).
- Mode hors ligne : précache de toutes les pages, chapitres, QCM et formations.
- Application installable (PWA) avec notifications push et compteur de messages non lus.
- Bandeau « Nouvelle version disponible » avec bouton Actualiser.
- Duels hebdomadaires, avatars personnalisés, thèmes ARI et AIP.

### Sécurité
- Administration protégée par mot de passe, limites de débit, en-têtes de sécurité, CORS configurable.
