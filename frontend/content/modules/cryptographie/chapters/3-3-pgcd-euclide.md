Générer une clé RSA, calculer un inverse modulaire, déchiffrer : tout repose sur **le pgcd et l'algorithme d'Euclide**. Ce chapitre est très « examen » : on y calcule beaucoup à la main.

## 3.3.1 Diviseurs et nombres premiers

Un entier **a divise** b (noté a | b) s'il existe k entier tel que b = k·a.

Un **nombre premier** est un entier **p ≥ 2** dont les seuls diviseurs positifs sont **1 et p** : 2, 3, 5, 7, 11, 13, 17, 19, 23... (2 est le seul premier pair). Un entier ≥ 2 non premier est dit **composé**.

**Théorème fondamental de l'arithmétique** : tout entier ≥ 2 s'écrit **de façon unique** comme produit de nombres premiers (à l'ordre près).

- 120 = 2³ × 3 × 5
- 1468 = 2² × 367
- 1120 = 2⁵ × 5 × 7

**La sécurité de RSA repose sur la difficulté de factoriser** un grand entier n = p × q. Multiplier deux premiers de 1024 bits est instantané ; retrouver p et q à partir de n (2048 bits) est hors de portée des algorithmes connus sur un ordinateur classique.

Pour **tester** qu'un entier n est premier à la main, il suffit d'essayer les diviseurs jusqu'à √n. Le **crible d'Ératosthène** liste les premiers jusqu'à une borne. En pratique, on utilise le test probabiliste de **Miller-Rabin**.

## 3.3.2 PGCD et PPCM

- **pgcd(a, b)** : le **plus grand commun diviseur**, le plus grand entier qui divise à la fois a et b.
- **ppcm(a, b)** : le **plus petit commun multiple**.
- Deux entiers sont **premiers entre eux** si pgcd(a, b) = 1.

**Méthode par décomposition** : on prend les facteurs premiers communs avec le plus **petit** exposant pour le pgcd, et **tous** les facteurs avec le plus **grand** exposant pour le ppcm.

**Lien entre les deux** :

> **pgcd(a, b) × ppcm(a, b) = a × b**

## 3.3.3 L'algorithme d'Euclide

La décomposition en facteurs premiers est impraticable pour de grands nombres. **Euclide** propose une méthode rapide, fondée sur ce théorème :

> **pgcd(a, b) = pgcd(b, r)** où r est le **reste** de la division euclidienne de a par b.

On répète jusqu'à obtenir un reste nul ; **le dernier reste non nul est le pgcd**.

**Exemple : pgcd(120, 45)**

| a | b | division | reste |
|---|---|---|---|
| 120 | 45 | 120 = 2 × 45 + **30** | 30 |
| 45 | 30 | 45 = 1 × 30 + **15** | 15 |
| 30 | 15 | 30 = 2 × 15 + **0** | 0 |

Dernier reste non nul : **15**, donc pgcd(120, 45) = 15.

**Les exercices du cours, corrigés**

| Calcul | Résultat |
|---|---|
| pgcd(120, 45) | **15** |
| pgcd(100, 460) | **20** |
| pgcd(122345, 45030) | **5** |
| pgcd(19, 17) | **1** (premiers entre eux) |
| pgcd(12, 45) | **3** |
| pgcd(130, 460) | **10** |
| pgcd(122345, 450300) | **5** |
| ppcm(13, 11) | **143** |
| ppcm(120, 110) | **1320** (pgcd = 10) |
| ppcm(1468, 1120) | **411 040** (pgcd = 4) |

Détail pour pgcd(122345, 45030) :

```text
122345 = 2 × 45030 + 32285
 45030 = 1 × 32285 + 12745
 32285 = 2 × 12745 + 6795
 12745 = 1 ×  6795 + 5950
  6795 = 1 ×  5950 + 845
  5950 = 7 ×   845 + 35
   845 = 24 ×   35 + 5
    35 = 7 ×     5 + 0     → pgcd = 5
```

:::retenir Combien d'étapes ?
L'algorithme d'Euclide est **très efficace** : le nombre de divisions est proportionnel au nombre de **chiffres** de a, pas à sa valeur. C'est pourquoi on peut l'exécuter sur des nombres de 2048 bits.
:::

## 3.3.4 L'identité de Bézout

**Théorème de Bézout** : pour tous entiers a et b, il existe des entiers u et v tels que

> **a·u + b·v = pgcd(a, b)**

En particulier, **si pgcd(a, n) = 1**, alors a·u + n·v = 1, d'où **a·u ≡ 1 (mod n)** : **u est l'inverse de a modulo n**. L'**algorithme d'Euclide étendu** calcule u et v.

## 3.3.5 L'algorithme d'Euclide étendu

On « remonte » les divisions d'Euclide.

**Exemple 1 : inverse de 7 modulo 26**

```text
26 = 3 × 7 + 5          →  5 = 26 − 3×7
 7 = 1 × 5 + 2          →  2 = 7 − 1×5
 5 = 2 × 2 + 1          →  1 = 5 − 2×2
```

On remonte :

```text
1 = 5 − 2×2
  = 5 − 2×(7 − 5)       = 3×5 − 2×7
  = 3×(26 − 3×7) − 2×7  = 3×26 − 11×7
```

Donc 7 × (−11) ≡ 1 (mod 26), soit **7⁻¹ ≡ −11 ≡ 15 (mod 26)**.

**Exemple 2 (RSA) : inverse de 17 modulo 3120**

```text
3120 = 183 × 17 + 9
  17 =   1 ×  9 + 8
   9 =   1 ×  8 + 1
```

```text
1 = 9 − 8 = 9 − (17 − 9) = 2×9 − 17
  = 2×(3120 − 183×17) − 17 = 2×3120 − 367×17
```

Donc 17 × (−367) ≡ 1 (mod 3120), et **−367 ≡ 3120 − 367 = 2753**. On a trouvé **d = 2753** : c'est la clé privée de l'exemple RSA du chapitre 6.1.

Vérification : 17 × 2753 = 46 801 = 15 × 3120 + 1. ✔

:::attention Piège de signe
Euclide étendu donne souvent un coefficient **négatif** (−11, −367). N'oubliez pas de **ramener dans [0, n−1]** en ajoutant n.
:::

## 3.3.6 Récapitulatif des outils

| Besoin | Outil |
|---|---|
| Savoir si a est inversible mod n | pgcd(a, n) = 1 ? (Euclide) |
| Calculer a⁻¹ mod n | Euclide étendu |
| Réduire un grand nombre | reste de la division |
| Calculer aᵏ mod n | exponentiation rapide (chapitre 3.4) |
| Casser RSA | factoriser n |

:::examen Exercices types
- Calculez pgcd(130, 460) avec l'algorithme d'Euclide et montrez les divisions.
- Calculez l'inverse de 11 modulo 26 par Euclide étendu. *(Réponse : 19, car 11 × 19 = 209 = 8 × 26 + 1.)*
- Pourquoi 4 n'a-t-il pas d'inverse modulo 10 ? pgcd(4, 10) = 2.
- Donnez la décomposition en facteurs premiers de 120 et de 1468.
:::
