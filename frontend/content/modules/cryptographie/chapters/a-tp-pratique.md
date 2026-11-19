Ces travaux pratiques reprennent les outils du cours. Toutes les commandes ont été essayées sur OpenSSL 3.x. Travaillez dans un **dossier de test**, jamais sur des clés réelles.

## A.1 Hachage et intégrité

```bash
echo "Bonjour" > f.txt
sha256sum f.txt                       # empreinte
echo "bonjour" > f2.txt && sha256sum f2.txt   # un caractère change : empreinte totalement différente
printf '%s' "abc" | openssl sha256    # ba7816bf...15ad
```

**À observer** : l'effet d'avalanche ; `sha256sum -c fichier.sha256` pour vérifier un téléchargement.

## A.2 Chiffrement symétrique

```bash
openssl enc -aes-256-cbc -pbkdf2 -iter 100000 -salt -in secret.txt -out secret.enc
openssl enc -d -aes-256-cbc -pbkdf2 -iter 100000 -in secret.enc -out secret.dec
diff secret.txt secret.dec && echo identique
```

Relancez deux fois le chiffrement : les sorties **diffèrent** (sel aléatoire).

## A.3 Paire de clés RSA, chiffrement et signature

```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out cle_privee.pem
openssl pkey -in cle_privee.pem -pubout -out cle_publique.pem
openssl pkeyutl -encrypt -pubin -inkey cle_publique.pem -pkeyopt rsa_padding_mode:oaep -in court.txt -out court.enc
openssl pkeyutl -decrypt -inkey cle_privee.pem -pkeyopt rsa_padding_mode:oaep -in court.enc
openssl dgst -sha256 -sign cle_privee.pem -out sig.bin document.txt
openssl dgst -sha256 -verify cle_publique.pem -signature sig.bin document.txt   # Verified OK
```

Modifiez `document.txt` et revérifiez : **Verification failure**. RSA ne chiffre que de petits messages (taille de clé moins le bourrage) : pour un gros fichier, utilisez l'**enveloppe** (clé AES chiffrée par RSA).

## A.4 Enveloppe numérique à la main

```bash
openssl rand -hex 32 > cle_session.hex
openssl enc -aes-256-cbc -pbkdf2 -pass file:cle_session.hex -in gros.txt -out gros.enc
openssl pkeyutl -encrypt -pubin -inkey cle_publique.pem -pkeyopt rsa_padding_mode:oaep -in cle_session.hex -out cle_session.enc
# Envoi : gros.enc + cle_session.enc
openssl pkeyutl -decrypt -inkey cle_privee.pem -pkeyopt rsa_padding_mode:oaep -in cle_session.enc -out cle_recue.hex
openssl enc -d -aes-256-cbc -pbkdf2 -pass file:cle_recue.hex -in gros.enc
```

## A.5 HMAC

```bash
openssl mac -digest SHA256 -macopt hexkey:000102030405060708090A0B0C0D0E0F10111214 -in eneam.txt HMAC
```

Sans la clé, impossible de produire un HMAC valide ; modifiez le fichier ou la clé : le HMAC change.

## A.6 Mini-PKI et analyse de certificat

Voir les commandes du chapitre 8.1.8 (AC auto-signée, CSR, certificat signé, `openssl verify`) et l'analyse d'un site :

```bash
openssl s_client -connect www.exemple.com:443 -servername www.exemple.com </dev/null | openssl x509 -noout -subject -issuer -dates
```

## A.7 GnuPG (OpenPGP)

```bash
gpg --full-generate-key                 # RSA 3072+ ou ECC (ed25519)
gpg --armor --export mon@mail > pub.asc # clé publique à partager
gpg --encrypt --armor -r destinataire@mail fichier.txt
gpg --decrypt fichier.txt.asc
gpg --armor --detach-sign fichier.txt   # signature
gpg --verify fichier.txt.asc fichier.txt
gpg --fingerprint mon@mail              # à vérifier par un second canal (confiance)
```

## A.8 Authentification SSH par clé (PuTTY / OpenSSH)

```bash
ssh-keygen -t ed25519 -C "moi@eneam"     # crée id_ed25519 (privée) et id_ed25519.pub
ssh-copy-id utilisateur@serveur          # dépose la clé publique
```

Sous Windows, **PuTTYgen** génère la paire (clé publique collée dans `authorized_keys`, clé privée `.ppk` protégée par une **passphrase**) ; **Pageant** garde la clé en mémoire. Vérifiez l'**empreinte** du serveur à la première connexion (protège contre le MITM).

## A.9 Scan de ports (réseau de test uniquement)

```bash
nmap -sT 127.0.0.1
sudo nmap -sS 127.0.0.1
```

:::attention Cadre légal
Scanner, tester des injections ou intercepter du trafic sur un système **sans autorisation écrite** est une infraction (Code du numérique béninois). Utilisez votre propre machine ou un laboratoire dédié.
:::
