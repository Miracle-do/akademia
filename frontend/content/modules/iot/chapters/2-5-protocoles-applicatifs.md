Le chapitre 2.1 a présenté les protocoles un par un. Ici, on les **fait fonctionner** : on suit un message de bout en bout, on retient les **chiffres d'examen** (ports, tailles d'en-tête, codes) et on apprend à **choisir** le bon protocole pour un cas donné.

## 2.5.1 Deux modèles de communication

| | **Requête / réponse** | **Publication / abonnement** |
|---|---|---|
| Principe | un client demande, un serveur répond | un producteur publie, un **broker** redistribue aux abonnés |
| Couplage | les deux parties se connaissent | producteur et consommateur **ne se connaissent pas** |
| Protocoles | HTTP, CoAP | MQTT, AMQP |
| Atout | simple, proche du web | un à plusieurs, tolère les déconnexions |

Un **protocole de réseau** est un ensemble de règles et de conventions qui définissent comment des équipements communiquent.

## 2.5.2 MQTT en détail

**MQTT** = *Message Queuing Telemetry Transport*. Modèle **publish/subscribe** via un **broker** (Mosquitto, EMQX, HiveMQ) qui reçoit les messages et les redistribue.

| Élément | Valeur à retenir |
|---|---|
| Transport | **TCP** |
| Ports | **1883** (clair), **8883** (TLS) |
| En-tête minimal | **2 octets** |
| Topic | adresse **hiérarchique** : `ferme/parcelle1/humidite` |
| Joker `+` | **un seul** niveau : `ferme/+/humidite` |
| Joker `#` | **tous** les niveaux suivants : `ferme/#` |

### Les trois niveaux de QoS

| QoS | Garantie | Échanges | Exemple d'usage |
|---|---|---|---|
| **0** | **au plus une fois** (perte possible) | 1 | mesure périodique (la suivante arrive bientôt) |
| **1** | **au moins une fois** (doublon possible) | 2 (PUBLISH, PUBACK) | allumer une lumière |
| **2** | **exactement une fois** | 4 (PUBLISH, PUBREC, PUBREL, PUBCOMP) | paiement, ouverture d'une vanne |

Plus le QoS est élevé, plus il y a d'échanges : c'est **plus fiable mais plus lent et plus coûteux en énergie**.

### Fonctions utiles

- **Retain** : le broker garde le dernier message d'un topic pour les nouveaux abonnés ;
- **Last Will** : message publié automatiquement si l'objet disparaît sans se déconnecter proprement ;
- **Keep-alive** : « ping » régulier pour détecter une connexion morte.

### Limites

- le **broker est un point central** : à sécuriser, et s'il tombe tout s'arrête ;
- **aucune sécurité par défaut** : activer TLS, un identifiant/mot de passe ou un certificat, et des ACL par topic ;
- les **topics ne sont pas standardisés** : chaque projet définit sa convention ;
- **le broker ne conserve pas l'historique** : il faut une base de données (voir 2.5.7).

### Essayer en ligne de commande (Mosquitto)

```bash
# Terminal 1 : s'abonner à toutes les parcelles (-v affiche le topic)
mosquitto_sub -h localhost -p 1883 -t "ferme/+/humidite" -v

# Terminal 2 : publier une mesure en QoS 1, conservée par le broker
mosquitto_pub -h localhost -p 1883 -t "ferme/parcelle1/humidite" -m "27.5" -q 1 -r
```

Avec TLS : port **8883** et `--cafile ca.crt`.

## 2.5.3 CoAP en détail

**CoAP** = *Constrained Application Protocol* (RFC 7252), pensé pour les équipements à **ressources limitées**.

| Élément | Valeur à retenir |
|---|---|
| Transport | **UDP** (pas de connexion préalable : économe en énergie) |
| Ports | **5683**, **5684** avec **DTLS** |
| En-tête | **4 octets** |
| Modèle | **REST** : ressources identifiées par des **URI** |
| Méthodes | **GET, POST, PUT, DELETE** |
| Types de messages | **CON** (confirmable), **NON** (non confirmable), **ACK**, **RST** (reset) |

**Attention** : GET/POST/PUT/DELETE sont des **méthodes** ; CON/NON/ACK/RST sont des **types de messages**. Ne pas les mélanger.

Un message **CON** doit être confirmé par un **ACK**, sinon il est **retransmis** : CoAP ajoute lui-même la fiabilité qu'UDP n'offre pas.

```text
 Client                                  Serveur (capteur)
   │── CON  GET /temperature ───────────►│
   │◄──────────── ACK 2.05 Content "27" ─│
```

**Observe** : le client s'abonne à une ressource et reçoit une **notification à chaque changement**. **Observe = 0** pour s'abonner, **Observe = 1** pour se désabonner.

**Sécurité** : CoAP est sur UDP, donc on utilise **DTLS** (équivalent de TLS pour UDP).

## 2.5.4 AMQP en détail

**AMQP** = *Advanced Message Queuing Protocol*, créé pour le **secteur bancaire** ; l'AMQP 1.0 est la norme **ISO/IEC 19464**.

