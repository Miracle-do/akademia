Pour échapper à l'analyse fréquentielle, on a imaginé des chiffres où **une même lettre du clair peut être chiffrée de plusieurs façons**. C'est la famille **polyalphabétique** (Vigenère), puis les chiffres **par blocs** (Hill), jusqu'à l'unique chiffre **parfait** : le masque jetable.

## 4.2.1 Le chiffre de Vigenère

Décrit au XVIᵉ siècle, longtemps appelé « le chiffre indéchiffrable ». On choisit une **clé-mot** (par exemple « MUSIQUE ») que l'on répète sous le message ; chaque lettre de la clé donne le **décalage César** appliqué à la lettre correspondante.

- **Chiffrement** : Cᵢ = (Pᵢ + Kᵢ mod |K|) mod 26
- **Déchiffrement** : Pᵢ = (Cᵢ − Kᵢ mod |K|) mod 26

La clé « ACCES » correspond aux décalages **(0, 2, 2, 4, 18)**.

**Exemple du cours** : chiffrer « CETTEPHRASE » avec la clé **ACCES** (on découpe en blocs de 5).

```text
Clair   : C  E  T  T  E | P  H  R  A  S | E
Clé     : A  C  C  E  S | A  C  C  E  S | A
Décalage: 0  2  2  4 18 | 0  2  2  4 18 | 0
Chiffré : C  G  V  X  W | P  J  T  E  K | E
```

Détail : C (2) + 0 = 2 → C ; E (4) + 2 = 6 → G ; T (19) + 2 = 21 → V ; T (19) + 4 = 23 → X ; E (4) + 18 = 22 → W...
Résultat : **CGVXWPJTEKE**.

**Autre exemple classique** : clair « ATTACKATDAWN », clé « LEMON » → **LXFOPVEFRNHR**.

**Avec la clé MUSIQUE** : « CRYPTOGRAPHIE » → **OLQXJIKDUHPYY** (et le déchiffrement redonne bien CRYPTOGRAPHIE).

On peut aussi voir Vigenère comme une **table** (carré de Vigenère) : on lit à l'intersection de la ligne de la lettre de clé et de la colonne de la lettre claire.

**Pourquoi c'est plus fort que César**

- la même lettre claire donne des lettres différentes selon sa position (« T T » devient « V X ») ;
- les fréquences sont **aplaties** ;
- l'espace des clés est de 26ᵐ pour une clé de m lettres.

## 4.2.2 Casser Vigenère

Il a résisté trois siècles, puis a été cassé en deux étapes.

1. **Trouver la longueur m de la clé** :
   - **Test de Kasiski** (1863) : des séquences de lettres identiques dans le chiffré, répétées à des distances multiples de m, révèlent probablement m (on cherche le **pgcd des écarts**) ;
   - **indice de coïncidence** de Friedman : il vaut environ 0,074 pour un texte français ou anglais en monoalphabétique et se rapproche de 0,038 pour un texte aléatoire.
2. **Casser m chiffres de César** : on découpe le chiffré en m colonnes (lettres 1, m+1, 2m+1, ... chiffrées par la même lettre de clé) et on fait une **analyse fréquentielle** sur chaque colonne.

:::attention Plus la clé est courte, plus c'est facile
Avec une clé de 4 ou 5 lettres et quelques centaines de caractères de chiffré, la cryptanalyse est rapide. Avec une clé **aussi longue que le message**, **aléatoire** et **à usage unique**, on obtient le masque jetable (plus loin).
:::

## 4.2.3 Le chiffre de Hill (par blocs, matriciel)

Inventé par Lester Hill en 1929, il chiffre **des blocs de n lettres à la fois** avec une **matrice n × n** modulo 26 : c'est le premier chiffre qui **mélange plusieurs lettres** (diffusion).

- **Chiffrement** : C = K × P (mod 26), où P est le vecteur colonne du bloc clair.
- **Déchiffrement** : P = K⁻¹ × C (mod 26).
- La clé K doit être **inversible modulo 26** : pgcd(det K, 26) = 1.

**Exemple** : K = [[3, 3], [2, 5]] (det = 9, inversible). Chiffrer « HELP » en blocs de 2.

