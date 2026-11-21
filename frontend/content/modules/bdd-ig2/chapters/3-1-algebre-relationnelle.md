## 3.1.1 Principe

L'**algèbre relationnelle** est un ensemble d'opérations qui prennent des **relations** en entrée et produisent **une relation** en résultat. C'est le fondement théorique de SQL.

Base d'exemple : `ETUDIANT(Matricule, Nom, Prénom, Sexe, #CodFil, Age)` et `FILIERE(CodFil, LibFil, Cout)`.

## 3.1.2 Opérations unaires

| Opération | Rôle | Équivalent SQL |
|---|---|---|
| **Projection** π | garde certaines **colonnes** (et supprime les doublons) | `SELECT DISTINCT col…` |
| **Sélection** σ | garde certaines **lignes** selon une condition | `WHERE` |
| **Tri** | ordonne le résultat | `ORDER BY` |

:::exemple
π(Nom, Prénom)(σ(Age > 20)(ETUDIANT)) : noms et prénoms des étudiants de plus de 20 ans.
`SELECT DISTINCT Nom, Prénom FROM Etudiant WHERE Age > 20;`
:::

## 3.1.3 Opérations ensemblistes

Elles exigent deux relations **de même schéma** (même nombre d'attributs, domaines compatibles).

| Opération | Résultat |
|---|---|
| **Union** R ∪ S | les n-uplets de R **ou** de S (sans doublon) |
| **Intersection** R ∩ S | les n-uplets présents dans R **et** S |
| **Différence** R − S | les n-uplets de R **qui ne sont pas** dans S |

## 3.1.4 Produit cartésien, jointure, division

- **Produit cartésien** R × S : toutes les combinaisons ; si R a m lignes et S en a n, le résultat en a **m × n**.
- **Jointure** R ⋈ S : produit cartésien suivi d'une **sélection** sur l'égalité des attributs communs. La jointure est de loin l'opération la plus utilisée.
- **Division** R ÷ S : donne les valeurs de R associées à **toutes** les valeurs de S. Elle répond aux questions en « **tous** » : « les étudiants inscrits à **tous** les cours ».

:::retenir Jointure = produit + sélection
`R ⋈ S = σ(R.a = S.a)(R × S)`. En SQL, oublier la condition de jointure donne un **produit cartésien** : un résultat énorme et faux.
:::

## 3.1.5 Regroupement et agrégats

Le **regroupement** découpe une relation en groupes (même valeur d'un attribut) et calcule un **agrégat** par groupe : `Compte`, `Somme`, `Moyenne`, `Min`, `Max`, `Premier`, `Dernier`.

| Agrégat | SQL |
|---|---|
| Compte | `COUNT(*)` |
| Somme | `SUM(col)` |
| Moyenne | `AVG(col)` |
| Min / Max | `MIN(col)` / `MAX(col)` |

## 3.1.6 Passer de l'algèbre à SQL

1. **Attributs projetés** : ce que la question veut afficher → `SELECT`.
2. **Tables concernées** → `FROM`.
3. **Jointures** entre tables → clés étrangères = clés primaires.
4. **Sélections** → `WHERE`.
5. **Regroupement** → `GROUP BY`, puis `HAVING` pour filtrer les groupes.

:::examen Méthode du TD
Toujours écrire dans cet ordre : attributs à afficher, liste des tables, jointure/sélection, regroupement. La requête s'écrit presque seule ensuite.
:::
