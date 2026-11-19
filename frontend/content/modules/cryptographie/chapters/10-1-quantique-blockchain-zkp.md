## 10.1.1 L'ordinateur quantique et la cryptographie

Un ordinateur quantique exploite la superposition et l'intrication des **qubits**. Deux algorithmes comptent :

| Algorithme | Effet | Conséquence |
|---|---|---|
| **Shor** (1994) | factorisation et **log discret** en temps polynomial | **RSA, Diffie-Hellman, ElGamal, ECC/ECDSA tous cassés** |
| **Grover** (1996) | recherche en √N | **divise par 2 la sécurité** des clés symétriques et des hachés |

:::attention Correction du cours
Le support laisse entendre que la cryptographie sur courbes elliptiques résiste au quantique. C'est **faux** : l'algorithme de Shor casse aussi l'ECDLP. Les **clés symétriques** (AES-256) et les hachés (SHA-384/512) restent sûrs en doublant la taille.
:::

Le risque *« récolter maintenant, déchiffrer plus tard »* justifie une migration dès aujourd'hui pour les secrets de longue durée.

## 10.1.2 La cryptographie post-quantique (PQC)

Algorithmes reposant sur des problèmes réputés difficiles même pour un ordinateur quantique (réseaux euclidiens, codes, hachage). Le **NIST** a standardisé en 2024 : **ML-KEM** (Kyber, échange de clé), **ML-DSA** (Dilithium, signature), **SLH-DSA** (SPHINCS+, signature à base de hachage). Les déploiements actuels sont **hybrides** (ECDHE + ML-KEM).

## 10.1.3 Chiffrement homomorphe

Permet de **calculer sur des données chiffrées** sans les déchiffrer : Chiffrer(a) ⊕ Chiffrer(b) = Chiffrer(a + b).

- **Partiellement homomorphe** : une seule opération. **RSA scolaire** est homomorphe pour la multiplication : (m₁ᵉ)(m₂ᵉ) = (m₁m₂)ᵉ mod n. **Paillier** : addition.
- **Totalement homomorphe (FHE)** : additions et multiplications (Gentry, 2009) ; très coûteux.

**Exemple 1** : avec RSA n = 143, e = 7 : c(2) = 2⁷ mod 143 = **128** ; c(3) = 3⁷ mod 143 = **42** ; produit des chiffrés : 128 × 42 = 5376 ≡ **85** (mod 143) ; et c(6) = 6⁷ mod 143 = **85** ✔. Le produit des chiffrés est le chiffré du produit (2 × 3 = 6), sans jamais déchiffrer.
**Exemple 2** : un hôpital externalise des calculs statistiques ; le cloud calcule la moyenne sur des valeurs chiffrées sans voir les dossiers.

**Avantages** par rapport à la cryptographie à clé publique classique : confidentialité **pendant** le traitement ; **limites** : lent, chiffrés volumineux, malléabilité (pas d'intégrité).

## 10.1.4 Preuves à divulgation nulle de connaissance (ZKP)

Une **ZKP** permet de **prouver qu'on connaît un secret sans le révéler**. Trois propriétés : **complétude** (le prouveur honnête convainc), **robustesse** (le tricheur échoue avec forte probabilité), **zéro-connaissance** (le vérifieur n'apprend rien d'autre).

**Image de la caverne d'Ali Baba** : Peggy entre dans une caverne en boucle, Victor attend et demande de sortir par la gauche ou la droite ; si elle connaît le mot de passe de la porte, elle réussit à chaque fois ; avec 20 tours, la probabilité de tricher est (1/2)²⁰ ≈ 10⁻⁶.

**Usages** : authentification sans mot de passe transmis, preuve d'âge sans date de naissance, **zk-SNARK/zk-STARK** dans les blockchains.

## 10.1.5 Blockchain

Une **blockchain** est un **registre distribué, append-only**, formé de **blocs** chaînés par hachage : chaque bloc contient le **haché du précédent**. Modifier un bloc change son haché, donc invalide tous les suivants.

**Briques crypto** : hachage (SHA-256), **signature** (ECDSA) des transactions, arbres de **Merkle**.
**Consensus** : *Proof of Work* (calcul), *Proof of Stake* (mise).

**Usages** : cryptomonnaies, traçabilité, horodatage, contrats intelligents.

:::attention Ne pas surestimer
La blockchain garantit l'**intégrité de l'historique**, pas la **véracité** des données qu'on y écrit, ni la confidentialité (publique = lisible). Elle est lente, énergivore (PoW) et n'est pas une solution à tout.
:::

:::retenir
**Shor casse RSA/DH/ECC ; Grover affaiblit AES (→ 256 bits). Solutions : PQC. Homomorphe = calcul sur chiffrés. ZKP = prouver sans révéler. Blockchain = chaînage de hachés.**
:::

:::examen Questions fréquentes
- Menaces du quantique sur la cryptographie actuelle ? Parades ?
- Chiffrement homomorphe : définition, avantages sur la clé publique, deux exemples.
- Principe d'une blockchain ; rôle du hachage.
:::
