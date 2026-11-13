### 5.1.1 Pourquoi une logique pour représenter les connaissances ?

Jusqu'ici, nos programmes d'IA *cherchaient* dans un espace d'états. Un système à base de connaissances fait autre chose : il **stocke ce qu'il sait sous forme de formules** et **déduit** de nouveaux faits. La logique classique est le langage le plus ancien et le plus rigoureux pour cela.

:::retenir Base de connaissances (BC)
Toutes les connaissances possédées sur le monde et sa structure. Elle se compose de :
- une **base de faits** (BF) : ce qui est vrai ;
- une **base de règles** (BR) : ce qui permet d'en déduire d'autres faits.

**Inférer** = utiliser les faits et les règles pour trouver de nouveaux faits.
:::

---

### 5.1.2 La logique des propositions

**Définition.** Étant donné l'ensemble $L = \{\text{vrai}, \text{faux}\}$, une phrase est une **proposition** si on peut la qualifier par un *seul* élément de $L$.

| Phrase | Proposition ? | Valeur |
|---|---|---|
| Le nombre 3 est plus grand que 1 | oui | vrai |
| Il ne pleut jamais au Bénin | oui | faux |
| La terre est ronde | oui | vrai |
| On doit conduire à droite | **non** | tantôt vrai, tantôt faux selon le pays |
| Le cube d'un nombre est positif | **non** | dépend du nombre |

Par concision, chaque proposition est représentée par une lettre : $A, B, C, P, Q, S\dots$

---

### 5.1.3 Les connecteurs logiques

| Connecteur | Notation du cours | Exemple |
|---|---|---|
| Non (négation) | `~` (ou ¬) | `~A` |
| Et (conjonction) | `^` (∧) | `A ^ B` |
| Ou (disjonction) | `v` (∨) | `A v B` |
| Implication | `=>` (⇒) | `A => B` |
| Équivalence | `<=>` (⇔) | `A <=> B` |

:::exemple Traduire une phrase en formule
- P : « Il pleut » ; S : « Le soleil brille » ; V : « Le vent souffle ».
- « S'il pleut alors le soleil ne brille pas » → `P => ~S`
- « S'il pleut et que le soleil ne brille pas alors le vent souffle » → `(P ^ ~S) => V`
:::

---

### 5.1.4 Table de vérité des formules de base

| A | B | ~A | A ^ B | A v B | A => B | A <=> B |
|---|---|---|---|---|---|---|
| F | F | V | F | F | **V** | V |
| F | V | V | F | V | **V** | F |
| V | F | F | F | V | **F** | F |
| V | V | F | V | V | V | V |

:::attention L'implication, piège n°1
`A => B` n'est fausse que dans **un seul** cas : A vrai et B faux. Si A est faux, l'implication est **vraie**, quel que soit B (« du faux on peut déduire n'importe quoi »). C'est pour cela que `A => B` équivaut à `~A v B`.
:::

---

### 5.1.5 Les lois logiques (tautologies)

| Loi | Formule |
|---|---|
| Associativité de ^ | `P ^ (Q ^ R) <=> (P ^ Q) ^ R` |
| Associativité de v | `P v (Q v R) <=> (P v Q) v R` |
| Commutativité | `P ^ Q <=> Q ^ P` ; `P v Q <=> Q v P` |
| Distributivité de ^ sur v | `P ^ (Q v R) <=> (P ^ Q) v (P ^ R)` |
| Distributivité de v sur ^ | `P v (Q ^ R) <=> (P v Q) ^ (P v R)` |
| Lois de Morgan | `~(P v Q) <=> ~P ^ ~Q` ; `~(P ^ Q) <=> ~P v ~Q` |
| Implication | `P => Q <=> ~P v Q` |
| **Contraposition** | `P => Q <=> ~Q => ~P` |
| Double négation | `~~P <=> P` |
| Équivalence | `(P <=> Q) <=> (P => Q) ^ (Q => P)` |

:::attention Contraposée ≠ réciproque ≠ inverse
Dans le polycopié, la loi de contraposition est écrite `P => Q <=> ~P => ~Q`. **C'est une coquille** : cette formule est l'*inverse* de l'implication, qui n'est **pas** équivalente (prendre P faux et Q vrai : `P => Q` est vraie, `~P => ~Q` est fausse). La bonne loi est `P => Q <=> ~Q => ~P`. L'exercice 3 du cours (cas d et e) le confirme : d) est une inférence correcte, e) ne l'est pas.
:::

:::examen À savoir réécrire sans réfléchir
`A => B` s'écrit `~A v B`. Toute la procédure de résolution (chapitre 5.3) repose sur cette réécriture : on met tout sous forme de « ou ».
:::
