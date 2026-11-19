Un algorithme comme AES sait chiffrer **un seul bloc de 128 bits**. Pour chiffrer un fichier de plusieurs mégaoctets, il faut un **mode opératoire**. Ce choix est aussi important que l'algorithme : un mauvais mode peut ruiner la sécurité d'AES.

## 5.2.1 Le bourrage (padding)

Si la longueur du message n'est pas un multiple de la taille de bloc (16 octets pour AES), on **complète** le dernier bloc. Le schéma standard est **PKCS#7** : on ajoute *n* octets, chacun de valeur *n*. Si le dernier bloc a 13 octets, on ajoute 3 octets `03 03 03`. Si le message tombe pile sur un multiple de 16, on ajoute **un bloc entier** de `10` pour qu'on puisse toujours enlever le bourrage sans ambiguïté.

Les modes à flux (CTR, GCM) n'ont pas besoin de bourrage.

## 5.2.2 ECB : Electronic Code Book (à ne jamais utiliser)

Chaque bloc est chiffré **indépendamment** : Cᵢ = E_K(Pᵢ).

- **Simple et parallélisable**, mais **déterministe** : deux blocs clairs identiques donnent **deux blocs chiffrés identiques**.
- **Fuite de structure** : l'exemple célèbre est une image chiffrée en ECB, dont on distingue encore les contours (« le pingouin ECB »).
- Les blocs peuvent être **réordonnés, répétés, supprimés** sans que le déchiffrement s'en aperçoive.

## 5.2.3 CBC : Cipher Block Chaining

Chaque bloc clair est **XORé avec le chiffré précédent** avant d'être chiffré. Le premier bloc utilise un **vecteur d'initialisation (IV)**.

> C₀ = IV ; **Cᵢ = E_K(Pᵢ ⊕ Cᵢ₋₁)** ; déchiffrement : **Pᵢ = D_K(Cᵢ) ⊕ Cᵢ₋₁**

- L'**IV doit être aléatoire (imprévisible)** et unique pour chaque message ; il n'est pas secret, on le transmet avec le chiffré.
- Deux blocs identiques donnent des chiffrés différents (le chaînage propage les différences).
- Le **chiffrement est séquentiel** (non parallélisable) ; le déchiffrement l'est.
- Une erreur sur un bloc chiffré perturbe **deux** blocs clairs (le sien en entier, un bit du suivant).
- Sensible aux **attaques par oracle de bourrage** (*padding oracle*) si le serveur révèle une erreur de bourrage.

## 5.2.4 CFB et OFB : transformer un bloc en flux

- **CFB** (*Cipher Feedback*) : on chiffre le **chiffré précédent** et on XOR avec le clair : Cᵢ = Pᵢ ⊕ E_K(Cᵢ₋₁). Auto-synchronisant.
- **OFB** (*Output Feedback*) : on chiffre **itérativement l'IV** pour produire un flux indépendant du message : Oᵢ = E_K(Oᵢ₋₁), Cᵢ = Pᵢ ⊕ Oᵢ. Une erreur de transmission d'un bit n'affecte **qu'un bit** du clair.

Ces deux modes fonctionnent **sans bourrage** et n'utilisent que la fonction de chiffrement E (jamais D).

## 5.2.5 CTR et GCM : les modes modernes

- **CTR** (*Counter*) : on chiffre un **compteur** (nonce ∥ compteur) pour produire le flux : Cᵢ = Pᵢ ⊕ E_K(nonce ∥ i). **Parallélisable**, accès aléatoire, pas de bourrage. **Règle d'or : ne jamais réutiliser un (clé, nonce).**
- **GCM** (*Galois/Counter Mode*) : CTR **plus** un code d'authentification (GHASH) : c'est du **chiffrement authentifié (AEAD)**. Il garantit **confidentialité et intégrité** en une seule opération. **AES-GCM** (et ChaCha20-Poly1305) est le choix par défaut de **TLS 1.3**.

## 5.2.6 Tableau comparatif

| Mode | IV / nonce | Parallélisable | Bourrage | Intégrité | Verdict |
|---|---|---|---|---|---|
| **ECB** | aucun | oui | oui | non | **à proscrire** |
| **CBC** | IV aléatoire | déchiffrement seul | oui | non | acceptable + MAC |
| **CFB** | IV | déchiffrement seul | non | non | rare |
| **OFB** | IV | non | non | non | rare |
| **CTR** | nonce unique | **oui** | non | non | bon + MAC |
| **GCM** | nonce unique | **oui** | non | **oui** | **recommandé** |

