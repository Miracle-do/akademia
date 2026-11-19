Ce chapitre donne le **cadre formel** d'un système de chiffrement, présente les deux grandes familles (symétrique et asymétrique), le **principe de Kerckhoffs** et le vocabulaire que l'on retrouve partout dans la suite.

## 2.2.1 Le cryptosystème

Un **cryptosystème** (ou système cryptographique) est un quintuplet **(M, C, K, E, D)** :

- **M** : l'espace des **messages clairs**, défini sur un alphabet A ;
- **C** : l'espace des **messages chiffrés**, défini sur un alphabet B ;
- **K** : l'espace des **clés** ;
- **E** : l'ensemble des **transformations de chiffrement** ;
- **D** : l'ensemble des **transformations de déchiffrement**.

À chaque clé k correspondent une fonction de chiffrement e_k : M → C et une fonction de déchiffrement d_k : C → M, telles que :

> **pour tout message m de M : d_k( e_k(m) ) = m**

C'est la propriété fondamentale : déchiffrer ce qu'on a chiffré redonne le message d'origine. Elle suppose que e_k est une **bijection** (on y revient au chapitre 3.1).

```text
        clé k                       clé k' (= k en symétrique)
          │                              │
  m ──► e_k ──► c  ───── canal ─────►  d_k' ──► m
 (clair)  chiffrement  (cryptogramme)   déchiffrement  (clair)
```

## 2.2.2 Le chiffrement symétrique

Aussi dit **à clé secrète**, c'est la plus ancienne forme de chiffrement. **La même clé** sert à chiffrer et à déchiffrer.

- Avantage : **très rapide**, adapté aux gros volumes de données.
- Problème majeur : l'**échange de la clé secrète**. Comment la transmettre à Bob sans qu'Ève l'intercepte ? Il faut un canal sûr (ou un autre mécanisme, comme Diffie-Hellman).
- Autre limite : le **nombre de clés** explose.
- Exemples : DES, 3DES, **AES**, Blowfish, IDEA, RC4, ChaCha20.

## 2.2.3 Le chiffrement asymétrique

Aussi dit **à clé publique**. Chaque utilisateur possède une **paire de clés** fortement liées mais distinctes :

- une **clé publique**, diffusée à tous ;
- une **clé privée**, que son propriétaire est seul à connaître.

Ce qui est chiffré avec l'une ne se déchiffre qu'avec l'autre. L'émetteur et le destinataire n'ont en commun que la clé publique : **plus besoin de partager un secret**.

