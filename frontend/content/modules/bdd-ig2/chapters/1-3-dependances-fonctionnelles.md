## 1.3.1 Dictionnaire des données

Première étape de toute étude : **recenser les attributs** dans un **dictionnaire des données**.

| Colonne | Contenu |
|---|---|
| **Code** | nom court de l'attribut (`NumCli`) |
| **Désignation** | sens en clair (« Numéro du client ») |
| **Nature** | **E** élémentaire, **Co** concaténé, **Ca** calculé |
| **Type** | **N** numérique, **C** caractère (alphanumérique), **L** logique, **D** date |
| **Taille** | nombre de caractères ou de chiffres |

Un attribut **calculé** (montant = quantité × prix) **ne figure pas** dans le MCD : on peut le recalculer. Un attribut **concaténé** (code produit = catégorie + série) se décompose en éléments atomiques.

## 1.3.2 Dépendance fonctionnelle (DF)

Il y a une **dépendance fonctionnelle** de A vers B, notée **A → B**, si à **une valeur de A correspond une seule valeur de B**.

:::exemple
`NumCli → NomCli` : un numéro de client donne un seul nom.
`NomCli → NumCli` est **fausse** : deux clients peuvent s'appeler « Koffi ».
:::

Propriétés (axiomes d'Armstrong) :

- **Réflexivité** : si B est inclus dans A, alors A → B ;
- **Augmentation** : si A → B alors A,C → B ;
- **Addition (union)** : si A → B et A → C alors A → B,C ;
- **Transitivité** : si A → B et B → C alors A → C.

## 1.3.3 DF élémentaire et DF élémentaire directe

- Une DF est **élémentaire** si la source est **minimale** : on ne peut retirer aucun attribut sans perdre la dépendance (`NumCom, NumPro → Quantité` est élémentaire ; `NumCom, NumPro → DateCom` ne l'est pas, car `NumCom → DateCom` suffit).
- Une DF est **directe** (DFED = DF Élémentaire Directe) si elle **n'est pas déductible par transitivité** d'autres DF.

:::retenir Test de la DFED
Pour A → C : existe-t-il un B tel que A → B et B → C ? Si oui, A → C est **transitive** donc à **éliminer** ; sinon c'est une DFED à garder.
:::

## 1.3.4 Couverture minimale

La **couverture minimale** est l'ensemble des DFED qui permet de retrouver **toutes** les autres, sans redondance. On la dresse en trois catégories :

1. **Identifiant simple** → attributs qu'il détermine (`NumCli → NomCli, AdrCli`) ;
2. **Identifiant composé** → attributs qui dépendent de **tout** le groupe (`NumCom, NumPro → Quantité`) ;
3. **Identifiant → identifiant** : liens entre entités (`NumCom → NumCli`), qui donneront les associations CIF.

## 1.3.5 De la couverture au MCD

- Chaque **identifiant simple** et ses dépendants forment une **entité**.
- Une DF **identifiant → identifiant** donne une **association** (cardinalité 1,1 côté source, 0,N ou 1,N côté cible).
- Une DF dont la source est **composée** donne une association **ternaire ou plurielle (CIM)** portant l'attribut.

:::examen Méthode éprouvée
1. Lister les attributs. 2. Barrer les calculés et décomposer les concaténés. 3. Écrire les DF élémentaires directes. 4. Regrouper par source : entités et associations. 5. Placer les cardinalités à partir des règles de gestion. 6. Vérifier que chaque attribut apparaît une seule fois.
:::

## 1.3.6 Exemple complet : location de véhicules (sujet 2025-2026)

Règles : un contrat est signé par **un** client à **une** date ; tous les véhicules d'un contrat ont **les mêmes dates** de début et de fin ; pour chaque véhicule du contrat on enregistre le **kilométrage** de départ et d'arrivée ; on peut louer avec ou sans chauffeur.

DFED :

- `NumLoc → DateLoc, NumCli, DateDeb, DatFin`
- `NumCli → NomCli`
- `NumVeh → CodMarq, Capacité`
- `CodMarq → LibMarq`
- `NumLoc, NumVeh → KmDeb, KmFin, NumChauf`
- `NumChauf → NomChauf`

La dépendance `NumLoc, NumVeh → KmDeb, KmFin` est la bonne : le kilométrage dépend du **couple** contrat-véhicule, pas du contrat seul, ni du véhicule seul.

:::attention Erreur fréquente
Écrire `NumLoc → KmDeb` est faux : un contrat peut concerner plusieurs véhicules, donc plusieurs kilométrages. Écrire `NumVeh → KmDeb` l'est aussi : un véhicule est loué plusieurs fois.
:::