| Élément | Valeur à retenir |
|---|---|
| Transport | **TCP** |
| Ports | **5672**, **5671** avec TLS |
| Sécurité | **TLS** et **SASL** |
| Trajet d'un message | **Producteur → Exchange → Queue → Consommateur** |

L'**exchange** lit la **clé de routage** et oriente le message vers les files :

| Type d'exchange | Comportement |
|---|---|
| **Direct** | vers **une** file précise (clé identique) |
| **Fanout** | **duplique vers toutes** les files liées (ex. alerte d'urgence) |
| **Topic** | tri par **mots-clés** avec jokers |

**Pourquoi pas pour de petits capteurs ?** Il est **plus lourd et complexe** (broker à administrer) : on l'utilise plutôt **côté serveur/entreprise**, là où **aucune perte de message** n'est tolérée (fiabilité, transactions, persistance).

## 2.5.5 HTTP pour l'IoT

- Ports **80** (HTTP) et **443** (HTTPS) ;
- **inconvénient majeur** : **en-têtes volumineux** et consommation élevée pour de très petites données ; le modèle requête/réponse convient mal aux flux continus ;
- **avantage** : universel, compatible avec les API et le web.

## 2.5.6 Tableau de synthèse des chiffres d'examen

| | **MQTT** | **CoAP** | **AMQP** | **HTTP(S)** |
|---|---|---|---|---|
| Modèle | pub/sub | requête/réponse REST | files d'attente | requête/réponse |
| Transport | TCP | **UDP** | TCP | TCP |
| Port clair | **1883** | **5683** | **5672** | **80** |
| Port sécurisé | **8883** (TLS) | **5684** (DTLS) | **5671** (TLS) | **443** (TLS) |
| En-tête | 2 octets | 4 octets | plus lourd | volumineux |
| Idéal pour | réseau instable, plusieurs abonnés | objet très contraint | **aucune perte tolérée** | applications web |

:::retenir Mnémotechnique des ports
**MQTT 1883 / 8883** (le 8 devant = TLS). **AMQP 5672 / 5671**. **CoAP 5683 / 5684**. **HTTP 80 / 443**.
:::

### Arbre de décision

1. L'objet est **très contraint** (peu de mémoire, batterie) ? → **CoAP** ;
2. Réseau **instable**, **plusieurs abonnés** à la même donnée ? → **MQTT** ;
3. **Aucun message ne doit se perdre** (côté serveur) ? → **AMQP** ;
4. Appareil puissant, intégration web/API ? → **HTTP/REST**.

Les protocoles sont **complémentaires** : une architecture courante est **CoAP ou MQTT côté capteurs** et **AMQP côté serveur**.

:::attention Aucun n'est sécurisé par défaut
MQTT, CoAP et AMQP ne chiffrent rien d'office. Il faut **activer TLS (MQTT, AMQP) ou DTLS (CoAP)** et l'**authentification**.
:::

## 2.5.7 Cas pratique : irrigation d'une exploitation agricole au Bénin

**Contexte** : exploitation près d'Abomey-Calavi, plusieurs parcelles, pas de réseau Wi-Fi au champ, objets sur batterie.

**Raisonnement**

- **Wi-Fi écarté** : pas de couverture au champ (et forte consommation) ;
- **LoRaWAN retenu** : portée et autonomie de la batterie ;
- **MQTT retenu** pour l'application : plusieurs abonnés (appli mobile, base de données, alertes), QoS 1 pour ne pas perdre une mesure.

**Chaîne retenue**

```text
Capteur d'humidité + ESP32 (LoRa) ─► Passerelle LoRaWAN ─► Serveur réseau ─► Broker MQTT (QoS 1)
                                                                              ├─► Base Oracle (historique)
                                                                              └─► Application mobile
```

**Décision locale (edge)** : l'ESP32 commande l'électrovanne **si l'humidité est inférieure à 30 %**, sans aller-retour vers le cloud : la réaction est immédiate, même sans réseau.

**Pourquoi une base Oracle en plus du broker ?** Le broker MQTT **ne garde pas les messages** : chaque message devient une ligne `INSERT`, ce qui conserve l'historique.

```sql
CREATE TABLE MESURES_IOT (
  id           NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  capteur_id   VARCHAR2(30) NOT NULL,
  humidite     NUMBER(5,2),
  date_mesure  TIMESTAMP DEFAULT SYSTIMESTAMP   -- pas « DATE » : mot réservé en Oracle
);
```

:::examen Questions fréquentes
- Quel protocole pour un objet très contraint ? pour un réseau instable avec plusieurs abonnés ? quand aucune perte n'est tolérée ?
- Donnez les ports de MQTT, CoAP, AMQP, HTTP (clairs et sécurisés).
- Expliquez les trois niveaux de QoS de MQTT avec un exemple chacun.
- Différence entre méthodes et types de messages CoAP.
- Pourquoi le broker MQTT ne remplace-t-il pas une base de données ?
:::
