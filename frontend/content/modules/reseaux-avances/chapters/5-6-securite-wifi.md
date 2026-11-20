Les ondes **traversent les murs** : n'importe qui à proximité peut écouter, tenter de se connecter ou se faire passer pour votre réseau. Le Wi-Fi a donc connu une évolution de sécurité rapide : WEP → WPA → WPA2 → WPA3.

## 5.6.1 Les menaces

- **Écoute passive** (*eavesdropping*) : capturer les trames ;
- **AP pirate** (*rogue AP*) : borne branchée sans autorisation sur le réseau ;
- **Evil twin** : faux AP avec le même SSID pour piéger les clients (vol d'identifiants) ;
- **Désauthentification** : trames de gestion forgées pour déconnecter un client (contrées par **PMF**, 802.11w) ;
- **Cassage de clé hors ligne** : capture d'un handshake puis dictionnaire/force brute ;
- **WPS** : PIN à 8 chiffres vulnérable ⇒ à désactiver ;
- **KRACK** (2017) : attaque par rejeu sur le 4-way handshake WPA2 ; **Dragonblood** (2019) : failles de premières implémentations WPA3 ;
- **Brouillage** (*jamming*) : déni de service radio.

## 5.6.2 WEP (1997) : à proscrire

- chiffrement **RC4** avec un **IV de 24 bits** (trop court : réutilisation rapide) ;
- intégrité par **CRC-32** (non cryptographique) ;
- clé cassable en **quelques minutes**.

## 5.6.3 WPA (2003) : solution transitoire

- toujours **RC4**, mais avec **TKIP** : IV de **48 bits**, clé par paquet ;
- intégrité **Michael** (MIC) ;
- rétrocompatible avec le matériel WEP. **Déprécié.**

## 5.6.4 WPA2 (2004, 802.11i)

- chiffrement **AES-CCMP** (AES en mode compteur + CBC-MAC) ;
- **WPA2-Personnel** (PSK) : mot de passe de **8 à 63 caractères**, la **PMK** est dérivée par **PBKDF2** (4096 itérations, SSID comme sel) ;
- **WPA2-Entreprise** : 802.1X / EAP / RADIUS ;
- **4-way handshake** : PMK → PTK (+ GTK) ;
- limites : **pas de confidentialité persistante** (*forward secrecy*) : qui connaît le PSK et a capturé un handshake peut déchiffrer ce trafic ; vulnérable au **dictionnaire hors ligne**. Recommandation : **PSK ≥ 16 caractères**, aléatoire.

## 5.6.5 WPA3 (2018)

| Fonction | Apport |
|---|---|
| **SAE** (Dragonfly) | remplace le PSK ; échange résistant au dictionnaire hors ligne et avec **forward secrecy** |
| **PMF obligatoire** | protège désauthentification et trames de gestion |
| **OWE** (*Enhanced Open*) | chiffrement des réseaux ouverts (hotspots) sans mot de passe |
| **DPP / Easy Connect** | provisionnement par QR code (IoT sans écran) |
| **192 bits** (CNSA) | mode entreprise haute sécurité |

**Mode transition** (WPA2 + WPA3 sur le même SSID) : pratique, mais un attaquant peut **forcer le repli vers WPA2** ⇒ à éviter dès que tous les clients sont compatibles. En **6 GHz**, WPA3 est **obligatoire**.

## 5.6.6 Comparaison

| | WEP | WPA | WPA2 | WPA3 |
|---|---|---|---|---|
| Chiffrement | RC4 | RC4 + TKIP | **AES-CCMP** | AES-CCMP / GCMP-256 |
| Authentification | clé partagée | PSK / 802.1X | PSK / 802.1X | **SAE** / 802.1X |
| Forward secrecy | non | non | non | **oui** (SAE) |
| PMF | non | non | optionnel | **obligatoire** |
| Statut | cassé | déprécié | encore répandu | recommandé |

## 5.6.7 802.1X, EAP, RADIUS

Pour une organisation, un mot de passe **partagé** est une mauvaise idée (départ d'un employé, fuite). On utilise **802.1X** :

- **Supplicant** (client) ↔ **Authenticator** (AP) ↔ **Serveur d'authentification** (RADIUS, **UDP 1812**) ;
- le port n'est ouvert qu'après authentification réussie ; chaque utilisateur reçoit des **clés individuelles**.

| Méthode EAP | Principe |
|---|---|
| **EAP-TLS** | certificats **client et serveur** (le plus sûr) |
| **PEAP-MSCHAPv2** | tunnel TLS + identifiant/mot de passe |
| **EAP-TTLS/PAP** | tunnel TLS + identifiant/mot de passe (annuaire LDAP) |

**eduroam** : fédération mondiale des universités fondée sur 802.1X : un étudiant s'authentifie avec les identifiants de son établissement partout dans le monde.

:::attention Vérifier le certificat du serveur
En PEAP/EAP-TTLS, si le client **n'est pas configuré pour valider** le certificat du serveur RADIUS, un *evil twin* peut capter les identifiants. Toujours **imposer la validation** du certificat.
:::

## 5.6.8 Bonnes pratiques

1. **WPA3** (ou WPA2-AES au minimum) ; jamais WEP/TKIP ;
2. **802.1X** pour les organisations ; PSK long (≥ 16 car.) pour le domicile ;
3. désactiver **WPS** ;
4. activer **PMF** ;
5. **SSID invité** isolé (VLAN, isolation des clients) ;
6. segmenter : VLAN pour l'IoT, l'administration ;
7. **mettre à jour** le micrologiciel des AP ;
8. changer les identifiants d'administration, désactiver l'administration depuis le Wi-Fi invité ;
9. **détecter les AP pirates** (WIPS) et surveiller les journaux ;
10. **masquer le SSID n'est pas une sécurité**.

:::retenir
Seuls **WPA2-AES** et **WPA3** sont acceptables ; **WPA3** (SAE + PMF) protège contre le dictionnaire hors ligne et la désauthentification ; **802.1X** s'impose en entreprise.
:::

:::examen Questions fréquentes
- Pourquoi WEP est-il cassé ? (RC4, IV 24 bits, CRC-32)
- Différence entre TKIP et AES-CCMP ? entre WPA2-PSK et WPA2-Entreprise ?
- Qu'apporte SAE par rapport au PSK ? À quoi sert OWE ?
- Qu'est-ce qu'un evil twin ? Comment s'en protéger ?
- Décrivez 802.1X : rôle du supplicant, de l'authenticator, du serveur RADIUS.
:::
