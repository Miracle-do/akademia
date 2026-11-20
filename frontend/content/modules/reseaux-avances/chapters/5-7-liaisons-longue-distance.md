Le Wi-Fi n'est pas réservé aux salles de classe : avec des **antennes directives**, on relie deux sites distants de **plusieurs kilomètres**. C'est une solution classique pour interconnecter des bâtiments, des campus ou des villages. Ce chapitre apprend à **calculer** qu'une liaison fonctionnera avant de monter sur le mât.

## 5.7.1 Topologies

- **PtP** (point à point) : deux antennes directives face à face ; usage : interconnexion de deux sites ;
- **PtMP** (point à multipoint) : une station de base (antenne sectorielle) dessert plusieurs clients ; usage : fournisseurs d'accès (BLR), zones rurales ;
- **Relais** : site intermédiaire quand la ligne de vue est bloquée.

Contrainte majeure : la **ligne de vue** (LOS) dégagée, avec **zone de Fresnel** libre.

## 5.7.2 Antennes, câbles, connecteurs

| Type | Gain | Usage |
|---|---|---|
| Omnidirectionnelle | 2 à 12 dBi | couverture 360° |
| Sectorielle | 12 à 18 dBi | PtMP (60 à 120°) |
| Directive (Yagi, panneau, parabole) | **15 à 30 dBi** | PtP |

- **Polarisation** (verticale/horizontale) : doit être **identique** aux deux extrémités ;
- **Connecteurs** : N (extérieur), SMA, **RP-SMA** (pièges : inversé), TNC ;
- **Câble** : l'atténuation augmente avec la fréquence ; ex. **LMR-400 ≈ 0,22 dB/m à 5 GHz** ⇒ garder les câbles **courts** (radio près de l'antenne) ;
- **Parafoudre** (*lightning arrestor*) et **mise à la terre** : indispensables sur un mât.

## 5.7.3 Perte en espace libre (FSPL)

> **FSPL (dB) = 20 log₁₀ d(km) + 20 log₁₀ f(MHz) + 32,45**

Exemples calculés :

| Cas | FSPL |
|---|---|
| 2,4 GHz, 1 km | **100,05 dB** |
| 5 GHz, 100 m | **86,43 dB** |
| 5 GHz, 10 km | **126,43 dB** |
| 5,8 GHz, 5 km | **121,70 dB** |
| 5,8 GHz, 15 km | **131,24 dB** |

:::retenir Règle des 6 dB
**Doubler la distance** ou **doubler la fréquence** ajoute **+6,02 dB** de perte. Passer de 10 à 20 km coûte 6 dB de marge.
:::

## 5.7.4 Le bilan de liaison

> **Pr = P_Tx − L_câble_Tx + G_Tx − FSPL + G_Rx − L_câble_Rx**
> **Marge = Pr − Sensibilité du récepteur**

La **marge** doit être d'au moins **10 à 15 dB** pour absorber pluie, désalignements, interférences, vieillissement.

**Exemple du cours** : 5 GHz, 10 km. FSPL = 126,4 dB ; PIRE = 46 dBm ; Pr = **−57,4 dBm** ; sensibilité = −75 dBm ⇒ marge = **+17,6 dB** : la liaison est viable.

**Exemple 15 km à 5,8 GHz** : Tx 24 dBm (≈ 251 mW), câbles 1 dB + 1 dB, antennes 27 dBi chacune, FSPL = 131,24 dB.

> Pr = 24 − 1 + 27 − 131,24 + 27 − 1 = **−55,24 dBm**
> Marge = −55,24 − (−78) = **22,76 dB** ✓

## 5.7.5 La zone de Fresnel

Autour de la ligne droite, les ondes qui contournent un obstacle peuvent **se retrancher** au récepteur. La **1ʳᵉ zone de Fresnel** est un ellipsoïde dont le rayon au milieu est :

> **r (m) = 17,32 × √( d(km) / (4 × f(GHz)) )**

- 5 GHz, 10 km : r ≈ **12,2 m** ;
- 5,8 GHz, 15 km : r ≈ **13,9 m** (60 % = **8,4 m**).

**Règle** : au moins **60 %** du rayon doit être dégagé ; ne pas oublier la **courbure terrestre** et la **végétation** (qui pousse !). Les antennes se montent donc sur un mât, un château d'eau, un toit élevé.

## 5.7.6 Le pointage d'antenne

1. **Pré-pointage** par calcul : **azimut** (cap vers l'autre site, corrigé de la **déclinaison magnétique**) et **élévation** ;
2. **pointage fin** : mouvements lents en observant le **RSSI / SNR** sur l'interface radio, un opérateur à chaque bout (téléphone ou talkie) ;
3. **attention aux lobes secondaires** : on peut maximiser le signal sur un lobe secondaire, plus faible que le lobe principal. Vérifier en balayant légèrement au-delà ;
4. verrouiller mécaniquement, mesurer, relever les valeurs de référence.

Exemple (coordonnées fictives) : A (6,40 N ; 2,30 E) → B (6,40 N ; 2,40 E) : distance ≈ **11,05 km**, azimut ≈ **90°**. Avec A à 20 m et B à 60 m d'altitude, l'**élévation** est de **0,2°** : très faible, d'où l'importance d'un pointage précis.

## 5.7.7 Étude par logiciel : Radio Mobile

**Radio Mobile** (gratuit) utilise le modèle **Longley-Rice (ITM)** et des cartes d'altitude **SRTM** pour prédire une liaison :

1. importer la carte d'altitudes ;
2. définir les sites (coordonnées, hauteur d'antenne) ;
3. définir le réseau : fréquence, puissance, gains, pertes, sensibilité ;
4. tracer le **profil du terrain** et lire : obstacles, **dégagement de Fresnel**, **marge**, niveau reçu.

Un résultat « OK » en simulation ne remplace pas une **visite de site**.

## 5.7.8 Checklist d'une liaison PtP

1. **Besoin** : débit, disponibilité, distance ;
2. **sites** : coordonnées, hauteurs, accès, alimentation ;
3. **ligne de vue** et **Fresnel** ;
4. **bande** et **réglementation** (licence éventuelle) ;
5. **matériel** : radios, antennes, câbles, parafoudres ;
6. **bilan de liaison** (marge ≥ 10-15 dB) ;
7. **installation** et mise à la terre ;
8. **pointage** et mesures (RSSI, SNR, iperf3) ;
9. **documentation** et supervision.

:::attention Pluie et fréquences élevées
La pluie atténue surtout les fréquences **très hautes** (60 GHz). À 5 GHz, l'effet est faible ; sur de longues distances, il faut néanmoins garder de la marge.
:::

:::examen Questions fréquentes
- Calculez la FSPL à 5 GHz sur 10 km ; que se passe-t-il si on double la distance ?
- Calculez la marge d'une liaison (Tx, gains, câbles, sensibilité fournis).
- À quoi sert la zone de Fresnel ? Quel dégagement minimal ?
- Décrivez les étapes du pointage d'antenne. Qu'est-ce qu'un lobe secondaire ?
- Quel est l'intérêt d'un parafoudre et d'une mise à la terre ?
:::
