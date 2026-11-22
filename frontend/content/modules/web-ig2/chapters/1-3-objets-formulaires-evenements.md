## 1.3.1 La notion d'objet

Un **objet** regroupe des **propriétés** (des données) et des **méthodes** (des fonctions).

```javascript
var etudiant = {
  nom: "Koffi",
  age: 21,
  presenter: function () { return this.nom + " a " + this.age + " ans"; }
};
etudiant.nom;            // accès à une propriété
etudiant.presenter();    // appel d'une méthode
```

Le mot-clé **`this`** désigne l'objet courant, celui qui possède la méthode.

## 1.3.2 Les formulaires et JavaScript

Un formulaire HTML est représenté par un objet du navigateur. Chaque champ est accessible par son **nom** (attribut `name`).

```html
<form name="monform">
  <input type="text" name="nom">
  <input type="checkbox" name="ok">
  <select name="langue"><option>français</option><option>anglais</option></select>
  <input type="submit" value="Envoyer">
</form>
<script>
  var texte = document.monform.nom.value;
  var coche = document.monform.ok.checked;
  var nb = document.monform.elements.length;   // nombre d'éléments du formulaire
</script>
```

| Élément | Propriété utile |
|---|---|
| Champ de texte | `value` |
| Case à cocher, bouton radio | `checked` |
| Liste de sélection | `selectedIndex`, `options[i].value` |
| Formulaire | `elements`, **`elements.length`** (nombre de champs) |

:::attention Compter les éléments
`document.monform.elements.length` est la bonne écriture. `elements.count` et `monform.count` n'existent pas, et `monform.length` n'est pas la forme du cours.
:::

## 1.3.3 Les événements

Un **événement** est une action de l'utilisateur ou du navigateur à laquelle on associe une fonction, par un attribut HTML :

```html
<button onclick="afficher()">Cliquer</button>
<input type="text" onfocus="aide()" onchange="verifier(this)">
<form onsubmit="return controler()">…</form>
```

| Événement | Se produit quand… |
|---|---|
| `onclick` | clic de souris |
| `onload` | chargement de la page |
| `onmouseover` / `onmouseout` | la souris entre / sort |
| `onfocus` / `onblur` | le champ reçoit / perd le focus |
| `onchange` | la valeur d'un champ change |
| `onselect` | du texte est sélectionné |
| `onsubmit` / `onreset` | envoi / remise à zéro du formulaire |
| **`onkeydown`**, **`onkeyup`**, **`onkeypress`** | **événements clavier** |

:::retenir Clavier ou souris ?
`onclick` (souris) et `onfocus` (focus) ne sont **pas** des événements clavier. Les événements propres au clavier sont `onkeydown`, `onkeyup` et `onkeypress`.
:::

## 1.3.4 Contrôler un formulaire avant l'envoi

Si le gestionnaire `onsubmit` renvoie **`false`**, l'envoi est annulé.

```html
<form name="f" action="traitement.php" method="post"
      onsubmit="return controler()">
  <input type="text" name="nom">
  <input type="submit" value="Envoyer">
</form>
<script>
  function controler() {
    if (document.f.nom.value === "") {
      alert("Le nom est obligatoire");
      return false;
    }
    return true;
  }
</script>
```
