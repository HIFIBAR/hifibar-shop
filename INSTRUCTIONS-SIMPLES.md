# 🎯 INSTRUCTIONS ULTRA-SIMPLES

## Vous avez dit : "je peux utiliser cloud de hostinger pour ton site?"

### ✅ **RÉPONSE : OUI, ABSOLUMENT !**

Hostinger Cloud supporte parfaitement votre site Next.js.

---

## 🚀 CE QU'IL FAUT FAIRE MAINTENANT

### **MÉTHODE FACILE (avec File Manager)**

#### 1. Préparez les fichiers sur votre ordinateur

- Téléchargez TOUT le projet
- Supprimez les dossiers : `node_modules`, `.next`, `.git` (si présents)
- Compressez tout en un fichier `.zip`

#### 2. Dans Hostinger hPanel

**a) Créer l'application Node.js**

```
Allez dans : Advanced → Node.js
Cliquez : Create Application
Remplissez :
  - Application Root: /domains/hifibar.eu/public_html
  - Application URL: hifibar.eu
  - Node.js Version: 18 ou 20 (prenez la plus récente)
  - Startup File: server.js
Cliquez : Create
```

**b) Uploader les fichiers**

```
Allez dans : Files → File Manager
Naviguez vers : /domains/hifibar.eu/public_html
Uploadez votre fichier .zip
Clic droit sur le .zip → Extract
Supprimez le .zip après extraction
```

**c) Ajouter les variables d'environnement**

```
Allez dans : Node.js → Votre Application → Environment Variables
Ajoutez ces 4 variables (copiez-collez exactement) :

Nom: NEXT_PUBLIC_SUPABASE_URL
Valeur: https://anjfqclowjfbhqseetyr.supabase.co

Nom: NEXT_PUBLIC_SUPABASE_ANON_KEY
Valeur: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuamZxY2xvd2pmYmhxc2VldHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDM2ODksImV4cCI6MjA3ODYxOTY4OX0.0ynu8IH9AppuT8wBdGC9fumUo4vpeM_zQQeaz_LPrAo

Nom: NODE_ENV
Valeur: production

Nom: PORT
Valeur: 3000
```

**d) Installer et builder via SSH**

```
Allez dans : Advanced → SSH Access
Activez l'accès SSH
Copiez les identifiants de connexion

Ouvrez un terminal (ou PuTTY sur Windows)
Connectez-vous avec les identifiants fournis

Une fois connecté, tapez ces commandes :
cd domains/hifibar.eu/public_html
npm install
npm run build
```

Attendez que ça se termine (2-5 minutes).

**e) Démarrer l'application**

```
Retournez dans : hPanel → Node.js → Votre Application
Cliquez sur le bouton : Start Application
Attendez 10-20 secondes
Le statut doit afficher : Running ✅
```

#### 3. C'est terminé !

Visitez **https://www.hifibar.eu** dans votre navigateur.

Votre site est en ligne ! 🎉

---

## 📝 NOTES IMPORTANTES

- **Temps total** : 20-30 minutes
- **Coût** : Inclus dans votre plan Hostinger Cloud (pas de frais supplémentaires)
- **Mises à jour** : Uploadez les nouveaux fichiers et refaites `npm run build`

---

## 🆘 SI ÇA NE MARCHE PAS

### Le site affiche "502 Bad Gateway"
→ L'application n'est pas démarrée. Allez dans hPanel → Node.js → Start Application

### Le site est vide ou erreurs
→ Vérifiez que les 4 variables d'environnement sont bien ajoutées
→ Refaites `npm run build` via SSH

### Erreur lors du build
→ Assurez-vous que Node.js 18 ou 20 est installé
→ Réessayez : `npm install` puis `npm run build`

### Besoin d'aide ?
→ Consultez les logs : hPanel → Node.js → Logs
→ Lisez le guide complet : HOSTINGER_CLOUD_GUIDE.md

---

## ✅ RÉCAPITULATIF

1. ✅ Créer app Node.js dans hPanel
2. ✅ Uploader les fichiers
3. ✅ Ajouter les 4 variables d'environnement
4. ✅ Via SSH : `npm install` + `npm run build`
5. ✅ Start Application dans hPanel
6. ✅ Visiter www.hifibar.eu

**VOTRE SITE EST PRÊT POUR HOSTINGER CLOUD !** 🚀
