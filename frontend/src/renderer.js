// INICIO
document.addEventListener('DOMContentLoaded', initApp);
async function initApp() {
  console.log('window.smiApp:', window.smiApp);

  if (!window.smiApp) {
    console.error('smiApp NO disponible (revisa preload.js)');
    return;
  }

  setupNavigation();
  setupEventListeners();
  await refrescarTodo();
}

// VISTAS
function setupNavigation() {
  const navButtons = document.querySelectorAll('.nav-btn');
  const views = document.querySelectorAll('.view');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const viewName = btn.dataset.view;
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      views.forEach(v => v.classList.remove('active'));
      document.getElementById(`view-${viewName}`)?.classList.add('active');
    });
  });
}

// EVENTOS
function setupEventListeners() {
  document.getElementById('formUsuario')?.addEventListener('submit', handleSaveUsuario);
  document.getElementById('formMaquinaria')?.addEventListener('submit', handleSaveMaquinaria);
  document.getElementById('formTecnico')?.addEventListener('submit', handleSaveTecnico);
  document.getElementById('formMantenimiento')?.addEventListener('submit', handleSaveMantenimiento);
  document.getElementById('formOrdenes')?.addEventListener('submit', handleBuscarOrdenes);

  document.getElementById('btnCancelarUsr')?.addEventListener('click', () => limpiarFormUsuario());
  document.getElementById('btnCancelarMaq')?.addEventListener('click', () => limpiarFormMaquinaria());
  document.getElementById('btnCancelarTec')?.addEventListener('click', () => limpiarFormTecnico());
  document.getElementById('btnCancelarMtto')?.addEventListener('click', () => limpiarFormMantenimiento());
  document.getElementById('btnLimpiarOrdenes')?.addEventListener('click', () => limpiarOrdenes());
}

// ACTUALIZAR EN AUTOMATICO
async function refrescarTodo() {
  await actualizarStats();
  await cargarUsuarios();
  await cargarMaquinaria();
  await cargarTecnicos();
  await cargarTecnicosParaSelect();
  await cargarMaquinariaParaSelect();
  await cargarMantenimientos();
}

async function actualizarStats() {
  try {
    const data = await window.smiApp.getCounts();
    document.getElementById('countMaquinarias').textContent = data.maquinarias ?? 0;
    document.getElementById('countSolicitudes').textContent = data.solicitudes ?? 0;
  } catch (e) {
    console.error('ERROR STATS:', e);
    document.getElementById('countMaquinarias').textContent = 0;
    document.getElementById('countSolicitudes').textContent = 0;
  }
}

// USUARIOS
async function cargarUsuarios() {
  const lista = document.getElementById('listaUsuarios');
  lista.className = 'loading';
  lista.textContent = 'Cargando usuarios...';

  try {
    const usuarios = await window.smiApp.getUsuarios();
    if (!usuarios.length) {
      lista.className = 'loading';
      lista.textContent = 'No hay usuarios.';
      return;
    }

    lista.className = '';
    lista.innerHTML = usuarios.map(u => `
      <div class="list-card">
        <div class="list-actions">
          <button class="mini-btn edit"
            onclick="editarUsuario(${u.id}, '${encodeURIComponent(u.nombre)}', '${encodeURIComponent(u.correo)}', '${u.rol}')">
            <i class="bi bi-pencil-square"></i> Editar
          </button>
          <button class="mini-btn danger"
            onclick="eliminarUsuario(${u.id}, '${encodeURIComponent(u.nombre)}')">
            <i class="bi bi-trash3"></i> Eliminar
          </button>
        </div>

        <div class="list-title">${escapeHtml(u.nombre)}</div>

        <div class="list-meta">
          <div class="meta-row"><i class="bi bi-envelope"></i> ${escapeHtml(u.correo)}</div>
          <div class="meta-row"><i class="bi bi-person-badge"></i> Rol: <strong>${escapeHtml(u.rol)}</strong></div>
        </div>
      </div>
    `).join('');

  } catch (e) {
    console.error('ERROR USUARIOS:', e);
    lista.className = 'loading';
    lista.innerHTML = '<div class="error">Error conectando backend</div>';
  }
}

