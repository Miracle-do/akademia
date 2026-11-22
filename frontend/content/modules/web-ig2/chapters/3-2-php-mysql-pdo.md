## 3.2.1 Deux interfaces : MySQLi et PDO

| | **MySQLi** | **PDO** |
|---|---|---|
| Bases acceptées | MySQL uniquement | MySQL, SQLite, PostgreSQL, … |
| Style | objet ou procédural | objet |
| Requêtes préparées | oui | oui |

On range les paramètres de connexion dans un fichier à part (`myparam.inc.php`) inclus par les scripts.

## 3.2.2 Connexion avec PDO

```php
<?php
try {
    $pdo = new PDO(
        "mysql:host=localhost;dbname=magasin;charset=utf8mb4",
        "root", "",
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    exit("Connexion impossible : " . $e->getMessage());
}
```

Le mode `ERRMODE_EXCEPTION` fait lever une exception à chaque erreur SQL : on l'attrape avec `try / catch`. Pour fermer : `$pdo = null;`.

## 3.2.3 Connexion avec MySQLi (objet)

```php
$mysqli = new mysqli("localhost", "root", "", "magasin");
if ($mysqli->connect_errno) {
    exit("Erreur : " . $mysqli->connect_error);
}
$mysqli->set_charset("utf8mb4");
```

## 3.2.4 Lire des données

```php
$res = $pdo->query("SELECT id_client, nom, ville FROM client ORDER BY nom");
echo "<table>";
foreach ($res as $ligne) {
    echo "<tr><td>" . htmlspecialchars($ligne["nom"]) . "</td>"
       . "<td>" . htmlspecialchars($ligne["ville"]) . "</td></tr>";
}
echo "</table>";
```

Avec MySQLi : `$res = $mysqli->query($sql); while ($ligne = $res->fetch_assoc()) { … }`. `$res->num_rows` donne le nombre de lignes.

## 3.2.5 Requêtes préparées : la bonne façon d'insérer

Une **requête préparée** envoie la requête avec des **marqueurs**, puis les valeurs à part : elle protège contre l'**injection SQL**.

```php
$sql = "INSERT INTO client (nom, prenom, age, ville) VALUES (:nom, :prenom, :age, :ville)";
$req = $pdo->prepare($sql);
$req->execute([
    ":nom"    => $_POST["nom"],
    ":prenom" => $_POST["prenom"],
    ":age"    => (int) $_POST["age"],
    ":ville"  => $_POST["ville"],
]);
echo "Enregistré, numéro : " . $pdo->lastInsertId();
```

Avec des points d'interrogation : `VALUES (?, ?, ?, ?)` puis `$req->execute([$nom, $prenom, $age, $ville]);`. Avec MySQLi : `prepare()`, `bind_param("ssis", $nom, $prenom, $age, $ville)`, `execute()`.

:::attention Ne jamais concaténer une saisie dans la requête
`"… WHERE nom = '" . $_POST["nom"] . "'"` est exploitable : un visiteur peut saisir `' OR '1'='1`. Utilisez toujours une requête préparée.
:::

## 3.2.6 Modifier, supprimer, rechercher

```php
$req = $pdo->prepare("UPDATE client SET ville = ? WHERE id_client = ?");
$req->execute([$ville, $id]);

$req = $pdo->prepare("DELETE FROM client WHERE id_client = ?");
$req->execute([$id]);

$req = $pdo->prepare("SELECT * FROM client WHERE nom LIKE ?");
$req->execute(["%" . $motcle . "%"]);
$lignes = $req->fetchAll(PDO::FETCH_ASSOC);
echo $req->rowCount() . " ligne(s)";
```

| Méthode | Rôle |
|---|---|
| `query($sql)` | exécute un `SELECT` sans paramètre |
| `exec($sql)` | exécute `INSERT/UPDATE/DELETE`, renvoie le nombre de lignes touchées |
| `prepare($sql)` + `execute()` | requête avec paramètres |
| `fetch()` / `fetchAll()` | lit une ligne / toutes les lignes |
| `rowCount()` | nombre de lignes concernées |
| `lastInsertId()` | dernier identifiant auto-incrémenté |

## 3.2.7 Transactions

Pour que plusieurs écritures réussissent **toutes** ou **aucune** : `beginTransaction()`, puis `commit()` ; en cas d'erreur, `rollBack()`.
