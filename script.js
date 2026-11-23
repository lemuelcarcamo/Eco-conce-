/* ===== ECO CONCE - LOGIC & APP ENGINE ===== */
const KEY = 'ecoconce_starken_v10';
const CODIGO_TRABAJADOR = '23023';
let trabajadorAutorizado = false;

const baseOrders = [
  {
    code: 'ECO-101', rem: 'Tostaduría Biobío', rec: 'Valentina Muñoz',
    orig: 'Concepción Centro', dest: 'Hualpén', dir: 'Av. Gran Bretaña 4120',
    status: 'En triciclo eléctrico', piloto: 'Diego Valdés (Trike #04)',
    co2: '1.65 kg', eta: '18 min', empaque: 'Caja Gratis + 1 Bolsa Reciclable',
    logs: ['09:15 - Retirado en Hub Concepción Centro', '09:28 - En tránsito por ciclovía Av. Colón']
  },
  {
    code: 'ECO-202', rem: 'Librería UdeC', rec: 'Sebastián Paredes',
    orig: 'Concepción Centro', dest: 'San Pedro de la Paz', dir: 'Michimalonco 1150',
    status: 'Entregado', piloto: 'Carla Morales (Trike #05)',
    co2: '1.50 kg', eta: 'Entregado', empaque: 'Caja Gratis',
    logs: ['10:05 - Retirado en Barrio Universitario', '10:22 - Cruzando ciclovía Puente Llacolén', '10:41 - Entregado en conserjería']
  },
  {
    code: 'ECO-303', rem: 'Huerto Chiguayante', rec: 'Almacén El Faro',
    orig: 'Chiguayante', dest: 'Talcahuano', dir: 'Colón 540',
    status: 'En preparación', piloto: 'Matías Rojas (Trike #02)',
    co2: '3.10 kg', eta: '55 min', empaque: 'Caja Gratis + 2 Bolsas Reciclables',
    logs: ['11:10 - Orden ingresada y asignada a Hub Chiguayante']
  }
];

function getOrders() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(baseOrders));
      return JSON.parse(JSON.stringify(baseOrders));
    }
    return JSON.parse(raw);
  } catch (e) {
    return JSON.parse(JSON.stringify(baseOrders));
  }
}

function saveOrders(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
}

function openTab(id, btnEl) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  if (btnEl) btnEl.classList.add('active');

  if (id === 'tab-admin') {
    actualizarVistaRepartidor();
  }
}

function verificarTrabajador() {
  const pin = document.getElementById('workerPinInput').value.trim();
  const err = document.getElementById('pinError');
  if (pin === CODIGO_TRABAJADOR) {
    trabajadorAutorizado = true;
    err.textContent = '';
    document.getElementById('workerPinInput').value = '';
    actualizarVistaRepartidor();
  } else {
    err.textContent = '❌ Código incorrecto. Utiliza 23023.';
    document.getElementById('workerPinInput').value = '';
  }
}

function cerrarSesionTrabajador() {
  trabajadorAutorizado = false;
  actualizarVistaRepartidor();
}

function actualizarVistaRepartidor() {
  const loginBox = document.getElementById('workerLoginBox');
  const panelBox = document.getElementById('workerPanelBox');
  if (trabajadorAutorizado) {
    loginBox.style.display = 'none';
    panelBox.style.display = 'block';
    renderAdmin();
  } else {
    loginBox.style.display = 'block';
    panelBox.style.display = 'none';
  }
}

function probarCodigo(c) {
  document.getElementById('trackInput').value = c;
  buscarOrden();
}

function buscarOrden() {
  const code = document.getElementById('trackInput').value.trim().toUpperCase();
  const out = document.getElementById('trackOut');
  const item = getOrders().find(x => x.code === code);

  if (!item) {
    out.innerHTML = `<div class="res-box" style="background:#fef2f2; border-color:#fca5a5; border-left-color:#dc2626; color:#b91c1c;">❌ Código <b>${code || 'vacío'}</b> no encontrado. Prueba con <b>ECO-101</b>, <b>ECO-202</b> o <b>ECO-303</b>.</div>`;
    return;
  }

  const pct = item.status === 'Entregado' ? '100%' : (item.status === 'En triciclo eléctrico' ? '66%' : '33%');
  const logsHtml = (item.logs || []).map(l => `<div>${l}</div>`).join('');

  out.innerHTML = `
    <div class="res-box">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
        <strong style="font-size:1.1rem;">📦 ${item.code}</strong>
        <span class="badge">${item.status}</span>
      </div>
      <div class="bar-bg"><div class="bar-fill" style="width:${pct};"></div></div>
      <div style="display:flex; justify-content:space-between; font-size:0.78rem; color:var(--slate); font-weight:700; margin-bottom:12px;">
        <span>1. Hub Origen</span><span>2. En Ruta Eléctrica</span><span>3. Entregado</span>
      </div>
      <div class="grid-2" style="font-size:0.88rem; margin-bottom:12px;">
        <div><b>Origen:</b> ${item.orig} (${item.rem || 'PyME'})</div>
        <div><b>Destino:</b> ${item.dest}</div>
        <div><b>Recibe:</b> ${item.rec}</div>
        <div><b>Dirección:</b> ${item.dir}</div>
        <div><b>Vehículo:</b> ${item.piloto}</div>
        <div><b>Empaque:</b> ${item.empaque || 'Caja Gratis'}</div>
      </div>
      <div style="background:#dcfce7; padding:10px 14px; border-radius:10px; font-size:0.86rem; font-weight:700; color:var(--primary-dark);">
        🌱 Impacto positivo: ${item.co2} de CO₂ evitados frente a furgón diésel
      </div>
      <div class="timeline">${logsHtml}</div>
    </div>
  `;
}

