## 2.1.1 Le modèle relationnel

Proposé par **E. F. Codd en 1970**. Une **relation** est un tableau à deux dimensions :

- ses **colonnes** sont les **attributs** (le schéma de la relation) ;
- ses **lignes** sont les **n-uplets** (ou tuples, occurrences).

Notation : `ETUDIANT(Matricule, Nom, Prénom, #CodFil)`.

| Notion | Définition |
|---|---|
| **Clé candidate** | ensemble minimal d'attributs identifiant un n-uplet |
| **Clé primaire** | la clé candidate retenue ; **soulignée**, jamais nulle |
| **Clé étrangère** | attribut qui est clé primaire d'une autre relation ; précédée de **#** |
| **Domaine** | l'ensemble des valeurs permises pour un attribut |

## 2.1.2 Contraintes d'intégrité

- **Contrainte de domaine** : le type et les valeurs permises (`Sexe` ∈ {M, F}).
- **Intégrité d'entité** : la clé primaire est **unique et non nulle**.
- **Intégrité référentielle** : toute valeur d'une clé étrangère doit exister dans la clé primaire référencée (ou être NULL si l'association est facultative).

## 2.1.3 Passage du MCD au MLDR : les règles

:::retenir Les quatre règles de base
1. **Toute entité** devient une **relation** ; son identifiant devient la clé primaire.
2. Une association **CIF** ne devient pas une relation : l'**identifiant du côté 0,N/1,N migre** comme **clé étrangère** vers la relation du côté (1,1) ou (0,1).
3. Une association **CIM** devient une **relation** dont la clé primaire est la **concaténation** des identifiants des entités reliées ; ses attributs viennent avec.
4. Les attributs d'une association CIF migrent aussi vers la relation qui reçoit la clé étrangère.
:::

:::exemple Client — Commande — Produit
CLIENT (1,1) ← passer → (0,N) COMMANDE est une CIF :
- CLIENT(**numCli**, nom)
- COMMANDE(**numCom**, dateCom, #numCli)

COMMANDE (0,N) — contenir — (1,N) PRODUIT est une CIM :
- PRODUIT(**numPro**, libellé, prix)
- CONTENIR(**#numCom, #numPro**, quantité)
:::

## 2.1.4 Cas particuliers

- **Association (0,1)** : la clé étrangère est **facultative** (peut être NULL) ; on l'écrit comme pour une (1,1) mais la colonne n'est pas `NOT NULL`.
- **Association réflexive CIF** : clé étrangère vers la même table, **renommée** : `ETUDIANT(**numEtu**, nom, #numParrain)`.
- **Association réflexive CIM** : relation à clé concaténée avec deux attributs **renommés** : `INCOMPATIBLE(**#numMed1, #numMed2**)`.
- **Association ternaire** : relation avec trois identifiants concaténés.
- **Entité faible** : la clé primaire contient l'identifiant de l'entité forte : `CHAMBRE(**#numHotel, numChambre**, nbLits)`.

## 2.1.5 Traduire une généralisation

Trois méthodes pour CLIENT / PARTICULIER / ENTREPRISE :

| Méthode | Principe | Avantage | Inconvénient |
|---|---|---|---|
| **Ascendante** | une seule table CLIENT avec tous les attributs et un attribut `type` | simple, une seule jointure | beaucoup de valeurs NULL |
| **Descendante** | une table par sous-entité, le sur-type disparaît | pas de NULL | l'entité mère est dispersée |
| **Par distinction** | une table mère + une table par sous-entité (clé = clé de la mère) | modèle fidèle | plus de jointures |

## 2.1.6 Exemple corrigé (sujet 2025-2026)

Soit le MCD : CLIENT (1,N) — Passer — (1,1) COMMANDES ; COMMANDES (1,N) — Posséder — (1,1) ÉCHÉANCE (entité faible, cardinalité entre parenthèses) ; ÉCHÉANCE (0,N) — Régler — REGLEMENT, avec l'attribut `Montant_réglé` et une CIF vers MODE_REGLEMENT.

Réponses :

- `Passer` est une **CIF** : pas de relation ; `COMMANDES(ID_Commande, DateCom, Montant, #Id_client)`.
- `ECHEANCE(Num_Echeance, ID_Commande, Date_echeance, Montant_Echeance)` : identifiant relatif, la clé primaire est le **couple** `(Num_Echeance, ID_Commande)`, et `ID_Commande` est aussi clé étrangère.
- `Régler` est une **CIM** entre ECHEANCE et REGLEMENT : `REGLER(#Num_Echeance, #Date_Reglement, #Id_Mode, Montant_réglé)` avec pour **clé primaire** `(Num_Echeance, Date_Reglement)` seulement.
- La **CIF** entre `Régler` et `MODE_REGLEMENT` (cardinalité 1,1) fait migrer `Id_Mode` dans REGLER **comme clé étrangère simple, hors de la clé primaire**.
- `MODE_REGLEMENT(Id_Mode, Libellé_Mode)` : le montant réglé et les clés de l'échéance n'y figurent **pas** ; aucune des réponses proposées ne convenait.
- `REGLEMENT(Date_Reglement)` : une table réduite à sa clé.

:::attention Clé d'une CIM et CIF sortante
La clé primaire d'une CIM est la concaténation des identifiants des entités **qu'elle relie**. Une CIF qui part de l'association vers une troisième entité ajoute seulement une **clé étrangère**, pas un élément de clé.
:::
