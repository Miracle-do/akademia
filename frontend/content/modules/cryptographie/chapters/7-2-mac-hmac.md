Le chiffrement protège la **confidentialité**, pas l'**intégrité**. Ce chapitre montre comment **détecter** une modification malveillante : d'abord pourquoi le simple haché ne suffit pas, puis le **MAC**, et enfin le **HMAC**.

## 7.2.1 Le chiffrement ne protège pas l'intégrité

Si l'on envoie un texte chiffré sur un canal non sûr, un attaquant **actif** peut l'intercepter et le **modifier** avant qu'il n'arrive. Avec un **chiffrement de flux** en particulier, chaque bit du chiffré correspond au bit du clair : inverser un bit du chiffré inverse le même bit du clair (**malléabilité**). Le destinataire ne peut pas savoir que le message n'est plus celui de l'expéditeur.

L'**intégrité des données** signifie que celles-ci ne sont pas modifiées pendant la communication ou le stockage, qu'elles soient chiffrées ou non. Pour la contrôler, on calcule une **valeur de contrôle** envoyée avec le message.

## 7.2.2 Premières idées, et pourquoi elles échouent

1. **Envoyer le message et son haché.** Contre une attaque **active**, c'est inutile : l'attaquant modifie le message **et recalcule le haché** (la fonction est publique). Le haché seul ne protège que contre les **erreurs accidentelles**.
2. **Hacher puis chiffrer (*Hash-then-Encrypt*)** : le message et son haché sont chiffrés ensemble. Insuffisant avec un chiffrement de flux malléable : un attaquant qui connaît le clair peut modifier le chiffré de façon **contrôlée**.
3. **Haché envoyé par un canal sûr** : cela marche (si l'attaquant ne peut pas toucher le haché), mais il faut un canal sûr, ce qui est rare. C'est le cas d'un haché publié sur le site officiel d'un éditeur de logiciel.

La solution : **faire dépendre le contrôle d'un secret**.

## 7.2.3 Le code d'authentification de message (MAC)

Un **MAC** (*Message Authentication Code*) est une valeur de contrôle calculée à partir du message **et d'une clé secrète partagée**. Le système comprend deux fonctions :

- **MAC(k, m)** : prend le message m et la clé secrète k, et produit l'étiquette (le *tag*) ;
- **V(k, m, tag)** : vérifie ; renvoie **VRAI** si le tag est correct pour m et k.

**Procédure** : l'expéditeur calcule le tag et l'attache au message ; le destinataire **recalcule** le tag avec la même clé et le compare. Si les deux concordent, le message **n'a pas été modifié** et vient bien d'un détenteur de la clé.

Remarques :

- sans la clé k, un attaquant **ne peut pas fabriquer** un tag valide pour un message modifié ;
- un MAC est transmis avec chaque message : l'information transportée augmente (coût de performance) ;
- quand on contrôle l'intégrité d'une donnée par un MAC, on dit que la **donnée est authentifiée**. Ne pas confondre avec l'**authentification d'un utilisateur** : ici, « authentifié » signifie « intègre et émis par un détenteur de la clé ».

:::attention MAC ≠ signature
Le MAC est la **version symétrique** d'une signature : la clé est **partagée** par au moins deux parties, donc on **ne sait pas laquelle** a créé le tag. Un MAC assure **intégrité et authenticité d'origine (entre les détenteurs de la clé)**, mais **pas la non-répudiation**. Seule une signature asymétrique prouve qui a signé.
:::

## 7.2.4 HMAC : un MAC construit sur une fonction de hachage

Le **HMAC** (*Hash-based MAC*) est un MAC construit avec une **fonction de hachage** et une **clé secrète**. C'est la méthode de MAC la plus utilisée : sûre, rapide, simple (une seule clé). Avec SHA-256 on parle de **HMAC-SHA256**.

**Pourquoi pas simplement H(k ∥ m) ?** Les fonctions comme MD5, SHA-1 et SHA-2 procèdent bloc par bloc. Connaissant H(k ∥ m) et la longueur de k, un attaquant peut **continuer le calcul** et obtenir H(k ∥ m ∥ m') sans connaître k : c'est l'**attaque par extension de message**. Il fabrique ainsi un tag valide pour un message prolongé.

**La construction réelle (RFC 2104)** :

> **HMAC(k, m) = H( (k' ⊕ opad) ∥ H( (k' ⊕ ipad) ∥ m ) )**

- k' : la clé complétée par des zéros jusqu'à la taille de bloc de H (64 octets pour SHA-256), ou hachée si elle est plus longue ;
- **ipad** : l'octet `0x36` répété ; **opad** : l'octet `0x5c` répété ;
- ∥ : concaténation ; ⊕ : XOR.

Le **double hachage imbriqué** empêche l'extension de message.

:::retenir Formule simplifiée du cours
Le cours donne HMAC(k, m) = hash(k ∥ hash(k ∥ m)) pour **l'idée** : deux hachages imbriqués contenant la clé. Pour l'examen, retenez la **procédure** :
1. préparer la clé (compléter à la taille de bloc) ;
2. XOR avec ipad, concaténer au message, hacher ;
3. XOR de la clé avec opad, concaténer au résultat précédent, hacher à nouveau ;
4. le résultat est le HMAC.
:::

**Exemple vérifié** (vecteur de test standard) : HMAC-SHA256 avec la clé « key » et le message « The quick brown fox jumps over the lazy dog » :

```text
f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8
```

**Limite** : pour protéger un **texte chiffré**, on préfère un mode de chiffrement **qui inclut directement l'authentification** (AES-GCM, ChaCha20-Poly1305) plutôt que d'assembler soi-même chiffrement et HMAC. Si on assemble, c'est **Encrypt-then-MAC** : on chiffre, puis on calcule le MAC **du chiffré**, et on **vérifie le MAC avant de déchiffrer**.

**Autres MAC** : **KMAC** (basé sur SHA-3), **CMAC** (basé sur AES), **Poly1305**. **Comparaison de tags en temps constant** (pas de `==` naïf) pour éviter les attaques temporelles.

## 7.2.5 Utilisations du HMAC

- **API signées** (AWS, Stripe, webhooks) : le serveur et le client partagent une clé et vérifient le HMAC de chaque requête.
- **Jetons de session** et **JWT** avec l'algorithme HS256 (HMAC-SHA256).
- **TLS**, **IPsec**, **SSH** : intégrité des paquets.
- **Dérivation de clés** (HKDF, PBKDF2 sont fondés sur HMAC).
- **Authentification à usage unique** (TOTP, HOTP : codes à 6 chiffres des applications d'authentification, fondés sur HMAC).

## 7.2.6 Commande OpenSSL (sujet de rattrapage)

```bash
openssl mac -digest SHA256 -macopt hexkey:000102030405060708090A0B0C0D0E0F10111214 -in eneam.txt HMAC
```

**Lecture de la commande** :

- `openssl mac` : calcule un code d'authentification de message ;
- `-digest SHA256` : la fonction de hachage sous-jacente est SHA-256 ;
- `-macopt hexkey:...` : la **clé secrète**, donnée en **hexadécimal** (ici 40 caractères hexadécimaux = **20 octets** : 00 01 … 0F, puis 10 11 12 14) ;
- `-in eneam.txt` : le fichier dont on authentifie le contenu ;
- `HMAC` : l'algorithme MAC choisi.

**Ce que fait la commande** : elle calcule le **HMAC-SHA256 du fichier `eneam.txt`** avec la clé fournie et affiche le code d'authentification (64 caractères hexadécimaux). Quiconque connaît la clé peut recalculer ce code et vérifier que le fichier n'a pas été modifié.

Exemple réel avec un fichier contenant « Bonjour le monde » (sans retour à la ligne) :

```text
F4BCB854C9AFFBBB97D09F41D961A953158FD15FEE6489356D72C833E1842AAE
```

:::examen « Donner la procédure de production d'un HMAC » (rattrapage 2022-2023)
Réponse type : (1) Alice et Bob **partagent une clé secrète k** ; (2) Alice choisit une fonction de hachage H (ex. SHA-256) ; (3) elle complète k à la taille de bloc, calcule **H((k ⊕ ipad) ∥ m)**, puis **H((k ⊕ opad) ∥ ce résultat)** ; (4) elle envoie **m et le HMAC** ; (5) Bob **recalcule** le HMAC avec k sur le m reçu et le compare : égalité = message intègre et authentique ; différence = message altéré ou clé différente. Ajoutez : le HMAC assure intégrité et authenticité de l'origine, pas la non-répudiation.
:::
