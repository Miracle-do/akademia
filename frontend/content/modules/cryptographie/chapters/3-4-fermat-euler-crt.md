Trois résultats classiques font marcher RSA et beaucoup d'autres algorithmes : le **petit théorème de Fermat**, l'**indicatrice d'Euler** et le **théorème des restes chinois**. On y ajoute les **matrices modulaires**, nécessaires pour le chiffre de Hill.

## 3.4.1 Le petit théorème de Fermat

> Si **p est premier** et p ne divise pas a, alors **a^(p−1) ≡ 1 (mod p)**.
> Variante : pour tout entier a, **aᵖ ≡ a (mod p)**.

Application immédiate : réduire de gros exposants. On réduit l'exposant **modulo p − 1**.

**Exemples**

- 3¹⁰⁰ mod 7 : p − 1 = 6 ; 100 = 6 × 16 + 4 ; donc 3¹⁰⁰ ≡ 3⁴ = 81 ≡ **4** (mod 7).
- 2¹⁰⁰ mod 13 : p − 1 = 12 ; 100 = 12 × 8 + 4 ; 2¹⁰⁰ ≡ 2⁴ = 16 ≡ **3** (mod 13).
- 7²²² mod 11 : p − 1 = 10 ; 222 = 10 × 22 + 2 ; 7²²² ≡ 7² = 49 ≡ **5** (mod 11).

Autre usage : pour p premier, **a⁻¹ ≡ a^(p−2) (mod p)**. Par exemple 3⁻¹ mod 7 = 3⁵ = 243 = 34 × 7 + 5 → **5** (vérif : 3 × 5 = 15 ≡ 1).

## 3.4.2 L'indicatrice d'Euler φ(n)

φ(n) est le **nombre d'entiers entre 1 et n premiers avec n**, c'est-à-dire le nombre d'éléments inversibles de Zₙ.

- Si **p est premier** : **φ(p) = p − 1**.
- Si **p et q sont premiers distincts** : **φ(p·q) = (p − 1)(q − 1)**. *C'est la formule de RSA.*
- Si n = pᵏ : φ(n) = pᵏ − pᵏ⁻¹.
- φ est **multiplicative** : φ(a·b) = φ(a)·φ(b) si pgcd(a, b) = 1.

Exemples : φ(7) = 6 ; φ(26) = φ(2) × φ(13) = 1 × 12 = **12** ; φ(35) = 4 × 6 = **24** ; φ(36) = φ(4) × φ(9) = 2 × 6 = **12**.

**Théorème d'Euler** (généralise Fermat) : si pgcd(a, n) = 1, alors **a^φ(n) ≡ 1 (mod n)**.

C'est ce théorème qui **prouve que RSA fonctionne** : si e·d ≡ 1 (mod φ(n)), alors (mᵉ)ᵈ = m^(1 + kφ(n)) ≡ m (mod n).

## 3.4.3 Exponentiation modulaire rapide

Calculer m¹⁷ ou m²⁷⁵³ mod n en multipliant 2752 fois serait lent ; avec des exposants de 2048 bits, **impossible**. On utilise l'**exponentiation par carrés successifs** : on écrit l'exposant en binaire.

**Exemple : 5¹¹⁷ mod 19**

117 = 64 + 32 + 16 + 4 + 1, mais on peut aussi utiliser Fermat : 117 = 18 × 6 + 9, donc 5¹¹⁷ ≡ 5⁹ (mod 19). Carrés successifs :

```text
5¹ = 5
5² = 25 ≡ 6
5⁴ = 6² = 36 ≡ 17
5⁸ = 17² = 289 ≡ 4         (289 = 15×19 + 4)
5⁹ = 5⁸ × 5 = 20 ≡ 1
```

Donc 5¹¹⁷ ≡ **1** (mod 19).

Cette méthode demande de l'ordre de **log₂(exposant)** multiplications, d'où des opérations RSA rapides. En Python : `pow(a, e, n)`.

## 3.4.4 Le théorème des restes chinois (CRT)

> Si n₁, n₂, …, n_k sont **deux à deux premiers entre eux**, alors le système
> x ≡ a₁ (mod n₁), x ≡ a₂ (mod n₂), …, x ≡ a_k (mod n_k)
> admet **une solution unique modulo N = n₁·n₂·…·n_k**.

