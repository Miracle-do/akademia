## 1.4.1 Les tableaux

```javascript
var langages = ["PHP", "JavaScript", "SQL"];
langages[0];                // "PHP"  (les indices commencent à 0)
langages.length;            // 3
langages.push("Java");      // ajoute à la fin
langages.pop();             // retire le dernier
langages.sort();            // tri alphabétique
langages.join(", ");        // "PHP, JavaScript, SQL" : une seule chaîne
var grille = [[1, 2], [3, 4]];   // tableau à 2 dimensions : grille[1][0] vaut 3
```

Autres méthodes courantes : `shift`, `unshift`, `slice`, `splice`, `concat`, `reverse`, `indexOf`.

## 1.4.2 Les objets du navigateur

Le navigateur expose une **arborescence** d'objets, dont le sommet est **`window`** :

| Objet | Rôle |
|---|---|
| `window` | la fenêtre : `alert`, `open`, `close`, `setTimeout`, `location` |
| `navigator` | informations sur le navigateur : `appName`, `userAgent`, `language` |
| `document` | la page affichée : `title`, `forms`, `images`, `getElementById` |
| `location` | l'adresse de la page : `href`, `reload()` |
| `history` | l'historique de navigation : `back()`, `forward()` |

```javascript
setTimeout(function () { alert("3 secondes"); }, 3000);
window.open("http://www.exemple.bj", "_blank");
```

## 1.4.3 L'objet document et le DOM

Le **DOM** (Document Object Model) représente la page sous forme d'arbre d'éléments modifiables.

```javascript
var titre = document.getElementById("titre");
titre.innerHTML = "Nouveau titre";
titre.style.color = "red";
var items = document.querySelectorAll(".produit");
```

## 1.4.4 Les objets du noyau

| Objet | Exemples |
|---|---|
| **Math** | `Math.round(2.6)` → 3 · `Math.floor` · `Math.ceil` · `Math.max` · `Math.random()` · `Math.PI` |
| **String** | `length` · `toUpperCase()` · `substring(0,3)` · `indexOf("a")` · `replace("a","b")` · `split(",")` |
| **Date** | `new Date()` · `getFullYear()` · `getMonth()` (0 à 11) · `getDate()` · `getDay()` · `getHours()` |

:::attention Les mois commencent à 0
`new Date().getMonth()` renvoie 0 pour janvier et 11 pour décembre.
:::

## 1.4.5 Les cookies

Un **cookie** est un petit texte stocké **dans le navigateur**, renvoyé au serveur à chaque requête. On l'écrit et on le lit via `document.cookie`.

```javascript
document.cookie = "nom=Koffi; expires=Fri, 31 Dec 2027 23:59:59 GMT; path=/";
var tous = document.cookie;        // "nom=Koffi; theme=sombre"
```

Pour **supprimer** un cookie, on lui donne une date d'expiration **passée**.

## 1.4.6 Expressions régulières

Une **expression régulière** décrit un motif de texte.

```javascript
var motif = /^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[a-z]{2,}$/;
motif.test("koffi@eneam.bj");   // true
```

| Symbole | Sens |
|---|---|
| `^` `$` | début / fin de la chaîne |
| `.` | n'importe quel caractère |
| `*` `+` `?` | 0 ou plus · 1 ou plus · 0 ou 1 |
| `[a-z]` | un caractère de l'intervalle |
| `\d` | un chiffre |
| `{n,m}` | de n à m répétitions |

## 1.4.7 La programmation objet

```javascript
class Etudiant {
  constructor(nom, age) { this.nom = nom; this.age = age; }
  presenter() { return this.nom + " (" + this.age + " ans)"; }
}
var e = new Etudiant("Ama", 20);
e.presenter();
```
