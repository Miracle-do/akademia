### 6.1.1 Qu'est-ce que le Machine Learning ?

Le **Machine Learning** (apprentissage automatique ou artificiel) est une **branche de l'intelligence artificielle**. Un système incapable d'apprendre peut difficilement être considéré comme intelligent : la capacité d'apprendre et de tirer parti de ses expériences est essentielle à un système conçu pour s'adapter à un environnement changeant.

Jusqu'ici dans ce cours, le programmeur écrivait les règles (espaces d'états, heuristiques, base de règles). Ici, c'est l'inverse : on fournit des **exemples**, et la machine en **tire elle-même le modèle**.

---

### 6.1.2 Pourquoi et quand l'utiliser ?

On utilise le ML pour résoudre des problèmes :

| Situation | Exemple |
|---|---|
| que l'on **ne sait pas résoudre** | prédiction d'achats |
| que l'on sait résoudre mais **sans savoir formaliser** comment on s'y prend | reconnaissance d'images, compréhension du langage naturel |
| que l'on sait résoudre, mais avec des procédures **trop gourmandes en ressources** | prédiction d'interactions entre grosses molécules (simulations très lourdes) |

:::retenir Quand ?
Le ML sert quand les **données sont abondantes** (relativement) mais les **connaissances peu accessibles ou peu développées**.
:::

Le ML aide aussi les humains à apprendre : un modèle appris peut révéler l'**importance relative** de certaines informations et la façon dont elles **interagissent**. En prédiction d'achats, comprendre le modèle dit quelles caractéristiques des achats passés permettent de prédire les achats futurs. En recherche scientifique : quels gènes interviennent dans un type de tumeur ? quelles régions d'une image cérébrale prédisent un comportement ? quelles caractéristiques font d'une molécule un bon médicament ? quels aspects d'une image de télescope identifient un objet astronomique ?

---

### 6.1.3 De quoi a-t-on besoin ? Deux piliers

1. **Les données** : les exemples à partir desquels l'algorithme apprend (transactions, bases de données d'entreprises, téléphones portables, satellites, séries temporelles comme la bourse ou la météo, génomique, web, textes…).
2. **L'algorithme d'apprentissage** : la procédure qu'on fait tourner sur ces données pour **produire un modèle**.

Données et algorithme sont **aussi importants l'un que l'autre** :
- aucun algorithme ne crée un bon modèle à partir de données non pertinentes ;
- un algorithme inadapté sur des données pertinentes ne donne pas non plus un bon modèle.

:::retenir Entraînement
On appelle **entraînement** le fait de faire tourner un algorithme d'apprentissage sur un jeu de données. *Données + algorithme → entraînement → modèle.*
:::

---

### 6.1.4 Les quatre objectifs du ML

| Objectif | Principe | Exemple de tâche | Algorithmes cités |
|---|---|---|---|
| **Classification** | examiner les caractéristiques d'un objet et lui attribuer une **classe** | décider d'accorder ou non un prêt à un client | SVM (machine à vecteurs de support), arbres de décision, classificateur bayésien naïf, KNN (k plus proches voisins), réseaux de neurones |
| **Prédiction** | prédire la **valeur** future d'un attribut en fonction d'autres attributs | prédire la qualité d'un client | régression linéaire, perceptron |
| **Association** | déterminer les attributs qui sont **corrélés** | analyse du panier de la ménagère | Apriori, FP-Growth |
| **Segmentation** | former des **groupes homogènes** dans une population | évaluer des employés : mauvais, bon, très bon, excellent | K-moyennes (K-means), réseaux de neurones |

:::attention Classification ≠ prédiction
- La **classification** renvoie une **catégorie** (accorder / refuser le prêt).
- La **prédiction** (régression) renvoie une **valeur numérique** (le montant, un score de qualité).
:::

---

### 6.1.5 Modèles prédictifs et modèles descriptifs

- **Modèle prédictif** : on utilise des données existantes **et des résultats connus** sur ces données pour développer des modèles capables de prédire les valeurs d'autres données. Exemple : prédire les clients qui ne rembourseront pas leur crédit. Tâches : **classification, prédiction**.
- **Modèle descriptif** : il **décrit les données** pour aider à la prise de décision. Il est souvent en amont de la construction de modèles prédictifs. Tâches : **segmentation, association**.

:::examen Réflexe de classement
Classification et prédiction → modèle **prédictif**. Segmentation et association → modèle **descriptif**. Cette correspondance tombe très souvent en QCM.
:::
