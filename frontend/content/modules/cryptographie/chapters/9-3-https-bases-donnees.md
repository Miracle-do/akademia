Protéger **les données en transit** (HTTPS) et **au repos** (bases de données, disques) est l'application la plus concrète de la cryptographie dans un système d'information.

## 9.3.1 HTTPS : sécuriser le web

**HTTPS = HTTP + TLS** (port 443). Il garantit que le trafic entre navigateur et serveur est **chiffré, intègre et que le serveur est authentifié**.

**Migrer un site vers HTTPS**

1. Générer une **paire de clés** et une **CSR** ;
2. obtenir un **certificat** auprès d'une AC (Let's Encrypt est gratuit, automatisé par ACME) ;
3. installer le certificat et la **chaîne intermédiaire** sur le serveur ;
4. configurer TLS 1.2/1.3 et des suites modernes ;
5. **rediriger** tout HTTP vers HTTPS (301) et activer **HSTS** ;
6. corriger le **contenu mixte** (ressources en http) ;
7. **renouveler** avant expiration (automatiser).

HTTPS protège le **transport**, pas le serveur : un site HTTPS peut être piraté ou frauduleux (le cadenas ne prouve pas l'honnêteté).

## 9.3.2 Chiffrer les données au repos

Le chiffrement peut s'appliquer à plusieurs **niveaux** :

| Niveau | Principe | Protège contre |
|---|---|---|
| **Disque / volume** | BitLocker (Windows), **LUKS** (Linux), FileVault | vol de l'appareil, du disque |
| **Fichier / dossier** | chiffrement par fichier (GnuPG, EFS) | accès non autorisé aux fichiers |
| **Base de données (TDE)** | *Transparent Data Encryption* : fichiers de la base chiffrés | vol des fichiers de données, des sauvegardes |
| **Colonne / champ** | chiffrement de données sensibles (carte, pièce d'identité) | administrateur curieux, injection SQL partielle |
| **Application** | l'application chiffre avant d'écrire en base | compromission de la base elle-même |
| **De bout en bout (client)** | seul l'utilisateur détient la clé | le fournisseur lui-même |
| **Proxy de chiffrement** | un composant intermédiaire chiffre/déchiffre | applications non modifiables |

:::attention La clé fait toute la sécurité
Stocker la clé **à côté** des données chiffrées annule le bénéfice. Utiliser un **gestionnaire de clés** (HSM, KMS), séparer les rôles, faire **tourner** les clés, sauvegarder la clé **séparément**. Perdre la clé = perdre les données.
:::

## 9.3.3 Menaces sur les bases de données

- **Externes** : injection SQL, vol d'identifiants, exploitation de vulnérabilités, ransomware, DDoS ;
- **Internes** : administrateur ou employé malveillant ou négligent, comptes à privilèges excessifs, erreurs de configuration, sauvegardes non protégées.

**Mesures** : moindre privilège, **requêtes paramétrées**, journalisation et audit, chiffrement (repos et transit), mots de passe **salés et hachés** (chapitre 7.3), sauvegardes chiffrées testées, pseudonymisation des données de test.

:::retenir
**Transit → TLS. Repos → disque/TDE/colonne. Mots de passe → hachage lent salé. Clés → coffre séparé.**
:::

:::examen Questions fréquentes
- Les étapes de migration vers HTTPS. Les niveaux de chiffrement d'une base de données.
- Différence entre menaces internes et externes sur une base de données.
:::
