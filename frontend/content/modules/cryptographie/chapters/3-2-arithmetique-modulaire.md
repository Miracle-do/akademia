De nombreux systèmes cryptographiques reposent sur l'**arithmétique modulaire**, celle de l'« horloge » : après 12 on revient à 1. Elle permet de travailler avec des nombres qui « bouclent » et de définir des opérations **inversibles**, exactement ce qu'il faut pour chiffrer et déchiffrer.

## 3.2.1 La congruence

Soient trois entiers a, b et n, avec n > 0. On dit que **a est congru à b modulo n**, et on écrit

> **a ≡ b (mod n)**

si et seulement si **n divise a − b**, c'est-à-dire s'il existe un entier k tel que **a − b = k·n**. L'entier n s'appelle le **modulus** (le module).

Exemples : 29 ≡ 1 (mod 4) car 29 − 1 = 28 = 7 × 4. De même 17 ≡ 2 (mod 5), et 100 ≡ 0 (mod 10).

## 3.2.2 Calcul pratique du modulo

Le calcul est plus simple qu'il n'y paraît : **a mod n est le reste de la division euclidienne de a par n**, toujours compris entre 0 et n − 1.

- 29 mod 4 : 29 = 7 × 4 + **1** → **1** ;
- 100 mod 7 : 100 = 14 × 7 + **2** → **2** ;
- 2024 mod 26 : 2024 = 77 × 26 + **22** → **22**.

:::attention Les nombres négatifs
Le reste est **toujours positif ou nul**. Donc **−3 mod 26 = 23** (et non −3), car −3 = (−1) × 26 + 23. En Python, `-3 % 26` donne bien 23 ; en C ou Java, `-3 % 26` donne **−3** : il faut ajouter n puis refaire un modulo. Cette différence provoque des bogues classiques dans les implémentations de César et de Vigenère.
:::

## 3.2.3 L'ensemble Zₙ

On note **Zₙ = {0, 1, …, n − 1}** l'ensemble des entiers modulo n. Les opérations fonctionnent comme d'habitude, mais **tous les résultats sont réduits modulo n**.

**Addition** dans Z₂₆ : 20 + 15 = 35 ≡ 9. (Z₂₆ est l'ensemble des 26 lettres, A = 0, …, Z = 25 : c'est exactement le chiffre de César.)

**Soustraction** : a − b mod n. Ainsi 5 − 12 = −7 ≡ 19 (mod 26).

**Opposé** : l'opposé de a est l'élément **−a** tel que a + (−a) ≡ 0 (mod n). C'est **n − a** (pour a ≠ 0). Dans Z₂₆, l'opposé de 8 est 18. Soustraire revient à ajouter l'opposé.

**Multiplication** : 7 × 9 = 63 = 2 × 26 + 11 → **11** dans Z₂₆.

Voici les tables de multiplication de Z₅ et de Z₆, à comparer :

| × | 0 | 1 | 2 | 3 | 4 |
|---|---|---|---|---|---|
| **0** | 0 | 0 | 0 | 0 | 0 |
| **1** | 0 | 1 | 2 | 3 | 4 |
| **2** | 0 | 2 | 4 | 1 | 3 |
| **3** | 0 | 3 | 1 | 4 | 2 |
| **4** | 0 | 4 | 3 | 2 | 1 |

Dans Z₅, **chaque ligne non nulle contient un 1** : tout élément non nul a un inverse. Dans Z₆ ce n'est pas le cas : 2 × 3 = 6 ≡ 0, et ni 2, ni 3, ni 4 n'ont d'inverse.

## 3.2.4 L'inverse modulaire

L'**inverse** de a modulo n est l'entier a⁻¹ tel que

> **a × a⁻¹ ≡ 1 (mod n)**

Il **n'existe pas toujours**. Théorème :

> **a est inversible modulo n ⇔ pgcd(a, n) = 1** (a et n sont **premiers entre eux**).

Exemples :

- dans Z₅ : 2⁻¹ = 3 (car 2 × 3 = 6 ≡ 1), 4⁻¹ = 4 (car 16 ≡ 1) ;
- dans Z₂₆ : 7⁻¹ = **15** (car 7 × 15 = 105 = 4 × 26 + 1) ;
- dans Z₂₆ : **2 n'a pas d'inverse** (pgcd(2, 26) = 2) ; c'est pourquoi on ne peut pas utiliser n'importe quelle clé multiplicative dans un chiffrement affine.

Pour **calculer** un inverse, on utilise l'**algorithme d'Euclide étendu** (chapitre 3.3). C'est le cœur de la génération des clés RSA.

:::retenir Les 12 valeurs inversibles de Z₂₆
Il y a **φ(26) = 12** éléments inversibles : 1, 3, 5, 7, 9, 11, 15, 17, 19, 21, 23, 25. Ce sont les nombres **impairs différents de 13**. Un chiffrement affine C = a·P + b mod 26 n'accepte que ces 12 valeurs de a.
:::

## 3.2.5 Notion de groupe

Un **groupe** (G, ∗) est un ensemble muni d'une opération qui vérifie :

1. **fermeture** : a ∗ b reste dans G ;
2. **associativité** ;
3. existence d'un **élément neutre** e (a ∗ e = a) ;
4. existence d'un **inverse** pour chaque élément.

(Zₙ, +) est un groupe pour tout n. (Zₚ*, ×), c'est-à-dire les éléments non nuls de Zₚ avec p premier, est aussi un groupe : c'est celui de **Diffie-Hellman** et d'**ElGamal**.

Le plus important dans un groupe est **l'existence d'un inverse** pour chaque élément. Les groupes fournissent donc des fonctions **inversibles**, utilisables dans des algorithmes de chiffrement car elles permettent le **déchiffrement**.

## 3.2.6 Les entiers en informatique

Les entiers machine ne sont pas les entiers mathématiques. Un entier informatique est **fini** (sous-ensemble de Z, borné par la taille du mot machine) ; un `unsigned int` 32 bits calcule en réalité **modulo 2³²**. C'est une arithmétique modulaire « gratuite » que les algorithmes de hachage (MD5, SHA) et de chiffrement (AES, ChaCha20) exploitent : **addition modulo 2³²**, rotation de bits, XOR.

Pour les grands nombres de RSA (2048 bits), il faut des bibliothèques de **grands entiers** (OpenSSL BN, `BigInteger`, les entiers Python).

:::examen Exercices types (corrigés)
- Calculez 29 mod 4 → **1**.
- Calculez (17 + 20) mod 26 → 37 − 26 = **11**.
- Calculez 7 × 9 mod 26 → 63 − 52 = **11**.
- Trouvez l'inverse de 7 modulo 26 → **15**.
- Pourquoi 6 n'a-t-il pas d'inverse modulo 9 ? Parce que pgcd(6, 9) = 3 ≠ 1.
:::
