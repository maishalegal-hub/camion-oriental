// Junta los camiones que subes desde el panel (content/camiones/*.json)
// en un solo archivo que lee la página: public/camiones.json
// Netlify lo ejecuta solo cada vez que hay un cambio.
const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'content', 'camiones');
const camiones = [];
for (const f of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
  if (!f.endsWith('.json')) continue;
  try {
    const c = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
    if (c.borrador) continue;
    c.id = f.replace(/\.json$/, '');
    c.fotos = (c.fotos || []).map(x => (typeof x === 'string' ? x : x && x.foto)).filter(Boolean);
    c.caracteristicas = (c.caracteristicas || []).map(x => (typeof x === 'string' ? x : x && x.item)).filter(Boolean);
    camiones.push(c);
  } catch (e) {
    console.error('No pude leer', f, e.message);
  }
}
// Camiones vendidos: ficha corta con una sola foto (content/vendidos/*.json).
// Un camión marcado "Vendido" que todavía no pasó por la limpieza automática se muestra igual: solo con su foto de vendido.
const vdir = path.join(__dirname, 'content', 'vendidos');
const corto = (c, id) => ({
  id, vendido: true, marca: c.marca, modelo: c.modelo, anio: c.anio, tipo: c.tipo, carroceria: c.carroceria,
  referencia: c.referencia, fecha: c.fecha_venta || c.fecha, fecha_venta: c.fecha_venta || c.fecha,
  fotos: [c.foto || (c.foto_vendido && (c.foto_vendido.foto || c.foto_vendido)) || c.fotos[0]].filter(Boolean)
});
for (let i = camiones.length - 1; i >= 0; i--) if (camiones[i].vendido) camiones[i] = corto(camiones[i], camiones[i].id);
for (const f of fs.existsSync(vdir) ? fs.readdirSync(vdir) : []) {
  if (!f.endsWith('.json')) continue;
  try { camiones.push(corto({ fotos: [], ...JSON.parse(fs.readFileSync(path.join(vdir, f), 'utf8')) }, 'v-' + f.replace(/\.json$/, ''))); }
  catch (e) { console.error('No pude leer', f, e.message); }
}

// Primero los destacados, luego los disponibles, los vendidos al final; dentro de cada grupo, el más reciente primero
camiones.sort((a, b) =>
  (!!a.vendido - !!b.vendido) || (!!b.destacado - !!a.destacado) ||
  (new Date(b.fecha || 0) - new Date(a.fecha || 0)));

// Referencia corta y estable para cada camión (CO-001, CO-002…), por orden de publicación
const porFecha = [...camiones].sort((a, b) => new Date(a.fecha || 0) - new Date(b.fecha || 0) || a.id.localeCompare(b.id));
let maxRef = Math.max(0, ...camiones.map(c => +String(c.referencia || '').replace(/\D/g, '') || 0));
porFecha.forEach(c => { if (!c.referencia) c.referencia = (c.vendido ? 'V-' : 'CO-') + String(++maxRef).padStart(3, '0'); });

fs.writeFileSync(path.join(__dirname, 'public', 'camiones.json'), JSON.stringify(camiones, null, 1));
const aj = path.join(__dirname, 'content', 'ajustes.json');
fs.copyFileSync(aj, path.join(__dirname, 'public', 'ajustes.json'));
console.log('Camiones publicados:', camiones.length);
