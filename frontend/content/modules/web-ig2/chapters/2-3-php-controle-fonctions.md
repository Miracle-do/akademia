## 2.3.1 Instructions conditionnelles

```php
if ($montant > 100) { $remise = 0.10; }
elseif ($montant > 50) { $remise = 0.05; }
else { $remise = 0; }

switch ($jour) {
  case 1:  echo "Lundi"; break;
  case 2:  echo "Mardi"; break;
  default: echo "Autre";
}

$statut = ($age >= 18) ? "majeur" : "mineur";   // opérateur ternaire
```

## 2.3.2 Boucles

```php
for ($i = 1; $i <= 10; $i++) { echo $i; }
while ($i < 5) { $i++; }
do { $i--; } while ($i > 0);

foreach ($notes as $n) { echo $n; }                  // valeurs
foreach ($etu as $cle => $valeur) { echo "$cle : $valeur"; }
```

`break` quitte la boucle ; `continue` passe au tour suivant. Ils fonctionnent comme en JavaScript.

## 2.3.3 Gérer les erreurs : les exceptions

```php
try {
    if ($b == 0) { throw new Exception("Division par zéro"); }
    echo $a / $b;
} catch (Exception $e) {
    echo "Erreur : " . $e->getMessage();
} finally {
    echo "Terminé";
}
```

Le bloc `try` contient le code à risque ; `catch` récupère l'exception ; `finally` s'exécute dans tous les cas.

## 2.3.4 Les fonctions

```php
function somme(int $a, int $b = 0): int {
    return $a + $b;
}
echo somme(4, 5);     // 9
echo somme(4);        // 4 : valeur par défaut de $b
```

- **Paramètres** : variables de la déclaration ; **arguments** : valeurs fournies à l'appel.
- **Passage par valeur** (par défaut) : la fonction travaille sur une copie. **Par référence** avec `&` : la fonction modifie la variable d'origine.

```php
function ajouter(array &$t, $v) { $t[] = $v; }
```

- Une variable créée dans une fonction est **locale**. Pour utiliser une variable globale, on la déclare `global $x;` dans la fonction (ou on la passe en paramètre, ce qui est préférable).
- **Nombre variable d'arguments** : `function prod(...$nombres)`.
- **Typage** : `declare(strict_types=1);` en début de fichier impose le typage strict.

:::retenir Appeler une fonction
Un appel de fonction PHP s'écrit simplement `somme(4, 5)`. Une fonction peut être appelée avant sa définition dans le fichier si elle est définie au premier niveau.
:::

## 2.3.5 Quelques fonctions utiles

| Domaine | Fonctions |
|---|---|
| Nombres | `abs`, `round`, `floor`, `ceil`, `sqrt`, `pow`, `max`, `min`, `rand` |
| Chaînes | `strlen`, `strtoupper`, `strtolower`, `substr`, `str_replace`, `trim`, `strpos` |
| Dates | `date("d/m/Y")`, `time()`, `strtotime()`, `mktime()` |
| Tests | `isset`, `empty`, `is_numeric`, `function_exists` |
