Jusqu'ici tout reposait sur des **clés**. Il existe une autre famille d'outils, la **cryptographie sans secret** : les **fonctions de hachage**. Elles ne chiffrent rien (impossible de « déhacher »), mais elles sont partout : intégrité des fichiers, mots de passe, signatures, blockchain.

## 7.1.1 Définition

Une **fonction de hachage cryptographique** prend une donnée de **taille arbitraire** (un mot, un film de 4 Go) et produit une **empreinte** (*haché*, *condensat*, *digest*) de **taille fixe** (128, 160, 256, 512 bits...).

> h : {0,1}* → {0,1}ⁿ

- **Déterministe** : la même entrée donne toujours la même empreinte.
- **Effet d'avalanche** : le moindre changement de l'entrée (un seul bit) change complètement l'empreinte.

Exemple avec SHA-256 :

```text
SHA-256("Bonjour") = 9172e8eec99f144f72eca9a568759580edadb2cfd154857f07e657569493bc44
SHA-256("bonjour") = 2cb4b1431b84ec15d35ed83bb927e27e8967d75f4bcd9cc4b25c8d879ae23e18
```

Une seule lettre change (B → b) et les 64 caractères hexadécimaux sont **complètement différents**. Les deux empreintes ont la même longueur (256 bits = 64 caractères hexa), quelle que soit l'entrée.

Si l'on calcule le haché de deux données et que les deux hachés sont **différents**, on est **certain** que les données sont différentes. L'inverse (hachés égaux ⇒ données égales) est « presque » certain, avec une probabilité d'erreur négligeable pour une bonne fonction.

## 7.1.2 Les propriétés exigées

Une fonction de hachage est **cryptographique** si elle vérifie :

1. **Résistance à la préimage (sens unique)** : à partir d'une empreinte h, il est **impossible** de retrouver un message x tel que H(x) = h. Exemple : à partir de `$P$Hv8rpLanTSYSA/2bP1xN.S6Mdk32.Z3`, impossible de retrouver le mot de passe. Effort attendu : **2ⁿ**.
2. **Résistance à la seconde préimage** : à partir d'un message x, impossible de trouver **un autre message x'** avec H(x') = H(x). Effort : 2ⁿ.
3. **Résistance aux collisions** : impossible de trouver **deux messages quelconques** x ≠ x' avec H(x) = H(x'). Effort : **2^(n/2)**, à cause du paradoxe des anniversaires.
4. **Rapidité** : le calcul doit être très rapide (c'est un avantage pour l'intégrité, un inconvénient pour les mots de passe, voir 7.3).

:::retenir Collision : pourquoi elle existe forcément
Une fonction de hachage compresse un ensemble **infini** en un ensemble **fini** : par le principe des tiroirs, des collisions **existent**. La question est seulement de savoir si on peut en **trouver** une en pratique. Le cours dit « aucune valeur identique ne doit être attribuée à des données différentes » : c'est un **idéal**, pas une impossibilité mathématique.
:::

## 7.1.3 Le paradoxe des anniversaires

Dans une salle de **23 personnes**, la probabilité qu'au moins deux aient le même anniversaire dépasse **50 %** (≈ 50,7 %), alors qu'il y a 365 jours. Pour un haché de n bits, on trouve une collision après environ **2^(n/2)** essais seulement :

| Haché | Bits | Effort préimage | Effort collision |
|---|---|---|---|
| MD5 | 128 | 2¹²⁸ | 2⁶⁴ (en pratique, **quelques secondes** car algorithme cassé) |
| SHA-1 | 160 | 2¹⁶⁰ | 2⁸⁰ (théorique) → collision réelle publiée en **2017** (SHAttered) |
| SHA-256 | 256 | 2²⁵⁶ | **2¹²⁸** (hors de portée) |

C'est la raison pour laquelle on exige un haché **au moins deux fois plus long** que le niveau de sécurité visé contre les collisions.

## 7.1.4 Les algorithmes