// VALIDACION
async function handleSaveUsuario(e) {
  e.preventDefault();

  const form = document.getElementById('formUsuario');
  const id = document.getElementById('usrId').value || null;
  const nombre = document.getElementById('usrNombre').value.trim();
  const correo = document.getElementById('usrCorreo').value.trim();
  const rol = document.getElementById('usrRol').value;
  const contrasena = document.getElementById('usrPass').value;

  const passInput = document.getElementById('usrPass');
  if (!id) passInput.setAttribute('required', 'required');
  else passInput.removeAttribute('required');

  if (!form.reportValidity()) return;

  try {
    if (id) {
      const data = { nombre, correo, rol };
      if (contrasena) data.contrasena = contrasena;
      await window.smiApp.updateUsuario(id, data);
      window.smiApp.showNotification?.('✅ Usuario actualizado');
    } else {
      await window.smiApp.createUsuario({ nombre, correo, rol, contrasena });
      window.smiApp.showNotification?.('✅ Usuario creado');
    }

    limpiarFormUsuario();
    await refrescarTodo();
  } catch (e2) {
    alert('Error: ' + e2.message);
  }
}

function limpiarFormUsuario() {
  document.getElementById('formUsuario')?.reset();
  document.getElementById('usrId').value = '';
  document.getElementById('usrPass')?.removeAttribute('required');
}

window.editarUsuario = function(id, nombreEnc, correoEnc, rol) {
  document.getElementById('usrId').value = id;
  document.getElementById('usrNombre').value = decodeURIComponent(nombreEnc);
  document.getElementById('usrCorreo').value = decodeURIComponent(correoEnc);
  document.getElementById('usrRol').value = rol;
  document.getElementById('usrPass').value = '';
  document.getElementById('usrPass')?.removeAttribute('required');
};

window.eliminarUsuario = async function(id, nombreEnc) {
  const nombre = decodeURIComponent(nombreEnc);

  mostrarConfirmacion(
    'Eliminar Usuario',
    `¿Seguro que deseas eliminar a <strong>${escapeHtml(nombre)}</strong>?`,
    async (ok) => {
      if (!ok) return;
      try {
        await window.smiApp.deleteUsuario(id);
        window.smiApp.showNotification?.('🗑️ Usuario eliminado');
        await refrescarTodo();
      } catch (e) {
        alert('Error: ' + e.message);
      }
    }
  );
};

// MAQUINARIA
async function cargarMaquinaria() {
  const lista = document.getElementById('listaMaquinaria');
  lista.className = 'loading';
  lista.textContent = 'Cargando maquinaria...';

  try {
    const maq = await window.smiApp.getMaquinaria();
    if (!maq.length) {
      lista.className = 'loading';
      lista.textContent = 'No hay maquinaria.';
      return;
    }

    lista.className = '';
    lista.innerHTML = maq.map(m => `
      <div class="list-card">
        <div class="list-actions">
          <button class="mini-btn edit"
            onclick="editarMaquinaria(${m.id}, '${encodeURIComponent(m.nombre)}', '${encodeURIComponent(m.modelo)}', '${encodeURIComponent(m.area)}', '${encodeURIComponent(m.estado)}')">
            <i class="bi bi-pencil-square"></i> Editar
          </button>
          <button class="mini-btn danger"
            onclick="eliminarMaquinaria(${m.id}, '${encodeURIComponent(m.nombre)}')">
            <i class="bi bi-trash3"></i> Eliminar
          </button>
        </div>

        <div class="list-title">${escapeHtml(m.nombre)}</div>

        <div class="list-meta">
          <div class="meta-row"><i class="bi bi-tag"></i> Modelo: ${escapeHtml(m.modelo)}</div>
          <div class="meta-row"><i class="bi bi-geo-alt"></i> Área: ${escapeHtml(m.area)}</div>
          <div class="meta-row"><i class="bi bi-activity"></i> Estado: <strong>${escapeHtml(m.estado)}</strong></div>
        </div>
      </div>
    `).join('');

  } catch (e) {
    console.error('ERROR MAQUINARIA:', e);
    lista.className = 'loading';
    lista.innerHTML = '<div class="error">Error cargando maquinaria</div>';
  }
}

