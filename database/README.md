# Documentación de Base de Datos - CEIN Negocios

## Índice
1. [Configuración Inicial](#configuración-inicial)
2. [Estructura de Tablas](#estructura-de-tablas)
3. [Ejecutar Scripts SQL](#ejecutar-scripts-sql)
4. [Integración con el Frontend](#integración-con-el-frontend)
5. [Funciones CRUD Disponibles](#funciones-crud-disponibles)
6. [Seguridad (RLS)](#seguridad-rls)

---

## Configuración Inicial

### 1. Acceder a Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto `nsrrhwphpevlpwffymqg`

### 2. Ejecutar Scripts SQL

#### Paso 1: Crear el Schema

1. En el panel de Supabase, ve a **SQL Editor**
2. Crea una nueva query
3. Copia y pega el contenido completo del archivo `schema.sql`
4. Haz clic en **Run** para ejecutar el script

**Importante:** Este script creará:
- 7 tablas principales
- Índices para optimizar consultas
- Triggers para actualizar timestamps automáticamente
- Políticas de Row Level Security (RLS)
- Función para crear perfiles automáticamente al registrarse

#### Paso 2: Insertar Datos Iniciales

1. En el SQL Editor, crea otra nueva query
2. Copia y pega el contenido completo del archivo `seed_courses.sql`
3. Haz clic en **Run** para ejecutar el script

Este script insertará:
- 2 categorías (Cursos Técnicos y Cursos Académicos)
- 11 cursos técnicos
- 6 cursos académicos

---

## Estructura de Tablas

### Tablas Principales

#### 1. **profiles**
Perfiles de usuarios (complementa `auth.users`)

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID del usuario (FK a auth.users) |
| email | TEXT | Email del usuario |
| full_name | TEXT | Nombre completo |
| phone | TEXT | Teléfono |
| role | TEXT | Rol: admin, instructor, student |
| avatar_url | TEXT | URL del avatar |

#### 2. **categories**
Categorías de cursos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único |
| name | TEXT | Nombre de la categoría |
| slug | TEXT | Slug único para URLs |
| description | TEXT | Descripción |
| icon | TEXT | Clase de icono Font Awesome |

#### 3. **courses**
Catálogo de cursos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único |
| category_id | UUID | ID de la categoría |
| title | TEXT | Título del curso |
| slug | TEXT | Slug único para URLs |
| description | TEXT | Descripción completa |
| duration | TEXT | Duración (ej: "Mes y medio") |
| modality | TEXT | presencial, virtual, hibrido |
| price_enrollment | NUMERIC | Precio de matrícula |
| price_monthly | NUMERIC | Precio mensual |
| is_active | BOOLEAN | Si está activo |

#### 4. **enrollments**
Inscripciones de estudiantes

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único |
| user_id | UUID | ID del estudiante |
| course_id | UUID | ID del curso |
| status | TEXT | pending, active, completed, cancelled |
| payment_status | TEXT | pending, paid, partial, refunded |
| enrolled_at | TIMESTAMP | Fecha de inscripción |

#### 5. **certificates**
Certificados emitidos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único |
| enrollment_id | UUID | ID de la inscripción |
| certificate_code | TEXT | Código único del certificado |
| student_name | TEXT | Nombre del estudiante |
| student_document | TEXT | DNI/documento |
| issue_date | DATE | Fecha de emisión |
| is_valid | BOOLEAN | Si es válido |

#### 6. **contact_messages**
Mensajes del formulario de contacto

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único |
| full_name | TEXT | Nombre completo |
| email | TEXT | Email |
| phone | TEXT | Teléfono |
| message | TEXT | Mensaje |
| status | TEXT | new, read, replied, archived |

#### 7. **testimonials**
Testimonios de estudiantes

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | ID único |
| user_id | UUID | ID del usuario (opcional) |
| full_name | TEXT | Nombre completo |
| company | TEXT | Empresa |
| testimonial_text | TEXT | Texto del testimonio |
| rating | INTEGER | Calificación (1-5) |
| is_published | BOOLEAN | Si está publicado |

---

## Integración con el Frontend

### Archivos JavaScript Creados

1. **supabase-config.js** - Configuración del cliente Supabase
2. **supabase-auth.js** - Sistema de autenticación
3. **supabase-crud.js** - Funciones CRUD para todas las tablas

### Actualizar Archivos HTML

Necesitas agregar los scripts de Supabase en tus archivos HTML. Aquí está el orden correcto:

#### En `login.html`:

```html
<!-- Antes de cerrar </body> -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/supabase-config.js"></script>
<script src="js/supabase-auth.js"></script>
```

#### En `dashboard.html`:

```html
<!-- Antes de cerrar </body> -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/supabase-config.js"></script>
<script src="js/supabase-auth.js"></script>
<script src="js/supabase-crud.js"></script>
<script src="js/admin.js"></script>
```

#### En `index.html` y otras páginas públicas:

```html
<!-- Antes de cerrar </body> -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/supabase-config.js"></script>
<script src="js/supabase-crud.js"></script>
<script src="js/init.js"></script>
```

#### En `certificates.html`:

```html
<!-- Antes de cerrar </body> -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="js/supabase-config.js"></script>
<script src="js/supabase-crud.js"></script>
<script src="js/certificates.js"></script>
```

---

## Funciones CRUD Disponibles

### Autenticación

```javascript
// Registrar usuario
await supabaseAuth.signUp(email, password, fullName, role);

// Iniciar sesión
await supabaseAuth.signIn(email, password);

// Cerrar sesión
await supabaseAuth.signOut();

// Recuperar contraseña
await supabaseAuth.resetPassword(email);

// Proteger página (redirige si no está autenticado)
await supabaseAuth.protectPage();

// Verificar si es admin
const isAdmin = await supabaseAuth.isAdmin();
```

### Cursos

```javascript
// Obtener todos los cursos
const result = await supabaseCRUD.getCourses();
if (result.success) {
    console.log(result.data);
}

// Obtener cursos por categoría
const result = await supabaseCRUD.getCourses({ categoryId: 'uuid-aqui' });

// Obtener curso por slug
const result = await supabaseCRUD.getCourseBySlug('armado-diseno-muebles-melamina');

// Crear curso (solo admin)
const result = await supabaseCRUD.createCourse({
    category_id: 'uuid-categoria',
    title: 'Nuevo Curso',
    slug: 'nuevo-curso',
    description: 'Descripción del curso',
    duration: '2 meses',
    modality: 'hibrido',
    is_active: true
});
```

### Certificados

```javascript
// Buscar certificado por código
const result = await supabaseCRUD.getCertificateByCode('CEIN-12345');

// Buscar certificados por documento
const result = await supabaseCRUD.getCertificatesByDocument('12345678');

// Crear certificado (solo admin)
const result = await supabaseCRUD.createCertificate(
    enrollmentId,
    userId,
    courseId,
    'Nombre del Estudiante',
    '12345678'
);
```

### Mensajes de Contacto

```javascript
// Enviar mensaje de contacto
const result = await supabaseCRUD.createContactMessage({
    fullName: 'Juan Pérez',
    email: 'juan@example.com',
    phone: '991403402',
    serviceInterest: 'cursos',
    message: 'Quiero más información'
});

// Obtener mensajes (solo admin)
const result = await supabaseCRUD.getContactMessages();

// Obtener solo mensajes nuevos
const result = await supabaseCRUD.getContactMessages('new');
```

### Inscripciones

```javascript
// Inscribir usuario a curso
const result = await supabaseCRUD.enrollInCourse(userId, courseId, 'Notas opcionales');

// Obtener inscripciones de un usuario
const result = await supabaseCRUD.getUserEnrollments(userId);

// Actualizar estado de inscripción (solo admin)
const result = await supabaseCRUD.updateEnrollmentStatus(
    enrollmentId,
    'active',
    'paid'
);
```

---

## Seguridad (RLS)

### Row Level Security (RLS)

Todas las tablas tienen RLS habilitado con políticas específicas:

#### Perfiles (profiles)
- Los usuarios pueden ver y editar su propio perfil
- Los admins pueden ver todos los perfiles

#### Cursos (courses)
- Cualquiera puede ver cursos activos
- Solo admins pueden crear/editar/eliminar cursos

#### Inscripciones (enrollments)
- Los usuarios pueden ver sus propias inscripciones
- Los usuarios pueden inscribirse en cursos
- Los admins pueden ver y gestionar todas las inscripciones

#### Certificados (certificates)
- Cualquiera puede buscar certificados (para validación pública)
- Los usuarios pueden ver sus propios certificados
- Solo admins pueden crear/editar certificados

#### Mensajes de Contacto (contact_messages)
- Cualquiera puede enviar mensajes
- Solo admins pueden ver y gestionar mensajes

#### Testimonios (testimonials)
- Cualquiera puede ver testimonios publicados
- Los usuarios pueden crear sus propios testimonios
- Solo admins pueden publicar y gestionar testimonios

---

## Crear Usuario Administrador

Para crear un usuario administrador:

1. Registra un usuario normalmente a través del sistema
2. Ve a Supabase → Table Editor → profiles
3. Encuentra el usuario creado
4. Cambia el campo `role` de `student` a `admin`
5. Guarda los cambios

O ejecuta este SQL (reemplaza el email):

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'admin@cein.com';
```

---

## Solución de Problemas

### Error: "relation public.profiles does not exist"
- Asegúrate de haber ejecutado primero el script `schema.sql`

### Error: "new row violates row-level security policy"
- Verifica que el usuario esté autenticado
- Verifica que el usuario tenga los permisos necesarios (admin para ciertas operaciones)

### Los cursos no se muestran
- Verifica que hayas ejecutado `seed_courses.sql`
- Verifica que los cursos tengan `is_active = true`

### Error de CORS
- El cliente de Supabase maneja CORS automáticamente
- Verifica que estés usando las credenciales correctas del archivo `.env`

---

## Próximos Pasos

1. ✅ Ejecutar `schema.sql` en Supabase
2. ✅ Ejecutar `seed_courses.sql` en Supabase
3. ✅ Actualizar archivos HTML con los scripts de Supabase
4. ✅ Crear primer usuario administrador
5. ⏭️ Probar el sistema de login
6. ⏭️ Probar funciones CRUD desde el dashboard
7. ⏭️ Personalizar el diseño según necesidades

---

## Soporte

Si tienes problemas con la implementación:

1. Revisa la consola del navegador para ver errores
2. Verifica que todas las credenciales sean correctas
3. Asegúrate de que RLS esté configurado correctamente
4. Consulta la documentación de Supabase: [https://supabase.com/docs](https://supabase.com/docs)
