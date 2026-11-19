Avant de chiffrer quoi que ce soit, il faut savoir **ce que l'on protège, contre quoi, et pourquoi**. La cryptographie n'est qu'un outil au service d'un objectif plus large : la **sécurité de l'information**. Ce chapitre pose le vocabulaire, les modèles de sécurité et les types de menaces sur lesquels s'appuie tout le reste du cours.

## 1.1.1 Pourquoi la sécurité devient un enjeu majeur

Il y a quelques années encore, sécuriser un système d'information était relativement simple : les employés étaient dans les locaux, les applications tournaient sur des serveurs dédiés d'un centre de données, le service informatique contrôlait les accès et le trafic réseau était prévisible (architecture client/serveur). Le **périmètre** était clair : on protégeait « l'intérieur » contre « l'extérieur ».

Ce modèle a volé en éclats :

- les employés se connectent avec des **appareils mobiles**, depuis n'importe où ;
- les applications sont **virtualisées** et passent d'un serveur ou d'un centre de données à l'autre ;
- les utilisateurs étendent le réseau de l'entreprise en utilisant le **cloud** (Dropbox, Google Docs...) ;
- les données ne sont plus cantonnées au centre de données : elles peuvent être sur un téléphone, une tablette, ou « dans le nuage » ;
- l'**IoT** ajoute en continu de nouveaux objets au réseau.

Parallèlement, les attaques ont changé de nature. Autrefois, un pirate envoyait deux millions de courriels exploitant une faille connue et comptait sur le fait qu'un certain pourcentage de destinataires tomberait dans le piège. Aujourd'hui, les attaques sont **ciblées et sophistiquées** : le pirate recueille des informations sur sa cible (ingénierie sociale), exploite la confiance de l'utilisateur et installe un logiciel malveillant ou vole des données. Ces attaques sont moins détectables et peuvent rester inaperçues longtemps.

Les besoins de sécurité augmentent aussi parce que le matériel est partout et abordable, les logiciels sont simples à prendre en main, et les entreprises, de plus en plus informatisées, ont besoin d'un réseau sécurisé, de données fiables et sont soumises à des **obligations réglementaires** (PSSIE, ISO 27001, Code du numérique).

## 1.1.2 Les niveaux de sécurité

La sécurité est présente à plusieurs niveaux, et aucun ne suffit seul :

| Niveau | Exemples de mesures |
|---|---|
| **Réseaux** | pare-feu, segmentation, VPN, IDS/IPS, chiffrement des flux |
| **Machines** | mises à jour, antivirus, durcissement, chiffrement du disque |
| **Applications** | code sûr, contrôle d'entrée, gestion des sessions, revue de code |
| **Données** | chiffrement, sauvegardes, contrôle d'accès, masquage |

Les techniques de protection évoluent, et **les techniques de contournement aussi**. La bonne nouvelle : l'étude des contournements se fait en même temps que celle des protections, et les failles découvertes sont publiées, ce qui permet de les corriger.

## 1.1.3 Vocabulaire de base

| Terme | Définition |
|---|---|
| **Sûreté** | protection contre les actions **non intentionnelles** (panne, bug, erreur) |
| **Sécurité** | protection contre les actions **intentionnelles malveillantes** |
| **Menace** | moyen potentiel par lequel un attaquant peut attaquer un système |
| **Vulnérabilité** | faiblesse exploitable (bug, mauvaise configuration, mot de passe faible) |
| **Risque** | combinaison de la **probabilité** d'une menace et de sa **gravité** si elle réussit |
| **Attaque** | exploitation effective d'une vulnérabilité par une menace |

