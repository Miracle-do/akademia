## 4.3.1 Jointures

Deux écritures équivalentes :

```sql
-- Jointure « à l'ancienne » (WHERE)
SELECT e.Nom, f.LibFil
FROM Etudiant e, Filiere f
WHERE e.CodFil = f.CodFil;

-- Jointure explicite (recommandée)
SELECT e.Nom, f.LibFil
FROM Etudiant e
INNER JOIN Filiere f ON e.CodFil = f.CodFil;
```

| Type | Résultat |
|---|---|
| `INNER JOIN` | seulement les lignes qui ont une correspondance des deux côtés |
| `LEFT [OUTER] JOIN` | **toutes** les lignes de gauche, NULL si pas de correspondance |
| `RIGHT [OUTER] JOIN` | toutes les lignes de droite |
| `FULL OUTER JOIN` | toutes les lignes des deux côtés |

:::exemple Étudiants sans filière
```sql
SELECT e.Nom
FROM Etudiant e LEFT JOIN Filiere f ON e.CodFil = f.CodFil
WHERE f.CodFil IS NULL;
```
:::

:::attention N tables, N−1 conditions
Pour joindre **n** tables il faut **n−1** conditions de jointure. Une condition manquante provoque un **produit cartésien**. Quand une table est reliée par une clé composée, la jointure porte sur **toutes** les colonnes de la clé.
:::

## 4.3.2 Auto-jointure

Pour comparer une table à elle-même, on lui donne deux **alias** :

```sql
SELECT e.Nom AS employe, c.Nom AS chef
FROM Employe e JOIN Employe c ON e.NumChef = c.Matricule;
```

## 4.3.3 Sous-requêtes

Une **sous-requête** est un `SELECT` placé dans une autre requête.

```sql
-- Étudiants plus âgés que la moyenne
SELECT Nom FROM Etudiant WHERE Age > (SELECT AVG(Age) FROM Etudiant);

-- Noms des chefs de service
SELECT Nom FROM Employe WHERE Matricule IN (SELECT Matricule FROM Service);
```

| Opérateur | Sens |
|---|---|
| `IN` / `NOT IN` | appartient / n'appartient pas à l'ensemble renvoyé |
| `= ANY` (ou `SOME`) | vrai si égal à **au moins une** valeur |
| `> ALL` | vrai si supérieur à **toutes** les valeurs |
| `EXISTS` / `NOT EXISTS` | vrai s'il y a au moins une / aucune ligne |

:::retenir Le plus grand, sans MAX
`WHERE Age >= ALL (SELECT Age FROM Etudiant)` renvoie les plus âgés. Avec `NOT IN`, méfiez-vous : si la sous-requête renvoie un NULL, le résultat est **vide**. Préférez `NOT EXISTS`.
:::

Une sous-requête peut aussi se placer dans le `FROM` (avec un alias obligatoire) :

```sql
SELECT AVG(nb) FROM (SELECT CodFil, COUNT(*) AS nb FROM Etudiant GROUP BY CodFil) t;
```

## 4.3.4 Opérateurs ensemblistes

`UNION` (sans doublon), `UNION ALL` (avec doublons), `INTERSECT`, `EXCEPT` (ou `MINUS` sous Oracle). Les deux `SELECT` doivent avoir le **même nombre de colonnes** de types compatibles.

## 4.3.5 Questions en « jamais » et en « tous »

- **Jamais / aucun** : `NOT IN` ou `NOT EXISTS` (clients qui n'ont **jamais** commandé).
- **Tous** : double négation ou comptage. Étudiants inscrits à **tous** les cours :

```sql
SELECT i.Matricule FROM Inscription i
GROUP BY i.Matricule
HAVING COUNT(DISTINCT i.CodCours) = (SELECT COUNT(*) FROM Cours);
```

:::examen Quatre étapes pour toute requête d'examen
1. Quelles colonnes afficher ? 2. Quelles tables (et lesquelles servent seulement de **pont**) ? 3. Jointures + conditions. 4. Faut-il regrouper ? Un « par » ou « pour chaque » dans l'énoncé annonce un `GROUP BY`.
:::
