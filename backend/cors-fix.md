# Correction des Erreurs CORS

## Problème
Le frontend (port 3000/5173) ne peut pas communiquer avec le backend (port 4000) à cause des erreurs CORS.

## Solutions

### 1. Vérifier le fichier .env
Assurez-vous que le fichier `.env` contient :
```bash
FRONTEND_URL=http://localhost:3000
```

### 2. Redémarrer les services
```bash
# Backend
cd backend
npm run start:dev

# Frontend
cd frontend  
npm run dev
```

### 3. Configuration CORS améliorée
La configuration dans `main.ts` a été améliorée avec :
- Support pour multiple ports (3000, 5173)
- `preflightContinue: true`
- `optionsSuccessStatus: 204`

### 4. Vérifier les ports
```bash
# Vérifier les ports utilisés
netstat -tulpn | grep :3000
netstat -tulpn | grep :4000
netstat -tulpn | grep :5173
```

### 5. Solution alternative
Si le problème persiste, utiliser un proxy dans `vite.config.ts` :

```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
```

### 6. Configuration navigateur
Ajouter des extensions CORS si nécessaire pour le développement.

## Diagnostic
Les logs montrent :
- ✅ Token JWT présent
- ✅ Rôle super_admin détecté
- ⚠️ Tenant ID null (normal pour super admin)
- ❌ Requêtes bloquées par CORS

## Actions Recommandées
1. Créer/copier le fichier `.env`
2. Redémarrer les deux services
3. Vérifier la communication API
4. Tester les endpoints super admin
