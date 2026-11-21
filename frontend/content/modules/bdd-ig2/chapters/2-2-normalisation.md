## 2.2.1 Pourquoi normaliser ?

Une relation mal conçue provoque des **anomalies** :

- **de mise à jour** : modifier l'adresse d'un client oblige à changer toutes ses lignes ;
- **d'insertion** : impossible d'ajouter un produit tant qu'aucune commande ne le contient ;
- **de suppression** : supprimer la dernière commande d'un client efface le client.

La **normalisation** découpe les relations pour supprimer ces anomalies. Elle s'appuie sur les dépendances fonctionnelles.

## 2.2.2 Première forme normale (1FN)

Une relation est en **1FN** si :

1. elle a une **clé primaire** ;
2. tous ses attributs sont **atomiques** (une seule valeur par case, pas de liste ni de groupe répétitif).

:::exemple Violation de 1FN
`COMMANDE(numCom, produits)` avec `produits = "stylo, cahier, règle"` n'est **pas** en 1FN. On crée une ligne par produit.
:::

## 2.2.3 Deuxième forme normale (2FN)

1FN **et** tout attribut non clé dépend de **toute la clé**, et non d'une partie seulement.

La 2FN n'a de sens que pour une **clé composée**.

:::exemple Violation de 2FN
`DETAIL(numCom, numPro, libellé, quantité)` : `libellé` dépend de `numPro` seul. On sépare : `PRODUIT(numPro, libellé)` et `DETAIL(numCom, numPro, quantité)`.
:::

## 2.2.4 Troisième forme normale (3FN)

2FN **et** aucun attribut non clé ne dépend d'un autre attribut non clé (**pas de dépendance transitive**).

:::exemple Violation de 3FN
`EMPLOYE(matricule, nom, numServ, nomServ)` : `matricule → numServ → nomServ`. On sépare : `EMPLOYE(matricule, nom, #numServ)` et `SERVICE(numServ, nomServ)`.
:::

:::retenir Formule mnémotechnique
Chaque attribut dépend **de la clé** (1FN), **de toute la clé** (2FN), **et rien que de la clé** (3FN).
:::

## 2.2.5 Exemple : la relation « Commander »

`COMMANDER(numBon, dateBon, numCli, nomCli, adrCli, numPro, libPro, prixPro, quantité)` avec clé `(numBon, numPro)`.

DFED : `numBon → dateBon, numCli` ; `numCli → nomCli, adrCli` ; `numPro → libPro, prixPro` ; `(numBon, numPro) → quantité`.

Décomposition en 3FN :

- `CLIENT(numCli, nomCli, adrCli)`
- `PRODUIT(numPro, libPro, prixPro)`
- `BON_COMMANDE(numBon, dateBon, #numCli)`
- `DETAIL_COMMANDE(#numBon, #numPro, quantité)`

## 2.2.6 Normaliser un énoncé : méthode

1. Lister les attributs (dictionnaire).
2. Écrire les **DFED** et vérifier qu'aucune n'est transitive.
3. Chaque **source** de DF donne une relation : la source est la clé, les cibles sont les attributs.
4. Une DF à **source composée** donne une relation à clé composée.
5. Placer les **clés étrangères** (#) : un identifiant qui apparaît dans une autre relation.
6. Contrôle : chaque attribut apparaît **une fois** (sauf comme clé étrangère).

:::examen Sujet de janvier 2020 : distribution de produits alimentaires
La question demandait de structurer en 3FN avant les 18 requêtes SQL. Dans ce type de sujet, la note dépend à 50 % de la justesse des clés primaires et étrangères : prenez le temps de les placer proprement, car toutes les requêtes en dépendent.
:::