- Bloc « HE » = (7, 4) : 3×7 + 3×4 = 33 ≡ 7 → H ; 2×7 + 5×4 = 34 ≡ 8 → I. Donc « HE » → « HI ».
- Bloc « LP » = (11, 15) : 3×11 + 3×15 = 78 ≡ 0 → A ; 2×11 + 5×15 = 97 ≡ 19 → T. Donc « LP » → « AT ».

Chiffré : **HIAT**. Déchiffrement avec K⁻¹ = [[15, 17], [20, 9]] (calculée au chapitre 3.4) : on retrouve « HELP ».

**Autre exemple** : « CODE » → **WWVA**.

**Force** : les fréquences des lettres isolées disparaissent. **Faiblesse** : le chiffre est **linéaire**. Si l'on connaît n blocs de clair et leurs chiffrés, on résout le système et on retrouve la clé (**attaque à clair connu**). La linéarité est la leçon : un bon chiffre moderne ajoute de la **non-linéarité** (les S-boxes d'AES).

## 4.2.4 Le masque jetable (chiffre de Vernam, one-time pad)

Le chiffre de **Vernam** (1917) fait un **XOR** bit à bit entre le message et une clé :

> **C = P ⊕ K** et **P = C ⊕ K** (car K ⊕ K = 0)

Exemple : message « OUI » (octets 4F 55 49) et clé aléatoire 5A 13 C7 → chiffré **15 46 8E**. Rejouer le XOR avec la même clé redonne « OUI ».

**Théorème de Shannon (1949)** : le masque jetable est **parfaitement secret** (le chiffré ne donne **aucune information** sur le clair) si et seulement si :

1. la clé est **vraiment aléatoire** ;
2. la clé est **au moins aussi longue** que le message ;
3. la clé n'est **utilisée qu'une seule fois**.

Si l'une des conditions est violée, la sécurité s'effondre. **Réutiliser la clé** : en XORant deux chiffrés on obtient P₁ ⊕ P₂, où la clé a disparu, ce qui ouvre la porte à l'analyse (c'est l'attaque sur le projet américain **Venona**).

**Inconvénient majeur** : il faut **distribuer une clé aussi longue que le message** par un canal sûr, ce qui revient au même problème que d'envoyer le message. Il sert dans des cas extrêmes (ligne directe sensible). Les **chiffrements de flux** modernes (ChaCha20, AES-CTR) s'en inspirent avec un **générateur pseudo-aléatoire** à la place de la vraie clé aléatoire.

:::retenir Résumé de l'évolution
| Chiffre | Type | Faille |
|---|---|---|
| César | monoalphabétique, 25 clés | force brute |
| Affine | monoalphabétique, 312 clés | force brute, fréquences |
| Substitution générale | monoalphabétique, 26! clés | fréquences |
| Vigenère | polyalphabétique | Kasiski + fréquences par colonne |
| Hill | par blocs, linéaire | clair connu |
| Vernam | XOR, clé jetable | parfait... mais impraticable |
:::

## 4.2.5 Exercices du cours : méthode

- **Vigenère, clé de longueur 4** : on découpe en blocs de 4 et on applique les 4 décalages. Si K = « CLE » (3 lettres) et le message « ATTAQUEAUXAUBE », le chiffré est **CEXCBYGLYZLYDP**.
- Pour **retrouver la clé** à partir d'un couple (clair, chiffré) : K = C − P mod 26, lettre par lettre.
- Si on vous donne seulement le chiffré : Kasiski/indice de coïncidence puis fréquences.

:::examen Questions types
- Chiffrez « CRYPTOGRAPHIE » avec Vigenère, clé MUSIQUE. → **OLQXJIKDUHPYY**
- Pourquoi Vigenère résiste-t-il à l'analyse fréquentielle simple ? Parce qu'une même lettre claire est chiffrée de plusieurs façons.
- Quelles sont les trois conditions du masque jetable ?
- Pourquoi le chiffre de Hill est-il vulnérable à une attaque à clair connu ? Parce qu'il est linéaire : n blocs connus permettent de résoudre pour K.
:::
