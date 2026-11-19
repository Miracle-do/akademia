Le chiffrement asymétrique résout le partage de secret mais en crée un autre : **comment être sûr que la clé publique que je tiens appartient bien à Bob ?** Si Mallory m'envoie sa clé en prétendant être Bob, je chiffre pour Mallory. Les **certificats** et la **PKI** répondent à cette question à grande échelle.

## 8.1.1 Qu'est-ce qu'une PKI ?

Une **PKI** (*Public Key Infrastructure*), ou **Infrastructure de Gestion de Clés (IGC)**, ou **Infrastructure à Clés Publiques**, est un ensemble de **technologies, procédures et logiciels** conçus pour gérer de façon sécurisée le **cycle de vie des certificats numériques**.

Les services qu'elle fournit reposent sur le **certificat électronique**, une donnée numérique qui garantit l'identité d'un signataire et qui est fondée sur le chiffrement asymétrique (dévoilé en 1976).

**Garanties offertes**

- **Confidentialité** : seuls les destinataires légitimes accèdent aux données ;
- **Authentification** : identité vérifiée de l'émetteur ou de l'utilisateur ;
- **Intégrité** : données non altérées en transit ;
- **Non-répudiation** : preuve de l'origine, l'auteur ne peut pas nier.

Pour garantir cela, une PKI s'appuie sur des **processus de vérification d'identité rigoureux**, des solutions cryptographiques fiables et des **audits** de certification.

## 8.1.2 Le certificat numérique X.509

Un **certificat** est une **carte d'identité numérique** : il **lie une clé publique à une identité** (personne, serveur, organisation), et il est **signé par un tiers de confiance** (l'autorité de certification) qui atteste ce lien.

**X.509** est la norme de l'UIT (créée en 1988, dans le cadre de X.500) qui définit le **format** des certificats à clé publique, des listes de révocation (CRL), des attributs et un **algorithme de validation du chemin de certification**. Elle repose sur une **hiérarchie** d'autorités, à l'inverse du « réseau de confiance » d'OpenPGP où chacun peut signer les clés des autres. Pour un site web, on parle de « certificat TLS » (anciennement « SSL »).

**Contenu d'un certificat X.509 v3**

| Champ | Rôle |
|---|---|
| **Version** | 3 (permet les extensions) |
| **Numéro de série** | identifiant unique chez l'émetteur |
| **Algorithme de signature** | ex. sha256WithRSAEncryption |
| **Émetteur (Issuer)** | l'autorité qui a signé |
| **Validité** | dates *Not Before* / *Not After* |
| **Sujet (Subject)** | le titulaire (CN, O, C...) |
| **Clé publique du sujet** | algorithme + valeur (RSA, ECDSA...) |
| **Extensions** | **SAN** (noms alternatifs : domaines), *Key Usage*, *Basic Constraints* (CA ou non), points de distribution CRL/OCSP |
| **Signature de l'AC** | signature numérique de tout ce qui précède |

Le champ **SAN** (*Subject Alternative Name*) est celui que les navigateurs vérifient pour un site : le nom saisi dans l'URL doit figurer dans le SAN.

### Types de certificats (cadre béninois et usages)

- **Certificat de signature électronique** : lie une signature à une personne physique ;
- **Certificat de cachet électronique** : personne morale ;
- **Certificat d'authentification de site Internet** : site associé à son titulaire ;
- versions **qualifiées** lorsqu'elles sont délivrées par un prestataire de services de confiance qualifié ;
- niveaux de validation d'un certificat de site : **DV** (domaine validé), **OV** (organisation validée), **EV** (validation étendue).

## 8.1.3 Les acteurs d'une PKI

| Acteur | Rôle |
|---|---|
| **Autorité de certification (AC / CA)** | tiers de confiance central : **génère, valide et signe** les certificats ; définit la **politique de certification (PC)** et la **déclaration des pratiques (DPC)** |
| **Autorité d'enregistrement (AE / RA)** | **vérifie l'identité** du demandeur avant de transmettre la demande à l'AC |
| **Autorité de dépôt (Repository / annuaire)** | **stocke et publie** les certificats et les **listes de révocation (CRL)** |
| **Autorité de validation (VA)** | **vérifie la validité** d'un certificat (OCSP) |
| **Entité finale (EE)** | l'utilisateur ou l'équipement **titulaire** du certificat |
| **Autorité de séquestre** (optionnelle) | conserve les clés de chiffrement pour un déchiffrement légal ultérieur |

**Fonctions d'une PKI** : enregistrer et vérifier les demandes (AE) ; créer et distribuer les certificats (AC) ; vérifier la validité (VA) ; gérer l'état et la révocation (CRL) ; publier dans un dépôt (annuaire).

## 8.1.4 Procédure de génération d'un certificat

C'est une question d'examen (« Qu'est-ce qu'un certificat ? Illustrer la procédure de sa génération »).

```text
 Entité finale (Bob)            AE                      AC                  Dépôt
 1. Génère sa paire de clés
    (publique, privée)
 2. Crée une CSR (demande)  ──►
    = clé publique + identité
                              3. Vérifie l'identité
                                 (pièces, domaine...) ──►
                                                        4. Construit le certificat
                                                           (identité + clé publique
                                                           + validité + extensions)
                                                        5. Le SIGNE avec la clé
                                                           privée de l'AC
 6. Reçoit son certificat  ◄────────────────────────────┤
                                                        7. Publie ──────────────►  annuaire
                                                           (révocation : CRL / OCSP)
```

