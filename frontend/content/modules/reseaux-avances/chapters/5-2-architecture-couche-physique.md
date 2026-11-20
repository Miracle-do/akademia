Ce chapitre décrit **les briques d'un réseau Wi-Fi** et **ce qui se passe sur le support radio** : bandes, canaux, modulations et antennes multiples.

## 5.2.1 Les équipements

- **Carte Wi-Fi** : intégrée (M.2, PCIe) ou USB ; fonctionne en mode **client** (station), **ad hoc** ou **AP** logiciel ;
- **Point d'accès (AP, borne)** : **pont** entre le réseau sans fil et le réseau filaire. Tout le trafic des stations associées passe par lui ;
- **Contrôleur WLAN** (physique ou cloud) : gestion centralisée (configuration, canaux, puissance, itinérance) ;
- **Routeur / box** : AP + routeur + NAT + DHCP dans un boîtier ;
- antennes, câbles, connecteurs, **injecteurs PoE**.

## 5.2.2 La terminologie 802.11

| Terme | Signification |
|---|---|
| **STA** | Station : tout équipement 802.11 (client ou AP) |
| **AP** | Access Point : station qui donne accès au système de distribution |
| **BSS** | Basic Service Set : **un AP et ses stations** associées |
| **BSSID** | identifiant du BSS = **adresse MAC de la radio de l'AP** |
| **SSID** | nom du réseau (**32 octets max.**) |
| **ESS** | Extended Service Set : **plusieurs BSS partageant le même SSID** |
| **DS** | Distribution System : réseau (souvent Ethernet) qui relie les AP |
| **IBSS** | Independent BSS : réseau **ad hoc**, sans AP |
| **MBSS** | Mesh BSS : réseau maillé 802.11s |
| **Roaming** | itinérance d'une station d'un AP à un autre du même ESS |

## 5.2.3 Les modes de déploiement

1. **Infrastructure (BSS/ESS)** : les stations communiquent via un ou plusieurs AP reliés à un réseau filaire. C'est le mode de l'entreprise, des campus et du domicile ;
2. **Ad hoc (IBSS)** : stations directement entre elles, sans AP ; remplacé en pratique par **Wi-Fi Direct** ;
3. **Maillé (Mesh, 802.11s)** : les AP se relient par radio ; un seul a besoin d'un lien filaire ;
4. **Pont / WDS** : interconnexion de deux réseaux filaires par une liaison radio PtP ou PtMP ;
5. **Mode moniteur** : la carte capture **toutes les trames** (analyse, supervision).

## 5.2.4 Les couches 802.11

| Couche | Rôle |
|---|---|
| **LLC** (802.2) | interface commune avec les couches supérieures (comme Ethernet) |
| **MAC 802.11** | accès au support (**CSMA/CA**), adressage, fragmentation, association, chiffrement, économie d'énergie |
| **PLCP** | préambule et en-tête physique (synchronisation, débit utilisé) |
| **PMD** | modulation et émission effective sur l'onde |

Les amendements (a, b, g, n, ac, ax, be…) modifient surtout la **couche physique** et une partie de la MAC.

## 5.2.5 Les bandes de fréquences

| Bande | Plage | Normes | Remarques |
|---|---|---|---|
| **2,4 GHz** (ISM) | 2,400 à 2,4835 GHz | b, g, n, ax, be | **3 canaux non chevauchants**, très encombrée |
| **5 GHz** (U-NII) | 5,150 à 5,895 GHz | a, n, ac, ax, be | jusqu'à 25 canaux de 20 MHz, **DFS** |
| **6 GHz** | 5,925 à 7,125 GHz | ax (6E), be | **1 200 MHz** ; ouverture variable selon les pays |
| **60 GHz** | 57 à 71 GHz | ad, ay (WiGig) | multi-Gbit/s, très courte portée |
| **Sub-1 GHz** | 755 à 928 MHz | ah (HaLow) | IoT, portée ~1 km |

Les bandes ISM et U-NII sont « **libres mais réglementées** » : pas de licence individuelle, mais puissance maximale (PIRE), usage intérieur/extérieur, **DFS** et **TPC** à respecter. L'ouverture du 6 GHz dépend de chaque pays : se référer à l'**ARCEP Bénin**.

## 5.2.6 Les canaux du 2,4 GHz

- **13 canaux** (14 au Japon en 802.11b) espacés de **5 MHz**, chacun large de 20 à 22 MHz ;
- seuls **1, 6 et 11** ne se chevauchent pas : c'est **le** plan à utiliser ;
- le 40 MHz en 2,4 GHz est **déconseillé** (il occupe les deux tiers de la bande) ;
- interférences : Bluetooth, fours micro-ondes, caméras sans fil, AP voisins.

Fréquence centrale : f = 2407 + 5 × n MHz (canal 1 = 2412 MHz, canal 6 = 2437 MHz, canal 11 = 2462 MHz).

## 5.2.7 Les canaux du 5 GHz

**Fréquence centrale : f = 5000 + 5 × n MHz** (exemple : canal 36 → 5180 MHz).

| Sous-bande | Canaux (20 MHz) | Usage (ETSI typique) | Contraintes |
|---|---|---|---|
| U-NII-1 | 36, 40, 44, 48 | intérieur | PIRE 200 mW |
| U-NII-2A | 52, 56, 60, 64 | intérieur | DFS + TPC, 200 mW |
| U-NII-2C | 100 à 144 | intérieur / extérieur | DFS + TPC, jusqu'à 1 W |
| U-NII-3 | 149 à 165 | extérieur, liaisons PtP | selon la réglementation nationale |

