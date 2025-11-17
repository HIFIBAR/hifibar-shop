# GUIDE COMPLET : DÉPLOIEMENT SUR HOSTINGER CLOUD

## ✅ VOTRE PLAN HOSTINGER CLOUD EST PARFAIT POUR CE SITE

---

## ÉTAPE 1 : CONFIGURER NODE.JS DANS hPANEL

1. Connectez-vous à votre **hPanel Hostinger**
2. Allez dans **Advanced → Node.js** (ou "Applications Node.js")
3. Cliquez sur **"Create Application"**

### Configuration de l'application :

```
Application Root: /home/[votre-user]/domains/hifibar.eu/public_html
Application URL: https://hifibar.eu (ou www.hifibar.eu)
Node.js Version: 18.x ou 20.x (choisissez la plus récente disponible)
Application Mode: Production
Application Startup File: server.js
```

---

## ÉTAPE 2 : UPLOADER LES FICHIERS

### OPTION A : Via Git (Recommandé)

1. Dans hPanel, allez dans **Advanced → SSH Access**
2. Activez l'accès SSH
3. Connectez-vous via SSH :
   ```bash
   ssh u123456789@your-server-ip
   ```

4. Allez dans le dossier de votre domaine :
   ```bash
   cd domains/hifibar.eu/public_html
   ```

5. Clonez votre repository :
   ```bash
   git clone [URL-de-votre-repo] .
   ```

### OPTION B : Via File Manager

1. Sur votre ordinateur, compressez **TOUS** les fichiers du projet en .zip
   - Incluez : tous les dossiers (app, components, lib, etc.)
   - Incluez : package.json, next.config.js, server.js, etc.
   - **N'incluez PAS** : node_modules, .next, .git

2. Dans hPanel, allez dans **Files → File Manager**

3. Naviguez vers : `/domains/hifibar.eu/public_html`

4. Uploadez le fichier .zip

5. Clic droit → **Extract**

---

## ÉTAPE 3 : CONFIGURER LES VARIABLES D'ENVIRONNEMENT

Dans hPanel, allez dans **Node.js → Votre Application → Environment Variables**

Ajoutez ces variables :

```
NEXT_PUBLIC_SUPABASE_URL=https://anjfqclowjfbhqseetyr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuamZxY2xvd2pmYmhxc2VldHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDM2ODksImV4cCI6MjA3ODYxOTY4OX0.0ynu8IH9AppuT8wBdGC9fumUo4vpeM_zQQeaz_LPrAo
NODE_ENV=production
PORT=3000
```

**Important** : Cliquez sur **Save** après chaque variable !

---

## ÉTAPE 4 : INSTALLER ET BUILDER VIA SSH

1. Connectez-vous via SSH (voir Étape 2, Option A)

2. Allez dans le dossier :
   ```bash
   cd domains/hifibar.eu/public_html
   ```

3. Installez les dépendances :
   ```bash
   npm install
   ```
   (Cela peut prendre 2-5 minutes)

4. Buildez le site :
   ```bash
   npm run build
   ```
   (Cela peut prendre 1-3 minutes)

---

## ÉTAPE 5 : DÉMARRER L'APPLICATION

1. Retournez dans hPanel → **Node.js → Votre Application**

2. Vérifiez la configuration :
   - **Application Startup File** : `server.js`
   - **Port** : 3000

3. Cliquez sur **"Start Application"** (bouton vert)

4. Attendez 10-20 secondes

5. Le statut devrait passer à **"Running"** ✅

---

## ÉTAPE 6 : CONFIGURER LE DOMAINE

### Si hifibar.eu est déjà sur Hostinger :

1. Allez dans **Domains → hifibar.eu**
2. Vérifiez que le domaine pointe vers votre application Node.js
3. Le site devrait être accessible sur **https://www.hifibar.eu**

### Si le domaine est ailleurs :

1. Changez les DNS (chez votre registrar) pour pointer vers Hostinger :
   ```
   NS1: ns1.dns-parking.com
   NS2: ns2.dns-parking.com
   ```
   (Ou utilisez les nameservers fournis par Hostinger)

2. Attendez 24-48h pour la propagation DNS

---

## VÉRIFICATION

Visitez **https://www.hifibar.eu** ou **https://hifibar.eu**

Vous devriez voir votre site fonctionner ! 🎉

---

## DÉPANNAGE

### ❌ L'application ne démarre pas

**Vérifiez les logs :**
- hPanel → Node.js → Votre Application → **Logs**
- Cherchez les erreurs

**Solutions courantes :**
```bash
# Refaire le build
cd domains/hifibar.eu/public_html
npm run build

# Vérifier que server.js existe
ls -la server.js

# Redémarrer l'application
# Via hPanel : Stop → Start
```

### ❌ Erreur "Module not found"

```bash
# Réinstaller les dépendances
cd domains/hifibar.eu/public_html
rm -rf node_modules
npm install
npm run build
```

### ❌ Site inaccessible (502 Bad Gateway)

- L'application n'est pas démarrée → Vérifiez dans hPanel
- Le port est incorrect → Doit être 3000
- Redémarrez l'application

### ❌ "Cannot find module 'next'"

```bash
# Next.js n'est pas installé
npm install next react react-dom
npm run build
```

### ❌ Variables d'environnement non chargées

- Redémarrez l'application après avoir ajouté les variables
- Vérifiez qu'il n'y a pas d'espaces dans les noms/valeurs

---

## MISES À JOUR FUTURES

Pour mettre à jour votre site :

### Via Git :
```bash
ssh u123456789@your-server-ip
cd domains/hifibar.eu/public_html
git pull
npm install  # Si nouveaux packages
npm run build
```

Puis redémarrez l'application dans hPanel.

### Via File Manager :
1. Uploadez les nouveaux fichiers
2. Rebuildez via SSH : `npm run build`
3. Redémarrez l'application

---

## PERFORMANCES

Pour optimiser sur Hostinger Cloud :

1. **Activez le Cache** dans hPanel
2. **Utilisez Cloudflare** (gratuit) pour le CDN
3. **Compressez les images** avant upload
4. **Activez HTTPS** (Let's Encrypt gratuit via hPanel)

---

## SUPPORT

- Documentation Hostinger : https://support.hostinger.com
- Support Supabase : https://supabase.com/docs
- En cas de problème, vérifiez d'abord les **Logs de l'application**

---

## RÉSUMÉ DES COMMANDES SSH

```bash
# Connexion
ssh u123456789@your-server-ip

# Navigation
cd domains/hifibar.eu/public_html

# Installation
npm install

# Build
npm run build

# Vérifier les fichiers
ls -la

# Voir les logs
tail -f logs/app.log  # Si disponible
```

---

✅ **Votre site est maintenant prêt à être déployé sur Hostinger Cloud !**
