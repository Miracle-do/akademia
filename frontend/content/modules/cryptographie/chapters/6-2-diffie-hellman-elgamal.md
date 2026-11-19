RSA n'est pas la seule construction à clé publique. Deux autres reposent sur un problème différent : le **logarithme discret**. **Diffie-Hellman** (1976) résout le problème historique de l'**échange de clé** ; **ElGamal** (1985) en dérive un chiffrement et une signature.

## 6.2.1 Le problème du logarithme discret

Dans le groupe **Zₚ*** (p premier), soit g un **générateur**.

- **Calculer y = gˣ mod p** est **facile** (exponentiation rapide).
- **Retrouver x à partir de y, g et p** (le **logarithme discret**) est **très difficile** pour un grand p.

Exemple jouet : dans Z₂₃*, 5⁶ mod 23 = 8. Retrouver « 6 » à partir de 8, c'est le log discret ; avec 23 on teste facilement ; avec un p de 2048 bits, c'est infaisable.

## 6.2.2 Échange de clés de Diffie-Hellman (DH)

**But** : Alice et Bob **créent un secret commun** sur un canal **public**, sans rien s'être échangé au préalable.

**Paramètres publics** : un grand nombre premier **p** et un générateur **g**.

1. Alice choisit un secret **a**, calcule **A = gᵃ mod p**, l'envoie à Bob.
2. Bob choisit un secret **b**, calcule **B = gᵇ mod p**, l'envoie à Alice.
3. Alice calcule **K = Bᵃ mod p** ; Bob calcule **K = Aᵇ mod p**.

Les deux obtiennent **gᵃᵇ mod p**, car (gᵇ)ᵃ = (gᵃ)ᵇ = gᵃᵇ.

**Exemple** : p = 23, g = 5.

| | Alice | Bob |
|---|---|---|
| Secret | a = 6 | b = 15 |
| Envoie | A = 5⁶ mod 23 = **8** | B = 5¹⁵ mod 23 = **19** |
| Calcule | 19⁶ mod 23 = **2** | 8¹⁵ mod 23 = **2** |

**Secret partagé K = 2.** Ève a vu p = 23, g = 5, A = 8, B = 19, mais pour trouver K il lui faudrait a ou b, c'est-à-dire résoudre un logarithme discret.

Le secret K sert ensuite à **dériver une clé symétrique** AES (via une fonction de dérivation).

:::attention DH ne protège pas contre l'homme du milieu
Diffie-Hellman seul **n'authentifie personne**. Mallory peut faire un échange avec Alice et un autre avec Bob, et relayer en déchiffrant tout (attaque **MITM**). Il faut **authentifier** les valeurs A et B par des signatures et des certificats : c'est ce que fait TLS.
:::

**DH éphémère (DHE / ECDHE)** : on génère de **nouveaux a et b à chaque session**. Même si la clé privée à long terme du serveur est volée plus tard, les anciennes sessions restent indéchiffrables : c'est la **confidentialité persistante** (*Perfect Forward Secrecy*). TLS 1.3 l'impose.

## 6.2.3 Le chiffrement ElGamal

Construit sur Diffie-Hellman.

**Clés** : p, g publics. Clé privée **x** ; clé publique **h = gˣ mod p**.

**Chiffrer m** (m < p) : on tire un **k aléatoire** à chaque message ; le chiffré est le couple

> **c₁ = gᵏ mod p**   et   **c₂ = m × hᵏ mod p**

**Déchiffrer** : **m = c₂ × (c₁ˣ)⁻¹ mod p**, car c₁ˣ = gᵏˣ = hᵏ.

**Exemple** : p = 23, g = 5, x = 6 → h = 5⁶ mod 23 = **8**. On chiffre m = 10 avec k = 3 :

- c₁ = 5³ mod 23 = 125 − 115 = **10** ;
- c₂ = 10 × 8³ mod 23 = 10 × 512 mod 23 = 10 × 6 mod 23 = 60 − 46 = **14** ;
- déchiffrement : on calcule **c₁ˣ = 10⁶ mod 23 = 6** (10² = 100 ≡ 8 ; 10⁴ ≡ 64 ≡ 18 ; 10⁶ = 18 × 8 = 144 ≡ 6). C'est bien hᵏ = 8³ mod 23 = 6. Son inverse est **6⁻¹ mod 23 = 4** (6 × 4 = 24 ≡ 1), donc **m = c₂ × 4 = 14 × 4 = 56 ≡ 10** ✔.

:::retenir Particularités d'ElGamal
- Le chiffré est **deux fois plus long** que le clair.
- Il est **probabiliste** : chiffrer deux fois le même message donne deux chiffrés différents (grâce à k).
- **Ne jamais réutiliser k** : deux messages avec le même k révèlent leur rapport.
:::

## 6.2.4 Signatures DSA et ElGamal

**DSA** (*Digital Signature Algorithm*, standard NIST) et ses variantes **ECDSA** dérivent de la signature d'ElGamal : elles produisent un couple (r, s) à partir du haché du message et de la clé privée, avec un **nombre aléatoire par signature**. Si ce nombre est réutilisé ou prévisible, **la clé privée fuit** (c'est ce qui est arrivé à la PlayStation 3 en 2010).

## 6.2.5 Comparaison RSA / DH / ElGamal

| | RSA | Diffie-Hellman | ElGamal |
|---|---|---|---|
| Problème difficile | **factorisation** | **log discret** | **log discret** |
| Usage | chiffrement, signature | **échange de clé** | chiffrement, signature |
| Probabiliste | non (sans OAEP) | oui (secrets éphémères) | **oui** |
| Taille du chiffré | égale à n | n/a | **2× le clair** |

:::examen Exercice type
« p = 23, g = 5. Alice choisit a = 6, Bob b = 15. Calculez A, B et la clé commune. » → **A = 8, B = 19, K = 2.**
Question de cours : *pourquoi Diffie-Hellman seul est-il vulnérable à l'attaque de l'homme du milieu ?* (absence d'authentification des échanges).
:::
