Le **Wi-Fi** (norme **IEEE 802.11**) transmet par ondes radio : n'importe qui dans la zone peut **écouter**. La sécurité repose donc entièrement sur la cryptographie.

## 9.2.1 Rappels radio

- Bandes : **2,4 GHz** (portée, encombrée), **5 GHz** (plus rapide), **6 GHz** (Wi-Fi 6E/7).
- Un réseau est identifié par son **SSID** ; le point d'accès (AP) diffuse des balises.
- Versions : 802.11b/a/g/n (Wi-Fi 4)/ac (Wi-Fi 5)/ax (Wi-Fi 6)/be (Wi-Fi 7), débits croissants.

## 9.2.2 Évolution des protocoles de sécurité

| Protocole | Année | Chiffrement | Authentification | Statut |
|---|---|---|---|---|
| **WEP** | 1997 | **RC4**, clé 40/104 bits + IV de **24 bits** | clé partagée | **cassé** en minutes |
| **WPA** | 2003 | RC4 + **TKIP** | PSK ou 802.1X | déprécié |
| **WPA2** | 2004 | **AES-CCMP** | PSK ou **802.1X** | encore courant ; PSK vulnérable au dictionnaire hors ligne, KRACK (2017) |
| **WPA3** | 2018 | AES-CCMP/**GCMP-256** | **SAE** (Dragonfly), 802.1X | **recommandé** |

**Pourquoi WEP est mort** : IV de seulement 24 bits (≈ 16,7 millions de valeurs) qui se répètent et sont transmis en clair ; avec RC4, la réutilisation d'IV permet de retrouver la clé (attaque FMS) ; l'intégrité (CRC-32) est **linéaire** donc falsifiable.

## 9.2.3 WPA2 : modes Personal et Enterprise

- **Personal (PSK)** : un mot de passe partagé ; la clé de session (PTK) est dérivée par la **poignée de main à 4 voies**. Un attaquant qui capture cette poignée peut tester des mots de passe **hors ligne**.
- **Enterprise (802.1X / EAP / RADIUS)** : chaque utilisateur a ses identifiants ou son certificat ; un serveur RADIUS authentifie.

## 9.2.4 WPA3

- **SAE** (*Simultaneous Authentication of Equals*, protocole **Dragonfly**) remplace la PSK : échange de type Diffie-Hellman authentifié par mot de passe ; **pas d'attaque par dictionnaire hors ligne** ; **confidentialité persistante**.
- **OWE** (*Opportunistic Wireless Encryption*) pour les réseaux **ouverts** (hôtels, cafés) : chiffrement sans mot de passe.
- **Mode 192 bits** pour l'entreprise (suite CNSA : GCMP-256, ECDH/ECDSA P-384, HMAC-SHA384).
- **PMF** (trames de gestion protégées) obligatoires.

## 9.2.5 Bonnes pratiques

Utiliser **WPA3** (ou WPA2-AES avec mot de passe long de 15+ caractères), désactiver **WPS** et le WEP/TKIP, changer le mot de passe administrateur du routeur, mettre à jour le micrologiciel, séparer le réseau invités, préférer **802.1X** en entreprise.

:::retenir
WEP (RC4, IV 24 bits) cassé → WPA (TKIP) transitoire → WPA2 (AES-CCMP) → **WPA3 (SAE)**.
:::

:::examen Questions fréquentes
- Pourquoi le WEP est-il vulnérable ? Comparez WPA2 et WPA3.
- Qu'apporte SAE ? OWE ?
:::