**Agrégation de canaux** : 20 → 40 → 80 → 160 MHz (et **320 MHz** en Wi-Fi 7 à 6 GHz). **Doubler la largeur double le débit**, mais **divise par deux** le nombre de canaux disponibles et **réduit le SNR d'environ 3 dB** (10 log 2 ≈ 3 dB : on capte deux fois plus de bruit).

- **DFS** (*Dynamic Frequency Selection*) : l'AP écoute les **radars** (météo, aviation) et **quitte le canal** s'il en détecte un ; **attente de 60 s** (CAC) avant d'émettre ;
- **TPC** (*Transmit Power Control*) : réduction automatique de puissance.

**En haute densité** (amphithéâtres) : privilégier **20 ou 40 MHz** pour multiplier les canaux.

## 5.2.8 La bande 6 GHz

Jusqu'à **1 200 MHz** de spectre : **59 canaux de 20 MHz, 29 de 40, 14 de 80, 7 de 160 et 3 de 320 MHz** (selon les pays, parfois seulement 5945-6425 MHz).

- bande « **propre** » : réservée aux équipements récents (pas de clients a/b/g/n/ac) ;
- **WPA3 et PMF obligatoires**, pas de WEP/WPA2 ni de réseau ouvert non chiffré (seul **OWE** est permis) ;
- découverte des AP : **PSC** (1 canal sur 4), annonce depuis les bandes 2,4/5 GHz (**RNR**), **FILS** ;
- classes de puissance : **LPI** (Low Power Indoor), **VLP** (Very Low Power), **SP** (Standard Power, avec base de données **AFC**) ;
- **portée inférieure** au 5 GHz : il faut plus d'AP.

## 5.2.9 Modulations et étalement

| Technique | Principe | Où ? |
|---|---|---|
| **FHSS** | saut de fréquence | 802.11 de 1997, Bluetooth |
| **DSSS / HR-DSSS** | étalement par code (Barker, CCK) | 802.11 et 802.11b (1 à 11 Mbit/s) |
| **OFDM** | canal découpé en nombreuses **sous-porteuses orthogonales** modulées en parallèle ; robuste aux trajets multiples | 802.11a/g/n/ac |
| **OFDMA** | sous-porteuses réparties en **Resource Units** attribuées à plusieurs utilisateurs simultanément | Wi-Fi 6/7 |

Chaque sous-porteuse est modulée en BPSK, QPSK, 16-QAM… 4096-QAM. Un **code correcteur** (FEC : BCC ou LDPC, taux 1/2, 2/3, 3/4, 5/6) protège les bits. Le couple **modulation + taux de codage** s'appelle **MCS** : le débit s'adapte automatiquement au SNR (*rate adaptation*).

| Modulation | Bits/symbole | SNR indicatif | Introduite par |
|---|---|---|---|
| BPSK | 1 | ~5 dB | 802.11a/g |
| QPSK | 2 | ~8 dB | 802.11a/g |
| 16-QAM | 4 | ~15 dB | 802.11a/g |
| 64-QAM | 6 | ~22 à 25 dB | 802.11a/g/n |
| 256-QAM | 8 | ~29 à 32 dB | 802.11ac (Wi-Fi 5) |
| 1024-QAM | 10 | ~35 dB | 802.11ax (Wi-Fi 6) |
| 4096-QAM | 12 | ~38 à 40 dB | 802.11be (Wi-Fi 7) |

Les modulations les plus denses ne s'obtiennent qu'**à courte distance** de l'AP, avec un très bon SNR. **256 → 1024-QAM : +25 %** de débit (10/8) ; **1024 → 4096-QAM : +20 %** (12/10).

## 5.2.10 MIMO, flux spatiaux, MU-MIMO, beamforming

- **MIMO** (depuis 802.11n) : plusieurs antennes à l'émission et à la réception. Notation **T × R : S** (4×4:4 = 4 émetteurs, 4 récepteurs, 4 flux) ;
- **Spatial Multiplexing** : chaque flux transporte des données différentes ⇒ débit **multiplié** par le nombre de flux ;
- **Diversité** (STBC, MRC) : fiabilité et portée ;
- **Beamforming** : l'émetteur ajuste la phase de chaque antenne pour **concentrer l'énergie vers le client** (normalisé depuis 802.11ac, par *sounding* NDP) ;
- **MU-MIMO** : l'AP sert **plusieurs clients simultanément** sur des flux différents. **Descendant seulement** en 802.11ac Wave 2 (4 clients) ; **montant et descendant** en 802.11ax (8 clients).

Les smartphones ont généralement **2 flux** ; les AP d'entreprise 4 à 8.

:::retenir Les trois leviers du débit
**Largeur de canal** (20 → 320 MHz) × **densité de modulation** (BPSK → 4096-QAM) × **nombre de flux** (1 → 16). Toute l'histoire du Wi-Fi est l'augmentation de ces trois facteurs.
:::

:::examen Questions fréquentes
- Définissez STA, AP, BSS, BSSID, SSID, ESS. Différence BSS / ESS ?
- Quels canaux du 2,4 GHz ne se chevauchent pas ? Calculez la fréquence du canal 6 et du canal 36.
- Qu'est-ce que le DFS ? le TPC ?
- Différence entre OFDM et OFDMA ? Que signifie MCS ?
- Que signifie 4×4:4 ? Que change le MU-MIMO ?
:::
