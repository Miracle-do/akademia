## 4.4.1 CASE

```sql
SELECT Nom,
  CASE
    WHEN Age < 20 THEN 'Jeune'
    WHEN Age BETWEEN 20 AND 25 THEN 'Standard'
    ELSE 'Senior'
  END AS categorie
FROM Etudiant;
```

## 4.4.2 Gérer les valeurs NULL

NULL signifie « inconnu », pas zéro. Toute opération avec NULL donne NULL.

| SGBD | Fonction de remplacement |
|---|---|
| MySQL | `IFNULL(col, 0)` |
| SQL Server | `ISNULL(col, 0)` |
| Oracle | `NVL(col, 0)` |
| Standard | `COALESCE(col1, col2, 0)` |

## 4.4.3 Limiter les résultats

| SGBD | Syntaxe |
|---|---|
| MySQL, PostgreSQL | `... LIMIT 5` |
| SQL Server | `SELECT TOP 5 ...` |
| Oracle | `FETCH FIRST 5 ROWS ONLY` (ou `WHERE ROWNUM <= 5`) |

## 4.4.4 Index et auto-incrémentation

```sql
CREATE INDEX idx_nom ON Etudiant(Nom);          -- accélère les recherches sur Nom
CREATE UNIQUE INDEX idx_mail ON Etudiant(Email);
DROP INDEX idx_nom ON Etudiant;                  -- MySQL

CREATE TABLE Client (
  NumCli INT AUTO_INCREMENT PRIMARY KEY,         -- MySQL
  Nom VARCHAR(40)
);
```

Un **index** accélère la lecture mais ralentit les écritures et occupe de la place : on n'indexe que les colonnes souvent filtrées ou jointes.

## 4.4.5 Fonctions utiles

| Famille | Exemples |
|---|---|
| Chaînes | `UPPER`, `LOWER`, `LENGTH`, `SUBSTRING`, `CONCAT`, `TRIM`, `REPLACE` |
| Mathématiques | `ROUND`, `CEIL`, `FLOOR`, `ABS`, `MOD`, `POWER` |
| Dates | `NOW()`, `CURDATE()`, `YEAR(d)`, `MONTH(d)`, `DATEDIFF(d1,d2)` |
| Conversion | `CAST(x AS type)`, `CONVERT` |

## 4.4.6 Vues

Une **vue** est une requête nommée, stockée dans la base : on l'interroge comme une table, elle ne stocke pas de données.

```sql
CREATE VIEW VEtudiantsInfo AS
SELECT e.Nom, e.Prenom FROM Etudiant e WHERE e.CodFil = 1;
```

Les vues servent à **simplifier** les requêtes et à **restreindre l'accès** (niveau externe de l'architecture à trois niveaux).

## 4.4.7 Commentaires et bonnes pratiques

- `-- commentaire sur une ligne` ; `/* commentaire sur plusieurs lignes */`.
- Écrire les mots-clés en majuscules, indenter les clauses, nommer les alias.
- Préférer `JOIN` explicite à la virgule ; éviter `SELECT *` dans les applications.