C'est ce théorème qui permet d'**accélérer RSA** (déchiffrer modulo p et modulo q séparément, puis recombiner) et de découper des calculs en petits morceaux.

### Exercice du cours : les pirates et le cuisinier chinois

> Une bande de **17 pirates** s'est emparée d'un butin de pièces d'or égales. Ils se partagent équitablement les pièces et donnent le reste au cuisinier : il reçoit **3 pièces**. Six pirates sont tués : il reste 11 pirates, le cuisinier reçoit **4 pièces**. Après un naufrage, il ne reste que **6 pirates** et le cuisinier : il reçoit **5 pièces**. Quelle est la **fortune minimale** du cuisinier s'il empoisonne tous les pirates ?

Soit N le nombre de pièces. On traduit :

```text
N ≡ 3 (mod 17)
N ≡ 4 (mod 11)
N ≡ 5 (mod 6)
```

17, 11 et 6 sont deux à deux premiers entre eux : une solution unique modulo 17 × 11 × 6 = **1122**.

**Étape 1** : N = 3 + 17t, et 3 + 17t ≡ 4 (mod 11) → 17t ≡ 1 (mod 11) → 6t ≡ 1 (mod 11). L'inverse de 6 modulo 11 est 2 (6 × 2 = 12 ≡ 1), donc t ≡ 2 (mod 11), d'où N = 3 + 34 = **37** (mod 187).

**Étape 2** : N = 37 + 187s, et 37 + 187s ≡ 5 (mod 6). Comme 37 ≡ 1 et 187 ≡ 1 (mod 6) : 1 + s ≡ 5, donc s ≡ 4 (mod 6), d'où N = 37 + 187 × 4 = 37 + 748 = **785**.

**Vérification** : 785 = 46 × 17 + 3 ✔ ; 785 = 71 × 11 + 4 ✔ ; 785 = 130 × 6 + 5 ✔.

Le cuisinier a donc au minimum **785 pièces d'or** (les autres solutions sont 785 + 1122k : 1907, 3029…).

:::retenir Méthode CRT en 3 temps
1. Écrire le système de congruences.
2. **Fusionner deux congruences à la fois** : poser x = a₁ + n₁·t et résoudre en t.
3. Vérifier avec chaque modulo à la fin.
:::

## 3.4.5 Matrices modulaires

Pour le **chiffre de Hill** (chapitre 4.2), on chiffre des blocs de lettres avec une matrice carrée. On rappelle les opérations : **addition**, **soustraction**, **multiplication**, **déterminant**, **inverse** d'une matrice carrée, toutes **réduites modulo n**.

**Matrice 2 × 2** K = [[a, b], [c, d]] :

- déterminant **det K = a·d − b·c** ;
- K est inversible modulo n ⇔ **pgcd(det K, n) = 1** ;
- inverse : **K⁻¹ = (det K)⁻¹ × [[d, −b], [−c, a]]** (mod n).

**Exemple** avec K = [[3, 3], [2, 5]] et n = 26 :

- det K = 3 × 5 − 3 × 2 = 9 ; pgcd(9, 26) = 1, donc K est inversible ;
- (9)⁻¹ mod 26 = **3** (9 × 3 = 27 ≡ 1) ;
- K⁻¹ = 3 × [[5, −3], [−2, 3]] = [[15, −9], [−6, 9]] ≡ **[[15, 17], [20, 9]]** (mod 26).

Vérification : K × K⁻¹ = [[3×15 + 3×20, 3×17 + 3×9], [2×15 + 5×20, 2×17 + 5×9]] = [[105, 78], [130, 79]] ≡ **[[1, 0], [0, 1]]** (mod 26). ✔

:::attention Une matrice peut avoir un déterminant non nul et ne pas être inversible modulo 26
Il faut que le déterminant soit **premier avec 26** : s'il est pair ou multiple de 13, **la clé est invalide**.
:::

:::examen Exercices types
- Calculez 3¹⁰⁰ mod 7 avec Fermat. → **4**
- Calculez φ(35). → **24**
- Résolvez x ≡ 2 (mod 3) et x ≡ 3 (mod 5). → **x ≡ 8 (mod 15)**
- Donnez l'inverse de la matrice [[3, 3], [2, 5]] modulo 26. → **[[15, 17], [20, 9]]**
:::
