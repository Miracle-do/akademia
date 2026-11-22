## 4.2.1 Qu'est-ce que Laravel ?

**Laravel** est un framework PHP qui suit l'architecture **MVC** :

| Lettre | Rôle | Où dans Laravel |
|---|---|---|
| **M**odèle | accès aux données (table) | `app/Models` (Eloquent) |
| **V**ue | affichage HTML | `resources/views` |
| **C**ontrôleur | reçoit la requête, appelle le modèle, choisit la vue | `app/Http/Controllers` |

Les **routes** (`routes/web.php`) associent une URL à un contrôleur.

## 4.2.2 Installer et démarrer

Laravel s'installe avec **Composer**, le gestionnaire de dépendances de PHP.

```bash
composer create-project laravel/laravel monprojet
cd monprojet
php artisan serve            # démarre le serveur de développement
```

**`artisan`** est l'outil en ligne de commande de Laravel. `php artisan serve` démarre le serveur (par défaut sur `http://127.0.0.1:8000`).

:::retenir Les commandes de Laravel
`php artisan …` est **la** commande Laravel. `composer` est le gestionnaire de paquets PHP, `git` gère les versions du code, `php -v` donne la version de PHP.
:::

## 4.2.3 La configuration : le fichier .env

La connexion à la base de données se définit dans le fichier **`.env`** à la racine du projet.

```ini
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=magasin
DB_USERNAME=root
DB_PASSWORD=
```

Le fichier `config/database.php` lit ces valeurs : on ne met jamais d'identifiants en dur dans le code, et on ne publie pas `.env`.

## 4.2.4 Contrôleurs, routes et vues

```bash
php artisan make:controller ClientController        # crée le contrôleur
php artisan make:controller ClientController --resource
php artisan make:model Client -m                    # modèle + migration
php artisan make:migration create_clients_table
php artisan migrate                                 # applique les migrations
```

```php
// routes/web.php
use App\Http\Controllers\ClientController;
Route::get('/clients', [ClientController::class, 'index']);
Route::post('/clients', [ClientController::class, 'store']);
```

```php
// app/Http/Controllers/ClientController.php
public function index() {
    $clients = Client::orderBy('nom')->get();
    return view('clients.index', ['clients' => $clients]);
}
```

## 4.2.5 Les vues Blade

Les vues Laravel se trouvent dans `resources/views` et leur nom se termine par **`.blade.php`**. Le moteur de modèles **Blade** ajoute des directives.

```blade
{{-- resources/views/clients/index.blade.php --}}
<h1>Liste des clients</h1>
@foreach ($clients as $c)
  <p>{{ $c->nom }} — {{ $c->ville }}</p>
@endforeach
@if ($clients->isEmpty())
  <p>Aucun client.</p>
@endif
```

`{{ … }}` affiche en **échappant** le HTML (protection XSS).

## 4.2.6 Migrations et Eloquent

```php
Schema::create('clients', function (Blueprint $table) {
    $table->id();
    $table->string('nom', 40);
    $table->string('ville')->nullable();
    $table->timestamps();
});
```

```php
Client::create(['nom' => 'Koffi', 'ville' => 'Cotonou']);
$c = Client::find(1);
$c->ville = 'Porto-Novo';  $c->save();
$c->delete();
```

## 4.2.7 Symfony

**Symfony** est l'autre grand framework PHP du cours. Il repose sur des composants réutilisables, la ligne de commande `bin/console`, le moteur de modèles **Twig** et l'ORM **Doctrine**. La logique reste la même qu'avec Laravel : routes → contrôleur → modèle → vue.
