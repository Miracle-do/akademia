## 5.2.1 Les utilisateurs

Un SGBD ne laisse personne accéder aux données sans **authentification**. L'administrateur crée des comptes :

```sql
-- MySQL
CREATE USER 'koffi'@'localhost' IDENTIFIED BY 'M0t2P@sse!';
ALTER USER 'koffi'@'localhost' IDENTIFIED BY 'Nouveau!';
SET PASSWORD FOR 'koffi'@'localhost' = 'Autre!';
DROP USER 'koffi'@'localhost';

-- Oracle
CREATE USER koffi IDENTIFIED BY M0t2P@sse;

-- SQL Server (login serveur, puis utilisateur de la base)
CREATE LOGIN koffi WITH PASSWORD = 'M0t2P@sse!';
CREATE USER koffi FOR LOGIN koffi;
```

## 5.2.2 Privilèges

- **Privilèges système** : droits d'agir sur le serveur (`CREATE TABLE`, `CREATE USER`, `CREATE SESSION`).
- **Privilèges objet** : droits sur un objet précis (`SELECT`, `INSERT`, `UPDATE`, `DELETE` sur la table `Etudiant`).

```sql
GRANT SELECT, INSERT ON Etudiant TO koffi;
GRANT SELECT ON Etudiant TO koffi WITH GRANT OPTION;   -- koffi peut redonner ce droit
GRANT CREATE SESSION TO koffi WITH ADMIN OPTION;       -- Oracle, privilège système
REVOKE INSERT ON Etudiant FROM koffi;
```

| Commande | Effet |
|---|---|
| `GRANT` | **accorde** un privilège |
| `REVOKE` | **retire** un privilège accordé |
| `DENY` (SQL Server) | **interdit** explicitement, même si un rôle l'accorde |

:::attention REVOKE ou DENY
`REVOKE` retire un droit donné ; il ne bloque pas un droit venu d'un **rôle**. `DENY` l'emporte sur tout `GRANT`.
:::

## 5.2.3 Rôles

Un **rôle** est un paquet de privilèges qu'on attribue à des utilisateurs : on gère les droits par fonction (caissier, directeur) et non utilisateur par utilisateur.

```sql
CREATE ROLE caissier;
GRANT SELECT, INSERT ON Vente TO caissier;
GRANT caissier TO koffi;
```

## 5.2.4 Sauvegarde et reprise

- **Sauvegarde complète** : copie de toute la base ; **incrémentale / différentielle** : seulement ce qui a changé.
- La règle **3-2-1** : 3 copies, sur 2 supports, dont 1 hors site.
- Une sauvegarde **non testée** n'est pas une sauvegarde : tester régulièrement la **restauration**.

## 5.2.5 Bonnes pratiques de sécurité d'une base

| Mesure | But |
|---|---|
| **Authentification** forte | n'autoriser que des utilisateurs identifiés |
| **Contrôle d'accès** (moindre privilège) | limiter les dégâts |
| **Chiffrement** (en transit et au repos) | protéger les données volées |
| **Mises à jour** (patching) | corriger les failles connues |
| **Journalisation** (audit) | tracer qui a fait quoi |
| **Sauvegarde et reprise** | survivre à une panne ou une attaque |
| **Tests de vulnérabilité** | trouver les failles avant l'attaquant |

:::examen À retenir pour l'écrit
Trois sources d'insécurité : mauvais **droits**, mauvaises **entrées** (injection), pas de **sauvegarde**. Pour chacune, citer la commande ou la mesure : `GRANT/REVOKE`, requêtes paramétrées, sauvegarde testée.
:::
