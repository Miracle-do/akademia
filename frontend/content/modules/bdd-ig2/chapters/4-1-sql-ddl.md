## 4.1.1 Les familles de commandes SQL

| Famille | Rôle | Commandes |
|---|---|---|
| **DDL** (Data Definition Language) | définir la structure | `CREATE`, `ALTER`, `DROP` |
| **DML** (Data Manipulation Language) | modifier les données | `INSERT`, `UPDATE`, `DELETE` |
| **DQL** (Data Query Language) | interroger | `SELECT` |
| **DCL** (Data Control Language) | gérer les droits | `GRANT`, `REVOKE` |
| **TCL** (Transaction Control Language) | gérer les transactions | `COMMIT`, `ROLLBACK` |

## 4.1.2 CREATE TABLE

```sql
CREATE TABLE Filiere (
  CodFil   INT PRIMARY KEY,
  LibFil   VARCHAR(40) NOT NULL UNIQUE,
  Cout     DECIMAL(10,2) DEFAULT 0 CHECK (Cout >= 0)
);

CREATE TABLE Etudiant (
  Matricule INT PRIMARY KEY,
  Nom       VARCHAR(30) NOT NULL,
  Prenom    VARCHAR(30),
  Sexe      CHAR(1) CHECK (Sexe IN ('M','F')),
  CodFil    INT,
  Age       INT,
  FOREIGN KEY (CodFil) REFERENCES Filiere(CodFil)
);
```

## 4.1.3 Les contraintes

| Contrainte | Effet |
|---|---|
| `NOT NULL` | la colonne doit toujours avoir une valeur |
| `UNIQUE` | pas deux fois la même valeur (NULL admis selon SGBD) |
| `PRIMARY KEY` | `UNIQUE` + `NOT NULL`, **une seule** par table |
| `FOREIGN KEY … REFERENCES` | intégrité référentielle |
| `DEFAULT v` | valeur prise si on n'en donne pas |
| `CHECK (condition)` | condition à respecter |

**Clé composée** : on doit la déclarer **au niveau de la table** : `PRIMARY KEY (Matricule, Mois, Annee)`.

:::attention Clé primaire composée ou deux clés ?
`PRIMARY KEY (Matricule, NumServ)` déclare **un seul** identifiant formé par le couple. Mettre la clé étrangère dans la clé primaire de EMPLOYE est une erreur classique : la clé primaire est `Matricule` seul.
:::

## 4.1.4 Actions référentielles

On précise ce qui se passe quand on supprime ou modifie une ligne **référencée** :

| Option | Effet sur les lignes filles |
|---|---|
| `CASCADE` | suppression/modification **répercutée** |
| `RESTRICT` / `NO ACTION` | opération **refusée** (défaut) |
| `SET NULL` | la clé étrangère devient NULL |
| `SET DEFAULT` | la clé étrangère prend sa valeur par défaut |

```sql
FOREIGN KEY (CodFil) REFERENCES Filiere(CodFil)
  ON DELETE SET NULL ON UPDATE CASCADE
```

## 4.1.5 Types courants

| Famille | Exemples |
|---|---|
| Entiers | `INT`, `SMALLINT`, `BIGINT` |
| Décimaux | `DECIMAL(p,s)`, `FLOAT`, `DOUBLE` |
| Texte | `CHAR(n)` (longueur fixe), `VARCHAR(n)` (variable), `TEXT` |
| Dates | `DATE`, `TIME`, `DATETIME`, `TIMESTAMP` |
| Logique | `BOOLEAN` |

## 4.1.6 ALTER TABLE et DROP TABLE

```sql
ALTER TABLE Etudiant ADD Email VARCHAR(60);
ALTER TABLE Etudiant MODIFY Nom VARCHAR(50);        -- MySQL
ALTER TABLE Etudiant CHANGE Nom NomFamille VARCHAR(50); -- MySQL : renomme
ALTER TABLE Etudiant DROP COLUMN Email;
DROP TABLE Etudiant;
```

:::retenir DROP, DELETE, TRUNCATE
`DROP TABLE` supprime la **table entière** (structure + données). `DELETE FROM t` supprime des **lignes** (avec `WHERE`), annulable. `TRUNCATE TABLE t` vide la table d'un coup mais garde la structure.
:::

:::examen CREATE TABLE avec CHECK (sujet 2025-2026)
« Créer la table Employé : le sexe ne prend que M ou F, les autres tables sont déjà créées. » La bonne réponse déclare `Matricule INT PRIMARY KEY`, `Sexe CHAR(1) CHECK (Sexe='M' OR Sexe='F')` et `NumServ INT REFERENCES Service` (ou `FOREIGN KEY (NumServ) REFERENCES Service`). Éliminer d'abord celles qui mettent `NumServ` dans la clé primaire ou qui font référence à une colonne inexistante (`NumRayon`).
:::