function calcPrecio() {
  const tam = parseInt(document.getElementById('tamSel').value, 10) || 0;
  const cantBolsas = parseInt(document.getElementById('bolsasSel').value, 10) || 0;
  
  const baseEnvio = 2750;
  const costoBolsas = cantBolsas * 250;
  const total = baseEnvio + tam + costoBolsas;

  document.getElementById('cotOut').innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
      <div>
        <span style="font-size:0.84rem; color:var(--slate);">Envío Único Gran Concepción: <b>$2.750</b> • Caja: <b>GRATIS ($0)</b></span><br>
        <span style="font-size:0.84rem; color:var(--slate);">Bolsas reciclables (${cantBolsas} × $250): <b>$${costoBolsas.toLocaleString('es-CL')} CLP</b></span><br>
        <strong style="font-size:1.45rem; color:var(--primary-dark);">Total: $${total.toLocaleString('es-CL')} CLP</strong>
      </div>
      <div style="text-align:right; font-size:0.85rem;">
        ⏱️ <b>35 - 50 min</b><br>
        🌱 <b>1.65 kg CO₂</b> ahorrados
      </div>
    </div>
  `;
}

function generarOrden() {
  const rem = document.getElementById('remInput').value.trim() || 'Cliente Web';
  const rec = document.getElementById('recInput').value.trim();
  const dir = document.getElementById('dirInput').value.trim();
  const nota = document.getElementById('notaInput').value.trim();
  const cantBolsas = parseInt(document.getElementById('bolsasSel').value, 10) || 0;

  if (!rec || !dir) {
    alert('Por favor ingresa el nombre del destinatario y la dirección exacta.');
    return;
  }

  const o = document.getElementById('oriSel').value;
  const d = document.getElementById('desSel').value;
  const list = getOrders();
  const code = 'ECO-' + (400 + list.length + 1);
  const co2 = '1.65 kg';
  const hora = new Date().toTimeString().slice(0, 5);
  const detalleEmpaque = cantBolsas > 0 ? `Caja Gratis + ${cantBolsas} Bolsa(s) Reciclable(s)` : 'Caja Gratis ($0)';

  list.unshift({
    code: code, rem: rem, rec: rec, orig: o, dest: d, dir: dir,
    status: 'En preparación', piloto: 'Asignación automática Hub',
    co2: co2, eta: '45 min', empaque: detalleEmpaque,
    logs: [`${hora} - Orden creada (${detalleEmpaque})${nota ? ' • Nota: ' + nota : ''}`]
  });

  saveOrders(list);

  document.getElementById('ordenCreadaOut').innerHTML = `
    <div class="res-box">
      ✅ ¡Orden generada con éxito! Código asignado: <b>${code}</b><br>
      <button class="btn btn-sm" onclick="irARastreo('${code}')">Ver en Seguimiento Satelital →</button>
    </div>
  `;

  document.getElementById('recInput').value = '';
  document.getElementById('dirInput').value = '';
  document.getElementById('notaInput').value = '';
}

function irARastreo(code) {
  const firstBtn = document.querySelector('.nav-btn');
  openTab('tab-rastreo', firstBtn);
  probarCodigo(code);
}

function renderAdmin() {
  const box = document.getElementById('adminList');
  const list = getOrders();
  box.innerHTML = '';

  list.forEach((item, idx) => {
    const div = document.createElement('div');
    div.className = 'box-item';
    div.style.marginBottom = '14px';
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <strong>${item.code} (${item.orig} → ${item.dest})</strong>
        <span class="badge">${item.status}</span>
      </div>
      <div style="font-size:0.85rem; color:var(--slate); margin:6px 0 10px;">
        Para: <b>${item.rec}</b> • ${item.dir} • <i>${item.empaque || 'Caja Gratis'}</i>
      </div>
      <select onchange="cambiarEstado(${idx}, this.value)">
        <option ${item.status === 'En preparación' ? 'selected' : ''}>En preparación</option>
        <option ${item.status === 'En triciclo eléctrico' ? 'selected' : ''}>En triciclo eléctrico</option>
        <option ${item.status === 'Entregado' ? 'selected' : ''}>Entregado</option>
      </select>
    `;
    box.appendChild(div);
  });
}

function cambiarEstado(idx, nuevo) {
  const list = getOrders();
  const hora = new Date().toTimeString().slice(0, 5);
  list[idx].status = nuevo;
  list[idx].eta = nuevo === 'Entregado' ? 'Entregado' : '25 min';
  list[idx].logs = list[idx].logs || [];
  list[idx].logs.push(`${hora} - Estado actualizado a: ${nuevo}`);
  saveOrders(list);
  renderAdmin();
}

function resetOrders() {
  saveOrders(JSON.parse(JSON.stringify(baseOrders)));
  renderAdmin();
}

calcPrecio();
