### 6.3.1 La matrice de confusion

Les performances d'un modèle de classification, binaire ou multi-classe, se résument dans une **matrice de confusion** : une matrice $M$ avec autant de lignes et de colonnes que de classes, dont l'entrée $M_{ck}$ est le nombre d'exemples de la classe $c$ pour lesquels l'étiquette $k$ a été prédite.

**Cas binaire** (disposition du cours : colonnes = classe réelle, lignes = classe prédite) :

| | Réel 0 | Réel 1 |
|---|---|---|
| **Prédit 0** | vrais négatifs (**TN**) | faux négatifs (**FN**) |
| **Prédit 1** | faux positifs (**FP**) | vrais positifs (**TP**) |

- **TP** (vrais positifs) : exemples positifs correctement classés ;
- **FP** (faux positifs) : exemples négatifs étiquetés positifs par le modèle ;
- **TN** (vrais négatifs) : exemples négatifs correctement classés ;
- **FN** (faux négatifs) : exemples positifs étiquetés négatifs.

Les faux positifs sont aussi appelés **fausses alarmes** ou **erreurs de type I** ; les faux négatifs sont les **erreurs de type II**.

:::attention Sens des axes
Selon les auteurs, on place le réel en lignes ou en colonnes. **Lisez toujours les titres de la matrice** avant de repérer FP et FN : FP = « prédit positif à tort », FN = « prédit négatif à tort ».
:::

---

### 6.3.2 Les critères dérivés

:::retenir Les formules à connaître
$$\text{Rappel (sensibilité)} = \frac{TP}{TP + FN} \qquad \text{Précision} = \frac{TP}{TP + FP}$$
$$\text{F-mesure} = 2 \cdot \frac{\text{Précision} \cdot \text{Rappel}}{\text{Précision} + \text{Rappel}} = \frac{2\,TP}{2\,TP + FP + FN}$$
$$\text{Spécificité} = \frac{TN}{TN + FP}$$
:::

- **Rappel** (*recall*, *sensibilité*) : taux de vrais positifs, la proportion d'exemples positifs correctement identifiés. Facile à rendre excellent en prédisant que **tous** les exemples sont positifs : il ne peut donc pas s'utiliser seul.
- **Précision** (*precision*, *valeur positive prédictive*) : proportion de prédictions correctes parmi les prédictions **positives**. Facile à rendre excellente en faisant **très peu** de prédictions positives, au détriment du rappel.
- **F-mesure** (*F1-score*) : **moyenne harmonique** de la précision et du rappel, qui résume les deux en un seul nombre.
- **Spécificité** : taux de vrais négatifs, proportion d'exemples négatifs correctement identifiés.

:::attention Précision en français = deux mots anglais
L'anglais distingue *precision* (ci-dessus) et ***accuracy***, la proportion d'exemples correctement étiquetés : $\frac{TP+TN}{TP+TN+FP+FN}$, soit le complémentaire à 1 du taux d'erreur. Les deux se traduisent « précision » en français : en cas de doute, vérifiez la formule.
:::

:::exemple Calcul complet
Sur 100 clients : TP = 40, FP = 10, FN = 20, TN = 30.
- Rappel = 40 / (40+20) = **0,667**
- Précision = 40 / (40+10) = **0,80**
- F-mesure = 2×40 / (2×40+10+20) = 80/110 = **0,727**
- Spécificité = 30 / (30+10) = **0,75**
- Accuracy = (40+30) / 100 = **0,70**

Lecture : le modèle rate un tiers des vrais positifs (rappel moyen) mais ses alertes sont fiables à 80 %.
:::

:::examen Quel critère choisir ?
- Dépister une maladie grave : on veut peu de faux négatifs → **rappel** élevé.
- Filtrer des courriels frauduleux en évitant de bloquer de vrais messages : peu de faux positifs → **précision** élevée.
- Besoin d'un compromis : **F-mesure**.
:::
