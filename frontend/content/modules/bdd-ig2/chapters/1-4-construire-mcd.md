## 1.4.1 Démarche générale

Un MCD se construit en gardant la même discipline à chaque fois : **entités d'abord, associations ensuite, cardinalités en dernier**, puis vérification.

| Étape | Question à se poser |
|---|---|
| 1. Entités | Quels sont les « objets » qui ont un identifiant et plusieurs occurrences ? |
| 2. Attributs | Chaque attribut appartient-il à **une seule** entité ? Est-il atomique ? |
| 3. Associations | Quels verbes relient ces entités ? |
| 4. Cardinalités | Pour chaque patte : minimum 0 ou 1 ? maximum 1 ou N ? |
| 5. Contrôle | Pas de doublon, pas d'attribut calculé, pas d'association qui duplique un lien. |

## 1.4.2 Associations binaires, ternaires, avec attributs

Une association **ternaire** relie trois entités quand la donnée dépend des trois à la fois. Exemple : un enseignant donne un cours à une classe dans une salle ; la note ou le volume horaire se rattache à l'association.

:::exemple Commande et produits
CLIENT (0,N) — passer — (1,1) COMMANDE (0,N) — contenir — (1,N) PRODUIT. L'association `contenir` est une CIM : elle porte l'attribut `quantité`.
:::

## 1.4.3 Association réflexive

Une association **réflexive** relie une entité à **elle-même**. On nomme les deux pattes par des **rôles**.

- **Parrainage** : un étudiant parraine 0 à N filleuls ; il a 0 ou 1 parrain. CIF (0,1 — 0,N) : la table gagnera une clé étrangère `numParrain`.
- **Médicaments incompatibles** : un médicament est incompatible avec 0 à N autres médicaments. CIM (0,N — 0,N) : elle devient une table à clé concaténée (deux fois `numMedicament`, renommés).

## 1.4.4 Entité faible (dépendante)

Une **entité faible** n'a pas d'identifiant propre : elle n'a de sens que rattachée à une entité forte. Exemple : une **chambre** (n° 12) n'existe que dans **un hôtel** ; le n° 12 existe dans tous les hôtels.

Notation : la cardinalité **(1,1)** de la patte vers l'entité forte est écrite **entre parenthèses**. Son identifiant est l'**identifiant relatif** : celui de l'hôtel **plus** son numéro local. Au passage en relationnel, la clé primaire devient `(#numHotel, numChambre)`.

:::attention Merise 1 et Merise 2
Dans Merise 2, on parle d'**identification relative**, avec la cardinalité (1,1) entre parenthèses ; Merise 1 la traitait différemment. En examen, suivre la notation du cours : cardinalité entre parenthèses = entité faible.
:::

## 1.4.5 Généralisation / spécialisation (sous-entités)

Quand des occurrences d'une entité ont des attributs différents, on crée des **sous-entités** : CLIENT se spécialise en CLIENT_PARTICULIER (date de naissance) et CLIENT_ENTREPRISE (raison sociale, IFU).

Les contraintes sur la spécialisation :

| Lettre | Signification |
|---|---|
| **X** | **Exclusion** : une occurrence appartient à une seule sous-entité |
| **T** | **Totalité** : toute occurrence est dans au moins une sous-entité |
| **XT** | Les deux : **partition** (une et une seule sous-entité) |

## 1.4.6 Pseudo-entité

Une **pseudo-entité** est une entité qui n'a pas d'attribut propre autre que son identifiant et sert uniquement de support à des associations. On la remplace souvent par un attribut ou on la regroupe avec l'association qu'elle sert.

:::examen Pièges à vérifier avant de rendre le MCD
- Un attribut calculé (total, âge) a-t-il été retiré ?
- Une entité n'a-t-elle qu'une seule occurrence ?
- Les attributs d'une CIM sont-ils sur l'association et non sur une entité ?
- Les cardinalités sont-elles justifiées par une règle de gestion ?
:::
