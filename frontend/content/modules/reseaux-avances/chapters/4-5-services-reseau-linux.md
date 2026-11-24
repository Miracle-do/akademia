Jusqu'ici, on a étudié les protocoles. Ce chapitre regarde le **côté serveur** : les services qu'un administrateur installe et configure sous Linux pour faire fonctionner un réseau d'entreprise — accès distant, VPN, infrastructure (DHCP, NTP, DNS), partage de fichiers, et supervision.

## 4.5.1 Accès distant : Telnet, SSH et le bastion

**Telnet** (port **23**) est le protocole historique de connexion à distance : simple, mais les données — y compris le mot de passe — circulent **en clair**. On le considère obsolète.

**SSH** (*Secure SHell*, port **22**) l'a remplacé : toutes les données sont **chiffrées** entre client et serveur.

```text
ssh -l user IP_machine        # se connecter
ssh-keygen                    # générer une paire de clés publique/privée
ssh-copy-id user@IP           # déposer sa clé publique sur le serveur
```

Une fois la clé publique copiée dans `~/.ssh/authorized_keys` du serveur, la connexion ne demande plus de mot de passe : c'est plus pratique **et** plus sûr (pas de mot de passe à deviner).

### Le bastion SSH (*jump host*)

Dans une entreprise, on n'expose jamais chaque serveur interne directement sur Internet. On place un **bastion** : une machine unique, durcie, qui sert de **point d'entrée unique**.

- **Réduit la surface d'attaque** : seul le bastion est visible depuis l'extérieur ;
- **Centralise et trace les accès** : qui s'est connecté, quand, quelles commandes ;
- **Sépare les flux** : on peut y exiger une double authentification avant d'aller plus loin.

```text
ssh -J victor@Bastion admin@IpInterne     # rebondit via le bastion (option -J = jump)
```

On peut aussi définir un alias dans `~/.ssh/config` pour éviter de retaper l'option à chaque fois.

:::retenir Pourquoi un bastion plutôt que d'ouvrir chaque serveur ?
Un serveur interne compromis reste cantonné au réseau local. Si chaque serveur était directement joignable depuis Internet, chacun serait une porte d'entrée à sécuriser séparément.
:::

## 4.5.2 VPN : OpenVPN et WireGuard

Un **VPN** (*Virtual Private Network*) chiffre une liaison point à point à travers un réseau public.

| | OpenVPN | WireGuard |
|---|---|---|
| Port | **1194** (configurable) | **51820** |
| Chiffrement | TLS (plusieurs algorithmes au choix) | moderne, fixé (Curve25519, ChaCha20) |
| Configuration | script d'installation, certificats | fichier `.conf` + paire de clés |
| Réputation | très répandu, mature | plus récent, plus simple, performant |

Le fichier `/etc/wireguard/wg0.conf` du **serveur** définit son adresse VPN interne, le port d'écoute et sa clé privée, puis une section `[Peer]` par client (sa clé publique et l'adresse qui lui est allouée). Le client importe le fichier correspondant — ou un **QR code** généré avec `qrencode`, pratique sur mobile.

## 4.5.3 DHCP et DNS, vus côté serveur Linux

Le **principe** du DHCP (dialogue DORA) a été vu au chapitre 4.2. Sous Linux, le service s'installe avec `isc-dhcp-server` et se configure dans `/etc/dhcp/dhcpd.conf` :

```conf
subnet 192.168.1.0 netmask 255.255.255.0 {
  range 192.168.1.2 192.168.1.200;
  option routers 192.168.1.1;
  option domain-name-servers 196.192.16.21, 196.192.16.22;
  default-lease-time 600;
  max-lease-time 7200;
}
```

Une section `host { hardware ethernet …; fixed-address …; }` réserve une adresse fixe à une machine précise (identifiée par son adresse MAC) — pratique pour un serveur ou une imprimante.

