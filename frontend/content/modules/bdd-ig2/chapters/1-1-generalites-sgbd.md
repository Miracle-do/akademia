## 1.1.1 Pourquoi une base de données ?

Avant les bases de données, chaque application gardait ses données dans ses **propres fichiers**. Ce mode de stockage pose des problèmes bien connus :

| Problème | Explication |
|---|---|
| **Redondance** | La même information (le nom d'un client) est recopiée dans plusieurs fichiers. |
| **Incohérence** | On corrige l'adresse dans un fichier, pas dans l'autre : les deux versions divergent. |
| **Dépendance programme/données** | Changer la structure d'un fichier oblige à réécrire les programmes qui le lisent. |
| **Partage difficile** | Deux utilisateurs qui modifient le même fichier en même temps s'écrasent mutuellement. |
| **Sécurité faible** | Les droits d'accès se gèrent au niveau du système de fichiers, pas de la donnée. |

## 1.1.2 Définition d'une base de données

Une **base de données (BD)** est un ensemble de données **structurées**, **non redondantes**, **exhaustives** (elles couvrent tout le domaine à gérer) et **persistantes** (elles survivent à l'arrêt des programmes), stockées de façon à être utilisées par plusieurs applications et plusieurs utilisateurs.

:::retenir Les quatre qualités d'une BD
Exhaustive · non redondante · structurée · persistante. Une question classique d'examen demande de les citer ou de reconnaître celle qui manque.
:::

**Avantages** : intégrité et cohérence des données, partage entre utilisateurs, indépendance des programmes vis-à-vis du stockage, sécurité centralisée, sauvegarde et reprise après panne, langage de requête standard (SQL).

## 1.1.3 Le SGBD

Un **Système de Gestion de Bases de Données (SGBD)** est le logiciel qui crée, interroge et protège une base. Exemples : Oracle, MySQL, PostgreSQL, SQL Server, SQLite.

Ses objectifs :

- **Indépendance physique** : changer l'organisation des fichiers sans toucher aux applications ;
- **Indépendance logique** : ajouter une colonne ou une table sans casser les vues des utilisateurs ;
- **Manipulation par des non-informaticiens** grâce à un langage déclaratif ;
- **Efficacité** des accès (index, optimiseur de requêtes) ;
- **Administration** centralisée (utilisateurs, droits, sauvegardes) ;
- **Cohérence** : contraintes d'intégrité et **transactions** ;
- **Partage** : accès concurrents contrôlés ;
- **Sécurité** : authentification, privilèges, chiffrement.

## 1.1.4 L'architecture à trois niveaux (ANSI/SPARC)

| Niveau | Description | Qui le voit ? |
|---|---|---|
| **Externe** | Les **vues** : la partie de la base qui concerne un groupe d'utilisateurs. | Utilisateurs, applications |
| **Conceptuel (logique)** | La description **globale** de toutes les données et de leurs liens, indépendante de la machine. | Concepteur, administrateur |
| **Interne (physique)** | Le stockage réel : fichiers, index, blocs disque. | SGBD, administrateur système |

:::exemple Un même client, trois niveaux
Niveau externe : le caissier voit « nom, solde ». Niveau conceptuel : la table CLIENT avec toutes ses colonnes et ses liens vers COMMANDE. Niveau physique : un fichier de données et un index sur `numClient`.
:::

## 1.1.5 Les modèles de données

- **Hiérarchique** : les données forment un **arbre** (un enregistrement a un seul parent). Rapide mais rigide.
- **Réseau** : un **graphe** où un enregistrement peut avoir plusieurs parents. Souple mais navigation complexe, liée aux pointeurs.
- **Relationnel** (Codd, 1970) : les données sont rangées dans des **tables** (relations) reliées par des valeurs communes. C'est le modèle dominant, fondé sur les mathématiques (algèbre relationnelle) et interrogé en **SQL**.

:::attention Piège d'examen
« Le modèle relationnel stocke des pointeurs entre enregistrements » est **faux** : les liens passent par des **clés étrangères**, c'est-à-dire par des valeurs, pas par des pointeurs.
:::