// TECNICOS
async function cargarTecnicos() {
  const lista = document.getElementById('listaTecnicos');
  if (!lista) return;

  lista.className = 'loading';
  lista.textContent = 'Cargando técnicos...';

  try {
    const tecnicos = await window.smiApp.getTecnicos();

    if (!tecnicos.length) {
      lista.className = 'loading';
      lista.textContent = 'No hay técnicos.';
      return;
    }

    lista.className = '';
    lista.innerHTML = tecnicos.map(t => `
      <div class="list-card">
        <div class="list-actions">
          <button class="mini-btn edit"
            onclick="editarTecnico(${t.id}, '${encodeURIComponent(t.nombre)}', '${encodeURIComponent(t.especialidad)}', '${encodeURIComponent(t.telefono || '')}')">
            <i class="bi bi-pencil-square"></i> Editar
          </button>
          <button class="mini-btn danger"
            onclick="eliminarTecnico(${t.id}, '${encodeURIComponent(t.nombre)}')">
            <i class="bi bi-trash3"></i> Eliminar
          </button>
        </div>

        <div class="list-title">${escapeHtml(t.nombre)}</div>

        <div class="list-meta">
          <div class="meta-row"><i class="bi bi-tools"></i> Especialidad: <strong>${escapeHtml(t.especialidad)}</strong></div>
          <div class="meta-row"><i class="bi bi-telephone"></i> Tel: ${escapeHtml(t.telefono || '—')}</div>
        </div>
      </div>
    `).join('');

  } catch (e) {
    console.error('ERROR TECNICOS:', e);
    lista.className = 'loading';
    lista.innerHTML = '<div class="error">Error cargando técnicos</div>';
  }
}

async function handleSaveTecnico(e) {
  e.preventDefault();

  const form = document.getElementById('formTecnico');
  if (!form.reportValidity()) return;

  const id = document.getElementById('tecId').value || null;
  const nombre = document.getElementById('tecNombre').value.trim();
  const especialidad = document.getElementById('tecEspecialidad').value.trim();
  const telefono = document.getElementById('tecTelefono').value.trim();

  try {
    if (id) {
      await window.smiApp.updateTecnico(id, { nombre, especialidad, telefono });
      window.smiApp.showNotification?.('✅ Técnico actualizado');
    } else {
      await window.smiApp.createTecnico({ nombre, especialidad, telefono });
      window.smiApp.showNotification?.('✅ Técnico creado');
    }

    limpiarFormTecnico();
    await refrescarTodo();

  } catch (e2) {
    alert('Error: ' + e2.message);
  }
}

function limpiarFormTecnico() {
  document.getElementById('formTecnico')?.reset();
  document.getElementById('tecId').value = '';
}

window.editarTecnico = function(id, nEnc, espEnc, telEnc) {
  document.getElementById('tecId').value = id;
  document.getElementById('tecNombre').value = decodeURIComponent(nEnc);
  document.getElementById('tecEspecialidad').value = decodeURIComponent(espEnc);
  document.getElementById('tecTelefono').value = decodeURIComponent(telEnc || '');
};

window.eliminarTecnico = async function(id, nombreEnc) {
  const nombre = decodeURIComponent(nombreEnc);

  mostrarConfirmacion(
    'Eliminar Técnico',
    `¿Seguro que deseas eliminar a <strong>${escapeHtml(nombre)}</strong>?`,
    async (ok) => {
      if (!ok) return;
      try {
        await window.smiApp.deleteTecnico(id);
        window.smiApp.showNotification?.('🗑️ Técnico eliminado');
        await refrescarTodo();
      } catch (e) {
        alert('Error: ' + e.message);
      }
    }
  );
};

async function handleSaveMaquinaria(e) {
  e.preventDefault();

  const form = document.getElementById('formMaquinaria');
  if (!form.reportValidity()) return;

  const id = document.getElementById('maqId').value || null;
  const nombre = document.getElementById('maqNombre').value.trim();
  const modelo = document.getElementById('maqModelo').value.trim();
  const area = document.getElementById('maqArea').value.trim();
  const estado = document.getElementById('maqEstado').value;

  try {
    if (id) {
      await window.smiApp.updateMaquinaria(id, { nombre, modelo, area, estado });
      window.smiApp.showNotification?.('✅ Maquinaria actualizada');
    } else {
      await window.smiApp.createMaquinaria({ nombre, modelo, area, estado });
      window.smiApp.showNotification?.('✅ Maquinaria creada');
    }

    limpiarFormMaquinaria();
    await refrescarTodo(); 
  } catch (e2) {
    alert('Error: ' + e2.message);
  }
}

function limpiarFormMaquinaria() {
  document.getElementById('formMaquinaria')?.reset();
  document.getElementById('maqId').value = '';
}

window.editarMaquinaria = function(id, nEnc, modEnc, areaEnc, estEnc) {
  document.getElementById('maqId').value = id;
  document.getElementById('maqNombre').value = decodeURIComponent(nEnc);
  document.getElementById('maqModelo').value = decodeURIComponent(modEnc);
  document.getElementById('maqArea').value = decodeURIComponent(areaEnc);
  document.getElementById('maqEstado').value = decodeURIComponent(estEnc);
};

