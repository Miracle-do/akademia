## 2.2.1 Les variables

Une variable PHP commence par le signe **`$`** suivi d'un nom : lettres, chiffres, `_` ; le premier caractère après `$` ne peut pas être un chiffre.

| Nom | Valide ? |
|---|---|
| `$var` | oui |
| `$_var` | oui |
| `$this` | **non** (`$this` est réservé aux objets : on ne peut pas lui affecter de valeur) |
| `$5var` | **non** (un chiffre ne peut pas suivre `$`) |

:::attention Sensibles à la casse
`$nom` et `$Nom` sont deux variables différentes, mais les noms de **fonctions** ne sont pas sensibles à la casse (`ABS()` = `abs()`).
:::

PHP est **faiblement typé** : on ne déclare pas le type, il dépend de la valeur.

```php
$a = 5;           // entier
$b = 3.14;        // décimal (float)
$c = "texte";     // chaîne
$d = true;        // booléen
$e = [1, 2, 3];   // tableau
$f = null;        // NULL
echo gettype($a);
```

Fonctions utiles : `isset($x)` (existe et non NULL), `empty($x)` (vide), `is_int`, `is_string`, `unset($x)`.

## 2.2.2 Les constantes

Une **constante** ne change pas de valeur et s'écrit **sans `$`**. On la déclare avec **`define()`** ou le mot-clé `const`.

```php
define("TVA", 0.18);
const NOM_SITE = "Akademia";
echo TVA;
```

:::retenir define, pas #pragma
En PHP, une constante se déclare avec **`define`** (ou `const`). `constant()` sert à lire sa valeur par son nom. `#pragma` appartient au langage C et `def` à d'autres langages.
:::

## 2.2.3 Opérateurs

| Famille | Opérateurs |
|---|---|
| Arithmétiques | `+ - * / % **` |
| Affectation | `= += -= *= /= .=` |
| Comparaison | `== === != !== < > <= >= <=>` |
| Logiques | `&& \|\| ! and or xor` |
| Chaînes | `.` (concaténation) |
| Incrément | `++ --` |

En PHP, la concaténation utilise le **point** : `"Bonjour " . $nom`. Dans une chaîne entre **guillemets doubles**, les variables sont remplacées (`"Salut $nom"`) ; entre **apostrophes**, le texte reste tel quel.

## 2.2.4 Les tableaux

```php
$notes = [12, 15, 9];                 // tableau indexé : $notes[0]
$etu = ["nom" => "Ama", "age" => 20]; // tableau associatif : $etu["nom"]
$notes[] = 17;                        // ajoute à la fin
count($notes);                        // nombre d'éléments
```

Fonctions courantes : `sort`, `rsort`, `array_push`, `array_pop`, `in_array`, `array_keys`, `implode`, `explode`.

## 2.2.5 Les variables superglobales

| Variable | Contenu |
|---|---|
| **`$_GET`** | paramètres passés dans l'URL |
| **`$_POST`** | données envoyées par un formulaire en `post` |
| `$_REQUEST` | `$_GET` + `$_POST` + `$_COOKIE` |
| `$_FILES` | fichiers téléversés |
| `$_COOKIE` | cookies reçus |
| `$_SESSION` | données de session |
| `$_SERVER` | informations sur le serveur et la requête |
