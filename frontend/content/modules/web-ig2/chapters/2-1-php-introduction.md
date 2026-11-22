## 2.1.1 Qu'est-ce que PHP ?

**PHP** signifie *PHP: Hypertext Preprocessor* (à l'origine *Personal Home Page*, créé par Rasmus Lerdorf). C'est un langage de script **côté serveur** : le serveur exécute le code et n'envoie au navigateur que le **HTML produit**.

PHP permet, entre autres :

- de manipuler des **fichiers** du système (créer, ouvrir, lire, écrire, fermer) ;
- de traiter des **formulaires** : rassembler des données, les enregistrer, envoyer un e-mail ;
- d'**ajouter, supprimer, modifier** des données dans une **base de données** (MySQL surtout, aussi SQLite) ;
- de gérer cookies et sessions.

## 2.1.2 L'environnement : LAMP et WAMP

| Sigle | Composants |
|---|---|
| **LAMP** | **L**inux, **A**pache, **M**ySQL, **P**HP |
| **WAMP** | **W**indows, Apache, MySQL, PHP |

En local, on utilise un paquet comme **XAMPP** ou **WAMP** : Apache (serveur web), MySQL (base) et **phpMyAdmin** (interface graphique de gestion de la base).

## 2.1.3 Cycle de vie d'une page PHP

1. Le navigateur envoie une **requête HTTP** pour `page.php`.
2. Le serveur Apache confie le fichier à l'**interpréteur PHP**.
3. PHP exécute le code (calculs, lectures en base…) et produit du **HTML**.
4. Le serveur renvoie ce HTML au navigateur, qui l'affiche.

:::retenir Le visiteur ne voit jamais le PHP
Un « affichage du code source » dans le navigateur montre le HTML déjà produit, jamais le code PHP.
:::

## 2.1.4 Premier script

```php
<!DOCTYPE html>
<html>
<body>
  <?php
    $nom = "Koffi";
    echo "<h1>Bonjour $nom</h1>";
  ?>
</body>
</html>
```

- Le code PHP est délimité par `<?php … ?>` ; le fichier porte l'extension **`.php`**.
- Chaque instruction se termine par **`;`**.
- `echo` et `print` affichent du texte ; `print_r` et `var_dump` servent au débogage.

## 2.1.5 Les commentaires

```php
// commentaire sur une fin de ligne
# autre forme, sur une ligne
/* commentaire
   sur plusieurs lignes */
```

:::attention Trois formes valides
`//`, `#` et `/* … */` sont **toutes** valables en PHP : à une question « quelle est la façon de commenter ? », « toutes les réponses sont vraies » est correct.
:::

## 2.1.6 Organiser un site : include et require

```php
include "entete.php";          // avertissement si le fichier manque
require "config.php";          // erreur fatale si le fichier manque
include_once "fonctions.php";  // n'inclut qu'une seule fois
```

On range en général les paramètres de connexion à la base dans un fichier séparé inclus partout.
