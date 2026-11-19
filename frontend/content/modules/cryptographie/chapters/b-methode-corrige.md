## B.1 Méthode pour l'examen

1. **Lisez tout le sujet** (2 h) et répartissez le temps selon les points.
2. **Définition → principe → schéma → exemple/limite** : c'est la structure d'une bonne réponse.
3. **Dessinez** : enveloppe numérique, génération de certificat, handshake, HMAC : un schéma propre rapporte beaucoup.
4. Pour les **calculs** (RSA, Diffie-Hellman, Euclide, CRT) : posez les formules, détaillez chaque étape, **vérifiez** en déchiffrant.
5. Pour les **commandes** : dites ce que fait chaque partie (`echo -n`, le tube `|`, la fonction, l'option).
6. Relisez : unités, noms propres, vocabulaire exact (*confidentialité*, *intégrité*, *non-répudiation*).

## B.2 Corrigé commenté du rattrapage 2022-2023 (3ᵉ année IG, 2 h)

**1. Qu'est-ce que la cryptologie ?** Science du secret regroupant la **cryptographie** (conception de procédés pour protéger l'information : chiffrement, signature, hachage) et la **cryptanalyse** (étude des moyens de casser ces procédés sans la clé). → chapitre 2.1.

**2. Quelle organisation est chargée de la cryptologie au Bénin ?** Le cadre repose sur la **Commission nationale de cryptologie** et l'**ANSSI-Bénin** (Agence nationale de la sécurité des systèmes d'information), dans le cadre du Code du numérique. À confirmer avec le texte vu en cours. → chapitre 1.2.

**3. Procédure de production d'un HMAC.** Clé K complétée à la taille du bloc ; K⊕ipad (0x36 répété) concaténée au message, hachée ; K⊕opad (0x5c répété) concaténée au résultat, hachée : **HMAC = H((K⊕opad) ∥ H((K⊕ipad) ∥ M))**. → chapitre 7.2.

**4. Certificat à clé publique et procédure de génération.** Définition (lie clé publique et identité, signé par une AC, format X.509) + schéma : clés → CSR → vérification AE → signature par l'AC → publication. → chapitre 8.1.4.

**5. Enveloppe numérique.** Schéma : message chiffré par une **clé de session symétrique** ; clé de session chiffrée par la **clé publique** du destinataire ; envoi des deux ; le destinataire déchiffre la clé avec sa clé privée, puis le message. → chapitre 6.3.

**6. Virus et phases.** Programme qui se réplique en infectant un hôte ; phases **dormante, propagation, déclenchement, action**. → 9.4.3.

**7. Quatre limites d'un pare-feu.** Menaces internes ; trafic contournant le pare-feu ; contenu malveillant/chiffré ; attaques sur les services autorisés ; dépendance à la configuration. → 9.1.4.

**8. APDP.** *Autorité de protection des données personnelles* : régulateur des traitements de données personnelles (conseil, contrôle, sanction, déclarations, droits des personnes). Le nom du président doit être **vérifié avant l'examen** (source web : Me Luciano Hounkponou, à confirmer).

**9. Cinq étapes de la sécurisation des données.** NIST : identifier, protéger, détecter, répondre, récupérer (ou la liste donnée par votre enseignant). → 9.4.8.

**10 (AIP). a)** Homomorphe : calcul sur données chiffrées sans déchiffrer, deux applications (cloud médical, vote électronique/analyse financière). **b)** Zero-Trust : ne jamais faire confiance, toujours vérifier (MFA, moindre privilège, micro-segmentation), nécessaire car le périmètre n'existe plus (cloud, télétravail, menaces internes). **c)** XSS et **d)** SQLi : définitions et tests manuels (9.4.5, 9.4.6).

**10 (ARI). a)** Faiblesses du filtrage de paquets : sans état, pas de contenu, usurpation d'IP, fragmentation ; attaques non bloquées : DoS/DDoS, XSS/SQLi, hameçonnage. **b)** Calcule le **SHA-256** de « Excellente composition à toi » (sans retour à la ligne) : `b5ca70c57a87800b500d637eb822e806e763a9ff6dc1747c764628f4c85819de`. **c)** Calcule le **HMAC-SHA256** du fichier `eneam.txt` avec la clé hexadécimale donnée (20 octets). **d)** `-sT` : scan TCP connect (connexion complète). **e)** `-sS` : scan SYN (semi-ouvert, plus discret, root).
