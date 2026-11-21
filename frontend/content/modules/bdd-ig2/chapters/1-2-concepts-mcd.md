## 1.2.1 Du monde réel au modèle

**Merise** est une méthode française de conception de systèmes d'information. Pour les données, elle propose trois niveaux de modèles :

1. **MCD** (Modèle Conceptuel de Données) : ce que l'organisation manipule, sans aucune contrainte technique ;
2. **MLD** ou **MLDR** (Modèle Logique de Données Relationnel) : le MCD traduit en tables ;
3. **MPD** (Modèle Physique) : le script SQL pour un SGBD précis.

## 1.2.2 Donnée, information, connaissance

- Une **donnée** est un fait brut, sans contexte : `15000`.
- Une **information** est une donnée interprétée : « le salaire de Koffi est 15 000 FCFA ».
- Une **connaissance** est une information utilisée pour décider : « le budget salaires dépasse la limite, il faut geler les embauches ».

## 1.2.3 Attribut (propriété)

Un **attribut** est une donnée élémentaire décrivant un objet. Il doit être **atomique** : on ne peut pas le décomposer sans perdre son sens (on sépare `nom` et `prénom`, on ne garde pas `nom_prénom`).

Deux défauts à éviter dans le vocabulaire :

- les **synonymes** : deux noms pour la même donnée (`Cli_nom` et `NomClient`) ;
- les **polysèmes** : un même nom pour deux données différentes (`date` pour la date de commande et la date de livraison).

## 1.2.4 Entité, occurrence, identifiant

Une **entité** est un objet du monde réel qui intéresse l'organisation (Client, Produit, Étudiant). On ne retient une entité que si elle possède **au moins deux occurrences** et plusieurs attributs.

Une **occurrence** est un exemplaire précis : « le client Koffi, numéro 12 ».

L'**identifiant** est l'attribut (ou le groupe d'attributs) qui distingue chaque occurrence. Il est **unique** et **non nul**. Dans le MCD, il est **souligné**.

:::retenir Choisir un identifiant
Un bon identifiant est stable, court et sans signification cachée. On crée souvent un numéro artificiel (`numClient`) plutôt que de prendre le nom, qui n'est pas unique.
:::

## 1.2.5 Association et cardinalités

Une **association** relie deux entités (ou plus) : « un client **passe** des commandes ». Elle porte un **verbe**. Elle peut avoir des **attributs** propres (la `quantité` d'un produit dans une commande).

La **cardinalité** d'une patte indique, pour une occurrence de l'entité, **combien d'occurrences de l'autre entité** elle peut être reliée au minimum et au maximum :

| Cardinalité | Signification |
|---|---|
| **0,1** | au plus une, parfois aucune |
| **1,1** | exactement une |
| **0,N** | aucune ou plusieurs |
| **1,N** | au moins une, éventuellement plusieurs |

La **dimension** d'une association est le nombre d'entités qu'elle relie : binaire (2), ternaire (3), réflexive (une entité avec elle-même).

:::exemple Lire une cardinalité
CLIENT (0,N) — passer — (1,1) COMMANDE se lit : « un client passe de zéro à plusieurs commandes ; une commande est passée par un et un seul client ».
:::

## 1.2.6 CIF et CIM

- **CIF** (Contrainte d'Intégrité Fonctionnelle) : association où l'une des pattes a la cardinalité maximale **1** (typiquement 1,1). Une occurrence de l'autre côté détermine **une seule** occurrence. Elle ne devient **pas** une table : l'identifiant migre.
- **CIM** (Contrainte d'Intégrité Multiple) : association dont **toutes** les pattes ont la cardinalité maximale **N** (par exemple 0,N — 1,N). Elle devient **une table**, avec les attributs éventuels.

:::attention CIF ou CIM ?
Une CIF **ne porte en principe pas d'attributs** (ils se placent sur l'entité côté 1). Une CIM **peut** porter des attributs. Retenir : CIF = au moins un max à 1 ; CIM = tous les max à N.
:::

## 1.2.7 Règles de gestion

Les **règles de gestion** sont les phrases de l'énoncé qui fixent les cardinalités : « un client peut passer plusieurs commandes », « une commande concerne un seul client ». Chaque cardinalité du MCD doit pouvoir être justifiée par une règle.
