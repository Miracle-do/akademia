## 4.2.1 INSERT

```sql
INSERT INTO Filiere (CodFil, LibFil, Cout) VALUES (1, 'Informatique', 600000);
INSERT INTO Filiere VALUES (2, 'Gestion', 450000);   -- toutes les colonnes, dans l'ordre
INSERT INTO ArchiveEtu SELECT * FROM Etudiant WHERE Age > 25;  -- insertion depuis un SELECT
```

:::attention Ordre des colonnes
Si l'on liste les colonnes, **les valeurs suivent cet ordre**. Sans liste, il faut respecter l'ordre de la table, ce qui est risqué.
:::

## 4.2.2 UPDATE et DELETE

```sql
UPDATE Etudiant SET Age = Age + 1 WHERE CodFil = 1;
DELETE FROM Etudiant WHERE Matricule = 204;
```

:::attention Sans WHERE, tout est touché
`UPDATE t SET c = 0;` modifie **toutes** les lignes ; `DELETE FROM t;` les supprime **toutes**. `DELETE FROM Salaire WHERE Matricule = 204` supprime les salaires de l'employé 204, **pas l'employé** lui-même.
:::

## 4.2.3 SELECT : la structure

```sql
SELECT [ALL | DISTINCT] colonnes
FROM tables
[WHERE condition]
[GROUP BY colonnes]
[HAVING condition_sur_groupes]
[ORDER BY colonne [ASC | DESC]];
```

Ordre d'**exécution** logique : `FROM` → `WHERE` → `GROUP BY` → `HAVING` → `SELECT` → `ORDER BY`.

- `DISTINCT` supprime les doublons ; `ALL` (défaut) les garde.
- `*` désigne toutes les colonnes.
- Un **alias** renomme : `SELECT Nom AS Etudiant FROM Etudiant e`.

## 4.2.4 Conditions du WHERE

| Opérateur | Exemple |
|---|---|
| `=  <>  <  >  <=  >=` | `Age >= 18` |
| `AND  OR  NOT` | `Sexe='F' AND Age<20` |
| `BETWEEN a AND b` | `Age BETWEEN 18 AND 25` (bornes **incluses**) |
| `IN (…)` | `CodFil IN (1, 3)` |
| `LIKE` | `Nom LIKE 'K%'` |
| `IS NULL` / `IS NOT NULL` | `Prenom IS NULL` |

`LIKE` : `%` remplace **0 à n** caractères, `_` remplace **exactement un** caractère.

:::attention NULL ne se compare pas avec =
`WHERE Prenom = NULL` ne renvoie **jamais** de ligne. On écrit `IS NULL`.
:::

## 4.2.5 Fonctions d'agrégation

`COUNT(*)` compte les lignes ; `COUNT(col)` compte les valeurs **non nulles** ; `SUM`, `AVG`, `MIN`, `MAX`. Sans `GROUP BY`, elles s'appliquent à toute la table et renvoient **une seule ligne**.

## 4.2.6 GROUP BY et HAVING

```sql
SELECT CodFil, COUNT(*) AS nb, AVG(Age) AS age_moyen
FROM Etudiant
WHERE Sexe = 'F'
GROUP BY CodFil
HAVING COUNT(*) > 10
ORDER BY nb DESC;
```

:::retenir WHERE ou HAVING ?
`WHERE` filtre les **lignes avant** le regroupement et ne peut pas contenir d'agrégat. `HAVING` filtre les **groupes après** le regroupement et contient les agrégats. Règle d'or : **tout attribut non agrégé du SELECT doit figurer dans le GROUP BY**.
:::

## 4.2.7 ORDER BY

`ASC` (croissant, par défaut) ou `DESC`. On peut trier sur plusieurs colonnes : `ORDER BY CodFil ASC, Nom DESC`.
