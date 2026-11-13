### 5.4.1 Les limites de la logique des propositions

La logique des propositions a un pouvoir de représentation très limité : impossible d'y écrire « tous les chats sont des mammifères » sans une proposition distincte par chat. Il faut des **objets**, des **propriétés** et des **variables**.

### 5.4.2 Prédicats

Un **prédicat** exprime une propriété d'un objet ou une relation entre objets. Forme habituelle : `nom_prédicat(objet1, objet2, …)`.

| Phrase | Prédicat |
|---|---|
| Jules est grand | `est_grand(Jules)` |
| Jules mange une pomme | `mange(Jules, pomme)` |
| 3 est inférieur à 56 | `3 < 56` (notation mathématique de `inférieur(3, 56)`) |

### 5.4.3 Variables et quantificateurs

Une variable sert à deux usages :
- exprimer un énoncé **universel** (elle représente tous les objets du domaine) : `beninois(X) => africain(X)` ;
- exprimer l'**existence** d'un objet pas encore identifié : dans `père("Joe", X)`, X est le père de Joe.

La logique des prédicats précise ces usages avec deux **quantificateurs** :

| Quantificateur | Lecture | Exemple |
|---|---|---|
| `∀x P(x)` (universel) | P est vrai pour **tous** les objets x | « Tous les chats sont des mammifères » : `∀x Chat(x) => Mammifère(x)` |
| `∃x P(x)` (existentiel) | P est vrai pour **au moins un** x | « Kokou a une sœur étudiante » : `∃x Sœur(x, Kokou) ^ étudiante(x)` |

:::attention Le bon connecteur avec le bon quantificateur
- `∀` va avec `=>` : `∀x (P(x) => Q(x))`.
- `∃` va avec `^` : `∃x (P(x) ^ Q(x))`.

Écrire `∀x (P(x) ^ Q(x))` dit que *tout* objet a P et Q ; écrire `∃x (P(x) => Q(x))` est vrai dès qu'un seul objet n'a pas P : ce n'est presque jamais ce qu'on veut dire.
:::

### 5.4.4 Propriétés des quantificateurs

- `∀x ∀y` équivaut à `∀y ∀x` ; `∃x ∃y` équivaut à `∃y ∃x`.
- **`∃x ∀y` n'équivaut pas à `∀y ∃x`** :
  - `∃x ∀y Aime(x,y)` : il existe quelqu'un qui aime tout le monde ;
  - `∀y ∃x Aime(x,y)` : tout le monde est aimé par au moins une personne.
- Un quantificateur s'exprime avec l'autre (**lois de Morgan généralisées**) :

| | |
|---|---|
| `∀x P(x) ≡ ¬∃x ¬P(x)` | `∃x P(x) ≡ ¬∀x ¬P(x)` |
| `¬∀x P(x) ≡ ∃x ¬P(x)` | `¬∃x P(x) ≡ ∀x ¬P(x)` |

Exemples : `∀x Aime(x, Fruit) ≡ ¬∃x ¬Aime(x, Fruit)` ; `∃x Aime(x, Viande) ≡ ¬∀x ¬Aime(x, Viande)`.

Autres équivalences : `∀x [P(x) ^ Q(x)] ≡ ∀x P(x) ^ ∀y Q(y)` ; `∃x [P(x) v Q(x)] ≡ ∃x P(x) v ∃y Q(y)` ; renommer une variable muette ne change rien : `∀x P(x) ≡ ∀y P(y)`.

**Égalité** : vraie si deux termes désignent le même objet.
- « Le père de Jean est Henry » : `Père(Jean) = Henry`.
- « Richard a au moins deux frères » : `∃x,y Frère(x,Richard) ^ Frère(y,Richard) ^ ¬(x = y)`.

**Convention** : toute variable libre est quantifiée universellement. Ainsi `homme(x) => mortel(x)` signifie `∀x (homme(x) => mortel(x))`.

### 5.4.5 Ordre du calcul des prédicats

