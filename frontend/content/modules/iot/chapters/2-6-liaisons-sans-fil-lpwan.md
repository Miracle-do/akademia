Ce chapitre complète 2.1 sur la **couche réseau** : comment choisir entre **Wi-Fi, Bluetooth/BLE, Zigbee** (courte et moyenne portée) et **LoRaWAN, NB-IoT** (longue portée), et quelles **attaques radio** menacent ces liaisons.

## 2.6.1 Critères de choix d'une technologie

**Débit, consommation, portée, nombre d'appareils, coût, sécurité, interopérabilité.** Ce sont les questions à se poser avant de choisir.

## 2.6.2 Quatre familles de connectivité

| Famille | Exemples | Portée |
|---|---|---|
| **Courte portée** | BLE, Zigbee, **NFC** (13,56 MHz, quelques cm, sans infrastructure) | cm à dizaines de m |
| **Réseau local** | Wi-Fi, Ethernet | dizaines de m |
| **Longue portée (LPWAN)** | LoRaWAN, Sigfox | plusieurs km (jusqu'à 15 à 20 km selon l'exposé) |
| **Cellulaire** | 2G à 5G, NB-IoT | réseau de l'opérateur |

:::attention Valeurs qui varient d'un exposé à l'autre
Portée du BLE, débit de LoRaWAN : les valeurs diffèrent selon les sources. À l'examen, **appuyez-vous sur le cours de votre enseignant** et précisez la source quand la question le demande.
:::

## 2.6.3 Wi-Fi, Bluetooth/BLE et Zigbee

| | **Wi-Fi** | **Bluetooth / BLE** | **Zigbee** |
|---|---|---|---|
| Fréquence | 2,4 / 5 GHz | **2,4 GHz** | 2,4 GHz |
| Topologie | **étoile** autour d'un point d'accès | point à point / étoile | **maillage (mesh)** |
| Base | IEEE 802.11 | | **IEEE 802.15.4** (couches physique et MAC) |
| Consommation | **la plus élevée** | faible (BLE) | faible |
| Débit | élevé | moyen | **250 kb/s** max (2,4 GHz) |
| Usages | caméras IP, TV connectées, gros volumes | montres, bracelets, capteurs de santé, balises | ampoules, capteurs d'ouverture/température, domotique |

**BLE** = *Bluetooth Low Energy*, variante conçue pour **réduire la consommation**.

**Zigbee** : trois types d'appareils : **coordinateur** (établit le réseau), **routeurs** (relaient), **appareils terminaux**. Le **maillage** permet à certains appareils de relayer les données des autres.

**Évolutions** : Wi-Fi 6/6E/7, Bluetooth 5.x, **Thread et Matter**, **IPv6** (adresses pour des milliards d'objets), **5G** (très faible latence, connexion massive : mMTC).

Quand plusieurs protocoles coexistent, une **passerelle** fait le lien entre eux.

## 2.6.4 Les réseaux LPWAN

**LPWAN** = *Low Power Wide Area Network*. Trois priorités : **portée, autonomie, capacité** (nombre d'objets). Ils transmettent de **petits messages** (température, humidité, relevé de compteur) à **faible débit** : **pas de vidéo**, ni de contrôle industriel en temps réel.

### LoRa et LoRaWAN

- **LoRa** = la **modulation radio** (couche physique) ;
- **LoRaWAN** = *Long Range Wide Area Network* : les **règles de communication** et l'organisation du réseau (spécifications de la **LoRa Alliance**).

**Topologie en étoile** : objets → passerelles → serveur réseau. Quand **plusieurs passerelles** reçoivent le même message, le serveur réseau **élimine les doublons** (meilleure couverture).

| Classe | Écoute | Consommation |
|---|---|---|
| **A** | courtes fenêtres de réception **après chaque émission** | **la plus faible, obligatoire** |
| **B** | fenêtres **programmées**, synchronisées avec le réseau | intermédiaire |
| **C** | **écoute quasi continue** | la plus élevée, commandes reçues vite |

- **Bandes sans licence** : 868 MHz (Europe, Afrique), 915 MHz (Amérique du Nord) ;
- **Chiffrement AES-128**, avec clés distinctes pour le réseau et l'application ;
- **Avantages** : grande portée, faible consommation, évolutivité, **réseau privé possible** ;
- **Limites** : débit limité et **communications descendantes contraintes** (temps d'émission limité sur bandes libres) ; débit ≈ **0,3 à 50 kbit/s**.

### NB-IoT

*Narrowband Internet of Things*, technologie **cellulaire** normalisée par le **3GPP** (**Release 13, 2016**), souvent ajoutée à un réseau 4G.

- **Bande de 180 kHz** (largeur d'un bloc de ressources LTE) : une bande étroite capte **moins de bruit** → plus de **portée et de pénétration**, au prix d'un **faible débit** (≈ **20 à 250 kbit/s**) ;
- **spectre sous licence** exploité par un **opérateur** (contrairement à LoRaWAN) ;
- **PSM** et **eDRX** : longues veilles pour économiser l'énergie, avec en contrepartie un **retard possible** pour recevoir une commande ;
- **authentification par carte SIM**.

### LoRaWAN contre NB-IoT

| | **LoRaWAN** | **NB-IoT** |
|---|---|---|
| Spectre | sans licence | **sous licence** (opérateur) |
| Réseau | **privé possible** | géré par l'**opérateur** |
| Débit | ≈ 0,3 à 50 kbit/s | ≈ 20 à 250 kbit/s |
| Sécurité | AES-128 | SIM / sécurité cellulaire |
| Ferme isolée | **adapté** (pas de couverture cellulaire) | souvent non couvert |
| Compteurs d'eau en ville | possible | **adapté si couverture** |
| Coût | passerelles, serveurs, maintenance | modules + abonnement |

À retenir : **évaluer le coût sur tout le cycle de vie du projet**, pas seulement le prix d'un capteur. Une couverture 4G sur un téléphone **ne prouve pas** que NB-IoT est disponible au même endroit. Selon l'exposé, aucune offre NB-IoT commerciale n'était annoncée publiquement au Bénin ; l'exemple est un cas d'école.

## 2.6.5 Attaques sur les liaisons radio

| Attaque | Principe | Exemple |
|---|---|---|
| **Sniffing** | **écoute passive** | lire des mesures non chiffrées |
| **Jamming** | **brouillage** du signal | rendre un capteur muet |
| **Rejeu (replay)** | renvoyer un message capturé | rejouer « ouvrir la porte » |
| **Spoofing** | **usurper** l'identité d'un appareil ou d'un point d'accès | faux objet, faux point d'accès |

Parades : chiffrement, **compteurs de trames** et horodatage contre le rejeu, authentification mutuelle, détection de brouillage (voir le chapitre sécurité).

:::examen Questions fréquentes
- Différence entre LoRa et LoRaWAN ? Quelles sont les classes A, B, C ?
- Pourquoi la bande étroite de NB-IoT est-elle utile ? À quoi servent PSM et eDRX ?
- Comparez LoRaWAN et NB-IoT pour une ferme isolée et pour des compteurs d'eau en ville.
- Citez les trois types d'appareils Zigbee et la norme IEEE de base.
- Définissez sniffing, jamming, rejeu et spoofing.
:::
