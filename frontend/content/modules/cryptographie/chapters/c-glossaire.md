## C.1 Glossaire

| Terme | Définition |
|---|---|
| **AC / CA** | autorité de certification, signe les certificats |
| **AEAD** | chiffrement authentifié (GCM, ChaCha20-Poly1305) |
| **AES** | standard de chiffrement par blocs de 128 bits (clés 128/192/256) |
| **Authenticité** | l'origine est bien celle annoncée |
| **Avalanche** | 1 bit changé en entrée change environ la moitié de la sortie |
| **CIA** | confidentialité, intégrité, disponibilité |
| **Cryptanalyse** | casser un chiffrement sans la clé |
| **CRL / OCSP** | liste / protocole de statut de révocation |
| **CSR** | demande de signature de certificat |
| **Diffie-Hellman** | échange de clé sur canal public |
| **ECC** | cryptographie sur courbes elliptiques |
| **Enveloppe numérique** | clé de session chiffrée par RSA + message chiffré en AES |
| **Hachage** | empreinte de taille fixe à sens unique |
| **HMAC** | MAC construit sur une fonction de hachage |
| **IV / nonce** | valeur d'initialisation, non secrète, à ne pas réutiliser |
| **Kerckhoffs** | la sécurité ne repose que sur le secret de la clé |
| **MAC** | code d'authentification de message (clé secrète) |
| **MITM** | homme du milieu |
| **Non-répudiation** | impossibilité de nier une action |
| **PFS** | confidentialité persistante |
| **PKI** | infrastructure de gestion de clés |
| **RSA** | cryptosystème asymétrique fondé sur la factorisation |
| **Sel** | valeur aléatoire ajoutée avant hachage d'un mot de passe |
| **Signature** | hachage + clé privée, vérifiée par clé publique |
| **TLS** | protocole de sécurisation du transport |
| **X.509** | format des certificats |
| **Zero Trust** | ne jamais faire confiance par défaut |

## C.2 Corrections apportées au support d'origine

| Point | Support | Correction dans ce cours |
|---|---|---|
| Nombre de clés symétriques pour n personnes | formule inexacte | **n(n−1)/2** clés (contre 2n clés asymétriques) |
| ECC et quantique | présentée comme résistante | **cassée par Shor** (PQC nécessaire) |
| IPsec | tunnel/transport confondus avec AH/ESP | deux axes indépendants (9.1.2) |
| HMAC | formule simplifiée | HMAC réel de la **RFC 2104** (ipad/opad) |
| « Chiffrer avec la clé privée » | exemple de chiffrement | c'est une **signature** : pas de confidentialité |
| Blockchain | affirmations excessives | intégrité de l'historique, pas véracité des données |
| 5 étapes de sécurisation | non détaillées | cadre NIST CSF, à confirmer avec l'enseignant |
| Président de l'APDP | nom incertain | à vérifier avant l'examen |
