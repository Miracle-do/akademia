La cryptographie moderne met en œuvre plusieurs outils mathématiques. On commence par le plus simple et le plus important : la notion de **fonction bijective**, car **déchiffrer, c'est inverser une fonction**.

## 3.1.1 Injection, surjection, bijection

Soit f une application d'un ensemble A (départ) dans un ensemble B (arrivée).

| Notion | Définition | En mots |
|---|---|---|
| **Injective** | x₁ ≠ x₂ ⇒ f(x₁) ≠ f(x₂) | deux éléments différents n'ont **jamais la même image** |
| **Surjective** | pour tout y de B, il existe x de A tel que y = f(x) | **tout élément de B est atteint** |
| **Bijective** | injective **et** surjective | pour tout y de B, **un et un seul** x tel que y = f(x) |

**Exemples du cours**

- X = {a, b, c}, Y = {1, 2, 3}, f(a) = 1, f(b) = 3, f(c) = 2 : **f est une bijection** (chaque élément de Y a exactement un antécédent).
- Même ensembles, g(a) = 1, g(b) = g(c) = 2 : **g n'est pas une bijection**. Elle n'est pas injective (b et c ont la même image 2) et pas surjective (3 n'est atteint par personne).
- X = {a, b, c, d} et Y = {1, 2, 3} : **aucune bijection** de X sur Y, car il y a 4 éléments contre 3.

:::retenir Conséquence sur les cardinaux
S'il existe une bijection de A dans B, alors A et B ont **le même nombre d'éléments** (le même *cardinal*).
:::

## 3.1.2 Pourquoi la cryptographie a besoin des bijections

Si e_k n'était pas injective, **deux messages clairs différents donneraient le même chiffré**. Le destinataire ne pourrait pas savoir lequel l'émetteur avait envoyé : **le déchiffrement serait ambigu**. La fonction de chiffrement doit donc être **injective** ; comme M et C sont de même taille dans un chiffrement par blocs, elle est **bijective**.

Si f : X → Y est une bijection, il existe une **fonction inverse** (ou réciproque) g = f⁻¹ : Y → X, elle-même bijective, telle que :

- pour tout x : g(f(x)) = x ;
- pour tout y : f(g(y)) = y.

Pour f(a) = 1, f(b) = 3, f(c) = 2, la fonction inverse est **f⁻¹(1) = a, f⁻¹(3) = b, f⁻¹(2) = c**.

En crypto : **chiffrer = appliquer f ; déchiffrer = appliquer f⁻¹**. L'« intérêt cryptographique des bijections repose sur leur propriété d'inversibilité » (le polycopié écrit « invisibilité », sans doute un lapsus).

:::attention Bijection ≠ facile à inverser
Une bijection existe toujours avec son inverse en théorie. La sécurité vient de ce que, **sans la clé**, l'inverse est **impossible à calculer en pratique**. Les fonctions à sens unique et à trappe (chapitres 6 et 7) exploitent exactement cet écart.
:::

## 3.1.3 La substitution

Une **substitution** est une bijection qui remplace **chaque lettre** d'un message par une autre lettre (ou un autre symbole). Règle d'or : **partout où une lettre donnée apparaît, elle est remplacée par la même lettre**.

Exemple du cours :

```text
M = m e s s a g e s e c r e t
C = b x v v g o x v x u l x e
```

On lit la table de substitution : m→b, e→x, s→v, a→g, g→o, c→u, r→l, t→e.

- **C'est une substitution** : chaque lettre du clair est toujours remplacée par la même lettre (les trois « s » deviennent « v », les quatre « e » deviennent « x »).
- **C'est une bijection** : huit lettres distinctes du clair donnent huit lettres distinctes du chiffré, donc deux lettres différentes ne sont jamais confondues. On peut donc retrouver le clair en lisant la table à l'envers.

Remarques :

- on peut remplacer des lettres par d'**autres symboles** (chiffres, signes), pas forcément des lettres du même alphabet ;
- une substitution **ne change pas l'ordre** des lettres ;
- le nombre total de substitutions possibles sur un alphabet de 26 lettres est **26! ≈ 4 × 10²⁶**. Beaucoup... mais l'**analyse fréquentielle** les casse facilement, car elle conserve les statistiques (chapitre 4).

## 3.1.4 La transposition

Dans une **transposition**, on **ne modifie pas les lettres**, seulement **leur ordre**.

```text
M = m e s s a g e s e c r e t
C = e m e a s g s e c s r t e
```

- **Bijection ?** Oui : le chiffré contient exactement les mêmes lettres (4 « e », 3 « s », un « m », un « a », un « g », un « c », un « r », un « t »), simplement permutées.
- **Transposition ?** Oui. On peut donner une permutation de positions : la lettre en position *i* du chiffré vient de la position π(i) du clair, avec π = (2, 1, 7, 5, 3, 6, 4, 9, 10, 8, 11, 13, 12). Par exemple, le 1ᵉʳ caractère du chiffré est le 2ᵉ du clair (« e »), le 2ᵉ est le 1ᵉʳ (« m »).

**Remarque importante** : une transposition **opère de façon identique quel que soit le message**. Elle ne dépend que de **l'ordre des positions**, jamais de la valeur des lettres. C'est l'inverse d'une substitution, qui ne dépend que de la valeur des lettres et ignore leur position.

|  | Substitution | Transposition |
|---|---|---|
| Change | **les lettres** | **l'ordre** |
| Conserve | l'ordre | **les lettres** (donc leurs fréquences) |
| Exemple historique | César, Vigenère | scytale, transposition en colonnes |
| Faiblesse | analyse fréquentielle | analyse d'anagrammes |

:::retenir Le principe des chiffrements modernes
Les algorithmes modernes (DES, AES) **combinent** les deux : de la **confusion** (substitution : cacher le lien clé/chiffré) et de la **diffusion** (permutation : répandre l'influence de chaque bit), répétées sur plusieurs **tours**. C'est le principe de Shannon.
:::

:::examen Exercices du cours (corrigés)
1. Justifiez que l'application M → C du cours est une bijection : 8 lettres distinctes → 8 lettres distinctes, deux lettres différentes ne partagent jamais la même image.
2. Pourquoi g (g(b) = g(c) = 2) n'est-elle pas une bijection ? Parce que b et c ont la même image : elle n'est pas injective, donc le déchiffrement de « 2 » serait ambigu.
3. Existe-t-il une bijection de {a, b, c, d} sur {1, 2, 3} ? Non : les cardinaux diffèrent.
:::
