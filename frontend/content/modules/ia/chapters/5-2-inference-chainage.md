### 5.2.1 L'inférence : déduire de nouveaux faits

Une **inférence** est un processus qui déduit de nouvelles propositions, conséquences des propositions initiales.

- **Prémisses** : propositions tenues pour vraies.
- **Conclusion** : fait nouveau déduit.

:::exemple
Règle `A => B` : « Si Jean est sage, alors Jean ira au cinéma ».
Prémisse `A` : « Jean est sage ». Conclusion : `B` : « Jean ira au cinéma ».
:::

La plupart des déductions des systèmes à base de connaissances reposent sur le **chaînage**, appliqué à des connaissances en **clauses de Horn** (règles de la forme `P1 ^ P2 ^ … => Q`).

Un problème de chaînage met en jeu :
1. une **base de faits** BF (au départ, les prémisses) ;
2. une **base de règles** BR (les règles générales) ;
3. la **spécification de la solution** : le fait F que l'on veut établir.

Deux stratégies : le **chaînage avant** (des faits vers le but) et le **chaînage arrière** (du but vers les faits).

---

### 5.2.2 Le chaînage avant

On applique toutes les règles possibles aux faits connus, en **ajoutant chaque nouvelle conclusion** à la base de faits. Une conclusion peut déclencher une autre règle. On s'arrête quand le but est atteint ou quand plus aucune règle n'est applicable.

```text
Algorithme chainage-avant
ENTREES : BF, BR, F          (F = fait à établir)
DEBUT
  TANTQUE (F ∉ BF) ET (il existe dans BR une règle applicable)
      choisir une règle applicable R
      BR ← BR − {R}                  (désactivation de R)
      BF ← BF ∪ {conclusion de R}
  FINTANTQUE
  SI F ∈ BF ALORS F est établi SINON F n'est pas établi
FIN
```

:::exemple Marchandise hors taxe ?
```text
R1 : vin ^ inférieur à 2 l          => petite-quantité
R2 : cognac ^ inférieur à 1 l       => petite-quantité
R3 : inférieur à 60 000 FCFA        => petite-quantité
R4 : petite-quantité ^ adulte       => hors-taxe
Faits : F1 vin, F2 inférieur à 2 l, F3 inférieur à 60 000 FCFA, F4 adulte
But   : hors-taxe
```
- R1, F1, F2 ⊢ **F5 : petite-quantité**  (R3 + F3 donnait aussi F5)
- R4, F5, F4 ⊢ **F6 : hors-taxe** = but ✔

L'efficacité dépend de la capacité à éviter les inférences inutiles : ici F5 a pu être trouvé deux fois (par R1 et par R3).
:::

---

### 5.2.3 Le chaînage arrière

On part du **but** et on cherche les règles qui l'ont dans leur **conclusion** (partie droite). Leurs prémisses deviennent des **sous-buts**, et ainsi de suite jusqu'à ce que chaque sous-but soit un fait connu. C'est la procédure la plus proche du raisonnement humain.

:::exemple Prouver D
```text
Faits : H, K
R1 : A => E      R2 : B => D      R3 : H => A
R4 : E ^ G => C  R5 : E ^ K => B  R6 : D ^ E ^ K => C
R7 : G ^ K ^ F => A
```
- But D → règle R2 → sous-but **B**
- B → règle R5 → sous-but **E** (K est un fait)
- E → règle R1 → sous-but **A**
- A → règles R3 et R7 ; **R3** conclut car H est un fait ✔

Chemin : H →R3→ A →R1→ E →R5→ B →R2→ D.
:::

:::retenir Avant ou arrière ?
| | Chaînage avant | Chaînage arrière |
|---|---|---|
| Point de départ | les faits | le but |
| Direction | pousse les faits vers les conclusions | tire le but vers les faits |
| Risque | produit beaucoup de faits inutiles | n'explore que ce qui sert le but |
| Adapté si | on veut *tout* déduire d'une situation | on a *une* question précise |
:::

---

### 5.2.4 Exercices corrigés

**Exercice 1** : règles `R1 : (~A => B) => P`, `R2 : (P ^ Q) => F`, `R3 : (C => A) => Q`, `R4 : F => (D => K)`, `R5 : K => (M ^ L)`. Faits : A, D. Prouver M par chaînage avant.

- Comme `A` est vrai, `~A` est faux, donc `~A => B` est **vraie** (implication à prémisse fausse, car `~A => B ≡ A v B`). R1 donne **P**.
- `A` vrai rend aussi `C => A` vraie (`≡ ~C v A`). R3 donne **Q**.
- P et Q vrais : R2 donne **F**.
- R4 : `F => (D => K)` ; D est un fait, donc **K**.
- R5 : K donne `M ^ L`, donc **M** ✔.

**Exercice 2** : règles `R1 : A^B => C`, `R2 : D => A`, `R3 : E => F`, `R4 : G => H`, `R5 : I => F`, `R6 : H^F^J => B`, `R7 : H^K => J`, `R8 : G^F => K` (le polycopié écrit « G ^ F ^ K », lu ici comme `G ^ F => K`). Faits : D, G, I. Prouver C.

*Chaînage avant* : R2 → A ; R4 → H ; R5 → F ; R8 → K ; R7 → J ; R6 → B ; R1 → **C** ✔.

*Chaînage arrière* : C ← (R1) A et B.
- A ← (R2) D ✔ fait.
- B ← (R6) H, F, J.
  - H ← (R4) G ✔ ; F ← (R5) I ✔ (R3 demanderait E, inconnu) ;
  - J ← (R7) H ✔ et K ; K ← (R8) G ✔ et F ✔.
- Tous les sous-buts sont des faits : **C est prouvé** ✔.

:::examen Méthode
En chaînage avant, notez chaque tour « règle appliquée → fait ajouté ». En chaînage arrière, dessinez l'arbre des sous-buts et cochez les feuilles qui sont des faits. Le correcteur veut voir **le numéro de la règle** à chaque pas.
:::
