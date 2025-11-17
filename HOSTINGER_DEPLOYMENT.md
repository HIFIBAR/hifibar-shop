# DÉPLOIEMENT SUR HOSTINGER (www.hifibar.eu)

## PRÉREQUIS
- Plan Hostinger Business ou Cloud (nécessaire pour Node.js)
- Accès au hPanel Hostinger
- Domaine hifibar.eu configuré

---

## MÉTHODE 1 : APPLICATION NODE.JS (Recommandé)

### Étape 1 : Activer Node.js dans hPanel

1. Connectez-vous à votre hPanel Hostinger
2. Allez dans **Advanced → Node.js**
3. Cliquez **Create Application**
4. Configurez :
   - **Application Root** : /public_html/hifibar
   - **Application URL** : hifibar.eu
   - **Node.js Version** : 18.x ou supérieur
   - **Application Mode** : Production

### Étape 2 : Télécharger les fichiers

**Via Git (Recommandé) :**
1. Dans hPanel, allez dans **Files → Git**
2. Clonez votre repository
3. OU utilisez SSH :
   ```bash
   cd /home/[votre-user]/domains/hifibar.eu/public_html
   git clone [votre-repo-url] .
   ```

**Via File Manager :**
1. Compressez tous les fichiers du projet en .zip
2. Uploadez via File Manager
3. Extrayez dans le dossier de l'application

### Étape 3 : Configurer les variables d'environnement

Dans **Node.js → Your Application → Environment Variables**, ajoutez :

```
NEXT_PUBLIC_SUPABASE_URL=https://anjfqclowjfbhqseetyr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFuamZxY2xvd2pmYmhxc2VldHlyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwNDM2ODksImV4cCI6MjA3ODYxOTY4OX0.0ynu8IH9AppuT8wBdGC9fumUo4vpeM_zQQeaz_LPrAo
NODE_ENV=production
```

### Étape 4 : Installer et Builder

Via SSH ou Terminal Hostinger :
```bash
npm install
npm run build
```

### Étape 5 : Configurer le démarrage

Dans **Node.js → Application Settings** :
- **Application Startup File** : `node_modules/next/dist/bin/next`
- **Arguments** : `start -p 3000`

OU créez un fichier `server.js` :
```javascript
const { createServer } = require('http')
const { parse } = require('url')
const next = require('next')

const dev = process.env.NODE_ENV !== 'production'
const hostname = 'localhost'
const port = process.env.PORT || 3000

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error('Error occurred handling', req.url, err)
      res.statusCode = 500
      res.end('internal server error')
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})
```

Puis configurez :
- **Application Startup File** : `server.js`

### Étape 6 : Démarrer l'application

Dans hPanel, cliquez **Start Application**

---

## MÉTHODE 2 : EXPORT STATIQUE (Limité)

⚠️ **ATTENTION** : Cette méthode NE SUPPORTE PAS :
- Les routes API
- Les pages dynamiques `/produits/[id]`
- Les fonctions serverless

Si votre plan Hostinger ne supporte pas Node.js, utilisez cette méthode limitée :

### Configuration pour export statique

Modifiez `next.config.js` et supprimez toutes les routes API et pages dynamiques.

---

## DÉPANNAGE

### L'application ne démarre pas
- Vérifiez les logs dans Node.js → Application Logs
- Assurez-vous que Node.js 18+ est installé
- Vérifiez que `npm run build` fonctionne sans erreur

### Erreur 502 Bad Gateway
- L'application Node.js n'est pas démarrée
- Le port est incorrect
- Vérifiez Application Logs

### Variables d'environnement non chargées
- Redémarrez l'application après avoir ajouté les variables
- Vérifiez qu'elles sont bien dans Environment Variables

### Site accessible uniquement via IP
- Configurez le domaine dans **Domains → Point Domain**
- Assurez-vous que les DNS pointent vers Hostinger

---

## ALTERNATIVE : UTILISER VERCEL (Plus Simple)

Si Hostinger ne supporte pas Node.js sur votre plan :

1. Déployez sur Vercel (gratuit) : vercel.com
2. Dans Hostinger DNS, ajoutez un CNAME :
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```
3. Dans Vercel, ajoutez le domaine hifibar.eu

C'est plus simple et gratuit !
