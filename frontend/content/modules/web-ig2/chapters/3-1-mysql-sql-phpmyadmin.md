## 3.1.1 Pourquoi une base de données avec PHP ?

Dès qu'un site doit **mémoriser** (comptes, commandes, articles), il stocke les données dans une base **MySQL**. PHP envoie des requêtes SQL à MySQL et affiche les résultats dans la page.

Rappel : la conception d'une base suit **MCD → MLD → SQL** (voir le module *Bases de données* de 2ᵉ année). Les règles à garder en tête :

- une entité devient une **table** ;
- association de type **1:N** : la clé de l'entité côté « 1 » devient **clé étrangère** dans la table côté « N » ;
- association de type **N:M** : on crée une **table d'association** dont la clé primaire est la concaténation des deux clés.

## 3.1.2 phpMyAdmin

**phpMyAdmin** est une interface web de gestion de MySQL : créer une base et des tables, saisir ou importer des données (fichiers `.sql`, `.csv`), exécuter des requêtes, exporter une sauvegarde.

## 3.1.3 Créer base et tables

```sql
CREATE DATABASE magasin CHARACTER SET utf8mb4;
USE magasin;

CREATE TABLE client (
  id_client INT AUTO_INCREMENT PRIMARY KEY,
  nom       VARCHAR(40) NOT NULL,
  prenom    VARCHAR(40),
  age       INT,
  ville     VARCHAR(40),
  mail      VARCHAR(80) UNIQUE
);

CREATE TABLE commande (
  id_comm    INT AUTO_INCREMENT PRIMARY KEY,
  date_comm  DATE NOT NULL,
  id_client  INT NOT NULL,
  FOREIGN KEY (id_client) REFERENCES client(id_client)
);
```

Types MySQL courants : `INT`, `DECIMAL(p,s)`, `VARCHAR(n)`, `CHAR(n)`, `TEXT`, `DATE`, `DATETIME`, `BOOLEAN`.

## 3.1.4 Les requêtes à connaître

```sql
INSERT INTO client (nom, prenom, age, ville) VALUES ('Koffi', 'Ama', 21, 'Cotonou');
UPDATE client SET ville = 'Porto-Novo' WHERE id_client = 1;
DELETE FROM client WHERE id_client = 1;

SELECT nom, prenom FROM client WHERE age >= 18 ORDER BY nom;
SELECT ville, COUNT(*) AS nb FROM client GROUP BY ville HAVING COUNT(*) > 2;
SELECT c.nom, cm.date_comm
FROM client c JOIN commande cm ON cm.id_client = c.id_client;
```

Les opérateurs `LIKE`, `BETWEEN`, `IN`, `IS NULL`, les fonctions `COUNT`, `SUM`, `AVG`, `MIN`, `MAX` et les jointures sont détaillés dans le module *Bases de données*.

:::retenir Où trouver une requête, comment l'appeler
Pour l'examen de programmation web, on attend surtout : **créer la table qui correspond à un formulaire**, puis **`INSERT`** avec les valeurs du formulaire, puis **`SELECT`** pour les afficher.
:::
