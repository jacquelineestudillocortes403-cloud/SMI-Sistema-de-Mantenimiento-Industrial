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
  // Formularios de registro
  document.getElementById('formUsuario')?.addEventListener('submit', handleSaveUsuario);
  document.getElementById('formMaquinaria')?.addEventListener('submit', handleSaveMaquinaria);
  document.getElementById('formTecnico')?.addEventListener('submit', handleSaveTecnico);
  document.getElementById('formMantenimiento')?.addEventListener('submit', handleSaveMantenimiento);
  document.getElementById('formOrdenes')?.addEventListener('submit', handleBuscarOrdenes);

  // Formularios modales
  document.getElementById('formUsuarioEdit')?.addEventListener('submit', handleUpdateUsuarioEdit);
  document.getElementById('formMaquinariaEdit')?.addEventListener('submit', handleUpdateMaquinariaEdit);
  document.getElementById('formTecnicoEdit')?.addEventListener('submit', handleUpdateTecnicoEdit);
  document.getElementById('formMantenimientoEdit')?.addEventListener('submit', handleUpdateMantenimientoEdit);

  // Botones cancelar 
  document.getElementById('btnCancelarUsr')?.addEventListener('click', () => limpiarFormUsuario());
  document.getElementById('btnCancelarMaq')?.addEventListener('click', () => limpiarFormMaquinaria());
  document.getElementById('btnCancelarTec')?.addEventListener('click', () => limpiarFormTecnico());
  document.getElementById('btnCancelarMtto')?.addEventListener('click', () => limpiarFormMantenimiento());
  document.getElementById('btnLimpiarOrdenes')?.addEventListener('click', () => limpiarOrdenes());

  // Cerrar modales
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => closeModal(btn.dataset.closeModal));
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (ev) => {
      if (ev.target === overlay) closeModal(overlay.id);
    });
  });

  document.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Escape') return;
    document.querySelectorAll('.modal-overlay.active').forEach(m => closeModal(m.id));
  });
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

// MODALES
function openModal(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  const el = document.getElementById(id);
  if (!el) return;

  const form = el.querySelector('form');
  if (form) form.reset();

  el.querySelectorAll('input[type="hidden"]').forEach(h => h.value = '');

  el.classList.remove('active');
  document.body.style.overflow = '';
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

async function handleSaveUsuario(e) {
  e.preventDefault();

  const form = document.getElementById('formUsuario');
  const nombre = document.getElementById('usrNombre').value.trim();
  const correo = document.getElementById('usrCorreo').value.trim();
  const rol = document.getElementById('usrRol').value;
  const contrasena = document.getElementById('usrPass').value;
  const passInput = document.getElementById('usrPass');
  passInput.setAttribute('required', 'required');

  if (!form.reportValidity()) return;

  try {
    await window.smiApp.createUsuario({ nombre, correo, rol, contrasena });
    window.smiApp.showNotification?.('✅ Usuario creado');

    limpiarFormUsuario();
    await refrescarTodo();
  } catch (e2) {
    alert('Error: ' + e2.message);
  }
}

function limpiarFormUsuario() {
  document.getElementById('formUsuario')?.reset();
  document.getElementById('usrId').value = '';
  document.getElementById('usrPass')?.setAttribute('required', 'required');
}

// Modal usuario
window.editarUsuario = function(id, nombreEnc, correoEnc, rol) {
  document.getElementById('usrEditId').value = id;
  document.getElementById('usrEditNombre').value = decodeURIComponent(nombreEnc);
  document.getElementById('usrEditCorreo').value = decodeURIComponent(correoEnc);
  document.getElementById('usrEditRol').value = rol;
  document.getElementById('usrEditPass').value = '';

  openModal('modalUsuario');
};

async function handleUpdateUsuarioEdit(e) {
  e.preventDefault();

  const form = document.getElementById('formUsuarioEdit');
  if (!form.reportValidity()) return;

  const id = document.getElementById('usrEditId').value;
  const nombre = document.getElementById('usrEditNombre').value.trim();
  const correo = document.getElementById('usrEditCorreo').value.trim();
  const rol = document.getElementById('usrEditRol').value;
  const contrasena = document.getElementById('usrEditPass').value;

  try {
    const data = { nombre, correo, rol };
    if (contrasena) data.contrasena = contrasena;

    await window.smiApp.updateUsuario(id, data);
    window.smiApp.showNotification?.('✅ Usuario actualizado');

    closeModal('modalUsuario');
    await refrescarTodo();
  } catch (e2) {
    alert('Error: ' + e2.message);
  }
}

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

// Registro de maquinaria
async function handleSaveMaquinaria(e) {
  e.preventDefault();

  const form = document.getElementById('formMaquinaria');
  if (!form.reportValidity()) return;

  const nombre = document.getElementById('maqNombre').value.trim();
  const modelo = document.getElementById('maqModelo').value.trim();
  const area = document.getElementById('maqArea').value.trim();
  const estado = document.getElementById('maqEstado').value;

  try {
    await window.smiApp.createMaquinaria({ nombre, modelo, area, estado });
    window.smiApp.showNotification?.('✅ Maquinaria creada');

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

// Modal Maquinaria
window.editarMaquinaria = function(id, nEnc, modEnc, areaEnc, estEnc) {
  document.getElementById('maqEditId').value = id;
  document.getElementById('maqEditNombre').value = decodeURIComponent(nEnc);
  document.getElementById('maqEditModelo').value = decodeURIComponent(modEnc);
  document.getElementById('maqEditArea').value = decodeURIComponent(areaEnc);
  document.getElementById('maqEditEstado').value = decodeURIComponent(estEnc);

  openModal('modalMaquinaria');
};

async function handleUpdateMaquinariaEdit(e) {
  e.preventDefault();

  const form = document.getElementById('formMaquinariaEdit');
  if (!form.reportValidity()) return;

  const id = document.getElementById('maqEditId').value;
  const nombre = document.getElementById('maqEditNombre').value.trim();
  const modelo = document.getElementById('maqEditModelo').value.trim();
  const area = document.getElementById('maqEditArea').value.trim();
  const estado = document.getElementById('maqEditEstado').value;

  try {
    await window.smiApp.updateMaquinaria(id, { nombre, modelo, area, estado });
    window.smiApp.showNotification?.('✅ Maquinaria actualizada');

    closeModal('modalMaquinaria');
    await refrescarTodo();
  } catch (e2) {
    alert('Error: ' + e2.message);
  }
}

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
        await refrescarTodo();
      } catch (e) {
        alert('Error: ' + e.message);
      }
    }
  );
};

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