**Étapes** : (1) Bob génère sa paire de clés ; la **clé privée ne quitte jamais** son poste ; (2) il crée une **CSR** (*Certificate Signing Request*) contenant sa clé publique et son identité, signée par sa clé privée ; (3) l'AE **vérifie son identité** ; (4) l'AC construit le certificat ; (5) l'AC le **signe avec sa clé privée** ; (6) elle le renvoie à Bob ; (7) le certificat est publié ; il sera utilisé jusqu'à **expiration** ou **révocation**.

**Cycle de vie** : demande → émission → utilisation → **renouvellement** ou **révocation** → expiration → archivage/destruction.

## 8.1.5 Valider un certificat : la chaîne de confiance

On ne signe pas tout avec la même clé : la **clé racine** est trop précieuse. Une hiérarchie typique :

```text
AC racine (auto-signée, hors ligne, stockée dans le navigateur / l'OS)
   └── AC intermédiaire (signée par la racine)
          └── Certificat du serveur www.exemple.bj (signé par l'intermédiaire)
```

**Validation d'un certificat par le client**

1. **Signature** : vérifier la signature de l'AC sur le certificat avec la **clé publique de l'AC** ;
2. **Chaîne** : remonter jusqu'à une **AC racine** présente dans le **magasin de confiance** local ;
3. **Validité** : la date actuelle est comprise entre *Not Before* et *Not After* ;
4. **Nom** : le domaine visité figure dans le **SAN** ;
5. **Usage** : *Key Usage* et *Basic Constraints* cohérents ;
6. **Révocation** : le certificat n'est pas révoqué (CRL ou OCSP).

Si **une seule** vérification échoue, le navigateur affiche un avertissement de sécurité.

## 8.1.6 Modèles de confiance

| Modèle | Principe |
|---|---|
| **Monopoliste** | une seule AC pour tout le monde |
| **Monopoliste avec AE** | une AC et plusieurs AE pour vérifier les identités |
| **Délégation (hiérarchique)** | une AC délègue le pouvoir à d'autres AC (intermédiaires) en leur délivrant un certificat |
| **Oligarchique** | le navigateur embarque **plusieurs AC racines** de confiance (le modèle du web) |
| **Anarchique (toile de confiance)** | chaque utilisateur choisit ceux à qui il fait confiance (**PGP**) |

## 8.1.7 La révocation

Un certificat peut être **révoqué** quand sa fin de validité réelle précède la fin prévue.

**Motifs** : compromission (réelle ou suspectée) de la clé privée ; changement d'un attribut certifié (nom, organisation) ; **perte** de la clé privée (disque effacé, carte perdue, code PIN oublié) ; évolution de la cryptanalyse (clé devenue cassable) ; perte de confiance envers un acteur de la PKI.

Le demandeur doit être **habilité et authentifié** : le propriétaire, son supérieur hiérarchique, le service du personnel.

**Moyens de vérifier le statut**

- **CRL** (*Certificate Revocation List*) : **liste signée** des numéros de série révoqués, publiée périodiquement ; annuaire « négatif » (on inscrit le certificat révoqué dans la liste). Inconvénient : liste lourde, mise à jour décalée.
- **OCSP** (*Online Certificate Status Protocol*) : le client interroge un **répondeur en ligne** et reçoit « bon / révoqué / inconnu » pour **un seul** certificat. Plus rapide et à jour ; pose un problème de **vie privée** (le répondeur voit les sites visités). **OCSP stapling** : le serveur joint lui-même la réponse OCSP signée.
- **SCVP** : validation complète déléguée à un serveur.
- Annuaire « **positif** » : la révocation consiste à **retirer** le certificat de l'annuaire.

## 8.1.8 Travaux pratiques : analyser un certificat

```bash
# Récupérer et afficher le certificat d'un site
openssl s_client -connect www.exemple.com:443 -servername www.exemple.com -showcerts </dev/null

# Afficher le contenu lisible d'un certificat
openssl x509 -in certificat.pem -text -noout

# Champs essentiels
openssl x509 -in certificat.pem -noout -subject -issuer -dates -ext subjectAltName
openssl x509 -in certificat.pem -noout -fingerprint -sha256
```

Mini-PKI de démonstration :

```bash
# AC auto-signée
openssl req -x509 -newkey rsa:2048 -nodes -keyout ca.key -out ca.crt -days 365 -subj "/C=BJ/O=ENEAM/CN=ENEAM Demo CA"
# Demande de certificat du serveur
openssl req -newkey rsa:2048 -nodes -keyout srv.key -out srv.csr -subj "/C=BJ/O=ENEAM/CN=www.exemple.bj"
# L'AC signe : émission du certificat
openssl x509 -req -in srv.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out srv.crt -days 90 -extfile ext.cnf
# Vérifier la chaîne
openssl verify -CAfile ca.crt srv.crt        # srv.crt: OK
openssl verify srv.crt                       # échec : AC inconnue du système
```

Le dernier test échoue **parce que** l'AC de démonstration n'est pas dans le magasin de confiance : c'est exactement ce que voit un navigateur devant un certificat « auto-signé ».

:::attention Certificat auto-signé
Un certificat auto-signé chiffre le trafic mais **n'authentifie rien** : n'importe qui peut en fabriquer un au nom de n'importe quel site. Acceptable en test, **jamais en production publique**.
:::

:::examen Questions fréquentes
- Qu'est-ce qu'un certificat à clé publique ? Illustrez la procédure de génération. *(rattrapage 2022-2023)*
- Rôles de l'AC, de l'AE, de l'autorité de dépôt, de l'entité finale.
- Que contient un certificat X.509 ?
- Comment valide-t-on un certificat ? Quels motifs de révocation ? CRL contre OCSP ?
- Citez les modèles de confiance.
:::
