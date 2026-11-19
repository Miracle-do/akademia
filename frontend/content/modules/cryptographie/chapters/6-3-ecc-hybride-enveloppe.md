Ce chapitre ferme la partie « clé publique » avec trois idées : les **courbes elliptiques** (ECC), qui offrent la même sécurité que RSA avec des clés bien plus courtes ; le **chiffrement hybride** ; et l'**enveloppe numérique**, schéma classique d'examen.

## 6.3.1 Les courbes elliptiques (ECC)

La **cryptographie à courbe elliptique** est une forme de cryptographie à clé publique fondée sur les mathématiques des courbes elliptiques. Elle permet l'**échange de clés** (ECDH), les **signatures** (ECDSA, EdDSA) et le chiffrement. C'est une alternative à RSA (1977).

**La courbe** : une courbe elliptique est l'ensemble des points (x, y) vérifiant

> **y² = x³ + ax + b**   (avec a, b constantes, sur un **corps fini**, par exemple modulo un nombre premier p)

Sur les réels, elle est **symétrique par rapport à l'axe des x**, et toute droite non verticale la coupe en **trois points au plus**. Cette propriété sert à définir une **addition de points** : pour additionner P et Q, on trace la droite (PQ), on prend le troisième point d'intersection R, puis son symétrique −R : P + Q = −R. Pour doubler un point (P + P), on utilise la tangente.

