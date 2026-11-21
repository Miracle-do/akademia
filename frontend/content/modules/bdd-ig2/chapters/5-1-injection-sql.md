## 5.1.1 Qu'est-ce qu'une injection SQL ?

Une **injection SQL** consiste à faire exécuter une requête non prévue en glissant du code SQL dans une donnée saisie par l'utilisateur. Elle survient quand l'application **concatène** le texte saisi dans la requête.

```php
$req = "SELECT * FROM users WHERE login='" . $login . "' AND mdp='" . $mdp . "'";
```

## 5.1.2 Trois attaques classiques

**1. La condition toujours vraie.** On saisit `' OR '1'='1` comme identifiant :

```sql
SELECT * FROM users WHERE login='' OR '1'='1' AND mdp='...'
```

La condition `'1'='1'` est toujours vraie : l'attaquant se connecte sans mot de passe. La variante `" or ""="` joue le même rôle avec des guillemets doubles.

**2. Le commentaire.** On saisit `admin'--` : tout ce qui suit `--` est ignoré, y compris le test du mot de passe.

**3. Les requêtes par lots.** On saisit `x'; DROP TABLE users; --` : si le SGBD accepte plusieurs instructions séparées par `;`, la table est supprimée.

:::attention Le vrai risque
Une injection peut **lire** des données qui ne devraient pas l'être, **modifier** ou **détruire** une base entière.
:::

## 5.1.3 Se protéger

:::retenir Requêtes paramétrées
La protection n°1 : les **requêtes préparées (paramétrées)**. La requête est envoyée **avec des marqueurs** (`?`), les valeurs sont transmises **séparément** : elles ne sont jamais interprétées comme du SQL.
:::

```php
$stmt = $pdo->prepare("SELECT * FROM users WHERE login = ? AND mdp = ?");
$stmt->execute([$login, $mdp]);
```

Mesures complémentaires :

- **valider** et **filtrer** les entrées (type, longueur, liste blanche) ;
- appliquer le **moindre privilège** : le compte de l'application n'a pas le droit de `DROP` ;
- **ne jamais afficher** les messages d'erreur SQL à l'utilisateur ;
- **hacher** les mots de passe (bcrypt, argon2), ne jamais les stocker en clair ;
- tenir le SGBD **à jour** et auditer le code.

:::examen Reconnaître l'attaque
Si l'énoncé montre `OR 1=1`, `' OR ''='` ou `; DROP TABLE`, c'est une **injection SQL**. Si on demande la parade, répondez « **requêtes paramétrées + validation des entrées + moindre privilège** ».
:::