- **Ordre 0** : aucune quantification (c'est la logique des propositions) ;
- **1er ordre** : quantification sur les **individus** ;
- **2e ordre** : quantification sur les individus **et les prédicats**.

Des algorithmes d'inférence n'existent que pour les ordres 0 et 1 ; le 2e ordre est presque jamais utilisé.

---

### 5.4.6 La skolémisation : éliminer les ∃

Skolem a montré qu'on peut **supprimer tout quantificateur existentiel** en introduisant une fonction (ou une constante) de Skolem.

1. **∃ à l'intérieur d'un ∀** : on remplace la variable existentielle par une fonction des variables universelles qui l'entourent.
   `∀x ∃y p(x,y)` devient `∀x p(x, f(x))`.
   *« Chaque personne parle sa langue »* : `∀x ∃y personne(x) => (langue(y) ^ parle(x,y))` devient `personne(x) => (langue(f_langue(x)) ^ parle(x, f_langue(x)))`.
2. **∃ hors de tout ∀** : la fonction de Skolem est une **constante**.
   `∃y ∀x personne(x) => (langue(y) ^ parle(x,y))` devient `personne(x) => (langue(a) ^ parle(x,a))` : *une même langue* `a` est parlée par tous.

Une fonction de Skolem **différente** par quantificateur existentiel. Après élimination, tout est universel et on **omet les ∀** (convention ci-dessus).

:::retenir Les deux phrases ne disent pas la même chose
« Chaque personne parle **sa** langue » (∀∃, fonction f(x)) ≠ « Toutes les personnes parlent **une** langue » (∃∀, constante a). C'est exactement la non-commutativité de `∃x ∀y`.
:::

---

### 5.4.7 Exercices corrigés

**Exercice 4 : quantificateurs**
- « Tous les Béninois sont gentils » : `∀x beninois(x) => gentil(x)`
- « Certains Béninois sont gentils » : `∃x beninois(x) ^ gentil(x)`
- « Une mère est un parent de sexe féminin » : `∀x ∀y mere(x,y) => (parent(x,y) ^ feminin(x))` (réciproquement, `parent(x,y) ^ feminin(x) => mere(x,y)`, d'où une équivalence)

**Exercice 6 : John a-t-il tué le chat ?**

Connaissances (avec le savoir implicite *un chat est un animal*) :
- `∃y chien(y) ^ possede(Jack,y)` ; après skolémisation : `chien(d0)`, `possede(Jack,d0)`
- `∀x,y chien(y) ^ possede(x,y) => ami_animaux(x)`
- `∀x,y ami_animaux(x) ^ animal(y) => ~tue(x,y)`
- `tue(Jack,chat) v tue(John,chat)` ; `animal(chat)`

Clauses : (1) `chien(d0)` (2) `possede(Jack,d0)` (3) `~chien(y) v ~possede(x,y) v ami_animaux(x)` (4) `~ami_animaux(x) v ~animal(y) v ~tue(x,y)` (5) `tue(Jack,chat) v tue(John,chat)` (6) `animal(chat)`, + négation du but (7) `~tue(John,chat)`.

- (5)+(7) → `tue(Jack,chat)` (8)
- (4)+(8), x=Jack, y=chat → `~ami_animaux(Jack) v ~animal(chat)` ; avec (6) → `~ami_animaux(Jack)` (9)
- (3)+(1)+(2), x=Jack, y=d0 → `ami_animaux(Jack)` (10)
- (9)+(10) → **⊥** ✔. **Oui, John a tué le chat.**

Sans résolution : modus ponens deux fois (Jack ami des animaux ; donc il ne tue pas le chat), puis le **syllogisme disjonctif** `A v B, ~A ⊢ B`, qui n'est qu'un cas de résolution.

**Exercice 7 : West est un criminel**

- `∀x,y,z américain(x) ^ arme(y) ^ vend(x,y,z) ^ hostile(z) => criminel(x)`
- `∃x possede(Nono,x) ^ missile(x)` → constante `M1` : `possede(Nono,M1)`, `missile(M1)`
- `∀x missile(x) ^ possede(Nono,x) => vend(West,x,Nono)`
- `∀x missile(x) => arme(x)` ; `∀x ennemi(x,Amérique) => hostile(x)`
- `américain(West)` ; `ennemi(Nono,Amérique)`

Modus ponens (chaînage avant) : `arme(M1)` ; `vend(West,M1,Nono)` ; `hostile(Nono)` ; puis la règle du crime avec x=West, y=M1, z=Nono → **`criminel(West)`** ✔. En résolution, on ajoute `~criminel(West)` et on remonte les mêmes étapes jusqu'à la clause vide.

**Exercice 8 : « H est son propre grand-père »**

Faits : `epoux(H,V)` ; `mere(V,F)` (F fille adulte de V) ; `epoux(P,F)` ; `pere(P,H)`.

Règles (avec la convention « par alliance » nécessaire, le texte de l'énoncé ne la précise pas) :
- `epoux(x,y) ^ mere(y,z) => parent(x,z)` (beau-parent) ; `epoux(x,y) => epoux(y,x)`
- `parent(x,y) ^ parent(y,z) => grand_pere(x,z)`, avec `pere(x,y) => parent(x,y)`

Déduction : `epoux(P,F)` donne `epoux(F,P)` ; `epoux(H,V)` et `mere(V,F)` donnent `parent(H,F)` ; F étant l'épouse de P, H est le beau-père de P : `parent(H,P)`. Avec `pere(P,H)` → `parent(P,H)`, d'où `parent(H,P) ^ parent(P,H) => grand_pere(H,H)` : **H est son propre grand-père** (par alliance).

:::attention Ce que cet exercice enseigne
L'énoncé n'est démontrable qu'après avoir **explicité les règles implicites** (beau-père, relations symétriques). Une base de connaissances ne contient que ce qu'on y écrit : le « bon sens » doit être modélisé.
:::