**Multiplication scalaire** : k·P = P + P + … + P (k fois), calculable vite par doublements successifs (comme l'exponentiation rapide).

**Le problème difficile** : étant donnés un point P et un point Q = k·P, **retrouver k** est le **problème du logarithme discret sur courbe elliptique (ECDLP)**. On ne connaît pas d'algorithme sous-exponentiel pour cela, contrairement à la factorisation.

| Analogie | Groupe Zₚ* | Courbe elliptique |
|---|---|---|
| Opération | multiplication modulo p | addition de points |
| « Puissance » | gᵏ mod p | k·P |
| Problème difficile | log discret | ECDLP |

### Exemple jouet : y² = x³ + 2x + 2 sur Z₁₇

Le point G = (5, 1) engendre un groupe d'**ordre 19**. Ses premiers multiples :

| k | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|
| k·G | (5,1) | (6,3) | (10,6) | (3,1) | (9,16) | (16,13) | (0,6) |

Et 19·G = **O** (le point à l'infini, élément neutre) ; donc 20·G = G.

**ECDH sur cette courbe** : Alice choisit a = 3 et publie A = 3G = (10, 6) ; Bob choisit b = 7 et publie B = 7G = (0, 6). Alice calcule 3·B = 21G = 2G (car 21 mod 19 = 2) = **(6, 3)** ; Bob calcule 7·A = 21G = **(6, 3)**. Même secret partagé, sans jamais l'avoir transmis.

## 6.3.2 Pourquoi l'ECC : clés courtes, mêmes garanties

Comme aucun algorithme sous-exponentiel n'est connu pour l'ECDLP, **une petite clé suffit** :

| Sécurité | RSA | ECC |
|---|---|---|
| 128 bits | 3072 bits | **256 bits** |
| 192 bits | 7680 bits | 384 bits |

Avantages : **moins de calcul**, **moins de bande passante**, **génération de clés rapide**, **faible latence**. Idéal pour les **mobiles**, l'**IoT**, les cartes à puce.

**Usages courants** : TLS (ECDHE, ECDSA), SSH (clés Ed25519), VPN, **Bitcoin et Ethereum** (courbe secp256k1 pour les adresses et les signatures), passeports électroniques, certificats de PKI, Signal/WhatsApp (X25519).

**Courbes standard** : NIST P-256 (secp256r1), **Curve25519** (échange X25519 et signature Ed25519, très répandues), secp256k1.

:::attention Correction importante sur le quantique
Le support de cours affirme que l'ECC est « plus résistante aux attaques quantiques » que RSA. **C'est faux** : l'algorithme de **Shor** casse **à la fois** la factorisation (RSA) et le logarithme discret (DH, ECC) en temps polynomial sur un ordinateur quantique assez puissant. L'ECC est **même plus vulnérable en proportion** (clés plus courtes, donc moins de qubits nécessaires). Le remède est la **cryptographie post-quantique** (chapitre 10).
:::

## 6.3.3 Le chiffrement hybride

Les systèmes asymétriques sont **lents** et limités en taille ; les symétriques sont **rapides** mais posent le problème de l'échange de clé. On combine :

1. l'expéditeur génère une **clé de session** symétrique aléatoire (par exemple 256 bits pour AES) ;
2. il **chiffre les données** avec cette clé de session (rapide) ;
3. il **chiffre la clé de session** avec la **clé publique du destinataire** (court donc rapide) ;
4. il envoie les deux ;
5. le destinataire **déchiffre la clé de session** avec sa clé privée, puis **déchiffre les données**.

C'est le principe de **HTTPS/TLS**, de **PGP/GnuPG**, de **S/MIME**, des VPN.

## 6.3.4 L'enveloppe numérique

L'**enveloppe numérique** est la mise en œuvre précise du chiffrement hybride. On appelle « enveloppe » l'ensemble **{clé de session chiffrée avec la clé publique du destinataire}** accompagné des **données chiffrées avec la clé de session**.

```text
        ÉMETTEUR (Alice)                                    DESTINATAIRE (Bob)
 ┌───────────────────────────────┐                  ┌───────────────────────────────┐
 │ Message M                     │                  │                               │
 │   │                           │                  │                               │
 │   ▼  chiffrement symétrique   │   (1) M chiffré  │  déchiffrement symétrique     │
 │ Ks (clé de session aléatoire) ├─────────────────►│  avec Ks ─────► Message M     │
 │   │                           │                  │        ▲                      │
 │   ▼  chiffrement asymétrique  │   (2) Ks chiffrée│        │ Ks                   │
 │ avec clé PUBLIQUE de Bob      ├─────────────────►│  déchiffrement asymétrique    │
 │                               │   (= l'enveloppe)│  avec clé PRIVÉE de Bob       │
 └───────────────────────────────┘                  └───────────────────────────────┘
```

**Bénéfices** : rapidité du symétrique + pas d'échange préalable de secret grâce à l'asymétrique. Seul Bob (qui détient la clé privée) ouvre l'enveloppe.

**Pour ajouter l'authenticité** : Alice **signe** l'empreinte du message avec sa clé privée avant d'envoyer ; Bob vérifie avec la clé publique d'Alice. On obtient alors confidentialité + intégrité + authenticité + non-répudiation (c'est le schéma de PGP).

:::examen « Illustrer schématiquement le concept d'enveloppe numérique » (rattrapage 2022-2023)
Dessinez le schéma ci-dessus et légendez : (1) clé de session Ks aléatoire ; (2) chiffrement du message avec Ks ; (3) chiffrement de Ks avec la **clé publique** de Bob ; (4) envoi des deux (l'enveloppe) ; (5) Bob déchiffre Ks avec sa **clé privée** puis le message avec Ks. Précisez pourquoi : l'asymétrique est lent, le symétrique rapide.
:::

## 6.3.5 Résumé de la partie asymétrique

| | RSA | DH | ElGamal | ECC |
|---|---|---|---|---|
| Problème | factorisation | log discret | log discret | ECDLP |
| Clé 128 bits de sécurité | 3072 | 3072 | 3072 | **256** |
| Chiffrer | oui | non | oui | oui (ECIES) |
| Échange de clé | oui (transport) | **oui** | – | **ECDH** |
| Signer | oui | non | oui | **ECDSA / EdDSA** |
| Face au quantique | cassé (Shor) | cassé | cassé | cassé |

:::examen Questions fréquentes
- Quelle est la difficulté mathématique de RSA ? de DH ? de l'ECC ?
- Pourquoi l'ECC convient-elle à l'IoT ?
- Expliquez le chiffrement hybride et dessinez l'enveloppe numérique.
- Quelle affirmation du cours sur l'ECC et le quantique faut-il corriger ?
:::
