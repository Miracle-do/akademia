## 4.1.1 Qu'est-ce que React ?

**React** est une bibliothèque JavaScript, créée par Facebook, pour construire des **interfaces utilisateur** (UI). Elle couvre la **couche d'interface** d'une application, pas la couche de données (le stockage reste une affaire de serveur et de base).

Idées clés :

- l'interface est découpée en **composants** réutilisables (un bouton, une liste, un formulaire) ;
- React maintient un **DOM virtuel** : une copie légère de la page en mémoire. À chaque changement, il compare l'ancienne et la nouvelle version et ne met à jour dans le vrai DOM que ce qui a changé, ce qui **améliore les performances** ;
- le rendu est **déclaratif** : on décrit ce que l'écran doit montrer pour un état donné.

## 4.1.2 JSX et composants

**JSX** est une syntaxe qui ressemble à du HTML écrite dans du JavaScript.

```jsx
function Bonjour({ nom }) {
  return <h1>Bonjour {nom} !</h1>;
}

function App() {
  return (
    <div>
      <Bonjour nom="Koffi" />
      <Bonjour nom="Ama" />
    </div>
  );
}
```

Un composant est une **fonction** (ou une classe) dont le nom commence par une **majuscule** et qui renvoie du JSX. Le JSX s'écrit `className` (et non `class`) et les accolades `{}` y insèrent du JavaScript.

## 4.1.3 Props et state : les deux façons de traiter les données

| | **props** | **state** |
|---|---|---|
| Rôle | données **reçues** du composant parent | données **internes** au composant |
| Modifiable par le composant ? | **non** (lecture seule) | **oui**, via une fonction de mise à jour |
| Effet d'un changement | le parent re-rend le composant | le composant se re-rend |

:::retenir props et state
« Les deux façons dont les données sont traitées dans React » : **state & props**. Les props viennent de l'extérieur, le state vit à l'intérieur.
:::

## 4.1.4 Le state avec les hooks

```jsx
import { useState } from "react";

function Compteur() {
  const [n, setN] = useState(0);      // [valeur, fonction de mise à jour]
  return (
    <button onClick={() => setN(n + 1)}>Cliqué {n} fois</button>
  );
}
```

Dans un composant **classe** (ancienne forme), on accède à l'état avec **`this.state`** et on le modifie avec `this.setState()`.

```jsx
class Compteur extends React.Component {
  state = { n: 0 };
  render() {
    return <button onClick={() => this.setState({ n: this.state.n + 1 })}>
             {this.state.n}
           </button>;
  }
}
```

**`useEffect`** exécute du code après le rendu (chargement de données, abonnements).

## 4.1.5 Organisation d'un projet

On crée un projet avec un outil (par exemple **Vite** : `npm create vite@latest`). Les composants se rangent dans un dossier de la source, classiquement **`src/components/`**. `npm run dev` lance le serveur de développement.

:::attention Où ranger les composants ?
Dans un projet actuel créé avec Vite, c'est **`src/components/`**. Au QCM, parmi les choix `js/components/`, `vendor/components/`, `external/components/` et `vendor/`, la réponse attendue est **`js/components/`**. Retenez que `vendor/` est le dossier des dépendances de **Composer (PHP/Laravel)**, jamais celui des composants React.
:::

## 4.1.6 Lister et réagir

```jsx
function Liste({ produits }) {
  return (
    <ul>
      {produits.map((p) => (
        <li key={p.id}>{p.nom} — {p.prix} F</li>
      ))}
    </ul>
  );
}
```

La propriété **`key`** aide React à identifier chaque élément de la liste.
