# Configuración de Cron Externo (Gratis)

Como Vercel requiere plan de pago para usar crons, usamos servicios externos gratuitos.

## Opción Recomendada: cron-job.org

### 1. Configurar Variable de Entorno en Vercel

Ve a tu proyecto en Vercel → Settings → Environment Variables y añade:

```
CRON_SECRET=tu-secreto-aleatorio-aqui
```

> Genera un secreto seguro con: `openssl rand -hex 32`

### 2. Crear cuenta en cron-job.org

1. Ir a https://cron-job.org/en/ y crear cuenta gratuita
2. Verificar email

### 3. Configurar los Cron Jobs

Necesitas crear estos cron jobs:

#### Cron 1: Auto-tracking (cada hora)
- **URL**: `https://www.keywordtracker.es/api/cron?action=auto-tracking&secret=TU_CRON_SECRET`
- **Schedule**: Every hour (0 * * * *)
- **Method**: GET

#### Cron 2: Sync pending checks (cada 5 minutos)
- **URL**: `https://www.keywordtracker.es/api/cron?action=sync&secret=TU_CRON_SECRET`
- **Schedule**: Every 5 minutes (*/5 * * * *)
- **Method**: GET

### 4. Verificar funcionamiento

Una vez configurados, puedes probar manualmente desde el navegador:
```
https://www.keywordtracker.es/api/cron?action=sync&secret=TU_CRON_SECRET
```

Deberías ver una respuesta JSON con `{ "success": true, ... }`

## Alternativas

### GitHub Actions (si el repo es público)
```yaml
# .github/workflows/cron.yml
name: Scheduled Cron
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
jobs:
  cron:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger sync
        run: |
          curl -X GET "https://www.keywordtracker.es/api/cron?action=sync&secret=${{ secrets.CRON_SECRET }}"
```

### UptimeRobot (gratis, mínimo 5 min)
1. Crear cuenta en uptimerobot.com
2. Add New Monitor → HTTP(s)
3. URL: `https://www.keywordtracker.es/api/cron?action=sync&secret=TU_SECRET`
4. Monitoring Interval: 5 minutes

## Notas de Seguridad

- El `CRON_SECRET` protege el endpoint de llamadas no autorizadas
- Sin el secreto correcto, el endpoint devuelve 401 Unauthorized
- El secreto se puede pasar como query param (`?secret=...`) o header (`Authorization: Bearer ...`)