window.eliminarMaquinaria = async function(id, nombreEnc) {
  const nombre = decodeURIComponent(nombreEnc);

  mostrarConfirmacion(
    'Eliminar Maquinaria',
    `¿Seguro que deseas eliminar <strong>${escapeHtml(nombre)}</strong>?`,
    async (ok) => {
      if (!ok) return;
      try {
        await window.smiApp.deleteMaquinaria(id);
        window.smiApp.showNotification?.('🗑️ Maquinaria eliminada');
        await refrescarTodo(); // ✅ refresco automático
      } catch (e) {
        alert('Error: ' + e.message);
      }
    }
  );
};

// SLECCION DE MANTENIMIENTO
async function cargarMaquinariaParaSelect() {
  const select = document.getElementById('mttoMaquinaria');
  if (!select) return;

  try {
    const maq = await window.smiApp.getMaquinaria();
    select.innerHTML =
      '<option value="">Selecciona...</option>' +
      maq.map(m => `<option value="${m.id}">${escapeHtml(m.nombre)}</option>`).join('');
  } catch (e) {
    console.error('ERROR select maquinaria:', e);
  }
}

async function cargarTecnicosParaSelect() {
  const select = document.getElementById('mttoTecnico');
  if (!select) return;

  try {
    const tecnicos = await window.smiApp.getTecnicos();
    select.innerHTML =
      '<option value="">Selecciona un técnico...</option>' +
      tecnicos.map(t => `<option value="${t.id}">${escapeHtml(t.nombre)}</option>`).join('');
  } catch (e) {
    console.error('ERROR select tecnicos:', e);
  }
}

// MANTENIMIENTO
async function cargarMantenimientos() {
  const lista = document.getElementById('listaMantenimientos');
  lista.className = 'loading';
  lista.textContent = 'Cargando mantenimientos...';

  try {
    const rows = await window.smiApp.getMantenimientos();

    if (!rows.length) {
      lista.className = 'loading';
      lista.textContent = 'No hay mantenimientos.';
      return;
    }

    lista.className = '';
    lista.innerHTML = rows.map(m => `
      <div class="list-card">
        <div class="list-actions">
          <button class="mini-btn edit"
            onclick="editarMantenimiento(${m.id}, ${m.maquinaria_id}, ${m.tecnico_id ?? 'null'}, '${m.prioridad}', '${m.estado}', '${encodeURIComponent(m.descripcion_falla)}')">
            <i class="bi bi-pencil-square"></i> Editar
          </button>
          <button class="mini-btn danger"
            onclick="eliminarMantenimiento(${m.id})">
            <i class="bi bi-trash3"></i> Eliminar
          </button>
        </div>

        <div class="list-title">Solicitud #${m.id}</div>

        <div class="list-meta">
          <div class="meta-row"><i class="bi bi-building"></i> ${escapeHtml(m.maquinaria_nombre || m.maquinaria || '')}</div>
          <div class="meta-row"><i class="bi bi-exclamation-triangle"></i> Prioridad: <strong>${escapeHtml(m.prioridad)}</strong></div>
          <div class="meta-row"><i class="bi bi-flag"></i> Estado: <strong>${escapeHtml(m.estado)}</strong></div>
          <div class="meta-row"><i class="bi bi-card-text"></i> ${escapeHtml(m.descripcion_falla)}</div>
        </div>
      </div>
    `).join('');

  } catch (e) {
    console.error('ERROR MANTENIMIENTO:', e);
    lista.className = 'loading';
    lista.innerHTML = '<div class="error">Error cargando mantenimientos</div>';
  }
}

async function handleSaveMantenimiento(e) {
  e.preventDefault();

  const form = document.getElementById('formMantenimiento');
  if (!form.reportValidity()) return;

  const id = document.getElementById('mttoId').value || null;
  const maquinaria_id = document.getElementById('mttoMaquinaria').value;
  const tecnico_id = document.getElementById('mttoTecnico').value;
  const prioridad = document.getElementById('mttoPrioridad').value;
  const estado = document.getElementById('mttoEstado').value;
  const descripcion_falla = document.getElementById('mttoDesc').value.trim();
  const usuario_id = 1;

  try {
    const payload = {
      usuario_id,
      maquinaria_id: Number(maquinaria_id),
      tecnico_id: Number(tecnico_id),
      prioridad,
      estado,
      descripcion_falla
    };

    if (id) {
      await window.smiApp.updateMantenimiento(id, payload);
      window.smiApp.showNotification?.('✅ Mantenimiento actualizado');
    } else {
      await window.smiApp.createMantenimiento(payload);
      window.smiApp.showNotification?.('✅ Solicitud registrada');
    }

    limpiarFormMantenimiento();
    await refrescarTodo(); 
  } catch (e2) {
    alert('Error: ' + e2.message);
  }
}

