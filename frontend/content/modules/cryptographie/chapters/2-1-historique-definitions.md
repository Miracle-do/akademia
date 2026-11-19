« L'homme moderne porte sur lui, sans forcément le savoir, plusieurs processus cryptographiques », disait Jacques Stern : téléphone mobile, carte bancaire, passeport biométrique, badge d'accès... Ce chapitre explique d'où vient la cryptographie, ce qu'elle recouvre et ce qu'elle cherche à garantir.

## 2.1.1 Un besoin aussi ancien que la communication

Le besoin d'envoyer un message de façon sûre est probablement aussi ancien que la communication elle-même. Il devient criant lors des **conflits** entre nations. D'où un vocabulaire militaire : adversaire, attaque, ennemi, pirate. La cryptologie a longtemps été confinée aux cercles **militaires et diplomatiques** ; elle est présentée comme une lutte incessante entre **codeurs** et **briseurs de code**.

Repères historiques :

| Époque | Fait |
|---|---|
| XVIᵉ siècle av. J.-C. | plus ancien document chiffré connu : une **tablette d'argile** retrouvée en Irak |
| VIᵉ siècle av. J.-C. | Nabuchodonosor, roi de Babylone, écrit sur le **crâne rasé** de ses esclaves, attend que les cheveux repoussent puis les envoie à ses généraux : c'est de la **stéganographie** |
| Vᵉ siècle av. J.-C. | la **scytale** spartiate (transposition sur bâton) |
| Iᵉʳ siècle av. J.-C. | **chiffre de César** (substitution par décalage) |
| IXᵉ siècle | **Al-Kindi** invente l'**analyse fréquentielle**, première cryptanalyse |
| XVIᵉ siècle | **Vigenère** : chiffrement polyalphabétique |
| 1883 | **Kerckhoffs** énonce son principe |
| 1918-1945 | machines à rotors : **Enigma** (cassée grâce à Rejewski puis Turing) |
| 1949 | **Shannon** : bases théoriques, masque jetable parfait |
| 1976-1977 | **DES** (standard), **Diffie-Hellman** (cryptographie à clé publique), puis **RSA** (1977) |
| 1991 | **PGP** de Philip Zimmermann |
| 2001 | **AES** remplace DES |
| 2018 | **TLS 1.3** |

Aujourd'hui, la cryptologie dépasse le cadre militaire : **industrie militaire** et radiocommunications, **banque** (transactions, contrats), **carte à puce** (passeport biométrique, identification), **commerce électronique**.

## 2.1.2 Cryptologie, cryptographie, cryptanalyse

Étymologiquement, **cryptologie** vient de *kryptos* (caché) et *logos* (science) : la **science du secret**.

> **Cryptologie = cryptographie + cryptanalyse**

- **Cryptographie** (« écriture secrète ») : l'ensemble des méthodes de protection d'une information. Elle sert à garantir la **confidentialité** lors d'une communication ou d'un stockage grâce au chiffrement, mais aussi l'**intégrité** et l'**authentification**. Définition du cours : *la science du codage des messages à l'aide de codes secrets appelés clés ; elle se base sur les propriétés des mathématiques et de l'informatique.*
- **Cryptanalyse** : l'étude des **attaques** contre les mécanismes de cryptographie. Elle analyse les messages chiffrés pour retrouver le clair **sans connaître la clé**. On dit « casser » le message. C'est une compétence spécialisée, rare en entreprise.

