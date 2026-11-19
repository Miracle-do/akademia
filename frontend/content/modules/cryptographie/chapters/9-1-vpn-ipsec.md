Les chapitres précédents donnent les briques ; celui-ci montre comment **sécuriser un réseau** : VPN, IPsec, pare-feu.

## 9.1.1 Le VPN

Un **VPN** (*Virtual Private Network*) crée un **tunnel chiffré et authentifié** à travers un réseau non sûr (Internet), comme si deux sites ou un utilisateur et son entreprise étaient sur le même réseau privé.

Deux scénarios : **site-à-site** (deux réseaux d'entreprise) et **accès distant** (un employé).

Il apporte **confidentialité, intégrité, authentification**. Il ne protège ni du poste infecté ni de ce qui se passe après la sortie du tunnel.

## 9.1.2 IPsec

**IPsec** protège **au niveau IP (couche 3)** : transparent pour les applications. Il se compose de :

| Élément | Rôle |
|---|---|
| **AH** (*Authentication Header*) | **intégrité et authentification** de l'origine du paquet ; **aucun chiffrement** |
| **ESP** (*Encapsulating Security Payload*) | **chiffrement** + intégrité + authentification (mode usuel) |
| **IKE** | négocie les paramètres et échange les clés (Diffie-Hellman), établit les **SA** (*Security Associations*) |

### Deux modes d'encapsulation (à ne pas confondre avec AH/ESP)

| Mode | Principe | Usage |
|---|---|---|
| **Transport** | on protège la **charge utile** ; l'**en-tête IP d'origine est conservé** | communication hôte à hôte |
| **Tunnel** | le **paquet IP entier** est encapsulé dans un nouveau paquet avec un nouvel en-tête | **passerelle à passerelle**, VPN d'entreprise |

:::attention Correction du cours
Le support d'origine présente parfois « tunnel » et « transport » comme s'ils étaient AH et ESP. Ce sont **deux axes indépendants** : on choisit le **protocole** (AH ou ESP) **et** le **mode** (transport ou tunnel), d'où quatre combinaisons possibles.
:::

## 9.1.3 VPN SSL/TLS

Fonctionne **au niveau applicatif/transport** via un navigateur ou un client léger (OpenVPN, WireGuard est distinct, basé sur Noise). Avantage : traverse facilement les pare-feux (port 443), pas de client lourd. IPsec convient mieux au **site-à-site**.

## 9.1.4 Le pare-feu (firewall)

Un **pare-feu** filtre le trafic entre réseaux selon des **règles**.

| Type | Principe |
|---|---|
| **Filtre de paquets** (sans état) | examine adresses IP, ports, protocole, drapeaux de chaque paquet |
| **À états** (*stateful*) | suit les **connexions** (TCP) : n'accepte que les réponses à une demande interne |
| **Proxy applicatif** | comprend le protocole (HTTP) et filtre le contenu |
| **Nouvelle génération (NGFW)** | inspection applicative, IPS, identité |

**DMZ** : zone intermédiaire pour les serveurs exposés (web, mail), isolée du réseau interne.

### Limites d'un pare-feu (4)

1. Il **ne protège pas contre les menaces internes** (employé malveillant) ;
2. Il **ne contrôle pas le trafic qui ne passe pas par lui** (Wi-Fi, clé USB, modem 4G) ;
3. Il **ne détecte pas les virus** dans le contenu chiffré ou les pièces jointes (sauf NGFW) ;
4. Il **suppose la bonne configuration** et ne protège pas contre les attaques **sur les ports ouverts** (XSS, injection SQL passent sur le port 80/443 légitime).

### Faiblesses du filtrage de paquets et attaques qu'on ne peut pas bloquer

Le filtre simple ne voit ni l'état ni le contenu : fragments IP, usurpation d'adresse IP (**spoofing**), tunnels sur ports autorisés.
Trois attaques qu'un pare-feu ne bloque pas : **DoS/DDoS** sur un service légitime ouvert, **attaques applicatives** (SQLi, XSS), **ingénierie sociale / hameçonnage**.

## 9.1.5 Défense en profondeur et Zero Trust

**Défense en profondeur** : empiler les couches (pare-feu, segmentation, IDS/IPS, antivirus, chiffrement, sauvegardes, formation) pour qu'aucune défaillance isolée ne suffise.

**Zero Trust** : « ne jamais faire confiance, toujours vérifier » : **authentification forte** (MFA) de chaque accès, **moindre privilège**, **micro-segmentation**, vérification continue ; plus de « zone de confiance » interne.

:::retenir
**VPN = tunnel chiffré. IPsec = AH (intégrité) ou ESP (chiffrement + intégrité), en mode transport ou tunnel. Pare-feu = filtre, pas bouclier universel.**
:::

:::examen Questions fréquentes
- Qu'est-ce qu'un VPN ? Différence IPsec / SSL VPN ?
- AH vs ESP ? Mode tunnel vs transport ?
- Les limites d'un pare-feu. Quelles attaques ne peut-il pas bloquer ?
:::
