# Gonzalez Style

Aplicacion web completa para una tienda de ropa local de Bella Vista, Corrientes.

## Estructura

- `client`: frontend con React, Vite y Tailwind CSS.
- `server`: backend con Node.js y Express.
- `supabase/schema.sql`: tablas, politicas, indices y bucket de imagenes.

## Requisitos

- Node.js 18 o superior.
- Una cuenta de Supabase.

## Configuracion

1. Crear un proyecto en Supabase.
2. Abrir el editor SQL de Supabase y ejecutar `supabase/schema.sql`.
3. Crear un usuario administrador en Supabase Auth con correo y contrasena.
4. En la tabla `admins`, agregar el `id` del usuario creado en Auth.
5. Copiar `.env.example` a `server/.env` y completar:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
CLIENT_URL=http://localhost:5173
PORT=4000
```

6. Copiar `client/.env.example` a `client/.env` y completar:

```env
VITE_API_URL=http://localhost:4000/api
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key
VITE_STORE_NAME=Gonzalez Style
VITE_STORE_CITY=Bella Vista, Corrientes
VITE_WHATSAPP_NUMBER=5493777000000
```

El nombre de la tienda se cambia desde `VITE_STORE_NAME`.

## Ejecutar

Desde la carpeta `gonzalez-style`:

```bash
npm install
npm run install:all
npm run dev
```

Luego abrir:

- Tienda publica: `http://localhost:5173`
- Login administrador: `http://localhost:5173/login`
- Panel administrador: `http://localhost:5173/admin`

## Funciones incluidas

- Inicio publico con banner, descripcion y productos destacados.
- Catalogo con buscador, filtros por categoria y tarjetas responsive.
- Productos con imagen, nombre, descripcion, precio, talles, colores y stock.
- Carrito basico en navegador.
- Boton de contacto por WhatsApp con mensaje del carrito.
- Login administrador con Supabase Auth.
- Panel privado para crear, editar, eliminar y destacar productos.
- Carga de imagenes al bucket `product-images` de Supabase.
- Creacion de categorias.
- Vista de productos sin stock.
