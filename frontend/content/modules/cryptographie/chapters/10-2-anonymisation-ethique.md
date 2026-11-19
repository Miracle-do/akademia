## 10.2.1 Pseudonymisation et anonymisation

| | **Pseudonymisation** | **Anonymisation** |
|---|---|---|
| Principe | remplacer l'identifiant par un pseudonyme ; **table de correspondance** conservée à part | rendre la réidentification **impossible** |
| Réversible ? | **oui** (avec l'information supplémentaire) | **non** |
| Données personnelles ? | **oui**, la loi s'applique | **non**, hors du champ de la loi |

Chiffrer ou hacher un identifiant est de la **pseudonymisation**, non de l'anonymisation.

## 10.2.2 Techniques d'anonymisation

- **Ajout de bruit** : modifier légèrement les valeurs (âge ± 2, poids ± 1 kg) ; protège l'individu, préserve les statistiques ; base de la **confidentialité différentielle**.
- **Permutation** : mélanger les valeurs d'un attribut entre individus (le revenu n'est plus associé à la bonne personne) ; distribution globale conservée.
- **Généralisation** : âge exact → tranche (30-39), ville → région.
- **k-anonymat** : chaque combinaison d'attributs quasi-identifiants (âge, code postal, sexe) apparaît pour **au moins k personnes**. Avec k = 5, impossible de distinguer un individu parmi 5 minimum. Limite : si les 5 ont la même maladie, on la déduit (d'où **l-diversité**).
- **Agrégation / suppression** des attributs rares.

## 10.2.3 Les trois critères du CEPD pour juger l'anonymat

Une anonymisation est valable si l'on ne peut **pas** :

1. **Individualiser** : isoler un individu dans le jeu de données ;
2. **Corréler** : relier des données concernant la même personne dans plusieurs jeux ;
3. **Inférer** : déduire avec une probabilité significative une information sur une personne.

## 10.2.4 Éthique et cadre légal

- **Principes** : licéité, finalité déterminée, **minimisation** (collecter le strict nécessaire), exactitude, limitation de conservation, sécurité, transparence, droits des personnes (accès, rectification, opposition, effacement).
- **Bénin** : le **Code du numérique** (loi 2017-20, Livre V sur la protection des données à caractère personnel) et l'**APDP** (Autorité de protection des données personnelles) encadrent les traitements ; déclaration ou autorisation selon les cas, notification des violations.
- **Éthique de l'ingénieur** : *privacy by design*, ne pas utiliser ses compétences pour nuire, divulgation responsable des vulnérabilités, respect du secret professionnel, consentement.
- **Cryptographie et société** : chiffrement fort vs besoins d'enquête (portes dérobées), surveillance de masse, liberté d'expression.

:::retenir
**Pseudonymiser ≠ anonymiser. Anonymat valable = ni individualisation, ni corrélation, ni inférence.**
:::

:::examen Questions fréquentes
- Définissez anonymisation et pseudonymisation. Techniques : bruit, permutation, k-anonymat.
- Quels critères valident une anonymisation ?
:::
