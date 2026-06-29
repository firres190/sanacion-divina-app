// js/perfil.js
// Menú de perfil tipo dropdown: aparece debajo del ícono al tocarlo.
// Opciones directas: Editar nombre / Cerrar sesión.

function obtenerInicialNombre() {
  const nombre = localStorage.getItem('sd_nombre') || '';
  if (nombre.trim()) return nombre.trim().charAt(0).toUpperCase();
  const email = localStorage.getItem('sd_email') || '';
  return email.charAt(0).toUpperCase() || '?';
}

function htmlBotonPerfil() {
  if (!localStorage.getItem('sd_session')) return '';
  return `
    <div style="position:relative;">
      <button class="boton-perfil" id="botonPerfil" onclick="toggleDropdownPerfil(event)" aria-label="Mi perfil">
        ${obtenerInicialNombre()}
      </button>
      <div id="dropdownPerfil" style="
        display:none;
        position:absolute;
        top:44px;right:0;
        background:var(--crema-card);
        border:1px solid var(--borde);
        border-radius:12px;
        box-shadow:0 4px 16px rgba(42,34,32,0.14);
        min-width:190px;
        z-index:500;
        overflow:hidden;
      ">
        <div style="padding:12px 16px 8px;border-bottom:1px solid var(--borde);">
          <div style="font-size:13px;font-weight:700;color:var(--texto);">${localStorage.getItem('sd_nombre') || 'Mi cuenta'}</div>
          <div style="font-size:11.5px;color:var(--texto-suave);margin-top:2px;">${localStorage.getItem('sd_email') || ''}</div>
        </div>
        <button onclick="abrirEditarNombre()" style="width:100%;background:none;border:none;padding:13px 16px;text-align:left;font-size:14px;color:var(--texto);cursor:pointer;display:flex;align-items:center;gap:10px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Editar nombre
        </button>
        <button onclick="cerrarSesionPerfil()" style="width:100%;background:none;border:none;border-top:1px solid var(--borde);padding:13px 16px;text-align:left;font-size:14px;color:var(--vino);cursor:pointer;display:flex;align-items:center;gap:10px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/></svg>
          Cerrar sesión
        </button>
      </div>
    </div>`;
}

function htmlModalEditarNombre() {
  return `
    <div class="modal-perfil" id="modalEditarNombre">
      <div class="hoja-perfil">
        <div class="avatar-perfil" id="avatarEditar">${obtenerInicialNombre()}</div>
        <div class="campo-formulario">
          <label for="inputNombrePerfil">Tu nombre</label>
          <input type="text" id="inputNombrePerfil" placeholder="¿Cómo te llamas?" maxlength="60">
        </div>
        <button class="boton-primario" style="margin-top:4px;" onclick="guardarNombrePerfil()">Guardar</button>
        <p style="text-align:center;margin-top:14px;">
          <a href="#" onclick="cerrarEditarNombre();return false;" style="color:var(--texto-suave);font-size:13px;">Cancelar</a>
        </p>
      </div>
    </div>`;
}

function inyectarPerfilEnPagina() {
  document.body.insertAdjacentHTML('beforeend', htmlModalEditarNombre());
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('dropdownPerfil');
    const boton = document.getElementById('botonPerfil');
    if (dropdown && !boton?.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.style.display = 'none';
    }
  });
}

function toggleDropdownPerfil(e) {
  e.stopPropagation();
  const dropdown = document.getElementById('dropdownPerfil');
  dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

function abrirEditarNombre() {
  document.getElementById('dropdownPerfil').style.display = 'none';
  document.getElementById('inputNombrePerfil').value = localStorage.getItem('sd_nombre') || '';
  document.getElementById('modalEditarNombre').classList.add('visible');
}

function cerrarEditarNombre() {
  document.getElementById('modalEditarNombre').classList.remove('visible');
}

async function guardarNombrePerfil() {
  const nombre = document.getElementById('inputNombrePerfil').value.trim();
  const token = localStorage.getItem('sd_session');

  try {
    await fetch('/api/actualizar-perfil', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionToken: token, nombre })
    });
    localStorage.setItem('sd_nombre', nombre);
    cerrarEditarNombre();
    // Actualizar la inicial en el botón y en el dropdown
    const boton = document.getElementById('botonPerfil');
    if (boton) boton.textContent = obtenerInicialNombre();
  } catch (e) {
    alert('No pudimos guardar tu nombre. Intenta de nuevo.');
  }
}

function cerrarSesionPerfil() {
  localStorage.removeItem('sd_session');
  localStorage.removeItem('sd_email');
  localStorage.removeItem('sd_nombre');
  localStorage.removeItem('sd_santo');
  localStorage.removeItem('sd_dia_desbloqueado');
  localStorage.removeItem('sd_dias_completados');
  window.location.href = 'index.html';
}
