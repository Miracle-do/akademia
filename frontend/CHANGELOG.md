# Journal des changements d'Akademia

Format : `MAJEUR.MINEUR.CORRECTIF`. MAJEUR = refonte ou changement qui casse quelque chose ; MINEUR = nouveauté visible (module, formation, fonctionnalité) ; CORRECTIF = correction ou retouche de contenu.
Les nouveautés en cours s'écrivent sous « Non publié » ; la commande `npm run release -- minor` les range sous un nouveau numéro.

## [Non publié]

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
