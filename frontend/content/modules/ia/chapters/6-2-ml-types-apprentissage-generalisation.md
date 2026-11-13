### 6.2.1 Apprentissage supervisé

**Principe.** Le processus prend en entrée des exemples d'apprentissage contenant **à la fois les données d'entrée et de sortie** : chaque exemple est fourni avec son **étiquette**.

**But.** Classer ou prédire correctement un **nouvel** exemple. **Tâches** : classification, prédiction.

:::retenir Formalisation
On dispose de $n$ observations $x^1, x^2, \dots, x^n$, chacune élément de l'espace des observations $X$, et de leurs étiquettes $y^1, \dots, y^n$, chacune élément de l'espace des étiquettes $Y$.

Le but est de trouver une fonction $f : X \to Y$ telle que $f(x) \approx y$ pour toutes les paires $(x, y) \in X \times Y$ ayant la même relation que les paires observées.

L'ensemble $D = \{(x^i, y^i)\}_{i=1..n}$ forme le **jeu d'apprentissage**.
:::

Cas particuliers selon l'espace des étiquettes $Y$ :

| $Y$ | Type de problème |
|---|---|
| $Y = \mathbb{R}$ | **régression** (prédiction) |
| $Y = \{0, 1\}$ | **classification binaire** : observations d'étiquette 0 = *négatives*, d'étiquette 1 = *positives* |
| $Y = \{1, 2, \dots, C\}$, $C > 2$ | **classification multi-classe** |

Dans de nombreuses situations, $X = \mathbb{R}^p$ : les observations sont représentées par **$p$ variables**.

:::exemple Un prêt bancaire
Chaque client est une observation $x \in \mathbb{R}^3$ (âge, revenu, ancienneté). L'étiquette $y \in \{0,1\}$ vaut 1 s'il a remboursé. On cherche $f$ qui, pour un **nouveau** client, prédit s'il remboursera : classification binaire.
:::

---

### 6.2.2 Apprentissage non supervisé

**Principe.** Les exemples d'apprentissage ne contiennent que des **données d'entrée, sans étiquette**.

**But.** **Regrouper** les exemples en paquets (*clusters*) d'exemples similaires. **Tâches** : segmentation, association.

| | Supervisé | Non supervisé |
|---|---|---|
| Données | entrées **+ étiquettes** | entrées seulement |
| But | classer / prédire un nouvel exemple | découvrir des groupes ou des corrélations |
| Tâches | classification, prédiction | segmentation, association |
| Modèle | prédictif | descriptif |
| Exemples d'algorithmes | SVM, arbres de décision, KNN, régression linéaire | K-means, Apriori |

---

### 6.2.3 Généralisation et sur-apprentissage

Un modèle n'est pas fait pour réciter les exemples vus, mais pour réussir sur des cas **nouveaux**.

:::retenir Trois définitions
- **Généralisation** : capacité d'un modèle à faire des prédictions correctes sur de **nouvelles données**, qui n'ont pas servi à le construire.
- **Sur-apprentissage** (*overfitting*) : au lieu de capturer la nature des objets à étiqueter, le modèle **modélise aussi le bruit** et ne saura pas généraliser.
- **Sous-apprentissage** (*underfitting*) : le modèle est **trop simple** pour avoir de bonnes performances, même sur les données utilisées pour le construire.
:::

| Symptôme | Diagnostic |
|---|---|
| Très bon sur l'entraînement, mauvais sur de nouvelles données | sur-apprentissage |
| Mauvais partout, y compris sur l'entraînement | sous-apprentissage |
| Bon sur l'entraînement **et** sur de nouvelles données | bonne généralisation |

:::attention Évaluer sur des données jamais vues
Mesurer la performance sur les données d'entraînement ne prouve rien : un modèle qui apprend par cœur y obtient 100 %. On réserve donc un jeu de **test**, non utilisé pour construire le modèle, afin de mesurer la vraie capacité de généralisation. Cette précision est une pratique standard ; le polycopié se contente de définir la généralisation.
:::
