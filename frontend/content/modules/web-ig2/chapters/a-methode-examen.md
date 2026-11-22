## A.1 Ce que l'examen demande

Les épreuves de programmation web de l'ENEAM mêlent :

| Bloc | Contenu typique |
|---|---|
| **QCM** (≈ 20 questions) | syntaxe PHP, JavaScript, événements, React, Laravel |
| **Exercice de synthèse** | un formulaire HTML → table MySQL → script PHP d'enregistrement |

## A.2 Méthode pour l'exercice « formulaire → base → PHP »

1. **Lire le formulaire** : chaque champ devient un `name`. Repérer les listes déroulantes et les groupes de cases à cocher.
2. **Écrire le HTML** : `<form action="enregistrer.php" method="post">`, un `name` par champ, `[]` pour les cases à cocher, boutons `reset` (EFFACER) et `submit` (ENVOI).
3. **Déduire le modèle logique** : valeur simple → colonne ; liste de **choix multiples** → table d'association (N:M).
4. **Écrire le PHP** : lire `$_POST`, vérifier, requête **préparée**, `INSERT`, message.

## A.3 Exemple corrigé : fiche « Recherche d'emploi »

Formulaire : Nom, Prénom, Âge, Langue pratiquée (liste), Compétences (XHTML, PHP, MySQL, ASP.Net), boutons EFFACER et ENVOI.

**1. Script du formulaire**

```html
<form action="enregistrer.php" method="post">
  <fieldset>
    <legend>Recherche d'emploi : complétez la fiche</legend>
    Nom <input type="text" name="nom">
    Prénom <input type="text" name="prenom">
    Âge <input type="number" name="age" min="16" max="99">

    <p>Langues pratiquées</p>
    <select name="langue">
      <option value="1">français</option>
      <option value="2">anglais</option>
      <option value="3">allemand</option>
    </select>

    <p>Compétences informatiques</p>
    XHTML <input type="checkbox" name="competences[]" value="1">
    PHP <input type="checkbox" name="competences[]" value="2">
    MySQL <input type="checkbox" name="competences[]" value="3">
    ASP.Net <input type="checkbox" name="competences[]" value="4">

    <p>
      <input type="reset"  value="EFFACER">
      <input type="submit" value="ENVOI">
    </p>
  </fieldset>
</form>
```

**2. Modèle logique correspondant**

- `LANGUE(`**id_langue**`, libelle)`
- `COMPETENCE(`**id_competence**`, libelle)`
- `CANDIDAT(`**id_candidat**`, nom, prenom, age, #id_langue)`
- `POSSEDER(`**#id_candidat, #id_competence**`)`

Une compétence peut être possédée par plusieurs candidats et un candidat peut avoir plusieurs compétences : **association N:M**, donc table `POSSEDER` à clé concaténée. *(Si la liste de langues autorisait plusieurs choix, on créerait de même une table `PARLER(#id_candidat, #id_langue)`.)*

**3. Code PHP de l'enregistrement**

```php
<?php
// enregistrer.php
require "connexion.php";   // définit l'objet PDO $pdo

$nom    = trim($_POST["nom"] ?? "");
$prenom = trim($_POST["prenom"] ?? "");
$age    = filter_var($_POST["age"] ?? "", FILTER_VALIDATE_INT);
$langue = (int) ($_POST["langue"] ?? 0);
$competences = $_POST["competences"] ?? [];

if ($nom === "" || $prenom === "" || $age === false || $langue === 0) {
    exit("Données incomplètes ou invalides.");
}

try {
    $pdo->beginTransaction();
    $req = $pdo->prepare(
        "INSERT INTO candidat (nom, prenom, age, id_langue) VALUES (?, ?, ?, ?)"
    );
    $req->execute([$nom, $prenom, $age, $langue]);
    $id = $pdo->lastInsertId();

    $lien = $pdo->prepare(
        "INSERT INTO posseder (id_candidat, id_competence) VALUES (?, ?)"
    );
    foreach ($competences as $c) {
        $lien->execute([$id, (int) $c]);
    }
    $pdo->commit();
    echo "Fiche enregistrée. Numéro : " . htmlspecialchars($id);
} catch (PDOException $e) {
    $pdo->rollBack();
    echo "Erreur d'enregistrement.";
}
```

:::examen Ce que le correcteur regarde
`method="post"`, un `name` par champ, `competences[]` pour les cases, une **table d'association** pour le choix multiple, une requête **préparée**, et un message de confirmation.
:::

## A.4 Cinq réflexes pour les QCM

:::attention
1. `$this` ne reçoit pas de valeur ; `$5var` n'est pas un nom valide.
2. Constante PHP : **`define`**. Fichier Laravel : **`.env`**, vues **`.blade.php`**.
3. Événement **clavier** : `onkeydown` / `onkeyup` / `onkeypress`.
4. React : **state & props**, **DOM virtuel**, composants dans **`src/components/`**.
5. « Toutes les réponses sont vraies » est souvent juste pour les listes de formes valides (commentaires PHP, fonctionnalités de PHP).
:::
