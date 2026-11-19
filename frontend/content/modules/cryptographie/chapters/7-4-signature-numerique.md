La **signature numérique** est l'application phare de la cryptographie asymétrique : elle apporte à un document numérique ce que la signature manuscrite apporte au papier, avec en plus une garantie mathématique d'intégrité. Elle fait partie des travaux pratiques du cours (création de signature électronique).

## 7.4.1 Ce qu'elle garantit

Les systèmes de signature sont un type de cryptographie à clé publique qui garantit :

- l'**intégrité** : le document n'a pas été modifié depuis la signature ;
- l'**authenticité** : il provient bien du détenteur de la clé privée ;
- la **non-répudiation** : le signataire ne peut pas nier l'avoir signé (seul lui possède la clé privée).

Elle **ne garantit pas la confidentialité** : un document signé reste lisible par tous, sauf si on le chiffre en plus.

Le cours indique : « le processus de signature peut être assimilé au chiffrement du fichier à l'aide de la clé privée ». C'est une **image** commode (surtout pour RSA) ; en pratique on **signe l'empreinte** du document, pas le document.

## 7.4.2 Le procédé : hacher puis signer

**Création de la signature par Alice**

1. Calculer l'**empreinte** h = H(M) du document M (par exemple SHA-256).
2. Appliquer sa **clé privée** à h : **S = Sign(clé_privée_Alice, h)**.
3. Envoyer **M et S** (la signature est jointe au document).

**Vérification par Bob (ou n'importe qui)**

1. Recalculer h' = H(M') sur le document reçu.
2. Appliquer la **clé publique d'Alice** à S pour obtenir (ou vérifier) h.
3. Si **h = h'**, la signature est valide : le document est intègre et provient d'Alice. Sinon : rejet.

```text
        ALICE (signe)                                  BOB (vérifie)
 Document M ──► H ──► empreinte h ──┐             Document M' ──► H ──► h'
                                     │ clé privée                          │
                                     ▼ d'Alice                             │
                                  Signature S ───── envoi (M, S) ─────►    ▼
                                                           S ──► clé publique d'Alice ──► h
                                                                       h = h' ?  ⇒ valide
```

**Pourquoi hacher d'abord ?**

- la signature d'un grand document serait **lente** et **aussi longue** que lui ;
- on signe une empreinte **de taille fixe** (256 bits) ;
- la fonction de hachage à **sens unique** et **résistante aux collisions** garantit qu'on ne peut pas **recoller** la signature sur un autre document : la moindre modification d'un document signé **fait échouer la vérification**.

## 7.4.3 Les algorithmes de signature

| Algorithme | Problème difficile | Remarque |
|---|---|---|
| **RSA-PSS** (et RSASSA-PKCS1-v1_5) | factorisation | **PSS** : schéma **probabiliste**, recommandé |
| **DSA** | log discret | standard NIST, plus guère utilisé |
| **ECDSA** | ECDLP | signatures courtes, TLS, Bitcoin ; **nonce aléatoire** par signature |
| **EdDSA / Ed25519** | ECDLP | **déterministe**, rapide, SSH moderne |

:::attention Le nonce de signature
Avec DSA/ECDSA, un **nombre aléatoire (nonce)** est utilisé à chaque signature. S'il est **réutilisé ou prévisible**, la **clé privée peut être retrouvée**. Les implémentations modernes le dérivent de manière déterministe (RFC 6979) ou utilisent EdDSA.
:::

## 7.4.4 Signature, MAC, chiffrement : ne pas confondre

| | **Chiffrement asymétrique** | **Signature** | **MAC / HMAC** |
|---|---|---|---|
| Clé utilisée à l'émission | publique du destinataire | **privée** de l'émetteur | **secrète partagée** |
| Clé utilisée à la réception | privée du destinataire | **publique** de l'émetteur | la même secrète |
| But | confidentialité | intégrité, authenticité, **non-répudiation** | intégrité, authenticité |
| Prouve **qui** ? | non | **oui** (une seule personne) | non (plusieurs ont la clé) |

## 7.4.5 Valeur légale

La signature électronique est reconnue par le **Code du numérique** béninois. Elle a **valeur légale** lorsqu'elle respecte les exigences de la loi : on distingue en général :

- la signature **simple** : identification et intention de signer ;
- la signature **avancée** : liée de façon unique au signataire, sous son contrôle exclusif, détectant toute modification ultérieure ;
- la signature **qualifiée** : avancée + créée avec un **dispositif qualifié** + **certificat qualifié** délivré par un prestataire de confiance qualifié ; elle bénéficie de la **présomption de fiabilité** la plus forte.

Le **cachet électronique** est l'équivalent pour une **personne morale** ; l'**horodatage** prouve la date et l'heure.

Lier une clé publique à une **identité réelle** est le rôle du **certificat** (chapitre 8.1) : sans lui, une signature prouve seulement « signé par le détenteur de *cette* clé », pas « signé par Mme X ».

## 7.4.6 Travaux pratiques : signer avec OpenSSL

```bash
# 1. Générer une paire de clés RSA
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out cle_privee.pem
openssl pkey -in cle_privee.pem -pubout -out cle_publique.pem

# 2. Signer le fichier (SHA-256 + RSA)
openssl dgst -sha256 -sign cle_privee.pem -out signature.bin document.txt

# 3. Vérifier avec la clé publique
openssl dgst -sha256 -verify cle_publique.pem -signature signature.bin document.txt
# → Verified OK
```

Si l'on **modifie un seul caractère** de `document.txt` puis qu'on relance l'étape 3, OpenSSL répond **« Verification failure »**. Cette expérience est le cœur du TP.

Variante moderne : avec le schéma probabiliste **RSA-PSS**

```bash
openssl pkeyutl -sign -inkey cle_privee.pem -rawin -in document.txt -digest sha256 \
  -pkeyopt rsa_padding_mode:pss -out signature_pss.bin
```

Avec **GnuPG** (PGP), la signature détachée s'obtient par `gpg --armor --detach-sign document.txt` et se vérifie par `gpg --verify document.txt.asc document.txt` (voir l’annexe A).

:::retenir Résumé
**Signer = hacher puis appliquer la clé privée à l'empreinte. Vérifier = recalculer l'empreinte et la comparer avec ce que donne la clé publique.** Intégrité + authenticité + non-répudiation.
:::

:::examen Questions fréquentes
- Qu'est-ce qu'une signature électronique ? Quelles propriétés garantit-elle ?
- Décrivez la création et la vérification (avec un schéma).
- Pourquoi signe-t-on l'empreinte plutôt que le document ?
- Différence entre signature et MAC ? entre signature et cachet électronique ?
:::
