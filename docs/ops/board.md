# Chilenos Young App - Board

> Progreso del proyecto y backlog de tareas

---

## LEGEND

- 🟢 **DONE** - Completado
- 🔵 **DOING** - En progreso (max 2)
- ⚪ **TODO** - Pendiente

---

## 🟢 DONE

### 2026-02-01

- [x] **Documentación completa del schema de base de datos**
  - Extraído schema de Drizzle/MySQL (`drizzle/schema.ts`)
  - Documentado en `docs/database-schema.md`:
    - 14 tablas con campos detallados
    - Primary keys, Foreign keys, índices
    - 4 enums identificados
    - Diagrama ASCII de relaciones
  - Generado script SQL PostgreSQL para Supabase (`docs/schema-postgresql.sql`):
    - CREATE TYPE para enums
    - CREATE TABLE con tipos convertidos
    - CONSTRAINTS, INDEXES
    - Vistas útiles incluidas
    - Triggers para updatedAt
    - RLS habilitado (policies de ejemplo)

---

## 🔵 DOING

*(Max 2 tareas en progreso)*

---

## ⚪ TODO

---

## NEXT STEPS

1. Revisar documentación generada (`docs/database-schema.md`)
2. Validar script SQL (`docs/schema-postgresql.sql`)
3. Configurar proyecto Supabase
4. Ejecutar migración a Supabase PostgreSQL
5. Actualizar Drizzle ORM para usar PostgreSQL
6. Pruebas de integración con Supabase

## RECENTLY COMPLETED

- [x] **Deploy completo a Vercel con fixes**
  - Migración MySQL→PostgreSQL adaptada
  - Fix: vercel.json rewrites correctos
  - Fix: OAuth env vars robusto
  - Fix: serverless export compatible
  - Sitio online: https://chilenos-young.vercel.app
  - Documentado lecciones en `docs/ops/DEPLOY_LESSONS.md`

---

**Last Updated:** 2026-02-01
