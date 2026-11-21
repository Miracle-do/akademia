## A.1 Répartition des sujets ENEAM

Les épreuves de base de données des IG2 mêlent presque toujours :

| Bloc | Poids habituel | Compétence testée |
|---|---|---|
| QCM de cours | 20 à 30 % | définitions, CIF/CIM, DF, normalisation |
| Modélisation | 30 à 40 % | dictionnaire, DF, MCD, MLD |
| SQL | 30 à 50 % | requêtes d'interrogation, DDL, DML |

## A.2 Méthode en 6 temps pour un sujet de modélisation

1. Lire l'énoncé **deux fois** en surlignant les règles de gestion.
2. Dresser le **dictionnaire** des attributs (nature, type), retirer les calculés.
3. Écrire les **DFED** et vérifier l'absence de transitivité.
4. Construire le **MCD** (entités, associations, cardinalités).
5. Passer au **MLDR** avec les règles CIF/CIM.
6. Contrôler la **3FN** et la cohérence des clés étrangères.

## A.3 Méthode en 4 temps pour une requête SQL

1. **Que doit-on afficher ?** (SELECT)
2. **Dans quelles tables se trouvent ces informations ?** (FROM, + tables « pont »)
3. **Quelles conditions ?** (JOIN … ON, WHERE)
4. **Faut-il regrouper ?** (GROUP BY / HAVING)

## A.4 Les cinq erreurs les plus pénalisées

:::attention
1. **Produit cartésien** involontaire : une condition de jointure oubliée.
2. **GROUP BY incomplet** : un attribut du SELECT absent du GROUP BY.
3. **`WHERE COUNT(*) > 10`** : un agrégat dans WHERE au lieu de HAVING.
4. **`= NULL`** au lieu de `IS NULL`.
5. **Clé étrangère mise dans la clé primaire** au passage en relationnel.
:::

## A.5 Gagner du temps en QCM « choisir LES réponses justes »

Plusieurs réponses peuvent être correctes. Éliminez d'abord celles qui ont une **faute de syntaxe** (colonne inexistante, `GROUP BY` incomplet, `WHERE` avec agrégat), puis vérifiez la **logique** de celles qui restent. Une requête syntaxiquement correcte peut répondre à une autre question que celle posée.
