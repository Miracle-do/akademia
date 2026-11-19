Les mots de passe restent le mécanisme d'authentification le plus répandu... et le plus mal protégé. Les fuites de bases de données sont fréquentes ; ce qui compte alors, c'est **ce que l'attaquant y trouve**.

## 7.3.1 Ne jamais stocker un mot de passe en clair

Quand un utilisateur se connecte, le serveur **n'a pas besoin de connaître** son mot de passe : il doit seulement vérifier que **l'empreinte du mot de passe saisi** correspond à l'**empreinte enregistrée**. Le serveur stocke donc **H(mot de passe)** et non le mot de passe.

- **Avantage** : si la base est volée, l'attaquant n'a pas directement les mots de passe.
- **Inconvénient** : un utilisateur qui l'oublie ne peut pas le **récupérer** (on le **réinitialise**). Un site qui vous **renvoie votre mot de passe** par courriel le stocke en clair ou chiffré réversiblement : mauvais signe.

## 7.3.2 Les attaques sur les empreintes de mots de passe

Comme le haché est à sens unique, l'attaquant **devine** puis compare :

- **Force brute** : tester toutes les combinaisons ;
- **Dictionnaire** : tester les mots de passe courants et leurs variantes (`azerty`, `123456`, `P@ssw0rd`) ;
- **Tables précalculées / arc-en-ciel** (*rainbow tables*) : un grand tableau empreinte → mot de passe, calculé une fois et réutilisé pour **toutes** les bases ;
- **Corrélation** : si deux utilisateurs ont le même mot de passe, ils ont **la même empreinte** : craquer l'un révèle l'autre.

Avec un hachage rapide (MD5, SHA-256), un GPU moderne teste **des milliards** de candidats par seconde : les mots de passe courants tombent en quelques secondes.

## 7.3.3 Le salage (salt)

Le **sel** est une valeur **aléatoire, unique par utilisateur**, ajoutée au mot de passe avant le hachage : **empreinte = H(sel ∥ mot de passe)**. Le sel est **stocké en clair** à côté de l'empreinte.

**Exemple du cours** : le mot de passe « f00tb@ll99 » avec MD5 donne `031cfd598a74f82d4c8983fd9030204a`. En ajoutant le sel « $3EP », on obtient `bb20de4417ef95a9608d94a9d43a261d`, une sortie **totalement différente**.

**Autre illustration** (SHA-256 de « azerty ») :

```text
sans sel         : f2d81a260dea8a100dd517984e53c56a7523d96942a834b9cdc249bd4e8c7aa9
sel1 + azerty    : e31c7fb43ef28960de6d7e44bab7e02c4f0e694a1ab8dcf300ffe5fff22fdebb
sel2 + azerty    : f67fb412085812c2a0226939e54b5ecb67ca1753552183490fc1e2a20054f809
```

Même mot de passe, trois empreintes différentes.

**Ce que le sel apporte**

- **annule les tables arc-en-ciel** (il faudrait une table par sel) ;
- **deux utilisateurs avec le même mot de passe** ont des empreintes différentes ;
- l'attaquant doit **attaquer chaque compte séparément**.

**Ce qu'il n'apporte pas** : le sel n'est pas secret. Il **ne protège pas un mot de passe faible** : l'attaquant qui a la base connaît le sel et peut toujours tester `azerty` avec chaque sel. L'utilisateur n'a rien à saisir : le sel est ajouté **automatiquement** (au début, à la fin ou au milieu).

## 7.3.4 Le poivre (pepper)

Le **poivre** est un secret **supplémentaire**, commun à toute l'application, **non stocké dans la base** (en variable d'environnement, coffre de secrets ou HSM). On calcule : **empreinte = H(sel ∥ mot de passe ∥ poivre)**, ou mieux **HMAC(poivre, ...)**.

| | **Sel** | **Poivre** |
|---|---|---|
| Valeur | aléatoire, **différente** pour chaque utilisateur | **unique** pour toute l'application |
| Stockage | **dans la base**, avec l'empreinte | **hors de la base** (secret) |
| Secret ? | non | **oui** |
| Rôle | contre arc-en-ciel et corrélation | si la base fuit **seule**, l'attaque devient impossible sans le poivre |

Version décrite dans le cours : le poivre est un **court ajout aléatoire non stocké** ; à la connexion, le serveur doit **essayer toutes les valeurs possibles** du poivre jusqu'à retrouver l'empreinte enregistrée. L'attaquant doit faire de même pour chaque tentative, d'où un coût multiplié (« des centaines de fois plus de temps »). C'est une variante à coût de calcul ; la pratique moderne préfère un **poivre secret long**, géré comme une clé.

## 7.3.5 Fonctions de dérivation lentes

Le problème de MD5 ou SHA-256 pour les mots de passe est justement leur **rapidité**. On utilise des fonctions **volontairement lentes et coûteuses en mémoire** :

| Fonction | Principe |
|---|---|
| **PBKDF2** | répète HMAC des **centaines de milliers** de fois (itérations) |
| **bcrypt** | basé sur Blowfish, **facteur de coût** réglable, sel intégré |
| **scrypt** | coûteux en **mémoire** : résiste aux GPU/ASIC |
| **Argon2** (vainqueur du concours PHC 2015) | **recommandé** ; réglage du temps, de la mémoire et du parallélisme (Argon2id) |

Ces fonctions intègrent le sel dans leur format de sortie, par exemple `$2b$12$...` pour bcrypt (cost = 12) : le préfixe `$P$` du cours (phpass) est de la même famille.

**Procédure recommandée**

1. À l'inscription : générer un sel aléatoire (16 octets), calculer **Argon2id(mot de passe, sel)** et stocker (algorithme, paramètres, sel, empreinte).
2. À la connexion : recalculer avec les mêmes paramètres, **comparer en temps constant**.
3. Augmenter le coût avec le temps et **ré-hacher** à la prochaine connexion.
4. Imposer une **longueur minimale** (12 caractères ou plus), refuser les mots de passe de listes de fuites, proposer la **MFA**.

:::retenir Le trio gagnant
**Sel unique** (par utilisateur) + **fonction lente** (Argon2/bcrypt/scrypt/PBKDF2) + éventuellement **poivre secret** hors base.
:::

## 7.3.6 Bonnes pratiques côté utilisateur

- un mot de passe **long** (phrase de passe) et **unique par service** ;
- un **gestionnaire de mots de passe** ;
- l'**authentification multifacteur** ;
- méfiance envers l'**hameçonnage** (le meilleur hachage ne protège pas d'un mot de passe donné au pirate).

:::examen Questions types
- Pourquoi ne stocke-t-on pas les mots de passe en clair ? Que stocke-t-on ?
- Différence entre sel et poivre ?
- Pourquoi MD5 est-il un mauvais choix pour les mots de passe ? (rapide, cassé, sans sel)
- Citez deux fonctions adaptées au stockage de mots de passe.
:::
