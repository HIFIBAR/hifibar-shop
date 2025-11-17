# 🚀 DÉPLOIEMENT RAPIDE SUR HOSTINGER CLOUD

## Votre site est prêt pour www.hifibar.eu

---

## 📋 CHECKLIST AVANT DE COMMENCER

- [ ] Compte Hostinger Cloud actif
- [ ] Domaine hifibar.eu configuré sur Hostinger
- [ ] Accès au hPanel Hostinger
- [ ] Tous les fichiers du projet prêts

---

## 🎯 DÉPLOIEMENT EN 6 ÉTAPES

### 1️⃣ CRÉER L'APPLICATION NODE.JS

Dans hPanel → **Advanced → Node.js** → **Create Application**

```
Application Root: /domains/hifibar.eu/public_html
Application URL: hifibar.eu
Node.js Version: 18.x ou 20.x
Application Mode: Production
Application Startup File: server.js
```

---

### 2️⃣ UPLOADER LES FICHIERS

**Méthode simple (File Manager) :**

1. Compressez TOUT le projet en .zip (sauf node_modules et .next)
2. hPanel → **Files → File Manager**
3. Allez dans `/domains/hifibar.eu/public_html`
4. Uploadez et extrayez le .zip

---

### 3️⃣ AJOUTER LES VARIABLES D'ENVIRONNEMENT

hPanel → **Node.js → Votre App → Environment Variables**

```
NEXT_PUBLIC_SUPABASE_URL=https://anjfqclowjfbhqseetyr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuamZxY2xvd2pmYmhxc2VldHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDM2ODksImV4cCI6MjA3ODYxOTY4OX0.0ynu8IH9AppuT8wBdGC9fumUo4vpeM_zQQeaz_LPrAo
NODE_ENV=production
PORT=3000
```

---

### 4️⃣ INSTALLER ET BUILDER (via SSH)

Dans hPanel → **Advanced → SSH Access** → Activez SSH

Connectez-vous :
```bash
ssh uXXXXXXXX@votre-serveur.com
cd domains/hifibar.eu/public_html
npm install
npm run build
```

**OU utilisez le script automatique :**
```bash
bash deploy-hostinger.sh
```

---

### 5️⃣ DÉMARRER L'APPLICATION

hPanel → **Node.js → Votre Application** → **Start Application** ✅

---

### 6️⃣ VÉRIFIER

Visitez **https://www.hifibar.eu** 🎉

---

## 📚 DOCUMENTATION COMPLÈTE

Pour les instructions détaillées, consultez :
- **HOSTINGER_CLOUD_GUIDE.md** - Guide complet avec dépannage

---

## 🆘 PROBLÈMES COURANTS

### L'application ne démarre pas
→ Vérifiez les logs dans hPanel → Node.js → Logs

### Erreur 502
→ L'application n'est pas démarrée, cliquez Start dans hPanel

### Site vide ou erreurs
→ Vérifiez que les variables d'environnement sont ajoutées
→ Refaites `npm run build`

---

## 🔄 METTRE À JOUR LE SITE

Via SSH :
```bash
cd domains/hifibar.eu/public_html
# Uploadez les nouveaux fichiers ou faites git pull
npm run build
```

Puis redémarrez l'app dans hPanel.

---

## ✅ VOTRE SITE INCLUT :

- ✅ Catalogue de produits avec base de données Supabase
- ✅ Système de panier
- ✅ Gestion des commandes
- ✅ Panel d'administration
- ✅ Import CSV de produits
- ✅ Calcul automatique des frais de port
- ✅ Synchronisation eBay
- ✅ Responsive design

---

**Besoin d'aide ?** Consultez HOSTINGER_CLOUD_GUIDE.md pour le guide complet.
