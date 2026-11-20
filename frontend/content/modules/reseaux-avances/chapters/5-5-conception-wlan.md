Un bon Wi-Fi ne s'obtient pas en posant une borne au milieu du couloir. Il se **conçoit** : besoins, étude, canaux, puissance, validation.

## 5.5.1 Architectures de gestion

| Architecture | Principe | Usage |
|---|---|---|
| **AP autonomes** | chaque AP se configure seul | petits sites, domicile |
| **AP légers + contrôleur** | les AP sont pilotés par un contrôleur via **CAPWAP** ; **RRM** ajuste canaux et puissances | campus, entreprise |
| **Contrôleur cloud** | gestion centralisée en ligne | sites multiples, PME |

Les AP sont alimentés en **PoE** :

| Norme | Puissance à la source | Usage |
|---|---|---|
| 802.3af (PoE) | 15,4 W | AP simples |
| 802.3at (PoE+) | 30 W | AP Wi-Fi 5/6 |
| 802.3bt (PoE++) | 60 / 90 W | AP Wi-Fi 6E/7, caméras PTZ |

## 5.5.2 Les étapes de planification

1. **Recueillir les besoins** : nombre d'utilisateurs, applications (voix, vidéo), zones, densité, croissance ;
2. **Étude prédictive** sur plan (logiciel type Ekahau, NetSpot) avec les matériaux ;
3. **Site survey** : mesures sur le terrain (passif : RSSI/bruit ; actif : débit) ;
4. **Plan de canaux et de puissance** ;
5. **Installation**, câblage (Ethernet ≤ 100 m), PoE ;
6. **Validation** (survey post-installation, iperf3) et **supervision**.

**Atténuation indicative des matériaux** : plâtre ≈ 3 dB ; brique ≈ 6 à 10 dB ; béton ≈ 12 à 20 dB ; métal et ascenseurs : très forte. Le **corps humain** absorbe aussi (une salle pleine atténue beaucoup).

## 5.5.3 Règles de conception

- viser un **RSSI ≥ −67 dBm** partout où l'on veut de la voix/vidéo ;
- **recouvrement de 15 à 20 %** entre cellules voisines (au niveau −67 dBm) pour permettre le roaming ;
- **25 à 50 clients actifs par radio** au maximum ;
- plan de canaux **sans co-canal** adjacent : en 2,4 GHz : 1/6/11 ; en 5 GHz : 20 ou 40 MHz en forte densité ;
- **ne pas mettre la puissance au maximum** : un AP trop puissant est entendu de loin par les clients, mais ceux-ci ne peuvent pas répondre (asymétrie) ; **équilibrer** la puissance de l'AP sur celle du client (≈ 14 à 17 dBm) ;
- **désactiver les débits faibles** (1, 2, 5,5 Mbit/s) : ils consomment un temps d'antenne énorme et réduisent la taille des cellules ;
- privilégier **5 et 6 GHz** ; garder 2,4 GHz pour l'IoT et les anciens clients ;
- **câbler** les AP (backhaul filaire) plutôt que mailler quand c'est possible.

:::attention Plus de puissance ≠ meilleur Wi-Fi
Un AP à 23 dBm face à un smartphone à 14 dBm donne un lien **déséquilibré** : le client entend l'AP mais l'AP n'entend pas le client. Mieux vaut **plus d'AP à puissance modérée**.
:::

## 5.5.4 Réglementation au Bénin

L'**ARCEP Bénin** fixe les bandes, les puissances et les conditions d'usage (intérieur/extérieur, licences pour les liaisons professionnelles). Avant tout déploiement extérieur, **vérifier les textes en vigueur**. Sous Linux, le domaine réglementaire se règle avec `iw reg set BJ`.

## 5.5.5 Outils d'analyse sous Linux

| Commande | Rôle |
|---|---|
| `iw dev` | liste les interfaces Wi-Fi |
| `iw list` | capacités de la carte (bandes, modes) |
| `sudo iw dev wlan0 scan` | scan détaillé (BSSID, canal, RSSI, sécurité) |
| `nmcli device wifi list` | réseaux visibles |
| `iw dev wlan0 link` | état de la connexion (SSID, fréquence, RSSI, débit) |
| `iw dev wlan0 station dump` | statistiques de la station associée |
| `iw reg get` / `sudo iw reg set BJ` | domaine réglementaire |
| `nmcli device wifi connect SSID password MOTDEPASSE` | se connecter |

Autres outils : **Wireshark** (mode moniteur : voir Beacons, trames de gestion), **iperf3** (débit réel : `iperf3 -s` côté serveur, `iperf3 -c IP` côté client), **Ekahau / NetSpot** (cartes de chaleur).

## 5.5.6 Cas de dépannage typiques

| Symptôme | Cause probable | Action |
|---|---|---|
| Débit faible, RSSI bon | canal saturé, interférences | changer de canal, passer en 5 GHz |
| Coupures en marchant | roaming tardif | activer 802.11k/v/r, ajuster les seuils |
| Connexion lente à forte densité | trop de clients par radio, débits bas autorisés | plus d'AP, canaux 20 MHz, désactiver les débits bas |
| Impossible de joindre l'AP loin | puissance client trop faible | réduire la puissance AP, ajouter des AP |
| Réseau instable à intervalle régulier | DFS (radar) | choisir canaux non-DFS pour les services critiques |

:::retenir
Concevoir un WLAN = **couverture (−67 dBm) + capacité (clients par radio) + canaux sans interférence + sécurité**. Valider toujours par une mesure sur le terrain.
:::

:::examen Questions fréquentes
- Différence entre AP autonome et AP léger avec contrôleur ?
- Quel RSSI cible pour de la voix ? Quel recouvrement entre cellules ?
- Pourquoi désactiver les débits les plus bas ?
- Quelle commande affiche le RSSI et le débit de la connexion courante ?
- Pourquoi ne faut-il pas régler la puissance au maximum ?
:::