:::attention Chiffrement ≠ intégrité
Hors GCM et assimilés, un attaquant peut **modifier** un chiffré (CBC : modifier un bit du bloc précédent change un bit chez le suivant). Utilisez **Encrypt-then-MAC** ou un mode AEAD. Ne jamais déchiffrer sans vérifier l'authenticité d'abord.
:::

## 5.2.7 Attaques sur les systèmes symétriques

**Force brute** : essayer les 2ⁿ clés possibles. Elle est toujours possible en théorie ; la parade est la **longueur de la clé**.

| Algorithme | Clés | Temps à 10¹² clés/s (ordre de grandeur) |
|---|---|---|
| DES (56 bits) | 7,2 × 10¹⁶ | environ 20 heures |
| AES-128 | 3,4 × 10³⁸ | environ 10¹⁹ années, soit **un milliard de fois l'âge de l'univers** (≈ 1,4 × 10¹⁰ ans) |
| AES-256 | 1,2 × 10⁷⁷ | inimaginable |

Ordres de grandeur : 2⁵⁶ ≈ 7,2 × 10¹⁶ ; 2¹²⁸ ≈ 3,4 × 10³⁸ ; 2²⁵⁶ ≈ 1,2 × 10⁷⁷. Chaque bit supplémentaire **double** l'effort.

**Autres attaques**

- **Cryptanalyse différentielle** et **linéaire** : exploitent des biais statistiques ; DES y est partiellement sensible, AES est conçu pour y résister.
- **Meet-in-the-middle** : contre le double chiffrement.
- **Attaques par canaux auxiliaires** : mesure du **temps de calcul**, de la **consommation**, du **rayonnement**, des **caches** (attaque de cache sur AES logiciel). Parade : implémentations à **temps constant**, AES-NI.
- **Attaques sur le mode** : réutilisation d'IV/nonce, oracle de bourrage, bit-flipping en CBC.
- **Attaques sur la gestion des clés** : clé en dur dans le code, clé faible dérivée d'un mot de passe, clé stockée avec les données chiffrées.

## 5.2.8 Implémenter AES de façon sûre

Règles pratiques :

1. **N'implémentez jamais AES vous-même** : utilisez une bibliothèque éprouvée (OpenSSL, libsodium, `cryptography` Python, `javax.crypto`, Web Crypto).
2. Choisissez **AES-256-GCM** (ou AES-128-GCM) ou **ChaCha20-Poly1305**.
3. Générez la clé avec un **générateur cryptographiquement sûr** (`/dev/urandom`, `os.urandom`, `SecureRandom`), jamais avec `rand()`.
4. **Un nonce/IV unique pour chaque chiffrement** (avec GCM : jamais deux fois le même nonce avec la même clé).
5. Si la clé vient d'un **mot de passe**, la dériver avec **PBKDF2, scrypt ou Argon2** (jamais un simple hachage).
6. **Protéger les clés** : coffre (HSM, KMS), rotation, jamais dans le dépôt de code.
7. **Vérifier l'authenticité avant de déchiffrer**.

Exemple en ligne de commande avec OpenSSL (chiffrement d'un fichier avec dérivation de clé à partir d'un mot de passe) :

```bash
openssl enc -aes-256-cbc -pbkdf2 -iter 100000 -salt -in secret.txt -out secret.enc
openssl enc -d -aes-256-cbc -pbkdf2 -iter 100000 -in secret.enc -out secret.dec
```

:::retenir Les règles d'or
**Algorithme public, clé longue et secrète, mode authentifié, nonce jamais réutilisé, bibliothèque standard.**
:::

:::examen Questions fréquentes
- Pourquoi le mode ECB est-il à proscrire ?
- Décrivez le chiffrement CBC et le rôle de l'IV (écrivez les formules).
- Quel mode offre à la fois confidentialité et intégrité ?
- Quelle est la parade contre la force brute ? Combien de clés pour AES-128 ?
- Citez trois bonnes pratiques d'implémentation d'AES.
:::
