### 5.3.1 Quatre règles d'inférence universellement vraies

Elles servent soit à valider une proposition complète, soit à générer des conclusions. Le symbole `⊢` se lit « permet de déduire ».

| Règle | Écriture | Lecture |
|---|---|---|
| **Modus ponens** | `A => B, A ⊢ B` | si A implique B et A est vrai, B est vrai |
| **Modus tollens** | `A => B, ~B ⊢ ~A` | si A implique B et B est faux, A est faux |
| **Réduction à l'absurde** | `A => B, A => ~B ⊢ ~A` | si A mène à une contradiction, A est faux |
| **Résolution** | `A v B, ~B v C ⊢ A v C` | on annule B contre ~B |

:::exemple Modus tollens en pratique
R : « Si l'informatique est un domaine qui se développe, alors on ne manque pas de candidats » (`I => ~M`).
F : « Il y a manque de candidats » (`M`, donc `~~M`).
Modus tollens : `I => ~M, ~~M ⊢ ~I` → **l'informatique n'est pas un domaine qui se développe**. (C'est logiquement valide ; que les prémisses soient réalistes est une autre question.)
:::

---

### 5.3.2 La procédure de résolution

**Forme clausale** : une série de propositions (ou de négations) reliées par des **ou**, comme `A v ~B v C v ~D`.

L'opération de base : **annuler** une proposition dont la négation figure dans une autre clause.

:::retenir Procédure de résolution (preuve par réfutation)
1. Mettre toutes les assertions sous **forme clausale** (utiliser `A => B ≡ ~A v B`).
2. Ajouter la **négation** de l'assertion à démontrer.
3. Répéter : choisir deux clauses, appliquer la résolution ; si la **résolvante est vide** (contradiction), c'est fini : l'assertion est démontrée. Sinon, ajouter la résolvante à l'ensemble et recommencer.
:::

:::exemple Montrer que R est vrai
Assertions : `P` ; `(P ^ Q) => R` ; `S => Q` ; `~T v Q` ; `T`.

Clauses : (1) `P` (2) `~P v ~Q v R` (3) `~S v Q` (4) `~T v Q` (5) `T` + négation du but (6) `~R`.

- (6) + (2) → `~P v ~Q` (7)
- (7) + (1) → `~Q` (8)
- (4) + (5) → `Q` (9)
- (8) + (9) → **clause vide** ⊥ ✔ : R est démontré.

(La clause 3 n'a pas servi, ce qui est normal.)
:::

:::exemple Application : « l'informatique ne se développe pas »
Clauses : `~I v ~M` (la règle), `M` (le fait). On veut `~I`, donc on ajoute sa négation `I`.
- `I` + `~I v ~M` → `~M`
- `~M` + `M` → ⊥ ✔
:::

:::attention Ne pas résoudre deux littéraux à la fois
Une résolution n'annule **qu'une** paire (p, ~p) à la fois. Annuler deux paires en un seul pas donne souvent une clause fausse (par exemple, `A v B` avec `~A v ~B` ne donne pas la clause vide : la résolvante est `B v ~B`, une tautologie).
:::

---

### 5.3.3 Exercices corrigés

**Exercice 3 : quelles inférences sont correctes ?**

| | Inférence | Verdict | Justification |
|---|---|---|---|
| a | `α→β, β→γ ⊢ α→γ` | ✔ correcte | syllogisme hypothétique (transitivité) |
| b | `α→β, β→γ, α ⊢ γ` | ✔ correcte | modus ponens deux fois |
| c | `α∨β, α∨¬β ⊢ α` | ✔ correcte | résolution sur β : on obtient `α∨α = α` |
| d | `α→β ⊢ ¬β→¬α` | ✔ correcte | loi de **contraposition** |
| e | `α→β ⊢ ¬α→¬β` | ✘ incorrecte | c'est l'**inverse** : α faux, β vrai la réfute |
| f | `α→(β→γ) ⊢ β→(α→γ)` | ✔ correcte | les deux valent `¬α ∨ ¬β ∨ γ` |

**Exercice 5 : qui va en ville ? (Barbara)**

Personnes : A (Anne), B (Barbara), C (Charles), D (David), E (Elizabeth), F (Fiona).
- « Seules Anne et Barbara conduisent, l'une doit y aller » → `A v B`
- « Anne ne part pas sans un de ses fils, Charles ou David » → `A => (C v D)`
- « Charles exige d'emmener ses amies Elizabeth et Fiona » → `C => (E ^ F)`
- « Si Fiona part sans David, Elizabeth restera tenir compagnie à David » → `(F ^ ~D) => ~E`
- « David ne peut pas partir » → `~D`
- À démontrer : `B`.

Clauses : (1) `A v B` (2) `~A v C v D` (3) `~C v E` (4) `~C v F` (5) `~F v D v ~E` (6) `~D` + négation du but (7) `~B`.

- (7)+(1) → `A` ; avec (2) → `C v D` ; avec (6) → `C`.
- `C` avec (3) → `E` ; `C` avec (4) → `F`.
- (5) avec `F` → `D v ~E` ; avec `E` → `D` ; avec (6) → **⊥** ✔.

**Barbara ira en ville.**
