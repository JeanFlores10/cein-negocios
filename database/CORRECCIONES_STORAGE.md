# 🔧 Correcciones Aplicadas al Script Storage

## ❌ Errores Corregidos

### 1. **Error: Column `e.student_id` does not exist**

**Problema:** La tabla `enrollments` usa `user_id`, no `student_id`

**Línea 128 - ANTES:**
```sql
WHERE e.student_id = auth.uid()
```

**DESPUÉS:**
```sql
WHERE e.user_id = auth.uid()
```

---

### 2. **Error: Estado 'activo' vs 'active'**

**Problema:** El schema usa `'active'`, no `'activo'`

**Línea 130 - ANTES:**
```sql
AND e.status = 'activo'
```

**DESPUÉS:**
```sql
AND e.status = 'active'
```

---

### 3. **Verificación incorrecta del rol de admin**

**Problema:** Usar `auth.jwt() ->> 'role'` no es consistente con las políticas RLS del schema.sql

**ANTES (14 ocurrencias):**
```sql
auth.jwt() ->> 'role' = 'admin'
```

**DESPUÉS:**
```sql
EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
)
```

**Razón:** El rol se almacena en la tabla `profiles`, no directamente en el JWT. Esta forma es consistente con todas las políticas RLS del schema.sql.

---

## ✅ Estado Actual

El script `database/storage-policies.sql` ha sido completamente corregido y está listo para ejecutarse.

### Cambios totales:
- ✓ 1 error de nombre de columna corregido
- ✓ 1 error de valor de estado corregido
- ✓ 14 verificaciones de rol de admin actualizadas
- ✓ 100% compatible con el schema.sql existente

---

## 🚀 Próximos Pasos

### 1. Asignar rol de admin a tu usuario

**IMPORTANTE:** Antes de ejecutar el script, asegúrate de que tu usuario tenga el rol de admin:

```sql
-- Reemplaza 'tu_email@example.com' con tu email real
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'tu_email@example.com';
```

**Verificar:**
```sql
SELECT id, email, role FROM public.profiles WHERE role = 'admin';
```

---

### 2. Ejecutar el script corregido

1. Ve a tu panel de Supabase
2. Navega a **SQL Editor**
3. Crea una nueva consulta
4. Copia todo el contenido de `database/storage-policies.sql`
5. Ejecuta el script

---

### 3. Verificar que las políticas se crearon

Al final del script hay una consulta de verificación:

```sql
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'objects'
ORDER BY policyname;
```

Deberías ver aproximadamente **20 políticas** creadas.

---

### 4. Verificar que los buckets existen

```sql
SELECT * FROM storage.buckets;
```

Deberías ver:
- `course-images` (public: true)
- `certificates` (public: false)
- `course-materials` (public: false)
- `avatars` (public: true)

---

## 🔍 Si aún tienes errores

### Error: "Policy already exists"

Si ya habías ejecutado el script antes, elimina las políticas anteriores:

```sql
-- Eliminar todas las políticas de storage.objects
DROP POLICY IF EXISTS "Administradores pueden subir imágenes de cursos" ON storage.objects;
DROP POLICY IF EXISTS "Administradores pueden actualizar imágenes de cursos" ON storage.objects;
DROP POLICY IF EXISTS "Administradores pueden eliminar imágenes de cursos" ON storage.objects;
DROP POLICY IF EXISTS "Todos pueden ver imágenes de cursos" ON storage.objects;

DROP POLICY IF EXISTS "Administradores pueden subir certificados" ON storage.objects;
DROP POLICY IF EXISTS "Administradores pueden ver todos los certificados" ON storage.objects;
DROP POLICY IF EXISTS "Estudiantes pueden ver sus propios certificados" ON storage.objects;
DROP POLICY IF EXISTS "Administradores pueden actualizar certificados" ON storage.objects;
DROP POLICY IF EXISTS "Administradores pueden eliminar certificados" ON storage.objects;

DROP POLICY IF EXISTS "Administradores pueden subir materiales" ON storage.objects;
DROP POLICY IF EXISTS "Administradores pueden ver todos los materiales" ON storage.objects;
DROP POLICY IF EXISTS "Estudiantes inscritos pueden ver materiales de sus cursos" ON storage.objects;
DROP POLICY IF EXISTS "Administradores pueden actualizar materiales" ON storage.objects;
DROP POLICY IF EXISTS "Administradores pueden eliminar materiales" ON storage.objects;

DROP POLICY IF EXISTS "Usuarios pueden subir su propio avatar" ON storage.objects;
DROP POLICY IF EXISTS "Administradores pueden subir avatares" ON storage.objects;
DROP POLICY IF EXISTS "Todos pueden ver avatares" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden actualizar su propio avatar" ON storage.objects;
DROP POLICY IF EXISTS "Administradores pueden actualizar avatares" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios pueden eliminar su propio avatar" ON storage.objects;
DROP POLICY IF EXISTS "Administradores pueden eliminar avatares" ON storage.objects;
```

Luego vuelve a ejecutar el script completo.

---

## 📞 Contacto

Si encuentras más errores, avísame con:
1. El mensaje de error completo
2. La línea donde ocurre el error
3. Una captura de pantalla si es posible

---

**✅ Script actualizado y listo para usar!**
