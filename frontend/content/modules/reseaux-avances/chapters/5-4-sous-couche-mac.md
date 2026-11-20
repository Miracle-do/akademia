Le support radio est **partagé** : si deux stations émettent en même temps, les trames se brouillent. La sous-couche MAC 802.11 organise l'accès avec **CSMA/CA**, puis gère la connexion, la sécurité et l'itinérance.

## 5.4.1 CSMA/CD contre CSMA/CA

| | Ethernet filaire (CSMA/CD) | Wi-Fi (CSMA/CA) |
|---|---|---|
| Principe | on **détecte** la collision | on **évite** la collision |
| Écoute pendant l'émission | oui | **non** (une radio ne peut pas émettre et écouter) |
| Accusé de réception | non | **oui** (ACK pour chaque trame unicast) |

Problème du **nœud caché** : deux stations A et C voient l'AP B mais pas l'une l'autre ; elles émettent en même temps et B reçoit une collision. Remède : **RTS/CTS**.

## 5.4.2 Les modes de coordination

- **DCF** (*Distributed Coordination Function*) : accès **distribué** par CSMA/CA, mode de base ;
- **PCF** : accès par interrogation (*polling*), quasiment jamais implémenté ;
- **HCF** : étend le DCF avec la QoS : **EDCA** (priorités) et HCCA (rare).

## 5.4.3 Le fonctionnement du DCF

1. La station **écoute** le canal. S'il est libre pendant un **DIFS**, elle émet ;
2. sinon, elle attend la fin de la transmission, puis tire un **backoff** aléatoire dans [0, CW] (en créneaux) qui décrémente tant que le canal est libre ;
3. à 0, elle émet ;
4. le récepteur répond par un **ACK** après un **SIFS** ;
5. sans ACK, la station double sa fenêtre (**backoff exponentiel binaire**) et recommence.

| Paramètre | Valeur (OFDM 5 GHz) |
|---|---|
| **SIFS** | 16 µs |
| **Slot** | 9 µs |
| **DIFS** | SIFS + 2 × slot = **34 µs** |
| **CWmin** | 15 |
| **CWmax** | 1023 |

Évolution de la fenêtre : **15 → 31 → 63 → 127 → 255 → 511 → 1023** (CW = 2^k − 1).

**NAV** (*Network Allocation Vector*) : compteur de **réservation virtuelle** : chaque trame porte une durée ; les autres stations la copient dans leur NAV et s'abstiennent d'émettre.

**RTS/CTS** : la station envoie un RTS, l'AP répond par un CTS que **tout le monde entend** : les nœuds cachés mettent leur NAV à jour. Utile pour les grandes trames ou si beaucoup de nœuds cachés ; coûteux sinon.

## 5.4.4 QoS : EDCA et WMM

**EDCA** (802.11e) définit 4 catégories d'accès avec des paramètres différents ; **WMM** est la certification Wi-Fi Alliance correspondante.

| Catégorie | Trafic | AIFSN | CWmin |
|---|---|---|---|
| **AC_VO** | voix | 2 | 3 |
| **AC_VI** | vidéo | 2 | 7 |
| **AC_BE** | meilleur effort | 3 | 15 |
| **AC_BK** | arrière-plan | 7 | 15 |

Plus l'AIFSN et la CWmin sont **petits**, plus la catégorie passe **souvent et vite**. La priorité n'est que **statistique** : elle n'est pas une garantie.

## 5.4.5 Les trames 802.11

| Type | Rôle | Exemples |
|---|---|---|
| **Gestion** | établir et maintenir l'association | Beacon, Probe Request/Response, Authentication, Association, Reassociation, Disassociation, Deauthentication |
| **Contrôle** | gérer l'accès au support | RTS, CTS, **ACK**, Block Ack |
| **Données** | transporter les paquets | Data, QoS Data, Null |

**En-tête MAC** : jusqu'à **4 adresses** (destination, source, émetteur, récepteur) selon les bits **To DS / From DS** ; plus Frame Control, Duration/ID (NAV), Sequence Control, QoS Control. Le **Beacon** (≈ toutes les 102,4 ms) annonce le SSID, les débits, la sécurité.

## 5.4.6 Les étapes de la connexion

1. **Scan** : passif (écoute des Beacons) ou actif (Probe Request) ;
2. **Authentification 802.11** (formalité en WPA2 ; **SAE** en WPA3) ;
3. **Association** : l'AP attribue un **AID** à la station ;
4. **Authentification 802.1X** (entreprise) ou PSK ;
5. **4-way handshake** : dérive les clés **PTK** (unicast) et **GTK** (diffusion) à partir de la **PMK** ;
6. **DHCP** : la station obtient son adresse IP.

## 5.4.7 L'itinérance (roaming)

C'est le **client** qui décide de changer d'AP (seuil de RSSI, typiquement autour de −70 dBm). Trois amendements l'aident :

- **802.11k** : l'AP fournit une **liste de voisins** (scan plus rapide) ;
- **802.11v** : l'AP peut **suggérer** un autre AP (BSS Transition) ;
- **802.11r** : **Fast BSS Transition**, réauthentification en quelques ms (voix, visio).

Les paramètres 802.11k/v/r doivent être **activés** ensemble sur les AP du même ESS.

:::retenir
Wi-Fi = **half-duplex partagé** avec **CSMA/CA** : écouter, attendre un backoff, émettre, attendre l'ACK. Plus il y a de clients actifs sur un canal, plus le débit **par client** chute.
:::

:::examen Questions fréquentes
- Pourquoi le Wi-Fi n'utilise-t-il pas CSMA/CD ?
- Qu'est-ce que le nœud caché ? Comment RTS/CTS le résout-il ?
- Calculez le DIFS à partir de SIFS = 16 µs et slot = 9 µs.
- Donnez l'évolution de la fenêtre de contention.
- Décrivez les étapes de connexion d'un client à un réseau WPA2/WPA3.
- À quoi servent 802.11k, v et r ?
:::
