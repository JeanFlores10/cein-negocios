# 📦 Guía de Implementación - Supabase Storage

## ✅ Archivos .md Eliminados

Se han eliminado los siguientes archivos de documentación ya implementados:
- ✓ `IMPLEMENTACION_COMPLETADA.md`
- ✓ `RESUMEN_FINAL_IMPLEMENTACION.md`
- ✓ `database/BUSQUEDA_FILTROS_COMPLETADO.md`
- ✓ `database/RESUMEN_SESION_MEJORAS_FINALES.md`
- ✓ `database/SIDEBAR_FUNCIONAL_COMPLETO.md`

---

## 🚀 Paso 1: Configurar Buckets en Supabase

### Acceder al Panel de Supabase

1. Ve a: https://nsrrhwphpevlpwffymqg.supabase.co
2. Inicia sesión con tus credenciales
3. Navega a **Storage** en el menú lateral

### Crear los Buckets

Crea los siguientes 4 buckets:

#### 1️⃣ **course-images** (Público)
- Nombre: `course-images`
- Público: ✓ SÍ
- Tipos permitidos: JPG, PNG, WEBP
- Tamaño máximo: 5MB

#### 2️⃣ **certificates** (Privado)
- Nombre: `certificates`
- Público: ✗ NO
- Tipos permitidos: PDF
- Tamaño máximo: 10MB

#### 3️⃣ **course-materials** (Privado)
- Nombre: `course-materials`
- Público: ✗ NO
- Tipos permitidos: PDF, DOC, DOCX, PPT, PPTX
- Tamaño máximo: 20MB

#### 4️⃣ **avatars** (Público)
- Nombre: `avatars`
- Público: ✓ SÍ
- Tipos permitidos: JPG, PNG
- Tamaño máximo: 2MB

---

## 🔒 Paso 2: Configurar Políticas de Seguridad (RLS)

### ⚠️ IMPORTANTE: Asignar Rol de Admin Primero

**ANTES de ejecutar el script**, asegúrate de que tu usuario tenga el rol de admin:

```sql
-- Reemplaza 'tu_email@example.com' con tu email real
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'tu_email@example.com';

-- Verificar
SELECT id, email, role FROM public.profiles WHERE role = 'admin';
```

### Ejecutar Script SQL

1. Ve a **SQL Editor** en el panel de Supabase
2. Crea una nueva consulta
3. Copia y pega el contenido del archivo: `database/storage-policies.sql`
4. Ejecuta el script completo

> **Nota:** El script ha sido corregido y está 100% compatible con tu schema.sql. Ver `database/CORRECCIONES_STORAGE.md` para detalles de los cambios.

### Verificar Políticas

Para verificar que las políticas se crearon correctamente, ejecuta:

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

Deberías ver aproximadamente 20 políticas creadas.

---

## 📝 Paso 3: Integrar en tu Aplicación

### Agregar el Script de Storage Manager

Asegúrate de incluir el script en tus páginas HTML:

```html
<!-- En index.html o cualquier página que necesite upload -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/supabase-config.js"></script>
<script src="js/storage-manager.js"></script>
```

### Ejemplo de Uso: Subir Imagen de Curso

```javascript
// Crear instancia del Storage Manager
const storageManager = new StorageManager();

// Subir imagen
const file = document.getElementById('file-input').files[0];
const courseId = '123'; // ID del curso

try {
    const result = await storageManager.uploadCourseImage(file, courseId);
    console.log('URL de la imagen:', result.publicUrl);

    // Actualizar la base de datos con la nueva URL
    await supabase
        .from('courses')
        .update({ image_url: result.publicUrl })
        .eq('id', courseId);

} catch (error) {
    console.error('Error:', error.message);
}
```

### Ejemplo de Uso: Widget de Upload con Drag & Drop

```javascript
// Crear widget de upload
const widget = new FileUploadWidget('container-id', {
    bucketType: 'courseImages',
    courseId: '123',
    onUploadSuccess: (result) => {
        console.log('Archivo subido:', result.publicUrl);
    },
    onUploadError: (error) => {
        alert('Error: ' + error.message);
    }
});
```

---

## 🎨 Paso 4: Usar el Dashboard de Upload

### Acceder al Dashboard

1. Abre el archivo: `dashboard/upload-example.html` en tu navegador
2. O intégralo en tu dashboard existente

### Funcionalidades del Dashboard

El dashboard de ejemplo incluye 4 pestañas:

#### 📸 Imágenes de Cursos
- Selecciona un curso
- Sube imágenes (JPG, PNG, WEBP)
- Drag & drop soportado

#### 📜 Certificados
- Selecciona un estudiante
- Selecciona un curso
- Sube certificados en PDF

#### 📚 Materiales de Curso
- Selecciona un curso
- Sube múltiples archivos (PDF, DOC, PPT)
- Drag & drop soportado

#### 👤 Avatares
- Selecciona un usuario
- Sube foto de perfil
- El avatar anterior se elimina automáticamente

---

## 🔧 Paso 5: Integrar en tu Dashboard Actual

### Agregar a tu Dashboard Existente

Si ya tienes un dashboard (por ejemplo `dashboard/index.html`), agrega:

