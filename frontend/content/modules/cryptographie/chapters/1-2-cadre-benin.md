La cryptographie n'est pas qu'une affaire technique : elle est **encadrée par la loi**. Ce chapitre présente le cadre réglementaire béninois, régulièrement demandé à l'examen (qui s'occupe de la cryptologie au Bénin ? quel texte impose la signature électronique ?).

## 1.2.1 Les textes de référence

Face à l'évolution des menaces, le Bénin a institutionnalisé la sécurité numérique à travers trois textes majeurs.

| Texte | Contenu principal |
|---|---|
| **Loi n° 2017-20 du 20 avril 2018 portant Code du numérique** en République du Bénin | cadre général : communications électroniques, services de confiance, signature électronique, protection des données (Livre V), cybercriminalité |
| **Décret n° 2021-550 du 27 octobre 2021** | approuve les règles de la **PSSIE** (Politique de Sécurité des Systèmes d'Information de l'État), en cohérence avec les normes **ISO 2700x** |
| **Décret n° 2023-060 du 22 février 2023** | règles de la **PPIIC** (Politique de Protection des Infrastructures d'Information Critiques) |

:::retenir À mémoriser
- **Code du numérique** : loi **2017-20** (20 avril 2018).
- **PSSIE** : décret **2021-550** (27 octobre 2021).
- **PPIIC** : décret **2023-060** (22 février 2023).
:::

## 1.2.2 La cryptologie au Bénin : l'ANSSI et la Commission Cryptologie

Le Code du numérique crée, au sein de l'**ANSSI-Bénin** (Agence Nationale de la Sécurité des Systèmes d'Information), une **Commission Cryptologie**. Elle est **en charge de la cryptologie au Bénin** (article 1er, définitions du Code).

:::examen « Quelle organisation est chargée de la cryptologie au Bénin ? »
Réponse type : *la **Commission Cryptologie**, créée par le Code du numérique au sein de l'**ANSSI-Bénin** (Agence Nationale de la Sécurité des Systèmes d'Information).* C'est une question du sujet de rattrapage 2022-2023.
:::

## 1.2.3 Signature électronique et services de confiance

Le Code du numérique reconnaît le **recours à la signature électronique** (article 84) et encadre les **services de confiance**. Il définit notamment :

- **Signature électronique** : données électroniques qui permettent d'identifier le signataire et de garantir l'intégrité de ce qu'il signe.
- **Cachet électronique** : données électroniques jointes ou associées logiquement à d'autres données pour garantir leur **origine** et leur **intégrité** (c'est l'équivalent, pour une **personne morale**, de la signature d'une personne physique). Il existe un **cachet électronique avancé** puis un **cachet électronique qualifié** (créé avec un dispositif qualifié et reposant sur un certificat qualifié).
- **Certificat de signature électronique** : attestation électronique qui associe les données de validation d'une signature à une **personne physique** et confirme au moins son nom ou son pseudonyme.
- **Certificat de cachet électronique** : même chose, pour une **personne morale**.
- **Certificat d'authentification de site Internet** : attestation permettant d'authentifier un site et l'associant à la personne physique ou morale titulaire du certificat.
- **Horodatage électronique** : données qui associent d'autres données à un **instant particulier** et prouvent que celles-ci existaient à cet instant.
- **Prestataire de services de confiance (PSCo)** : personne physique ou morale qui fournit un ou plusieurs services de confiance ; il est dit **qualifié** s'il a obtenu le statut qualifié.
- **Autorité compétente** et **organe de contrôle** : supervisent et contrôlent les prestataires.
- **Autorité de régulation** : ARCEP, chargée de réguler les communications électroniques et la poste.

Le mot **« qualifié »** signifie toujours : délivré par un prestataire qualifié et respectant des exigences fixées par la loi ou la réglementation. Un certificat qualifié offre une présomption de fiabilité plus forte.

:::attention Ne pas confondre
**Signature** (personne physique) et **cachet** (personne morale). Les deux assurent intégrité et origine ; seule la signature engage une personne physique.
:::

## 1.2.4 Données personnelles et APDP

Les individus ont un droit à la protection de leurs données personnelles, fondé sur le **Livre V du Code du numérique**. L'autorité chargée de le faire respecter est l'**APDP** (Autorité de Protection des Données Personnelles).

- **Rôle** : veiller à ce que les traitements de données personnelles respectent la loi ; informer et conseiller ; recevoir les déclarations et plaintes ; contrôler et, le cas échéant, sanctionner.
- **Président** : à la date des sources consultées en 2026, **Me Luciano Hounkponou**. Un nom de dirigeant peut changer : la question « nom du président » figure au sujet de rattrapage, mais **vérifiez sur le site officiel de l'APDP** avant l'examen.

Principes usuels : **finalité** déterminée, **proportionnalité** (collecter le minimum), **durée de conservation** limitée, **sécurité** des données, **droits des personnes** (accès, rectification, opposition, effacement). L'intégrité est qualifiée d'« exigence chère » au Code du numérique : elle comporte quatre éléments, **intégralité, précision, exactitude, validité**.

## 1.2.5 Infrastructures critiques

Le Code définit une **infrastructure sensible ou critique** comme un point, un système ou une partie de celui-ci, situé sur le territoire béninois, **indispensable au maintien des fonctions vitales** de la société, de la santé, de la sûreté, de la sécurité et du bien-être économique ou social (centrales électriques, réseaux de transport, réseaux publics...) et dont l'arrêt ou la destruction aurait un impact significatif. La **PPIIC** fixe les règles pour les protéger.

Une **mesure de sécurité**, toujours selon le Code, est toute utilisation de procédures, dispositifs ou programmes informatiques spécialisés qui limitent ou interdisent l'accès à un système informatique pour certaines catégories d'utilisateurs.

## 1.2.6 Pourquoi ce cadre compte pour un ingénieur

- Une entreprise béninoise a l'**obligation** de protéger ses logiciels contre la piraterie et de sécuriser le traitement de ses données.
- Une signature électronique n'a de **valeur légale** que si elle respecte le cadre (niveau avancé ou qualifié).
- Les **banques** et le commerce électronique exigent des transactions sécurisées ; les **individus** exigent la protection de leurs données.
- La conformité PSSIE s'appuie sur ISO 27001 : audits, politiques, analyse de risques.

:::examen Questions fréquentes de ce chapitre
- Citez le texte qui institue la signature électronique et celui qui approuve la PSSIE (avec date).
- Quel est le rôle de la Commission Cryptologie ?
- Qu'est-ce que l'APDP ? Quel est son rôle ?
- Distinguez signature électronique, cachet électronique et horodatage.
:::
