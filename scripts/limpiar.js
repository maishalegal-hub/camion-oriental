// Limpieza automática (la corre GitHub después de cada cambio que hagas en el panel):
// 1. Cada camión marcado como "Vendido" se convierte en una ficha corta en content/vendidos/
//    con UNA sola foto (la "Foto para Vendidos" que elijas, o si no, su portada),
//    y se borran su ficha completa y todas sus demás fotos.
// 2. Le pone a cada camión nuevo su referencia fija (CO-001, CO-002…), para que los enlaces compartidos no cambien.
// 3. Borra fotos de public/uploads que ya ningún camión usa (si llevan más de un día en el repositorio).
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const R = path.join(__dirname, '..');
const CAM = path.join(R, 'content', 'camiones');
const VEN = path.join(R, 'content', 'vendidos');
const UP = path.join(R, 'public', 'uploads');
const read = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const write = (f, o) => fs.writeFileSync(f, JSON.stringify(o, null, 2) + '\n');
const jsons = d => (fs.existsSync(d) ? fs.readdirSync(d) : []).filter(f => f.endsWith('.json')).map(f => path.join(d, f));
const foto = x => (typeof x === 'string' ? x : x && x.foto) || '';
const log = [];
const delVendido = new Set(); // fotos de los camiones que se acaban de vender

// Referencias fijas
const all = [...jsons(CAM), ...jsons(VEN)].map(f => ({ f, c: read(f) }));
let max = Math.max(0, ...all.map(({ c }) => +String(c.referencia || '').replace(/\D/g, '') || 0));
for (const { f, c } of all.filter(x => x.f.startsWith(CAM) && !x.c.referencia).sort((a, b) => new Date(a.c.fecha || 0) - new Date(b.c.fecha || 0))) {
  c.referencia = 'CO-' + String(++max).padStart(3, '0');
  write(f, c); log.push(`Referencia ${c.referencia} para ${path.basename(f)}`);
}

// Vendidos → ficha corta con una sola foto
fs.mkdirSync(VEN, { recursive: true });
for (const f of jsons(CAM)) {
  const c = read(f);
  if (!c.vendido) continue;
  const keep = foto(c.foto_vendido) || foto((c.fotos || [])[0]);
  for (const x of c.fotos || []) delVendido.add(path.basename(foto(x)));
  const v = {
    marca: c.marca || '', modelo: c.modelo || '', anio: c.anio || '',
    tipo: c.tipo || '', carroceria: c.carroceria || '',
    foto: keep, referencia: c.referencia || '',
    fecha_venta: c.fecha_venta || new Date().toISOString()
  };
  let dest = path.join(VEN, path.basename(f));
  if (fs.existsSync(dest)) dest = dest.replace(/\.json$/, '-' + Date.now() + '.json');
  write(dest, v);
  fs.unlinkSync(f);
  log.push(`Vendido: ${v.marca} ${v.modelo} ${v.anio} → queda solo ${keep || '(sin foto)'}`);
}

// Fotos que ya nadie usa
const used = new Set();
for (const f of [...jsons(CAM), ...jsons(VEN)]) {
  for (const m of fs.readFileSync(f, 'utf8').matchAll(/\/?uploads\/[^"'\s)]+/g)) used.add(path.basename(m[0]));
}
const now = Date.now() / 1000;
for (const name of fs.existsSync(UP) ? fs.readdirSync(UP) : []) {
  if (name.startsWith('.') || used.has(name)) continue;
  let t = now;
  try { t = +execSync(`git log -1 --format=%ct -- "public/uploads/${name}"`, { cwd: R }).toString().trim() || now; } catch (e) {}
  const viejo = now - t > 86400;
  if (viejo || delVendido.has(name)) { fs.unlinkSync(path.join(UP, name)); log.push('Foto borrada: ' + name); }
}
console.log(log.length ? log.join('\n') : 'Nada que limpiar.');