function limpiarFormMantenimiento() {
  document.getElementById('formMantenimiento')?.reset();
  document.getElementById('mttoId').value = '';
}

window.editarMantenimiento = function(id, maquinaria_id, tecnico_id, prioridad, estado, descEnc) {
  document.getElementById('mttoId').value = id;
  document.getElementById('mttoMaquinaria').value = maquinaria_id;
  document.getElementById('mttoTecnico').value = tecnico_id ?? '';
  document.getElementById('mttoPrioridad').value = prioridad;
  document.getElementById('mttoEstado').value = estado;
  document.getElementById('mttoDesc').value = decodeURIComponent(descEnc);
};

window.eliminarMantenimiento = async function(id) {
  mostrarConfirmacion(
    'Eliminar Mantenimiento',
    `¿Seguro que deseas eliminar la solicitud <strong>#${id}</strong>?`,
    async (ok) => {
      if (!ok) return;
      try {
        await window.smiApp.deleteMantenimiento(id);
        window.smiApp.showNotification?.('🗑️ Solicitud eliminada');
        await refrescarTodo();
      } catch (e) {
        alert('Error: ' + e.message);
      }
    }
  );
};

// ORDENES
async function handleBuscarOrdenes(e) {
  e.preventDefault();

  const nombre = document.getElementById('ordenTecnicoNombre').value.trim();
  const lista = document.getElementById('listaOrdenes');

  if (!nombre) return alert('Escribe el nombre del técnico');

  lista.className = 'loading';
  lista.textContent = 'Buscando órdenes...';

  try {
    const rows = await window.smiApp.getOrdenesPorTecnicoNombre(nombre);

    if (!rows.length) {
      lista.className = 'loading';
      lista.textContent = 'No hay órdenes para ese técnico.';
      return;
    }

    lista.className = '';
    lista.innerHTML = rows.map(o => `
      <div class="list-card">
        <div class="list-title">${escapeHtml(o.tecnico || nombre)}</div>

        <div class="list-meta">
          <div class="meta-row"><i class="bi bi-file-earmark-text"></i> Solicitud #${o.id}</div>
          <div class="meta-row"><i class="bi bi-building"></i> ${escapeHtml(o.maquinaria)}</div>
          <div class="meta-row"><i class="bi bi-flag"></i> Estado: <strong>${escapeHtml(o.estado)}</strong></div>
          <div class="meta-row"><i class="bi bi-exclamation-triangle"></i> Prioridad: <strong>${escapeHtml(o.prioridad)}</strong></div>
        </div>
      </div>
    `).join('');

  } catch (e2) {
    console.error('ERROR ORDENES:', e2);
    lista.className = 'loading';
    lista.innerHTML = '<div class="error">Error buscando órdenes</div>';
  }
}

function limpiarOrdenes() {
  document.getElementById('formOrdenes')?.reset();
  const lista = document.getElementById('listaOrdenes');
  lista.className = 'loading';
  lista.textContent = 'Escribe un técnico y presiona Buscar.';
}

function mostrarConfirmacion(titulo, mensaje, callback) {
  const modal = document.createElement('div');
  modal.id = 'modalConfirm';
  modal.style.cssText = `
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.55);
    display: flex; align-items: center; justify-content: center;
    z-index: 99999;
    padding: 16px;
  `;

  modal.innerHTML = `
    <div style="
      background: white;
      border-radius: 16px;
      padding: 22px;
      max-width: 420px;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0,0,0,0.25);
      border: 1px solid rgba(0,0,0,0.08);
      text-align:center;
    ">
      <h3 style="margin-bottom:10px; color:#111;">${titulo}</h3>
      <div style="margin-bottom:18px; color:#333; opacity:.85;">${mensaje}</div>
      <div style="display:flex; gap:10px; justify-content:center;">
        <button id="btnConfirmNo" style="
          padding: 12px 16px; border-radius: 10px; border: 2px solid #ddd;
          background:#f7f7f7; cursor:pointer; font-weight:700;
        ">Cancelar</button>

        <button id="btnConfirmSi" style="
          padding: 12px 16px; border-radius: 10px; border:none;
          background:#ef4444; color:white; cursor:pointer; font-weight:800;
        ">Sí, eliminar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.getElementById('btnConfirmSi').onclick = () => {
    document.body.removeChild(modal);
    callback(true);
  };
  document.getElementById('btnConfirmNo').onclick = () => {
    document.body.removeChild(modal);
    callback(false);
  };
}

function escapeHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}