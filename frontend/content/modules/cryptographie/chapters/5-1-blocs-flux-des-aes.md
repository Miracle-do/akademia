Les chiffrements symétriques modernes se répartissent en deux familles : par **blocs** et par **flux**. Deux standards dominent l'histoire : **DES** (1977, aujourd'hui obsolète) et **AES** (2001, partout aujourd'hui).

## 5.1.1 Chiffrement par blocs et chiffrement par flux

| | **Par blocs** | **Par flux** |
|---|---|---|
| Principe | découpe le message en **blocs de taille fixe** (64 ou 128 bits) chiffrés avec la même clé | génère un **flux pseudo-aléatoire** (keystream) combiné par **XOR** avec le message, bit à bit ou octet par octet |
| Exemples | DES, 3DES, **AES**, Blowfish, IDEA | RC4 (obsolète), **ChaCha20**, A5/1 |
| Besoin | un **mode opératoire** (ECB, CBC, CTR...) et du **bourrage** (*padding*) | un **nonce/IV** unique : jamais de réutilisation (keystream, clé) |
| Usage | fichiers, disques, TLS | communications temps réel, objets faibles ressources |

Un chiffrement de flux est **malléable** : en modifiant un bit du chiffré, on modifie le même bit du clair, sans connaître la clé. C'est pourquoi le chiffrement seul **ne garantit pas l'intégrité** (voir chapitre 7).

## 5.1.2 Confusion et diffusion (Shannon)

Les deux principes de conception d'un chiffre sûr (Claude Shannon, 1949) :

- **Confusion** : rendre la relation entre la clé et le chiffré **aussi complexe que possible** (substitutions, S-boxes) ;
- **Diffusion** : répandre l'influence de **chaque bit du clair** sur **beaucoup de bits du chiffré** (permutations, mélange). Un bon chiffre a l'**effet d'avalanche** : changer 1 bit en entrée change en moyenne la moitié des bits de sortie.

Les chiffrements modernes **répètent** des tours combinant ces deux ingrédients.

## 5.1.3 DES (Data Encryption Standard)

Adopté en **1977** comme standard américain (conçu à partir de Lucifer d'IBM, avec la NSA).

- **Bloc** : 64 bits.
- **Clé** : 64 bits dont **8 de parité**, soit **56 bits effectifs**.
- **Structure** : **réseau de Feistel** à **16 tours**.

**Réseau de Feistel** : le bloc est coupé en deux moitiés **L** et **R**. À chaque tour :

> L' = R  ;  R' = L ⊕ F(R, K_tour)

La fonction F (expansion, XOR avec la sous-clé, **8 S-boxes**, permutation) n'a **pas besoin d'être inversible** : la structure de Feistel est toujours inversible, car il suffit d'appliquer les sous-clés **dans l'ordre inverse** pour déchiffrer. C'est l'élégance de DES : même circuit pour chiffrer et déchiffrer.

**Pourquoi DES est mort** : **56 bits seulement** = 2⁵⁶ ≈ 7,2 × 10¹⁶ clés. En 1998, la machine **Deep Crack** de l'EFF l'a cassé par force brute en environ **56 heures** ; aujourd'hui quelques heures suffisent avec du matériel adapté. Le bloc de 64 bits est aussi trop petit (attaque **Sweet32** sur les longues sessions).

## 5.1.4 Triple DES (3DES)

Pour prolonger la vie de DES, on l'applique **trois fois** avec 2 ou 3 clés, en mode **EDE** (chiffrer-déchiffrer-chiffrer) : C = E_K3(D_K2(E_K1(P))).

- Clé nominale de 168 bits, mais sécurité effective d'environ **112 bits** (attaque *meet-in-the-middle*).
- **Trois fois plus lent** que DES, bloc toujours de 64 bits.
- Déprécié par le NIST ; à éviter dans les nouveaux systèmes.

:::attention Pourquoi pas « 2DES » ?
Chiffrer deux fois avec deux clés de 56 bits donnerait 112 bits de sécurité en théorie, mais l'attaque **meet-in-the-middle** ramène l'effort à environ 2⁵⁷ opérations : à peine mieux que DES. D'où les trois passes du 3DES.
:::

## 5.1.5 AES (Advanced Encryption Standard)

Choisi en **2000** par le NIST après un **concours public international** (conforme à Kerckhoffs), standardisé en **2001** (FIPS 197). L'algorithme retenu est **Rijndael**, des Belges Joan Daemen et Vincent Rijmen.

| | AES-128 | AES-192 | AES-256 |
|---|---|---|---|
| Bloc | 128 bits | 128 bits | 128 bits |
| Clé | 128 bits | 192 bits | 256 bits |
| Tours | **10** | **12** | **14** |

**Structure** : **réseau substitution-permutation** (SPN), non Feistel. L'état est une **matrice 4 × 4 d'octets** (16 octets = 128 bits). Chaque tour comprend :

1. **SubBytes** : chaque octet est remplacé par sa valeur dans une **S-box** (inverse dans le corps fini GF(2⁸), puis transformation affine). C'est la **confusion**, et la seule opération **non linéaire**.
2. **ShiftRows** : les lignes de la matrice sont décalées cycliquement (0, 1, 2, 3 positions). **Diffusion** entre colonnes.
3. **MixColumns** : chaque colonne est multipliée par une matrice fixe dans GF(2⁸). **Diffusion** à l'intérieur de la colonne. (Absente au dernier tour.)
4. **AddRoundKey** : XOR avec la **sous-clé de tour**, dérivée de la clé par l'**expansion de clé**.

Avant le premier tour : un AddRoundKey initial. Le déchiffrement applique les opérations inverses.

:::retenir Chiffres à connaître
**AES : bloc 128 bits ; clés 128/192/256 ; 10/12/14 tours.**
**DES : bloc 64 bits ; clé 56 bits (+8 parité) ; 16 tours ; Feistel.**
:::

**Sécurité et performance**

- Aucune attaque pratique connue sur AES complet ; la meilleure attaque théorique (biclique) ne gagne qu'un facteur environ 4 sur la force brute.
- AES-128 offre déjà environ 2¹²⁸ clés : **hors de portée** de toute force brute. AES-256 sert pour la résistance à long terme (y compris face aux ordinateurs quantiques, voir chapitre 10).
- Les processeurs modernes ont des instructions matérielles dédiées (**AES-NI**) : chiffrement très rapide.

## 5.1.6 Comparatif

| | DES | 3DES | AES |
|---|---|---|---|
| Année | 1977 | ~1998 | 2001 |
| Taille de bloc | 64 | 64 | **128** |
| Taille de clé | 56 | 112 effectifs | **128 / 192 / 256** |
| Structure | Feistel, 16 tours | 3 × DES | SPN, 10/12/14 tours |
| Statut | **cassé** | déprécié | **standard** |

## 5.1.7 Autres algorithmes symétriques

- **Blowfish / Twofish** (Schneier) : Feistel, blocs de 64/128 bits, clés jusqu'à 448/256 bits.
- **IDEA** : bloc de 64 bits, clé de 128 bits (utilisé dans les premières versions de PGP).
- **RC4** : chiffrement de flux, **abandonné** (biais statistiques ; cause de la faiblesse du WEP).
- **ChaCha20** (avec le MAC **Poly1305**) : chiffrement de flux moderne, rapide en logiciel sans matériel dédié, très utilisé dans TLS 1.3 et sur mobile.

:::examen Questions fréquentes
- Donnez les caractéristiques de DES et d'AES (bloc, clé, tours).
- Expliquez le principe d'un réseau de Feistel. Pourquoi est-il inversible ?
- Pourquoi DES n'est-il plus sûr ? Quel est le principe du 3DES ?
- Citez les quatre opérations d'un tour d'AES.
- Distinguez chiffrement par blocs et par flux.
:::