```html
<!-- En el <head> -->
<script src="../js/storage-manager.js"></script>

<!-- Donde quieras el formulario de upload -->
<div id="upload-container"></div>

<script>
// Inicializar widget
const uploadWidget = new FileUploadWidget('upload-container', {
    bucketType: 'courseImages',
    courseId: getCurrentCourseId(), // Tu función para obtener el curso actual
    onUploadSuccess: (result) => {
        // Actualizar la interfaz
        updateCourseImage(result.publicUrl);
    }
});
</script>
```

---

## 📋 API Reference - StorageManager

### Métodos Principales

#### `uploadCourseImage(file, courseId)`
Sube una imagen de curso y retorna la URL pública.

```javascript
const result = await storageManager.uploadCourseImage(file, courseId);
// result = { success: true, filePath: '...', publicUrl: '...', fileName: '...' }
```

#### `uploadCertificate(file, studentId, courseId)`
Sube un certificado privado.

```javascript
const result = await storageManager.uploadCertificate(file, studentId, courseId);
// result = { success: true, filePath: '...', fileName: '...' }
```

#### `uploadCourseMaterial(file, courseId)`
Sube material de curso (PDF, DOC, etc.).

```javascript
const result = await storageManager.uploadCourseMaterial(file, courseId);
```

#### `uploadAvatar(file, userId)`
Sube un avatar de usuario (elimina el anterior automáticamente).

```javascript
const result = await storageManager.uploadAvatar(file, userId);
```

#### `deleteFile(bucketName, filePath)`
Elimina un archivo del storage.

```javascript
await storageManager.deleteFile('course-images', 'path/to/file.jpg');
```

#### `getDownloadUrl(bucketName, filePath, expiresIn)`
Obtiene una URL temporal para descargar archivos privados.

```javascript
const url = await storageManager.getDownloadUrl('certificates', 'path/to/cert.pdf', 3600);
```

#### `listFiles(bucketName, path)`
Lista archivos en un directorio.

```javascript
const files = await storageManager.listFiles('course-materials', 'courses/123/materials');
```

---

## 🔐 Seguridad y Permisos

### Roles de Usuario

El sistema asume que tienes una columna `role` en tu tabla `profiles`:

```sql
ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'student';
```

Los roles posibles son:
- `admin`: Puede subir, ver, actualizar y eliminar todos los archivos
- `student`: Solo puede ver sus propios certificados y materiales de cursos en los que está inscrito

### Verificar Rol del Usuario

Para asignar el rol de admin a un usuario:

```sql
UPDATE profiles
SET role = 'admin'
WHERE email = 'admin@ceinnegocios.com';
```

---

## 🧪 Paso 6: Pruebas

### Probar el Upload

1. Abre `dashboard/upload-example.html`
2. Asegúrate de estar autenticado como administrador
3. Selecciona un curso
4. Arrastra una imagen al área de drop
5. Verifica que la imagen se suba correctamente

### Verificar en Supabase

1. Ve a **Storage** en el panel de Supabase
2. Navega al bucket `course-images`
3. Verifica que el archivo aparece en `courses/[courseId]/`

---

## 🐛 Troubleshooting

### Error: "Policy violation"

**Solución:** Verifica que:
1. Las políticas RLS están creadas correctamente
2. El usuario tiene el rol `admin` en la tabla `profiles`
3. El usuario está autenticado

### Error: "Bucket not found"

**Solución:**
1. Ejecuta el script `database/storage-policies.sql` completamente
2. O crea los buckets manualmente desde el panel de Supabase

### Error: "File too large"

**Solución:**
El archivo excede el tamaño máximo permitido. Verifica los límites en `STORAGE_CONFIG.maxSizes` en `storage-manager.js`.

### Imágenes no se muestran

**Solución:**
1. Verifica que el bucket sea público (`course-images` y `avatars`)
2. Usa `getPublicUrl()` para buckets públicos
3. Usa `createSignedUrl()` para buckets privados

---

## 📊 Estructura de Archivos en Storage

```
course-images/
  └── courses/
      └── [courseId]/
          └── [filename].jpg

certificates/
  └── students/
      └── [studentId]/
          └── certificates/
              └── [courseId]/
                  └── [filename].pdf

course-materials/
  └── courses/
      └── [courseId]/
          └── materials/
              └── [filename].pdf

avatars/
  └── users/
      └── [userId]/
          └── [filename].jpg
```

---

## ✨ Próximos Pasos

1. ✅ Ejecutar el script SQL de políticas
2. ✅ Probar el upload desde el dashboard de ejemplo
3. ✅ Integrar el widget en tu dashboard principal
4. 🔄 Actualizar la tabla `courses` para guardar las URLs de imágenes
5. 🔄 Crear funcionalidad para listar y eliminar archivos
6. 🔄 Agregar validación de imágenes en el formulario de cursos

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la consola del navegador para ver errores
2. Verifica que las credenciales de Supabase sean correctas
3. Asegúrate de que el usuario tenga permisos de administrador

---

**¡Listo!** Ahora tienes un sistema completo de gestión de archivos con Supabase Storage integrado en tu aplicación CEIN. 🎉