:::retenir Sûreté ≠ sécurité
La **sûreté** protège contre le hasard (un disque qui tombe en panne), la **sécurité** contre la malveillance (quelqu'un qui détruit le disque exprès). Une question d'examen classique demande de distinguer les deux.
:::

## 1.1.4 Les types de menaces

On classe les menaces selon deux axes.

**Selon l'intention**

- Menaces **accidentelles** : aucune préméditation. Bugs logiciels, pannes matérielles, défaillances incontrôlables.
- Menaces **intentionnelles** : action d'un tiers qui veut s'introduire et relever des informations. C'est l'« attaque de système informatique », avec la notion d'attaquant : virus, chevaux de Troie, pirates.

**Selon l'effet sur le système**

- Menaces **passives** : l'intrus tente de dérober des informations en observant le système, **sans modifier** les fichiers ni les éléments du système (écoute du réseau, par exemple). Elles sont très difficiles à détecter.
- Menaces **actives** : l'attaque est détectée par ses **dégâts**, parfois trop tard. C'est la plus dangereuse.

**Les quatre catégories de menaces actives**

| Catégorie | Principe | Propriété de sécurité touchée |
|---|---|---|
| **Interruption** | la ressource est détruite ou rendue indisponible | **disponibilité** |
| **Interception** | un tiers accède à l'information | **confidentialité** |
| **Modification** | un tiers altère l'information | **intégrité** (et authenticité) |
| **Fabrication** | un tiers injecte de faux éléments | **authenticité** |

:::attention Passif ou actif ?
Une écoute passive (sniffer le Wi-Fi) ne modifie rien : elle est invisible. Une modification de message en transit est active. Pour se protéger du passif, on **chiffre** ; pour détecter l'actif, on utilise **hachage, MAC et signatures**.
:::

## 1.1.5 Le triangle CIA

La sécurité de l'information consiste à empêcher l'accès, l'utilisation, la divulgation, la perturbation, la modification, l'inspection, l'enregistrement ou la destruction **non autorisés** de l'information. Elle s'articule autour de trois objectifs, introduits en 1987 : **CIA**.

- **Confidentialité** (*Confidentiality*) : l'information n'est connue que des entités autorisées. L'attaquant peut capturer les données ; la parade principale est le **chiffrement** (AES, par exemple). Le Code du numérique béninois la définit comme l'état de sécurité garantissant le secret des informations stockées, traitées ou transférées, afin de prévenir leur divulgation non autorisée.
- **Intégrité** (*Integrity*) : l'information n'a pas été modifiée entre sa création, son traitement et son transfert. On la vérifie avec une **fonction de hachage** (MD5, SHA), un MAC ou une signature.
- **Disponibilité** (*Availability*) : l'information est toujours accessible et ne peut être ni perdue ni bloquée. Parades : redondance, sauvegardes, protection contre le DoS.

La plupart des autres modèles reposent sur cette base.

## 1.1.6 Le contrôle d'accès : le protocole AAA

Le contrôle d'accès se fait en quatre étapes :

1. **Identification** : qui êtes-vous ? (un identifiant, un nom d'utilisateur)
2. **Authentification** : prouvez-le ! (mot de passe, code PIN, carte, empreinte digitale, rétine...)
3. **Autorisation** : avez-vous les droits requis ?
4. **Accounting / audit** : qu'avez-vous fait ? (journalisation)

On parle d'**AAA** (*Authentication, Authorization, Accounting*) parce que les deux premières étapes sont souvent fusionnées. On parle d'*accounting* quand on doit comptabiliser des faits précis, et d'*audit* lorsqu'il faut étudier des résultats plus globaux.

Les facteurs d'authentification se classent en : **ce que je sais** (mot de passe), **ce que je possède** (carte, téléphone), **ce que je suis** (biométrie). Combiner au moins deux facteurs donne l'**authentification multifacteur** (MFA).

## 1.1.7 Les autres modèles de sécurité

**Le pentagone de confiance** (Piscitello, 2006) précise la notion d'accès et la confiance qu'un utilisateur peut avoir en un système : authentification, autorisation, disponibilité, **admissibilité** (la machine à laquelle je me connecte est-elle fiable ?) et intégrité/authenticité.

**L'hexade de Parker** (*Parkerian Hexad*, Donn Parker, 1998) ajoute à la confidentialité, l'intégrité et la disponibilité : l'**authenticité**, la **possession/contrôle** et l'**utilité**. Exemple d'utilité : une information chiffrée dont on a perdu la clé reste confidentielle, disponible et intègre... mais **n'est plus utile**.

**Le cube de McCumber** (1991) ajoute deux dimensions au triangle CIA :

- l'**état des données** : stockage, transmission, traitement (exécution) ;
- les **méthodes** : technologies, politiques/procédures, formation/sensibilisation.

## 1.1.8 Sécurité en parallèle et sécurité en série

- **Sécurité en parallèle** : plusieurs mécanismes ont **le même rôle** (déverrouiller un portable par mot de passe *ou* par empreinte). Le niveau de protection est celui du **mécanisme le plus faible**, car l'attaquant choisit la porte la plus facile.
- **Sécurité en série** (ou **défense en profondeur**) : plusieurs mécanismes ont **des rôles différents** et s'enchaînent (pare-feu matériel, pare-feu logiciel sur chaque machine, mots de passe sur les logiciels). L'attaquant doit tous les franchir.

:::retenir Le maillon le plus faible
Le niveau de sécurité d'un système est celui de son **maillon le plus faible**. Et la sécurité à 100 % n'existe pas : sécuriser, c'est prendre en compte tout le périmètre de l'actif informationnel (logiciel, matériel, ressources humaines, procédures, politiques).
:::

## 1.1.9 Le rôle de la cryptographie

La cryptographie est l'**outil fondamental** de la sécurité informatique. Sa mise en œuvre permet :

- la **confidentialité** des données transmises ou stockées (chiffrement) ;
- le contrôle de l'**intégrité** des données (hachage, MAC) ;
- l'**authentification** d'une entité lors des transactions ; avec les signatures, la **non-répudiation**.

Mais elle ne résout pas tout : les failles des cryptosystèmes concernent le plus souvent **la sécurité de la clé**. Avec un système symétrique, c'est la clé secrète partagée qui pose souci (comment l'échanger ? comment la stocker ?). Avec un système asymétrique, la clé privée est mieux protégée par construction, mais reste un point sensible (vol, perte, fausse clé publique). **La clé est le souci majeur de tous les systèmes cryptographiques.**

:::examen Questions fréquentes de ce chapitre
- Définissez confidentialité, intégrité, disponibilité et donnez un mécanisme pour chacune.
- Distinguez menace passive et menace active ; citez les 4 catégories de menaces actives.
- Que signifie AAA ? Détaillez les étapes.
- Quelle différence entre sécurité en série et en parallèle ? Donnez un exemple de chaque.
- Pourquoi dit-on que la sécurité 100 % n'existe pas ?
:::