| Famille | Sortie | Statut |
|---|---|---|
| **MD5** (Rivest, 1991) | 128 bits | **cassé** (collisions : 2004, Wang et al.) ; à ne plus utiliser pour la sécurité |
| **SHA-1** (NIST, 1995) | 160 bits | **cassé** (collision pratique : 2017) ; abandonné |
| **SHA-2** (2001) : SHA-224, **SHA-256**, SHA-384, **SHA-512** | 224 à 512 | **sûr, standard actuel** |
| **SHA-3** (Keccak, 2015) | 224 à 512 | sûr, **construction différente** (éponge) |
| **BLAKE2/3**, **RIPEMD-160** | variable / 160 | sûrs (RIPEMD-160 utilisé dans Bitcoin) |

Le cours précise : « MD5 est un haché de 128 bits et SHA un haché de 160 bits si l'on utilise SHA-1 » : c'est exact, mais **SHA-1 est lui aussi à proscrire** aujourd'hui.

### MD5 en bref (au programme)

MD5 (*Message-Digest Algorithm 5*) produit **128 bits**. Étapes :

1. **Bourrage** : on ajoute un bit « 1 », puis des « 0 », jusqu'à une longueur ≡ **448 mod 512**, puis la **longueur d'origine** sur **64 bits** : la longueur totale devient un **multiple de 512 bits**.
2. **Initialisation** de **4 registres de 32 bits** A, B, C, D (A = 01234567, B = 89abcdef, C = fedcba98, D = 76543210 en hexadécimal).
3. **Calcul itératif** : pour chaque **bloc de 512 bits**, 4 rondes de 16 opérations (fonctions non linéaires, additions modulo 2³², rotations).
4. **Résultat** : concaténation de A, B, C, D = **128 bits**.

**Avantages** : rapide, simple, très répandu. **Inconvénients** : **collisions faciles**, sortie courte, **obsolète** pour la sécurité. Il reste utilisé pour les usages **non sensibles** (somme de contrôle d'un téléchargement contre la corruption accidentelle, déduplication de données).

Exemple connu : MD5("f00tb@ll99") = `031cfd598a74f82d4c8983fd9030204a` (exemple du cours).

## 7.1.5 À quoi servent les fonctions de hachage

- **Contrôler l'intégrité** d'un fichier ou d'un message (somme `sha256sum`). L'empreinte peut aussi servir d'**identifiant unique** d'un fichier (git identifie ainsi ses objets).
- **Stocker les mots de passe** : le serveur ne garde que l'empreinte (avec sel).
- **Signature numérique** : on signe l'empreinte et non le message entier (plus court donc plus rapide).
- **Preuve de travail** (blockchain, minage) : trouver une donnée dont le haché est inférieur à un seuil.
- **Dérivation de clés**, **génération pseudo-aléatoire**.
- **Tables de hachage** en bases de données et en programmation (là, un hachage non cryptographique suffit).
- **Arbres de Merkle** (blockchain, git) pour prouver l'appartenance d'une donnée à un ensemble.

## 7.1.6 Vérifier l'intégrité d'un fichier

```bash
sha256sum fichier.iso            # Linux
openssl dgst -sha256 fichier.iso # OpenSSL (portable)
echo -n "abc" | openssl sha256   # haché d'une chaîne
```

Valeurs de référence :

- `SHA-256("abc")` = `ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad`
- `SHA-1("abc")` = `a9993e364706816aba3e25717850c26c9cd0d89d`
- `MD5("abc")` = `900150983cd24fb0d6963f7d28e17f72`
- `SHA-256("")` (chaîne vide) = `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`

Option `-n` de `echo` : **sans saut de ligne final** ; sans elle, le haché change car « abc\n » ≠ « abc ».

:::examen Commande du sujet de rattrapage
`echo -n "Excellente composition à toi" | openssl sha256` : cette commande calcule le **haché SHA-256** de la chaîne « Excellente composition à toi » (sans retour à la ligne final grâce à `-n`) et affiche une empreinte de 64 caractères hexadécimaux : `b5ca70c57a87800b500d637eb822e806e763a9ff6dc1747c764628f4c85819de`. Le haché est calculé sur les octets **UTF-8** de la chaîne (le « à » compte pour 2 octets).
:::

:::attention Hachage ≠ chiffrement
Le chiffrement est **réversible avec la clé** ; le hachage est **à sens unique et sans clé**. On ne « décrypte » pas un haché : on peut seulement **deviner l'entrée** (dictionnaire, force brute, tables arc-en-ciel) et comparer.
:::
