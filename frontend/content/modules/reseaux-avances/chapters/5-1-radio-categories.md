Jusqu'ici, nos paquets circulaient dans des câbles. Dans ce chapitre, ils voyagent dans **l'air**. Le support change, donc les règles changent : le support est **partagé**, il subit des **interférences**, et **tout le monde peut l'écouter**. Pour comprendre le Wi-Fi, il faut d'abord comprendre la radio.

## 5.1.1 Réseau sans fil : définition

Un **réseau sans fil** (*wireless network*) est un ensemble d'appareils capables d'émettre et de recevoir des données **sans liaison filaire physique**. Le support de transmission est l'**onde électromagnétique** (radio ou infrarouge) qui se propage dans l'air.

**Wi-Fi** est une **marque commerciale** de la Wi-Fi Alliance. La norme technique sous-jacente est **IEEE 802.11**.

## 5.1.2 Bref historique

| Année | Étape |
|---|---|
| 1971 | **ALOHAnet** (Université d'Hawaï) : premier réseau de données par radio |
| 1985 | La FCC (États-Unis) ouvre les **bandes ISM** à l'usage sans licence |
| 1997 | Première norme **IEEE 802.11** (1 et 2 Mbit/s) |
| 1999 | **802.11a / 802.11b** ; création de la WECA, future Wi-Fi Alliance |
| 2003 | **802.11g** (54 Mbit/s) et **WPA** ; 2004 : **802.11i / WPA2** |
| 2009 | **802.11n** (Wi-Fi 4) : MIMO, 600 Mbit/s |
| 2013 | **802.11ac** (Wi-Fi 5) : 5 GHz, 256-QAM ; MU-MIMO (Wave 2, 2016) |
| 2018 | **WPA3** ; numérotation Wi-Fi 4/5/6 |
| 2019 / 2020 | **802.11ax** (Wi-Fi 6), puis **Wi-Fi 6E** (bande 6 GHz) |
| 2024 | **802.11be** (Wi-Fi 7) : 320 MHz, 4096-QAM, MLO |
| en cours | **802.11bn** (Ultra High Reliability, futur « Wi-Fi 8 ») |

## 5.1.3 Qui décide quoi ?

| Organisme | Rôle |
|---|---|
| **IEEE** | groupes de travail 802.11 (WLAN), 802.15 (WPAN), 802.16 (WMAN) : écrit les normes techniques |
| **Wi-Fi Alliance** | consortium industriel : certifie l'**interopérabilité** (logo *Wi-Fi CERTIFIED*, WPA2/WPA3) |
| **UIT-R** | répartit le **spectre** à l'échelle mondiale |
| **ETSI** (Europe), **FCC** (USA) | règles de puissance et d'usage des bandes |
| **3GPP** | normes **cellulaires** (GSM, UMTS, LTE, 5G NR) |
| **ARCEP Bénin** | régulateur national : autorise les fréquences, fixe les **puissances maximales**, délivre les licences (faisceaux hertziens, BLR) |

## 5.1.4 Infrarouge ou radio ?

- **Infrarouge** : ligne de vue obligatoire, quelques mètres (télécommandes, IrDA). Aujourd'hui marginal ; sa variante moderne est le **Li-Fi** (IEEE 802.11bb, 2023), qui transmet par la **lumière**.
- **Radio** : de quelques mètres à plusieurs dizaines de kilomètres ; traverse en partie les obstacles ; omnidirectionnelle ou directive. **Inconvénients** : interférences, atténuation (murs, pluie sur les bandes hautes), **trajets multiples** (*multipath*) et **écoute facile**.

## 5.1.5 Fréquence et longueur d'onde

> **λ = c / f**   avec c ≈ 3 × 10⁸ m/s

| Fréquence | λ | λ/2 |
|---|---|---|
| 2,4 GHz | 12,5 cm | 6,2 cm |
| 5,5 GHz | 5,5 cm | 2,7 cm |
| 6,5 GHz | 4,6 cm | 2,3 cm |
| 60 GHz | 5 mm | 2,5 mm |

**Règle** : plus la fréquence est **haute**, plus on dispose de **bande passante**, mais plus l'**atténuation** est forte et moins on traverse les obstacles. Le **2,4 GHz** porte plus loin et traverse mieux les murs que le 5 ou le 6 GHz. La **taille des antennes** est proportionnelle à λ.

**Phénomènes de propagation** : réflexion, réfraction, diffraction, diffusion (*scattering*), absorption (eau, corps humain, béton) et **trajets multiples** (longtemps un problème, aujourd'hui exploité par le **MIMO**).

## 5.1.6 Les unités de puissance : mW, dBm, dB, dBi

La puissance radio varie sur des **ordres de grandeur énormes** : on utilise donc l'échelle **logarithmique**.

> **P(dBm) = 10 × log₁₀ ( P(mW) / 1 mW )**

| mW | dBm |
|---|---|
| 1 000 (1 W) | 30 |
| 200 | 23 |
| 100 | 20 |
| 10 | 10 |
| 1 | 0 |
| 0,001 | −30 |
| 10⁻⁹ | −90 |

- **dB** : rapport **relatif** (gain ou perte) ;
- **dBm** : puissance **absolue** par rapport à 1 mW ;
- **dBi** : gain d'antenne par rapport à l'antenne **isotrope** ; dBi = dBd + 2,15 (dBd : par rapport au dipôle).

:::retenir Les règles des 3 et des 10
**+3 dB ⇒ ×2** (puissance doublée) ; **−3 dB ⇒ ÷2**. **+10 dB ⇒ ×10** ; **−10 dB ⇒ ÷10**. Avec ces deux règles, on convertit presque tout de tête : 23 dBm = 20 + 3 = 100 mW × 2 = **200 mW**.
:::

## 5.1.7 PIRE, RSSI, sensibilité, SNR

- **PIRE** (EIRP, puissance isotrope rayonnée équivalente) : puissance **réellement rayonnée** dans l'axe de l'antenne ; c'est elle que **limite la réglementation**.

> **PIRE (dBm) = P_émetteur − pertes de câble + gain d'antenne**

Exemple : émetteur 20 dBm, câble −2 dB, antenne +6 dBi → PIRE = 20 − 2 + 6 = **24 dBm**, soit environ **250 mW**.

- **RSSI** : niveau **reçu**, en dBm ;
- **Sensibilité** du récepteur : niveau minimum pour décoder un débit donné (MCS) ;
- **Plancher de bruit** (*noise floor*) : typiquement **−90 à −95 dBm** ;
- **SNR = RSSI − bruit** (en dB) : il **détermine la modulation utilisable**.

Exemple : RSSI = −67 dBm, bruit = −92 dBm → SNR = **25 dB** : on peut utiliser jusqu'au 64-QAM.

| RSSI | Qualité | Usage possible |
|---|---|---|
| > −55 dBm | Excellente | MCS élevés (1024/4096-QAM) |
| −55 à −67 dBm | Bonne | VoIP, vidéo (**cible usuelle de conception**) |
| −67 à −75 dBm | Moyenne | navigation, messagerie |
| < −80 dBm | Faible | connexion instable |

## 5.1.8 Avantages et limites

| Avantages | Limites |
|---|---|
| mobilité des usagers et des terminaux | **support partagé** : débit divisé entre utilisateurs |
| déploiement rapide, peu de génie civil | interférences et saturation des canaux |
| moins de risque de rupture (câble coupé) | **sécurité** : les ondes dépassent les murs |
| accès aux lieux difficiles à câbler | latence et gigue plus variables que le filaire |
| évolutivité | contraintes réglementaires (puissance, bandes) |
| économies à long terme | consommation d'énergie des terminaux |

**Domaines d'application** : hôpitaux, commerce et restauration, logistique ; **campus** (amphithéâtres à forte densité, itinérance *eduroam*) ; domicile et petits bureaux (SOHO) ; opérateurs et FAI (**BLR**, backhaul, zones rurales) ; **IoT** ; sites difficiles (chantiers, liaisons entre bâtiments séparés par une route ou une rivière).

## 5.1.9 Les catégories de réseaux sans fil

| Catégorie | Signification | Technologies | Portée |
|---|---|---|---|
| **WPAN** | Personal Area Network | Bluetooth 5.x/6.0, BLE, Zigbee, UWB, NFC | cm à ~100 m |
| **WLAN** | Local Area Network | IEEE 802.11 (Wi-Fi 4 à 7) | 30 à 100 m (intérieur) |
| **WMAN** | Metropolitan Area Network | 802.16 WiMAX (en déclin), BLR, liaisons Wi-Fi PtP/PtMP | 1 à 50 km |
| **WWAN** | Wide Area Network | GSM, GPRS/EDGE, UMTS, LTE (4G), 5G NR | plusieurs km par cellule |
| **LPWAN** | Low Power WAN (transverse) | LoRaWAN, Sigfox, NB-IoT, LTE-M, Wi-Fi HaLow | 2 à 15 km+ |

**WPAN** : faible portée, **pas d'infrastructure**, relie des périphériques (casque, clavier, montre) à un ordinateur ou un smartphone : Bluetooth Classic (1 à 3 Mbit/s, ~10 m), **BLE** (1 à 2 Mbit/s), **Zigbee / Thread** (IEEE 802.15.4, **250 kbit/s**, maillage, domotique), **UWB** (localisation centimétrique), **NFC** (13,56 MHz, < 10 cm).

**WWAN (cellulaire)** : 2G (voix, SMS, ≤ 236 kbit/s) → 3G (jusqu'à 42 Mbit/s) → 4G (100 Mbit/s à 1 Gbit/s) → 5G NR (eMBB, URLLC, mMTC ; plusieurs Gbit/s).

:::attention Retouche à une figure du support
Sur une figure du cours, l'étiquette « Réseaux locaux sans fil » doit se lire **WLAN** (et non WPAN).
:::

:::examen Questions fréquentes
- Définissez un réseau sans fil. Quelle différence entre Wi-Fi et IEEE 802.11 ?
- Convertissez 200 mW en dBm ; dites ce que donne +3 dB.
- Calculez la PIRE d'un émetteur de 20 dBm avec un câble de 2 dB et une antenne de 6 dBi.
- Citez les 4 catégories de réseaux sans fil et la catégorie transverse, avec un exemple chacune.
- Pourquoi le 2,4 GHz traverse-t-il mieux les murs que le 5 GHz ?
:::
