# Página web de Camión Oriental

## Cómo funciona
- `public/` es lo que se publica: `index.html` (la página), `logo.png`, `favicon.png`, `og.jpg` (imagen al compartir el enlace) y `uploads/` (fotos de los camiones).
- `content/camiones/` tiene un archivo por camión. **No hace falta tocarlos a mano**: se crean desde el panel.
- `content/ajustes.json` tiene el WhatsApp, la ciudad, el horario y las redes. También se cambia desde el panel.
- `build.js` junta todos los camiones en `public/camiones.json`. Netlify lo corre solo en cada cambio.
- `public/admin/` es el panel privado (Decap CMS). Se entra en `tu-sitio.netlify.app/admin`.

## Fotos
Puedes subir fotos verticales, horizontales o cuadradas. En el catálogo todas se muestran en el mismo formato (4:3),
y en la ficha del camión se ven completas sobre un fondo difuminado de la misma foto.
En Netlify, además, se recortan y comprimen al tamaño justo para que carguen rápido en celular.
La primera foto de la lista es la portada.

## Activar el panel (una sola vez)
1. Netlify → tu sitio → **Project configuration → Identity** → **Enable Identity**.
2. En **Registration**, elige **Invite only** (así nadie más puede crear cuenta).
3. Más abajo, en **Services → Git Gateway**, haz clic en **Enable Git Gateway**.
4. En la pestaña **Identity** del sitio, **Invite users** y pon tu correo.
5. Abre el correo de invitación, crea tu contraseña y entra a `/admin`.

## Formulario "Vende tu camión"
Lo que la gente envía queda en Netlify → tu sitio → **Forms → vender**.
Ahí mismo puedes activar que te llegue un correo por cada formulario nuevo (Form notifications).

## Dónde cambiar cada cosa
| Quiero cambiar…                    | Dónde                                         |
|------------------------------------|-----------------------------------------------|
| Camiones, fotos, precios           | Panel → Camiones                              |
| WhatsApp, ciudad, horario, redes   | Panel → Datos de contacto                     |
| Textos de la página                | `public/index.html` (busca el texto tal cual) |
| Marcas de la portada (y sus logos) | `public/index.html` → busca `const BRANDS`    |
| Colores                            | `public/index.html` → `--sky`, `--deep`, `--red` |
| Campos del formulario del panel    | `public/admin/config.yml`                     |

## Camiones vendidos
- **Cuando vendas uno:** en el panel abre el camión, marca **Vendido**, sube si quieres la **Foto para Vendidos** y dale **Publicar**.
  En unos minutos la limpieza automática (GitHub → pestaña Actions → "Limpiar vendidos y fotos") borra su ficha completa
  y todas sus fotos, y lo deja en **Vendidos** con una sola foto. Lo hace `scripts/limpiar.js`.
- **Para subir uno que vendiste antes:** panel → **Vendidos** → nuevo, con una sola foto.
- La limpieza también achica fotos muy pesadas (máximo 1600 px) y borra fotos que ningún camión usa desde hace más de un día.
- Las referencias (CO-001, CO-002…) quedan fijas en cada camión, así los enlaces compartidos no cambian.

## A dónde llegan los contactos
- Botones de WhatsApp: abren directamente el chat con el número principal (311 405 6471).
- Formulario "Vende tu camión": abre WhatsApp con los datos ya escritos y además queda guardado en Netlify → **Forms → vender**.
  Para recibir también un correo por cada formulario: Netlify → tu sitio → **Project configuration → Notifications → Emails and webhooks → Form submission notifications → Add notification → Email notification**.