:::examen « Qu'est-ce que la cryptologie ? »
Réponse type : la cryptologie, « science du secret » (du grec *kryptos* « caché » et *logos* « science »), regroupe **la cryptographie** (conception de méthodes de protection de l'information : chiffrement, hachage, signature) et **la cryptanalyse** (étude des attaques contre ces méthodes). Aujourd'hui elle ne se limite plus à la confidentialité : elle assure aussi **l'authenticité** (qui a envoyé ?) et **l'intégrité** (le message a-t-il été modifié ?).
:::

## 2.1.3 Les branches de la cryptologie

La cryptographie ancienne se répartissait en :

- **Codes et répertoires** : on remplace des mots ou des phrases entières par des symboles, selon un livre de codes ;
- **Chiffrement** : on transforme les **lettres** elles-mêmes ;
- **Stéganographie** : on **cache l'existence** du message (encre invisible, message dans une image).

Le chiffrement lui-même se divise en :

- **Transposition** : on change l'**ordre** des lettres sans les modifier (scytale) ;
- **Substitution** : on remplace les lettres par d'autres symboles, sans changer l'ordre. La substitution peut être **monoalphabétique** (un seul alphabet de substitution : César, Atbash) ou **polyalphabétique** (plusieurs : Vigenère).

:::retenir Cacher vs brouiller
La **stéganographie** cache *qu'*un message existe. Le **chiffrement** ne cache pas son existence, il le rend *illisible*. Les deux peuvent se combiner.
:::

## 2.1.4 Les objectifs de la cryptographie

La cryptographie vise essentiellement trois objectifs, auxquels on ajoute la non-répudiation :

- **Confidentialité** : seules les personnes autorisées accèdent à l'information (ISO : s'assurer que l'information n'est accessible qu'à ceux dont l'accès est autorisé). C'est le **chiffrement** qui la réalise.
- **Authenticité** : on vérifie l'**identité** d'une entité (personne, ordinateur, système d'information) avant de lui donner accès à des ressources. Le simple login/mot de passe a des failles : un intrus peut retrouver le mot de passe. On utilise donc aussi des certificats, des signatures, des MAC.
- **Intégrité** : les données ne subissent **aucune altération ou destruction**, volontaire ou accidentelle, pendant le traitement, la conservation ou la transmission, et conservent un format exploitable. Quatre éléments : **intégralité** (rien ne manque), **précision**, **exactitude**, **validité**. On l'assure par le **hachage** et les **MAC**.
- **Non-répudiation** : l'auteur d'une action ne peut pas nier l'avoir faite (**signature numérique**).

C'est la même triade que le CIA vu au chapitre 1 (confidentialité, intégrité) complétée par l'authenticité ; la disponibilité n'est pas, elle, un objectif de la cryptographie.

## 2.1.5 Les quatre grandes fonctions

| Besoin | Fonction cryptographique | Question à laquelle elle répond |
|---|---|---|
| Confidentialité | **chiffrement** (symétrique ou asymétrique) | « Qui peut lire ? » |
| Intégrité | **hachage** (sans clé) ou **MAC / HMAC** (avec clé) | « A-t-il été modifié ? » |
| Authenticité + non-répudiation | **signature numérique** | « Qui l'a écrit, et peut-il le nier ? » |
| Confiance dans les clés publiques | **certificat / PKI** | « Cette clé est-elle bien celle de Bob ? » |

On n'a **pas** besoin de chiffrer pour assurer l'intégrité, ni l'inverse : le chiffrement **ne protège pas** l'intégrité (un attaquant peut altérer un texte chiffré sans le comprendre). D'où l'utilité du **chiffrement authentifié** (AES-GCM) vu plus tard.

## 2.1.6 Cryptographie dans la vie courante

- **Mots de passe** : on stocke des **empreintes** (hachés), jamais les mots de passe en clair.
- **Navigation web** : HTTPS (TLS) protège contre l'écoute et l'attaque de l'homme du milieu.
- **Messageries** : chiffrement de bout en bout (WhatsApp, Signal).
- **Paiement** : carte bancaire à puce, 3-D Secure.
- **Cryptomonnaies** : signatures et hachage.
- **Signature électronique** : contrats ayant valeur légale.
- **IoT** : cryptographie légère pour environnements contraints (norme ISO/IEC 29192).
- **DRM** : protection du droit d'auteur.

:::examen Questions fréquentes de ce chapitre
- Définir cryptologie, cryptographie, cryptanalyse.
- Distinguer transposition et substitution ; monoalphabétique et polyalphabétique.
- Qu'est-ce que la stéganographie ? Donnez l'exemple de Nabuchodonosor.
- Citez les objectifs de la cryptographie et le mécanisme qui réalise chacun.
:::
