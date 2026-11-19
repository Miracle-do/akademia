Ce chapitre rassemble les **attaques courantes** contre les réseaux et systèmes d'information, et les **parades** associées.

## 9.4.1 Déni de service : DoS et DDoS

Un **DoS** (*Denial of Service*) rend un service **indisponible** en le saturant. Un **DDoS** (*distributed*) utilise **des milliers de machines** (un **botnet**) : plus puissant, plus dur à bloquer.

| Type | Exemple |
|---|---|
| **Volumétrique** | inonder la bande passante (UDP flood, amplification DNS/NTP) |
| **Protocolaire** | **SYN flood** : demandes de connexion TCP jamais terminées |
| **Applicatif** | requêtes HTTP lourdes en masse |

Cible la propriété **disponibilité** (le « A » de la triade CIA). **Parades** : filtrage et limitation de débit, **SYN cookies**, répartition de charge, **CDN / anti-DDoS**, surdimensionnement, plan de réponse.

## 9.4.2 Homme du milieu (MITM) et ARP spoofing

Dans une attaque **MITM**, Mallory s'interpose entre Alice et Bob, **lit et modifie** les échanges.

**ARP spoofing** (réseau local) : ARP n'est pas authentifié ; l'attaquant envoie de **fausses réponses ARP** associant **son adresse MAC à l'IP de la passerelle**. Le trafic des victimes passe par lui.

**Parades** : **TLS/HTTPS** avec validation des certificats, HSTS, VPN, **ARP statique**, **Dynamic ARP Inspection** sur les commutateurs, **802.1X**, authentification mutuelle, vigilance sur les alertes de certificat.

## 9.4.3 Logiciels malveillants

**Virus** : programme qui **se réplique en s'attachant à un hôte**. Ses phases : **dormante** (inactif, discret), **propagation** (se copie), **déclenchement** (condition remplie : date, événement), **action** (charge utile : destruction, vol...).

Autres : **ver** (se propage seul par le réseau), **cheval de Troie**, **ransomware**, **spyware**, **botnet**, **rootkit**.

**Ransomware** : **chiffre** les fichiers de la victime (souvent avec AES + RSA : crypto hybride utilisée à des fins malveillantes) et demande une **rançon**. **Parades** : **sauvegardes hors ligne testées** (la meilleure défense), correctifs, filtrage des courriels, moindre privilège, segmentation. Payer ne garantit pas la récupération.

## 9.4.4 Ingénierie sociale et hameçonnage

L'humain est le **maillon le plus faible**. **Hameçonnage** (*phishing*) : faux courriel, faux site pour voler identifiants. **Variantes** : *spear phishing* (ciblé), *smishing* (SMS), *vishing* (voix), arnaque au président. **Parades** : formation, **MFA** (même si le mot de passe fuit), vérification par un second canal, filtrage anti-phishing.

## 9.4.5 Injection SQL (SQLi)

L'application construit une requête en **concaténant** une saisie utilisateur ; l'attaquant y glisse du SQL.

```sql
-- Code vulnérable (concaténation)
SELECT * FROM users WHERE login = '$l' AND mdp = '$p';
-- Saisie : login = admin' --    ⇒ le reste de la requête est commenté
SELECT * FROM users WHERE login = 'admin' --' AND mdp = '';
```

**Détection manuelle** : saisir une apostrophe `'` dans les champs et URL (erreur SQL = signal), `' OR '1'='1`, `1 AND 1=1` contre `1 AND 1=2`, observer messages d'erreur et différences de comportement. (**Uniquement sur vos propres systèmes ou avec autorisation écrite.**)

**Parades** : **requêtes paramétrées / préparées**, ORM, validation des entrées, **moindre privilège** du compte SQL, pas de messages d'erreur détaillés, WAF en complément.

## 9.4.6 XSS (Cross-Site Scripting)

L'attaquant injecte du **script** (JavaScript) dans une page vue par d'autres utilisateurs, qui s'exécute **dans leur navigateur** : vol de cookies de session, redirection, défiguration.

| Type | Principe |
|---|---|
| **Réfléchi** | le script est dans l'URL/formulaire, renvoyé dans la réponse |
| **Stocké** | enregistré (commentaire, profil) et servi à tous |
| **DOM** | exécuté côté client par le JavaScript de la page |

**Détection manuelle** : saisir `<script>alert(1)</script>` ou `"><img src=x onerror=alert(1)>` dans les champs et vérifier s'il s'exécute ou s'il est affiché tel quel. **Parades** : **échapper/encoder** toute sortie, **Content-Security-Policy**, cookies `HttpOnly` et `Secure`, validation côté serveur.

## 9.4.7 Scan de ports avec nmap (reconnaissance)

```bash
nmap -sT 192.168.1.10          # scan TCP connect : connexion complète (visible dans les journaux)
sudo nmap -sS 192.168.1.10     # scan SYN (« furtif ») : ne finalise pas la connexion
nmap -sV -p 1-1000 hôte        # versions des services
```

| Option | Principe | Particularité |
|---|---|---|
| `-sT` | connexion TCP complète (3 temps) | sans privilèges, bruyant |
| `-sS` | envoie SYN, lit SYN/ACK, **envoie RST** | root requis, plus discret |

États d'un port : **open**, **closed**, **filtered**. Ne scannez que **vos réseaux** ou avec autorisation : un scan non autorisé peut être illégal.

## 9.4.8 Stratégie de protection des données : 5 fonctions

Le support ne détaille pas une stratégie en cinq étapes ; nous retenons le cadre **NIST Cybersecurity Framework** :

1. **Identifier** : inventaire des actifs et données, risques ;
2. **Protéger** : chiffrement, contrôle d'accès, MFA, formation, sauvegardes ;
3. **Détecter** : journalisation, supervision, IDS/IPS ;
4. **Répondre** : plan de réponse aux incidents, communication, notification à l'**APDP** en cas de violation de données personnelles ;
5. **Récupérer** : restauration, retour d'expérience.

:::attention Vérifier avec votre enseignant
Si l'énoncé de l'examen attend une autre liste en cinq étapes, privilégiez celle du cours de votre enseignant.
:::

:::retenir
**DoS → disponibilité ; MITM → confidentialité/intégrité (TLS) ; SQLi/XSS → validation des entrées ; ransomware → sauvegardes ; phishing → MFA + formation.**
:::

:::examen Questions fréquentes
- Qu'est-ce qu'un DDoS ? Citez des parades.
- Expliquez l'ARP spoofing et les contre-mesures.
- Phases d'un virus. Comment fonctionne un ransomware ?
- Comment détecter manuellement une injection SQL / une faille XSS ?
- Différence nmap -sT / -sS.
:::
