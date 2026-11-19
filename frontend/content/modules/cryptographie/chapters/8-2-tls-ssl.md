**SSL/TLS** est le protocole qui sécurise HTTPS, la messagerie, de nombreux VPN... C'est le grand assemblage de tout ce que vous avez vu : **asymétrique** pour s'authentifier et échanger une clé, **symétrique** pour chiffrer les données, **hachage/MAC** pour l'intégrité, **certificats** pour la confiance.

## 8.2.1 Historique

| Version | Année | Statut |
|---|---|---|
| SSL 1.0 | 1994 (Netscape) | jamais publiée (failles) |
| SSL 2.0 | 1995 | **interdit** |
| SSL 3.0 | 1996 | **interdit** (attaque POODLE, 2014) |
| **TLS 1.0** | 1999 (RFC 2246) | **déprécié** |
| TLS 1.1 | 2006 | **déprécié** |
| **TLS 1.2** | 2008 (RFC 5246) | encore répandu |
| **TLS 1.3** | 2018 (RFC 8446) | **recommandé** |

Le nom « SSL » est resté dans le langage courant ; on parle de « certificat SSL » alors qu'on utilise TLS.

## 8.2.2 Place dans l'architecture

TLS se situe **entre la couche transport (TCP) et la couche application** (HTTP, SMTP, IMAP...). HTTP + TLS = **HTTPS** (port 443). Il garantit : **confidentialité** (chiffrement symétrique), **intégrité** (MAC ou AEAD), **authentification** du serveur (et optionnellement du client) par certificat.

## 8.2.3 Les sous-protocoles

- **Handshake** : négocie les algorithmes, authentifie, établit les clés ;
- **Change Cipher Spec** : signale le passage aux paramètres négociés (supprimé en TLS 1.3, sauf compatibilité) ;
- **Alert** : signale erreurs et fermetures (avertissement ou fatal) ;
- **Record** : **fragmente, compresse (retiré), protège (MAC/chiffrement)** les données applicatives.

## 8.2.4 Le handshake TLS 1.2 (RSA historique)

```text
 Client                                            Serveur
 1. ClientHello  ───────────────────────────────►  (versions, suites, nonce client)
                 ◄───────────────────────────────  2. ServerHello (suite choisie, nonce serveur)
                 ◄───────────────────────────────  3. Certificate (certificat du serveur)
                 ◄───────────────────────────────  4. ServerHelloDone
 5. Vérifie le certificat (chaîne, date, nom)
 6. ClientKeyExchange : pre-master secret (48 octets)
    chiffré avec la clé publique du serveur ─────►
 7. Dérive master secret → clés de session
    ChangeCipherSpec + Finished ────────────────►
                 ◄───────────────────────────────  8. ChangeCipherSpec + Finished
 ═══════════ Données applicatives chiffrées (clés symétriques) ═══════════
```

**Déroulé**

1. Le client propose ses versions et **suites cryptographiques** (*cipher suites*) et envoie un nombre aléatoire ;
2. le serveur choisit et envoie son nombre aléatoire et son **certificat** ;
3. le client **valide** le certificat (chapitre 8.1) ;
4. le client génère le **pre-master secret** (**48 octets**), le chiffre avec la clé publique RSA du serveur ;
5. des deux côtés : **master secret = PRF(pre-master, nonce client, nonce serveur)**, puis dérivation des **clés de chiffrement et MAC** ;
6. les messages **Finished** (haché de tout l'échange) prouvent que personne n'a modifié la négociation.

:::attention Pas de confidentialité persistante avec RSA
Si la clé privée RSA du serveur est volée un jour, un attaquant qui a enregistré le trafic peut **tout déchiffrer rétroactivement**. D'où l'abandon de cette méthode.
:::

## 8.2.5 TLS 1.3 : plus court, plus sûr

- **1 aller-retour** au lieu de 2 (les paramètres Diffie-Hellman sont envoyés dès le *ClientHello*) ;
- **échange de clé uniquement éphémère (ECDHE)** : **confidentialité persistante obligatoire** ;
- suppression des algorithmes faibles (RC4, 3DES, MD5, SHA-1, CBC, RSA key transport, compression) ;
- **chiffrement authentifié uniquement (AEAD)** : AES-GCM, ChaCha20-Poly1305 ;
- le certificat du serveur est déjà **chiffré** ;
- reprise de session 0-RTT (avec risque de rejeu).

## 8.2.6 Lecture d'une suite cryptographique

`TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384` :

| Élément | Rôle |
|---|---|
| **ECDHE** | échange de clé (Diffie-Hellman elliptique éphémère) |
| **RSA** | authentification (signature du serveur avec son certificat RSA) |
| **AES_256_GCM** | chiffrement symétrique des données, authentifié |
| **SHA384** | fonction de hachage pour la dérivation de clés |

## 8.2.7 TP : observer une connexion

```bash
openssl s_client -connect www.exemple.com:443 -tls1_3 </dev/null
# affiche : version, suite choisie, chaîne de certificats, "Verify return code: 0 (ok)"
openssl s_client -connect www.exemple.com:443 -tls1_1 </dev/null   # refusé si désactivé
```

Les points à relever : le **protocole** (TLSv1.3), la **suite** (TLS_AES_256_GCM_SHA384), la **chaîne** et le **code de vérification**.

## 8.2.8 Attaques et bonnes pratiques

| Attaque | Cible |
|---|---|
| **Downgrade** | forcer une ancienne version |
| **POODLE / BEAST / CRIME** | SSL 3.0, CBC, compression |
| **Heartbleed (2014)** | bogue d'OpenSSL : fuite de mémoire |
| **MITM avec faux certificat** | AC compromise ou utilisateur qui accepte l'alerte |
| **SSL stripping** | rétrograder de HTTPS à HTTP ; parade **HSTS** |

**Bonnes pratiques** : TLS 1.2 minimum (1.3 préféré), suites AEAD à confidentialité persistante, certificats renouvelés (Let's Encrypt, ACME), **HSTS**, ne jamais ignorer l'alerte du navigateur.

:::retenir En une phrase
TLS = **certificat** pour authentifier + **ECDHE** pour convenir d'une clé + **AES-GCM** pour chiffrer et authentifier les données.
:::

:::examen Questions fréquentes
- Décrivez les phases du handshake TLS. Quel est le rôle du pre-master secret ?
- Quels sont les sous-protocoles de TLS ?
- Pourquoi TLS 1.3 est-il meilleur ? Qu'est-ce que la confidentialité persistante ?
:::