// egistro de tecnico
async function handleSaveTecnico(e) {
  e.preventDefault();

  const form = document.getElementById('formTecnico');
  if (!form.reportValidity()) return;

  const nombre = document.getElementById('tecNombre').value.trim();
  const especialidad = document.getElementById('tecEspecialidad').value.trim();
  const telefono = document.getElementById('tecTelefono').value.trim();

  try {
    await window.smiApp.createTecnico({ nombre, especialidad, telefono });
    window.smiApp.showNotification?.('✅ Técnico creado');

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

// Modal tecnico
window.editarTecnico = function(id, nEnc, espEnc, telEnc) {
  document.getElementById('tecEditId').value = id;
  document.getElementById('tecEditNombre').value = decodeURIComponent(nEnc);
  document.getElementById('tecEditEspecialidad').value = decodeURIComponent(espEnc);
  document.getElementById('tecEditTelefono').value = decodeURIComponent(telEnc || '');

  openModal('modalTecnico');
};

async function handleUpdateTecnicoEdit(e) {
  e.preventDefault();

  const form = document.getElementById('formTecnicoEdit');
  if (!form.reportValidity()) return;

  const id = document.getElementById('tecEditId').value;
  const nombre = document.getElementById('tecEditNombre').value.trim();
  const especialidad = document.getElementById('tecEditEspecialidad').value.trim();
  const telefono = document.getElementById('tecEditTelefono').value.trim();

  try {
    await window.smiApp.updateTecnico(id, { nombre, especialidad, telefono });
    window.smiApp.showNotification?.('✅ Técnico actualizado');

    closeModal('modalTecnico');
    await refrescarTodo();
  } catch (e2) {
    alert('Error: ' + e2.message);
  }
}

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

// Mantenimiento
async function cargarMaquinariaParaSelect() {
  const selectMain = document.getElementById('mttoMaquinaria');
  const selectEdit = document.getElementById('mttoEditMaquinaria');

  try {
    const maq = await window.smiApp.getMaquinaria();
    const html =
      '<option value="">Selecciona...</option>' +
      maq.map(m => `<option value="${m.id}">${escapeHtml(m.nombre)}</option>`).join('');

    if (selectMain) selectMain.innerHTML = html;
    if (selectEdit) selectEdit.innerHTML = html;
  } catch (e) {
    console.error('ERROR select maquinaria:', e);
  }
}

async function cargarTecnicosParaSelect() {
  const selectMain = document.getElementById('mttoTecnico');
  const selectEdit = document.getElementById('mttoEditTecnico');

  try {
    const tecnicos = await window.smiApp.getTecnicos();
    const html =
      '<option value="">Selecciona un técnico...</option>' +
      tecnicos.map(t => `<option value="${t.id}">${escapeHtml(t.nombre)}</option>`).join('');

    if (selectMain) selectMain.innerHTML = html;
    if (selectEdit) selectEdit.innerHTML = html;
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

// Registro de mantenimiento
async function handleSaveMantenimiento(e) {
  e.preventDefault();

  const form = document.getElementById('formMantenimiento');
  if (!form.reportValidity()) return;

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

    await window.smiApp.createMantenimiento(payload);
    window.smiApp.showNotification?.('✅ Solicitud registrada');

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

window.editarMantenimiento = async function(id, maquinaria_id, tecnico_id, prioridad, estado, descEnc) {
  await cargarMaquinariaParaSelect();
  await cargarTecnicosParaSelect();

  document.getElementById('mttoEditId').value = id;
  document.getElementById('mttoEditMaquinaria').value = maquinaria_id;
  document.getElementById('mttoEditTecnico').value = tecnico_id ?? '';
  document.getElementById('mttoEditPrioridad').value = prioridad;
  document.getElementById('mttoEditEstado').value = estado;
  document.getElementById('mttoEditDesc').value = decodeURIComponent(descEnc);

  openModal('modalMantenimiento');
};

async function handleUpdateMantenimientoEdit(e) {
  e.preventDefault();

  const form = document.getElementById('formMantenimientoEdit');
  if (!form.reportValidity()) return;

  const id = document.getElementById('mttoEditId').value;
  const maquinaria_id = document.getElementById('mttoEditMaquinaria').value;
  const tecnico_id = document.getElementById('mttoEditTecnico').value;
  const prioridad = document.getElementById('mttoEditPrioridad').value;
  const estado = document.getElementById('mttoEditEstado').value;
  const descripcion_falla = document.getElementById('mttoEditDesc').value.trim();
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

    await window.smiApp.updateMantenimiento(id, payload);
    window.smiApp.showNotification?.('✅ Mantenimiento actualizado');

    closeModal('modalMantenimiento');
    await refrescarTodo();
  } catch (e2) {
    alert('Error: ' + e2.message);
  }
}

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

// ELIMINACIÓN
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