**En IPv6**, trois approches coexistent : **SLAAC** (le routeur annonce le préfixe, la machine construit seule son adresse), **DHCPv6 sans état** (annonce de routeur *et* DHCPv6 pour les options comme le DNS) et **DHCPv6 avec état** (DHCPv6 attribue aussi l'adresse, comme en IPv4).

**DNS sous Linux** : le paquet `bind9`. Une zone **maître** (`type master`) héberge les enregistrements de référence ; une zone **esclave** (`type slave`, avec `masters { IP_du_maître; }`) les récupère automatiquement — pour la redondance.

```zone
$TTL 604800
@     IN  SOA  ns1.exemple.com. root.exemple.com. ( 2026112401 604800 86400 2419200 604800 )
@     IN  NS   ns1.exemple.com.
www   IN  A    196.192.16.5
mail  IN  A    196.192.16.3
```

**DNSSEC** répond à un vrai problème : le DNS, nativement, n'authentifie rien — une réponse peut être falsifiée (empoisonnement de cache). DNSSEC **signe** chaque enregistrement avec une paire de clés (ZSK, clé de zone ; KSK, clé de clé) ; la commande `dnssec-signzone` produit la zone signée et l'enregistrement **DS** à transmettre au gestionnaire du domaine parent, qui complète la chaîne de confiance.

**NTP** (port **123**) synchronise l'horloge des équipements qui n'ont pas de pile de secours (routeurs, caméras, bornes Wi-Fi) — essentiel aussi pour que les horodatages des journaux (logs) de plusieurs machines restent comparables entre eux.

## 4.5.4 Partage de fichiers : FTP, NFS, SAMBA

| Service | Port | Usage | Remarque |
|---|---|---|---|
| **FTP** | 20/21 | transfert de fichiers | en clair ; préférer **SFTP** (par-dessus SSH) |
| **NFS** | 2049 | partage entre systèmes Unix/Linux | configuré dans `/etc/exports` sur le serveur |
| **SAMBA** | 445 (+ 137-139 NetBIOS) | partage compatible Windows (protocole SMB) | à ne **jamais** exposer sur Internet |

`/etc/exports` déclare, par ligne, un dossier partagé et les machines autorisées :

```text
/home/      192.168.0.3(rw,sync)
/var/www/   192.168.0.0/24(rw,sync)
```

Le client monte le partage avec `mount 192.168.0.1:/home /mnt`, ou de façon permanente via une ligne dans `/etc/fstab`.

Un serveur **SAMBA** sous Linux peut remplacer un serveur Windows dans un réseau local : partage de fichiers et d'imprimantes, authentification compatible Windows. Chaque utilisateur a un mot de passe **Samba**, distinct de son mot de passe Unix (`smbpasswd -a utilisateur`).

:::attention Ports à bloquer vers Internet
445 et 137-139 ne doivent **jamais** être exposés publiquement : ils ont servi de vecteur à plusieurs rançongiciels (dont WannaCry, qui exploitait une faille du protocole SMB).
:::

## 4.5.5 Superviser : Prometheus et Grafana

Pourquoi surveiller ? Pour **détecter une panne avant les utilisateurs**, suivre l'usage des ressources (CPU, RAM, disque, réseau) et garder un historique pour comprendre un incident après coup.

**Prometheus** collecte et stocke des métriques dans le temps (modèle *pull* : c'est lui qui interroge les machines, toutes les 15 secondes par défaut). **Grafana** les visualise en tableaux de bord.

```text
                    requêtes PromQL
   Grafana  ───────────────────────▶  Prometheus  ───▶  node_exporter (chaque machine, port 9100)
  (port 3000)                        (port 9090)        expose ses métriques sur /metrics
```

Chaque machine surveillée installe `node_exporter`, qui expose ses métriques sur le port **9100**. Prometheus les interroge (on dit qu'il « *scrape* ») selon une liste de cibles déclarée dans `prometheus.yml` :

```yaml
scrape_configs:
  - job_name: "node_exporter"
    static_configs:
      - targets: ["192.168.32.21:9100", "192.168.32.22:9100"]
```

Quelques requêtes **PromQL** utiles : `up` (1 si la cible répond, 0 sinon), `node_load1` (charge moyenne), ou pour l'usage CPU en % : `100 - avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100`.

Grafana se connecte à Prometheus comme **source de données**, puis importe un tableau de bord tout prêt (le n° **1860**, « Node Exporter Full », est une référence pour voir CPU, mémoire, disque et réseau de chaque machine en un coup d'œil).

:::attention Ne jamais exposer 9090 et 9100 sur Internet
Ces ports ne demandent **aucune authentification** par défaut : n'importe qui pourrait lire les métriques détaillées des machines. On les restreint au réseau interne (pare-feu) et on publie seulement Grafana, en HTTPS, derrière un proxy inverse.
:::

## 4.5.6 Tableau récapitulatif des ports

| Service | Port(s) | Transport |
|---|---|---|
| SSH | 22 | TCP |
| Telnet | 23 | TCP |
| FTP | 20 / 21 | TCP |
| DNS | 53 | UDP (requêtes) / TCP (zones) |
| NTP | 123 | UDP |
| OpenVPN | 1194 | UDP/TCP |
| SAMBA (SMB) | 445 | TCP |
| NFS | 2049 | TCP |
| Prometheus | 9090 | TCP |
| node_exporter | 9100 | TCP |
| Grafana | 3000 | TCP |
| WireGuard | 51820 | UDP |

## 4.5.7 Points clés

1. **SSH** remplace Telnet, et un **bastion** centralise les accès aux serveurs internes plutôt que de les exposer un à un ;
2. **OpenVPN** et **WireGuard** chiffrent une liaison à travers un réseau public ; WireGuard est plus récent et plus simple à configurer ;
3. **DHCP** et **DNS** se configurent côté Linux dans `/etc/dhcp/dhcpd.conf` et via `bind9` ; **DNSSEC** répond au manque d'authentification natif du DNS ;
4. **FTP/NFS/SAMBA** partagent des fichiers, mais SAMBA (445, 137-139) ne doit jamais sortir sur Internet ;
5. **Prometheus** collecte les métriques (modèle *pull*, via `node_exporter`), **Grafana** les visualise : la base d'une supervision d'infrastructure.
