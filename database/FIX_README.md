# Fix para Error de Recursión Infinita en Supabase

## Problema
Error: `infinite recursion detected in policy for relation "profiles"`

## Causa
Las políticas RLS (Row Level Security) estaban verificando la tabla `profiles` desde dentro de las mismas políticas de `profiles`, creando un bucle infinito.

## Solución Aplicada

Se creó una función helper `is_admin()` con `SECURITY DEFINER` que verifica el rol del usuario sin trigger recursión de RLS.

## Cómo Aplicar el Fix

### Paso 1: Ir a Supabase Dashboard
1. Abre https://supabase.com/dashboard
2. Selecciona tu proyecto `cein-negocios`

### Paso 2: Abrir SQL Editor
1. En el menú lateral, click en **"SQL Editor"**
2. Click en **"New query"**

### Paso 3: Ejecutar el Script de Fix
1. Abre el archivo `fix_rls_policies.sql` (en esta misma carpeta)
2. Copia TODO el contenido del archivo
3. Pégalo en el editor SQL de Supabase
4. Click en **"Run"** o presiona `Ctrl+Enter`

### Paso 4: Verificar
1. El script mostrará una lista de todas las políticas al final
2. Recarga tu aplicación web
3. El error debe desaparecer

## Qué hace el script

1. **Elimina las políticas problemáticas** que causaban recursión
2. **Crea una función helper** `is_admin()` segura
3. **Recrea las políticas** usando la nueva función helper
4. **Verifica** que todo se creó correctamente

## Después del Fix

Una vez aplicado el fix:
- ✅ Las categorías se cargarán sin error
- ✅ Los cursos se mostrarán correctamente
- ✅ Los usuarios no admin podrán ver contenido público
- ✅ Los admins podrán gestionar todo el contenido

## Notas Importantes

- El script es **seguro** de ejecutar múltiples veces (usa `DROP POLICY IF EXISTS`)
- **NO** perderás ningún dato
- Solo se modifican las políticas de seguridad, no los datos

## Si el Error Persiste

1. Verifica que ejecutaste TODO el script
2. Revisa en "Database" > "Policies" que las nuevas políticas existan
3. Limpia la caché del navegador (`Ctrl+Shift+R`)
4. Verifica en la consola del navegador si hay otros errores
