## 1.1.1 Le web statique et le web dynamique

Une page **statique** est un fichier HTML identique pour tous les visiteurs. Une page **dynamique** est construite ou modifiée au moment de l'affichage. Deux endroits possibles :

| | Côté client | Côté serveur |
|---|---|---|
| **Où ça s'exécute** | dans le navigateur | sur le serveur web |
| **Langages** | JavaScript | PHP, Java, Python… |
| **Sert à** | réagir aux actions, contrôler une saisie, animer | lire une base, enregistrer, envoyer un e-mail |
| **Code visible par l'utilisateur ?** | oui | non (seul le HTML produit est envoyé) |

:::retenir Qui fait quoi ?
JavaScript réagit **dans le navigateur** ; PHP prépare la page **sur le serveur**. Un contrôle de saisie en JavaScript améliore le confort, mais seul le serveur peut le garantir : il faut toujours revérifier côté PHP.
:::

## 1.1.2 Le langage JavaScript

JavaScript est un langage de script **interprété** par le navigateur, **sensible à la casse** (`Nom` et `nom` sont deux variables). Malgré son nom, il n'a presque rien à voir avec Java.

**Incorporer le code** dans une page HTML avec la balise `<script>` :

```html
<script>
  alert("Bonjour !");
</script>

<!-- ou depuis un fichier externe -->
<script src="programme.js"></script>
```

:::attention La balise, pas un autre nom
Le code JavaScript se place dans la balise **`<script>`** (pas `<js>`, ni `<javascript>`). Chaque instruction se termine par un point-virgule, et `//` ou `/* … */` servent de commentaires.
:::

## 1.1.3 Variables et types

Une variable se déclare avec `var` (ancienne forme du cours), `let` (variable modifiable de portée de bloc) ou `const` (valeur non réaffectable).

```javascript
var nom = "Koffi";      // chaîne
let age = 21;           // nombre
const TVA = 0.18;       // constante
var admis = true;       // booléen
```

Les types principaux : **nombre**, **chaîne** (string), **booléen**, **objet**, **tableau**, `undefined` (non initialisée) et `null`. JavaScript est **faiblement typé** : le type suit la valeur. L'opérateur `typeof` donne le type.

Règles de nommage : lettres, chiffres, `_` et `$`, sans commencer par un chiffre, sans mot réservé.

## 1.1.4 Les opérateurs

| Famille | Opérateurs |
|---|---|
| Calcul | `+  -  *  /  %` |
| Comparaison | `==  !=  ===  !==  <  >  <=  >=` |
| Associatifs | `=  +=  -=  *=  /=` |
| Logiques | `&&` (et)  `\|\|` (ou)  `!` (non) |
| Incrément | `++` et `--` |

`==` compare après conversion (`"5" == 5` vrai), `===` compare **valeur et type** (`"5" === 5` faux). Avec des chaînes, `+` **concatène** : `"5" + 3` donne `"53"`.

:::exemple Pièges de conversion
`"5" + 3` → `"53"` (concaténation) mais `"5" - 3` → `2` (calcul). Pour convertir une saisie : `parseInt("12")`, `parseFloat("3.5")`, `Number("8")`.
:::
