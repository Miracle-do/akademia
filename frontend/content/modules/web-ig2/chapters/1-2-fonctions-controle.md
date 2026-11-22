## 1.2.1 Les fonctions

Une **fonction** regroupe des instructions réutilisables. On la **déclare** une fois (de préférence dans l'en-tête `<head>`), on l'**appelle** autant de fois que nécessaire.

```javascript
function somme(a, b) {
  return a + b;
}
var total = somme(4, 5);   // appel : total vaut 9
```

- On appelle une fonction par son **nom suivi de parenthèses** : `somme(4, 5)`. Il n'existe ni `call somme()` ni `call function`.
- Les **paramètres** sont les noms écrits dans la déclaration (`a`, `b`) ; les **arguments** sont les valeurs passées à l'appel (`4`, `5`). Ils n'ont pas besoin de porter le même nom.
- `return` renvoie une valeur et termine la fonction.

:::attention Arguments et paramètres
Dire que « les arguments sont des paramètres » est la formulation retenue au QCM : les arguments sont les valeurs réellement transmises aux paramètres de la fonction.
:::

**Portée** : une variable déclarée **dans** une fonction est **locale** ; déclarée **en dehors**, elle est **globale** et visible partout.

Une **fonction anonyme** ou **fléchée** s'écrit `const double = (x) => x * 2;`.

## 1.2.2 Conditions

```javascript
if (note >= 10) { alert("Admis"); }
else if (note >= 8) { alert("Rattrapage"); }
else { alert("Ajourné"); }

switch (jour) {
  case 1: nom = "Lundi"; break;
  case 2: nom = "Mardi"; break;
  default: nom = "Autre";
}
```

Sans `break`, l'exécution **continue** dans le `case` suivant.

## 1.2.3 Boucles

```javascript
for (var i = 0; i < 5; i++) { /* ... */ }
while (condition) { /* ... */ }
do { /* ... */ } while (condition);   // s'exécute au moins une fois
```

| Mot-clé | Effet |
|---|---|
| **`break`** | **termine** la boucle (ou le `switch`) et passe à l'instruction qui la suit |
| **`continue`** | saute le reste du tour et passe à l'itération suivante |

## 1.2.4 Les boîtes de message

| Fonction | Rôle | Retour |
|---|---|---|
| `alert("texte")` | affiche un message | rien |
| `prompt("question", "défaut")` | demande une saisie | la chaîne saisie (ou `null`) |
| `confirm("question")` | demande une confirmation | `true` (OK) ou `false` (Annuler) |

```javascript
var nom = prompt("Votre nom ?");
if (confirm("Supprimer " + nom + " ?")) { alert("Supprimé"); }
```

:::retenir prompt renvoie toujours du texte
`prompt` renvoie une **chaîne** : pour calculer il faut convertir avec `parseInt` ou `Number`.
:::
