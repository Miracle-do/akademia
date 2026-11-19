**RSA** (Rivest, Shamir, Adleman, 1977) est le premier algorithme de chiffrement à clé publique largement utilisé. Il met en œuvre tout ce que vous avez vu au chapitre 3 : nombres premiers, Euclide étendu, Euler, exponentiation modulaire. Il tombe à l'examen sous forme d'**exercice de calcul** : apprenez la méthode.

## 6.1.1 Le principe : la fonction à sens unique avec trappe

La cryptographie à clé publique repose sur des **fonctions à trappe** (*trapdoor functions*) :

- **faciles à calculer** dans un sens ;
- **très difficiles à inverser** sans information secrète (la « trappe ») ;
- **faciles à inverser** avec la trappe.

Pour RSA : **multiplier** deux grands premiers p et q est facile ; **factoriser** n = p·q est très difficile. La trappe est la connaissance de p et q (donc de φ(n)).

## 6.1.2 Génération des clés

1. Choisir deux **grands nombres premiers distincts** p et q (au moins 1024 bits chacun aujourd'hui).
2. Calculer le **module** **n = p × q**.
3. Calculer **φ(n) = (p − 1)(q − 1)**.
4. Choisir un **exposant public** e tel que **1 < e < φ(n)** et **pgcd(e, φ(n)) = 1** (en pratique e = 65537).
5. Calculer l'**exposant privé** d, **inverse de e modulo φ(n)** : **e × d ≡ 1 (mod φ(n))** (Euclide étendu).

> **Clé publique : (e, n)**   —   **Clé privée : (d, n)** (ou d, p, q)

On détruit ou protège soigneusement p, q et φ(n) : les connaître permet de retrouver d.

## 6.1.3 Chiffrement et déchiffrement

Le message est converti en un entier **m < n**.

> **Chiffrement** : c = mᵉ mod n
> **Déchiffrement** : m = cᵈ mod n

**Pourquoi ça marche** : e·d = 1 + k·φ(n), donc cᵈ = m^(e·d) = m · (m^φ(n))ᵏ ≡ m · 1ᵏ = m (mod n) d'après le théorème d'Euler (si m est premier avec n).

## 6.1.4 Exemple complet (le classique p = 61, q = 53)

1. p = 61, q = 53.
2. **n = 61 × 53 = 3233**.
3. **φ(n) = 60 × 52 = 3120**.
4. On choisit **e = 17** (pgcd(17, 3120) = 1 : 3120 = 2⁴ × 3 × 5 × 13, 17 n'en divise aucun).
5. **d = e⁻¹ mod 3120**. Euclide étendu (voir chapitre 3.3) : 1 = 2 × 3120 − 367 × 17, donc d = −367 ≡ **2753**.

Clé publique **(17, 3233)** ; clé privée **(2753, 3233)**.

**Chiffrer m = 65** :
c = 65¹⁷ mod 3233 = **2790**.

**Déchiffrer** :
m = 2790²⁷⁵³ mod 3233 = **65** ✔.

(Le calcul de 65¹⁷ se fait par carrés successifs : 17 = 16 + 1, il suffit de 4 élévations au carré puis une multiplication.)

## 6.1.5 Second exemple, plus petit (à refaire à la main)

p = 11, q = 13 → n = **143**, φ = 10 × 12 = **120**. On choisit **e = 7** (pgcd(7, 120) = 1). On cherche d tel que 7d ≡ 1 (mod 120) : **d = 103** (7 × 103 = 721 = 6 × 120 + 1).

Chiffrer **m = 9** : c = 9⁷ mod 143 = **48**. Déchiffrer : 48¹⁰³ mod 143 = **9** ✔.

Détail du chiffrement : 9² = 81 ; 9⁴ = 81² = 6561 = 45 × 143 + 126 → 126 ; 9⁷ = 9⁴ × 9² × 9 = 126 × 81 × 9 mod 143 → 126 × 81 = 10206 = 71 × 143 + 53 → 53 ; 53 × 9 = 477 = 3 × 143 + 48 → **48**.

## 6.1.6 Signer avec RSA

RSA fonctionne dans les deux sens : ce que la clé publique chiffre, la clé privée le déchiffre **et inversement**.

- **Signer** : s = hᵈ mod n, où h est l'**empreinte** du message (on signe le haché, pas le message). Seul le détenteur de d peut le faire.
- **Vérifier** : sᵉ mod n doit redonner h.

Avec l'exemple précédent : h = 65 → s = 65²⁷⁵³ mod 3233 = **588**. Vérification : 588¹⁷ mod 3233 = **65** ✔.

:::attention « Signer » n'est pas « chiffrer avec la clé privée »
On dit parfois que la signature « chiffre avec la clé privée ». C'est une **image** valable pour RSA, mais le résultat n'assure **pas la confidentialité** (tout le monde dispose de la clé publique et peut le déchiffrer). Et d'autres schémas (DSA, ECDSA) ne fonctionnent pas du tout ainsi.
:::

## 6.1.7 Tailles de clés et sécurité

La sécurité repose sur la **difficulté de factoriser n**. Les meilleurs algorithmes (crible général des corps de nombres) ont une complexité sous-exponentielle.

| Niveau de sécurité | RSA (taille de n) | ECC (taille de clé) |
|---|---|---|
| 112 bits | **2048 bits** (minimum actuel) | 224 bits |
| 128 bits | **3072 bits** | **256 bits** |
| 192 bits | 7680 bits | 384 bits |
| 256 bits | 15360 bits | 521 bits |

Records : le nombre **RSA-250** (829 bits) a été factorisé en 2020. Les clés de 512 bits tombent en quelques heures. **1024 bits est déconseillé**, 2048 est le minimum.

## 6.1.8 Utilisation pratique et pièges

- **Ne jamais chiffrer sans bourrage** : le « RSA scolaire » (mᵉ mod n direct) est **déterministe** et malléable. On utilise **OAEP** (chiffrement) et **PSS** (signature).
- RSA est **lent** et limité en taille (m < n) : on l'emploie pour **chiffrer une clé de session** AES (chiffrement hybride), pas pour de gros fichiers.
- **Choix des premiers** : p et q doivent être **aléatoires, grands, et éloignés** ; des générateurs faibles ont produit des clés factorisables (clés partageant un facteur).
- **Exposant e** : 65537 (2¹⁶ + 1) est un bon compromis (rapide, sûr).
- **Attaque quantique** : l'algorithme de **Shor** factorise en temps polynomial sur un ordinateur quantique suffisamment grand (voir chapitre 10).
- Génération de clés avec OpenSSL :

```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out cle_privee.pem
openssl pkey -in cle_privee.pem -pubout -out cle_publique.pem
openssl pkey -in cle_privee.pem -text -noout   # affiche n, e, d, p, q
```

:::retenir La méthode en 5 lignes
**p, q** premiers → **n = pq** → **φ = (p−1)(q−1)** → choisir **e** avec pgcd(e, φ) = 1 → **d = e⁻¹ mod φ**. Chiffrer : **c = mᵉ mod n**. Déchiffrer : **m = cᵈ mod n**.
:::

:::examen Exercice type (corrigé ci-dessus)
« Soit p = 11, q = 13, e = 7. Calculez n, φ(n), d, puis chiffrez m = 9 et déchiffrez le résultat. »
Réponse : n = 143, φ = 120, d = 103, c = 48, déchiffré = 9.
:::
