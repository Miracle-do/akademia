Les chiffrements classiques ne protègent plus rien aujourd'hui, mais ils sont **l'école de la cryptographie** : on y voit clairement la clé, la substitution, la bijection, l'arithmétique modulaire et surtout **comment on les casse**. Dans tout ce chapitre, on numérote les lettres : **A = 0, B = 1, …, Z = 25**, et on calcule **modulo 26**.

## 4.1.1 Le chiffre de César

Attribué à Jules César (Iᵉʳ siècle av. J.-C.), c'est une substitution **monoalphabétique par décalage** : chaque lettre est décalée de **k** positions dans l'alphabet.

- **Chiffrement** : C = (P + k) mod 26
- **Déchiffrement** : P = (C − k) mod 26

Le César historique utilise k = 3 (A → D, B → E, … X → A, Y → B, Z → C).

**Exemple** : chiffrer « MESSAGESECRET » avec k = 3.

| Clair | M | E | S | S | A | G | E | S | E | C | R | E | T |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Rang | 12 | 4 | 18 | 18 | 0 | 6 | 4 | 18 | 4 | 2 | 17 | 4 | 19 |
| +3 mod 26 | 15 | 7 | 21 | 21 | 3 | 9 | 7 | 21 | 7 | 5 | 20 | 7 | 22 |
| Chiffré | P | H | V | V | D | J | H | V | H | F | U | H | W |

Résultat : **PHVVDJHVHFUHW**. Pour déchiffrer, on applique −3.

**Généralisation** : toute clé k de 0 à 25 est possible (k = 0 ne change rien). L'**espace des clés n'a que 25 valeurs utiles** : on peut toutes les tester à la main. C'est la faiblesse fatale du César : une **attaque par force brute** le casse en quelques secondes.

:::attention ROT13
ROT13 est un César de décalage 13. Comme 13 + 13 = 26, **chiffrer deux fois redonne le clair** : la même opération chiffre et déchiffre. Ce n'est pas de la sécurité, seulement un moyen de masquer un spoiler.
:::

## 4.1.2 Le chiffre affine

On généralise César avec une multiplication : **C = (a·P + b) mod 26**.

- La clé est le couple **(a, b)**.
- Pour déchiffrer, il faut que **a soit inversible modulo 26**, c'est-à-dire **pgcd(a, 26) = 1** (12 valeurs possibles : 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25).
- **Déchiffrement** : P = a⁻¹ · (C − b) mod 26.

**Exemple** : chiffrer « BONJOUR » avec (a, b) = (3, 5).

- B = 1 → 3×1 + 5 = 8 → I ; O = 14 → 3×14 + 5 = 47 ≡ 21 → V ; N = 13 → 44 ≡ 18 → S ; J = 9 → 32 ≡ 6 → G ; O → V ; U = 20 → 65 ≡ 13 → N ; R = 17 → 56 ≡ 4 → E.
- Chiffré : **IVSGVNE**.
- Inverse : 3⁻¹ mod 26 = **9** (3 × 9 = 27 ≡ 1). Déchiffrement : P = 9 (C − 5) mod 26. Pour I = 8 : 9 × 3 = 27 ≡ 1 → B ✔.

L'espace des clés est de **12 × 26 = 312** : toujours trivial à explorer.

## 4.1.3 Le chiffre Atbash

**Atbash** est un chiffre de substitution hébraïque très ancien : l'alphabet est **inversé** (A ↔ Z, B ↔ Y, C ↔ X...).

- **Formule** : C = (25 − P) mod 26, c'est un cas particulier du chiffre affine avec a = −1 = 25 et b = 25.
- Il est **involutif** : l'appliquer deux fois redonne le clair, comme ROT13.
- **Aucune clé** : tout le secret réside dans l'algorithme, ce qui viole le principe de Kerckhoffs.

**Exemples** : BENIN → **YVMRM** ; CRYPTOGRAPHIE → **XIBKGLTIZKSRV**.

| Clair | A | B | C | D | E | … | X | Y | Z |
|---|---|---|---|---|---|---|---|---|---|
| Atbash | Z | Y | X | W | V | … | C | B | A |

## 4.1.4 Casser une substitution monoalphabétique : l'analyse fréquentielle

Une substitution **conserve les fréquences** : si le « E » est la lettre la plus fréquente d'un texte français, la lettre qui la remplace sera la plus fréquente du chiffré. Le savant arabe **Al-Kindi** (IXᵉ siècle) a décrit cette méthode.

**Fréquences approximatives en français** : E ≈ 14,7 %, A ≈ 7,6 %, S ≈ 7,9 %, I ≈ 7,5 %, N ≈ 7,1 %, T ≈ 7,2 %, R ≈ 6,6 %, U ≈ 6,3 %, L ≈ 5,5 %, O ≈ 5,4 %. Les lettres rares : W, K, Y, Z, X.

**Méthode**

1. Compter les fréquences des lettres du chiffré.
2. Associer la plus fréquente à « E », puis la suivante à « S », « A », « I », « N »...
3. Chercher des **mots courts** (« LE », « DE », « ET », « QUE ») et des **doublets** (« SS », « LL »).
4. Ajuster par essais en s'aidant du sens du texte.

Pour un **César**, c'est encore plus simple : repérer la lettre la plus fréquente, supposer qu'elle correspond à E, en déduire le décalage k, et vérifier.

:::retenir Pourquoi tous ces chiffres sont cassés
Un **petit nombre de clés** (César, affine) tombe à la force brute. Un **grand nombre de clés** mais qui **préserve les fréquences** (substitution quelconque : 26! ≈ 4 × 10²⁶ clés) tombe à l'analyse fréquentielle. La sécurité exige **les deux** : espace de clés immense *et* absence de fuite statistique.
:::

## 4.1.5 Limites du chiffrement de César

- **Trop peu de clés** (25) : force brute immédiate.
- **Fréquences conservées** : analyse fréquentielle.
- **Aucune diffusion** : changer une lettre du clair ne change qu'une lettre du chiffré.
- **Algorithme faible face à Kerckhoffs** : si l'on connaît le principe, il ne reste que 25 essais.

La polyalphabétique (Vigenère) tente de corriger ces défauts (chapitre suivant).

:::examen Exercices types (corrigés)
- Chiffrer « ATTAQUEAUXAUBE » avec César k = 3 → **DWWDTXHDXADXEH**.
- Déchiffrer « PHVVDJHVHFUHW » avec k = 3 → **MESSAGESECRET**.
- Chiffrer « AFFINE » avec (a, b) = (5, 8) → **IHHWVC**.
- Pourquoi (a, b) = (2, 7) est-elle une mauvaise clé affine ? Parce que pgcd(2, 26) = 2 : plusieurs lettres donneraient le même chiffré, la fonction n'est pas bijective.
:::
