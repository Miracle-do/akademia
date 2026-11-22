## 2.4.1 Le formulaire HTML

```html
<form action="cible.php" method="post">
  <input type="text"     name="nom">
  <input type="number"   name="age">
  <input type="password" name="mdp">
  <input type="radio"    name="sexe" value="M"> M
  <input type="radio"    name="sexe" value="F"> F
  <input type="checkbox" name="competences[]" value="php"> PHP
  <input type="checkbox" name="competences[]" value="sql"> SQL
  <select name="langue">
    <option value="fr">Français</option>
    <option value="en">Anglais</option>
  </select>
  <textarea name="message"></textarea>
  <input type="submit" value="Envoyer">
  <input type="reset"  value="Effacer">
</form>
```

| Attribut | Rôle |
|---|---|
| `action` | le script PHP qui reçoit les données |
| `method` | `get` (données dans l'URL, visibles) ou `post` (données dans le corps de la requête) |
| `name` (de chaque champ) | **clé** sous laquelle PHP retrouve la valeur |
| `enctype="multipart/form-data"` | obligatoire pour envoyer des **fichiers** |

:::retenir GET ou POST ?
`get` : recherche, lien partageable, jamais de mot de passe. `post` : saisie, enregistrement, connexion.
:::

:::attention Cases à cocher
Pour qu'un groupe de cases à cocher arrive en **tableau**, le nom se termine par `[]` : `name="competences[]"`. Une case non cochée n'est **pas envoyée** du tout.
:::

## 2.4.2 Récupérer les données en PHP

```php
<?php
if (isset($_POST["nom"]) && $_POST["nom"] !== "") {
    $nom = htmlspecialchars($_POST["nom"]);
    $age = (int) $_POST["age"];
    $competences = $_POST["competences"] ?? [];   // tableau, ou vide si aucune case cochée
    echo "Bonjour $nom, $age ans. Compétences : " . implode(", ", $competences);
} else {
    echo "Veuillez remplir le formulaire.";
}
```

- `isset()` / `empty()` vérifient l'existence et le contenu.
- **`htmlspecialchars()`** neutralise les balises HTML : protection indispensable avant d'afficher une saisie.
- `$x ?? valeur` renvoie `valeur` si `$x` n'existe pas ou vaut NULL.

## 2.4.3 Téléverser un fichier

```html
<form action="upload.php" method="post" enctype="multipart/form-data">
  <input type="file" name="fich">
  <input type="submit">
</form>
```

```php
if ($_FILES["fich"]["error"] === UPLOAD_ERR_OK) {
    $nomSur = basename($_FILES["fich"]["name"]);
    move_uploaded_file($_FILES["fich"]["tmp_name"], "uploads/" . $nomSur);
}
```

Le fichier arrive d'abord dans un répertoire **temporaire** du serveur : `move_uploaded_file()` le déplace vers sa destination définitive. `$_FILES["fich"]` contient `name`, `type`, `tmp_name`, `error`, `size`.

## 2.4.4 Mêmes données, deux formes de contrôle

| Contrôle | Avantage | Limite |
|---|---|---|
| JavaScript (`onsubmit`) | immédiat, sans aller-retour | contournable |
| PHP | **fiable**, c'est le dernier mot | un aller-retour réseau |

On fait **les deux** : JavaScript pour le confort, PHP pour la sécurité.