- Avantage : plus d'échange de secret ; permet aussi la **signature numérique**.
- Inconvénients : **beaucoup plus lent** que le symétrique, et il faut **être sûr que la clé publique appartient bien** à la bonne personne (d'où les certificats et la PKI).
- Exemples : **RSA**, **ElGamal**, **courbes elliptiques** (ECC), DSA.

## 2.2.4 Combien de clés ? (exercice du cours, corrigé)

Pour **n utilisateurs** qui veulent échanger entre eux de manière confidentielle :

- **Symétrique** : chaque **paire** d'utilisateurs a besoin de sa propre clé secrète, soit **n(n−1)/2** clés. Pour n = 10 : 45 clés. Pour n = 1000 : 499 500 clés.
- **Asymétrique** : chaque utilisateur a une paire (publique, privée), soit **2n** clés. Pour n = 1000 : 2000 clés.

:::attention Correction du support de cours
Le polycopié donne « *n clés secrètes* » pour le symétrique. **C'est inexact** : si chacun partageait la *même* clé avec tous, n'importe quel membre pourrait lire les échanges des autres. Pour des secrets **deux à deux**, il faut **n(n−1)/2** clés. C'est cette croissance **quadratique** qui motive le chiffrement asymétrique (croissance linéaire : 2n).
:::

## 2.2.5 Le principe de Kerckhoffs (1883)

> *La sécurité d'un système cryptographique ne doit pas reposer sur le secret des algorithmes de chiffrement et de déchiffrement, mais uniquement sur le secret de la clé.*

Conséquences pratiques :

- on suppose que **l'attaquant connaît l'algorithme** : tout est public sauf la clé ;
- un algorithme **public** est examiné par des milliers de chercheurs : les faiblesses sont trouvées et corrigées. C'est la raison d'être des **concours publics** (AES, SHA-3) ;
- la « sécurité par l'obscurité » (algorithme maison secret) est une **mauvaise pratique** ;
- si la clé est compromise, il suffit de **changer la clé**, pas tout le système.

Pour l'utilisateur : ce qui compte, c'est de **bien protéger les clés**, pas de cacher l'algorithme.

:::retenir « Ne jamais inventer son propre algorithme »
Un algorithme non public n'a pas été éprouvé. Utilisez des algorithmes standards (AES, RSA, SHA-256, ECDSA) via des bibliothèques reconnues (OpenSSL, libsodium).
:::

## 2.2.6 Cryptanalyse : les attaques

La cryptanalyse cherche à retrouver le clair ou la clé sans autorisation. Les types d'attaques, du plus faible au plus fort pour l'attaquant :

| Type d'attaque | L'attaquant dispose de |
|---|---|
| **Texte chiffré seul** | seulement des cryptogrammes |
| **Texte clair connu** | des paires (clair, chiffré) |
| **Texte clair choisi** | peut faire chiffrer les messages de son choix |
| **Texte chiffré choisi** | peut faire déchiffrer les cryptogrammes de son choix |

Techniques : **force brute** (essayer toutes les clés), **analyse fréquentielle** (chiffres classiques), **cryptanalyse différentielle** et **linéaire** (chiffrements par blocs), **factorisation** (RSA), **attaques par dictionnaire**, **attaques par canaux auxiliaires** (temps, consommation).

La **force brute** est toujours possible en théorie : la parade est une **clé assez longue**. Une clé de n bits offre 2ⁿ possibilités ; passer de 56 bits (DES) à 128 bits (AES) multiplie l'effort par 2⁷² ≈ 4,7 × 10²¹.

## 2.2.7 Hybride : le meilleur des deux mondes

Dans la pratique on **combine** les deux : on utilise l'asymétrique (lent) pour **transmettre une clé de session**, puis le symétrique (rapide) pour chiffrer les données. C'est le **chiffrement hybride**, utilisé par **HTTPS**, PGP, les VPN, et appelé **enveloppe numérique** (voir chapitre 6.3).

## 2.2.7 Vocabulaire

| Terme | Sens |
|---|---|
| **Chiffrement** | transformation d'un clair en message incompréhensible à l'aide d'une clé |
| **Chiffre** | autrefois le code secret ; aujourd'hui, **l'algorithme** de chiffrement |
| **Cryptogramme** | le message chiffré |
| **Déchiffrement** | retrouver le clair **avec** la clé |
| **Décryptage** | retrouver le clair **sans** la clé (cryptanalyse) |
| **Cryptage** | mot courant, à éviter : confusion fréquente avec chiffrement |
| **Alice, Bob** | les deux correspondants légitimes ; **Ève** l'espionne, **Mallory** l'attaquant actif |

:::attention « Crypter » et « décrypter »
En toute rigueur on **chiffre** et on **déchiffre** (avec la clé). On **décrypte** seulement quand on casse le message *sans* la clé. L'examen distingue souvent ces termes.
:::

:::examen Questions fréquentes de ce chapitre
- Donnez la définition d'un cryptosystème (quintuplet) et la propriété d_k(e_k(m)) = m.
- Comparez chiffrement symétrique et asymétrique (avantages, inconvénients, exemples).
- Combien de clés pour n utilisateurs dans chaque cas ?
- Énoncez le principe de Kerckhoffs.
- Différence entre déchiffrement et décryptage.
:::
