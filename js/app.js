(function () {
    'use strict';

    var API_BASE_URL = window.API_BASE_URL || 'https://sistema-erp-zt38.onrender.com';

    function sha256(str) {
        var msg = unescape(encodeURIComponent(str));
        var len = msg.length;
        var words = [];
        for (var i = 0; i < len; i++) {
            words[i >> 2] |= (msg.charCodeAt(i) & 0xff) << (24 - (i % 4) * 8);
        }
        words[len >> 2] |= 0x80 << (24 - (len % 4) * 8);
        words[((len + 8) >> 6) * 16 + 15] = len * 8;
        var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
        var K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0c13,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
        for (var blk = 0; blk < words.length; blk += 16) {
            var w = words.slice(blk, blk + 16);
            for (var t = 16; t < 64; t++) {
                var s0 = ((w[t-15] >>> 7) | (w[t-15] << 25)) ^ ((w[t-15] >>> 18) | (w[t-15] << 14)) ^ (w[t-15] >>> 3);
                var s1 = ((w[t-2] >>> 17) | (w[t-2] << 15)) ^ ((w[t-2] >>> 19) | (w[t-2] << 13)) ^ (w[t-2] >>> 10);
                w[t] = (w[t-16] + s0 + w[t-7] + s1) | 0;
            }
            var a = H[0], b = H[1], c = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
            for (t = 0; t < 64; t++) {
                var S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
                var ch = (e & f) ^ ((~e) & g);
                var temp1 = (h + S1 + ch + K[t] + w[t]) | 0;
                var S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
                var maj = (a & b) ^ (a & c) ^ (b & c);
                var temp2 = (S0 + maj) | 0;
                h = g; g = f; f = e; e = (d + temp1) | 0; d = c; c = b; b = a; a = (temp1 + temp2) | 0;
            }
            H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0;
            H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
        }
        var hex = '';
        for (var i = 0; i < 8; i++) {
            var v = H[i];
            hex += ((v >>> 24) & 0xff).toString(16).padStart(2, '0');
            hex += ((v >>> 16) & 0xff).toString(16).padStart(2, '0');
            hex += ((v >>> 8) & 0xff).toString(16).padStart(2, '0');
            hex += (v & 0xff).toString(16).padStart(2, '0');
        }
        return hex;
    }

    function sanitizar(str) {
        if (!str) return '';
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    function validarTexto(val, nombre, min, max) {
        if (!val || val.length < min) return nombre + ' debe tener al menos ' + min + ' caracteres.';
        if (val.length > max) return nombre + ' no debe exceder ' + max + ' caracteres.';
        return null;
    }

    function validarNumero(val, nombre, min, max) {
        if (isNaN(val)) return nombre + ' debe ser un numero valido.';
        if (val < min) return nombre + ' debe ser al menos ' + min + '.';
        if (max !== null && val > max) return nombre + ' no debe exceder ' + max + '.';
        return null;
    }

    function validarEmail(val) {
        if (!val) return null;
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(val)) return 'El email no tiene un formato valido.';
        return null;
    }

    function validarTelefono(val) {
        if (!val) return null;
        var re = /^\+?[\d\s\-().]{7,20}$/;
        if (!re.test(val)) return 'El telefono no tiene un formato valido.';
        return null;
    }

    function mostrarErrores(errs) {
        if (!errs || errs.length === 0) return false;
        var texto = errs.join('<br>');
        SwalDark.fire({ icon: 'warning', title: 'Errores de validacion', html: '<div style="text-align:left;font-size:13px;line-height:1.8;">' + texto + '</div>' });
        return true;
    }

    var SwalDark = Swal.mixin({
        background: '#1a1d24',
        color: '#ffffff',
        confirmButtonColor: '#0f766e',
        cancelButtonColor: '#475569',
        iconColor: '#0f766e'
    });

    /* =================================================================
       MÓDULO DE SEGURIDAD — AUTENTICACIÓN VÍA SUPABASE
    ================================================================= */
    var usuarioActivo = null;

    var loginOverlay = document.getElementById('loginOverlay');
    var loginForm    = document.getElementById('loginForm');
    var loginUser    = document.getElementById('loginUser');
    var loginPass    = document.getElementById('loginPass');
    var loginError   = document.getElementById('loginError');
    var loginBtn     = document.getElementById('loginBtn');
    var appLayout    = document.getElementById('appLayout');

    appLayout.style.display = 'none';

    function aplicarRestriccionesRol() {
        var navDashboard = document.querySelector('.nav-item[data-section="dashboard"]');
        var navCompras   = document.querySelector('.nav-item[data-section="compras"]');
        var navGestionUsuarios = document.querySelector('.nav-item-admin-only');
        var navRRHH = document.querySelector('.nav-item-rrhh-only');
        if (usuarioActivo.rol === 'Vendedor') {
            if (navDashboard) navDashboard.style.display = 'none';
            if (navCompras) navCompras.style.display = 'none';
        } else {
            if (navDashboard) navDashboard.style.display = '';
            if (navCompras) navCompras.style.display = '';
        }
        if (navGestionUsuarios) {
            navGestionUsuarios.style.display = usuarioActivo.rol === 'Admin' ? '' : 'none';
        }
        if (navRRHH) {
            navRRHH.style.display = (usuarioActivo.rol === 'Admin' || usuarioActivo.rol === 'Gerente') ? '' : 'none';
        }
    }

    function actualizarSidebarUsuario() {
        var userNameEl = document.querySelector('.user-name');
        var userRoleEl = document.querySelector('.user-role');
        var avatarEl   = document.querySelector('.avatar span');

        if (userNameEl) userNameEl.textContent = usuarioActivo.nombre;
        if (userRoleEl) userRoleEl.textContent = usuarioActivo.rol;
        if (avatarEl)   avatarEl.textContent   = usuarioActivo.nombre.charAt(0).toUpperCase();
    }

    function iniciarSesion(usuario) {
        usuarioActivo = usuario;
        loginOverlay.classList.add('hidden');
        appLayout.style.display = '';
        aplicarRestriccionesRol();
        actualizarSidebarUsuario();
        lucide.createIcons();

        cargarInventario().then(function () {
            cargarAlertasStock();
            var defaultSection = usuario.rol === 'Vendedor' ? 'ventas' : 'dashboard';
            navigateTo(defaultSection);
        });
    }

    function cerrarSesion() {
        registrarAuditoria('Cierre de sesion', 'Seguridad');
        usuarioActivo = null;
        localStorage.clear();
        if (chartVentasInst) { chartVentasInst.destroy(); chartVentasInst = null; }
        if (chartStockInst)  { chartStockInst.destroy();  chartStockInst  = null; }
        window.location.href = 'index.html';
    }

    var togglePass = document.getElementById('togglePass');
    if (togglePass) {
        togglePass.addEventListener('click', function () {
            var passInput = document.getElementById('loginPass');
            var icon = this.querySelector('[data-lucide]');
            if (passInput.type === 'password') {
                passInput.type = 'text';
                if (icon) icon.setAttribute('data-lucide', 'eye-off');
            } else {
                passInput.type = 'password';
                if (icon) icon.setAttribute('data-lucide', 'eye');
            }
            lucide.createIcons();
        });
    }

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        var user = loginUser.value.trim();
        var pass = loginPass.value;

        var errs = [];
        var eUser = validarTexto(user, 'Usuario', 3, 50);
        if (eUser) errs.push(eUser);
        var ePass = validarTexto(pass, 'Contrasena', 3, 50);
        if (ePass) errs.push(ePass);
        if (errs.length > 0) { loginError.textContent = errs.join('. '); return; }

        loginError.textContent = 'Verificando...';
        loginBtn.disabled = true;

        try {
            var result = await supabase
                .from('usuarios')
                .select('*')
                .eq('nombre', user)
                .eq('password_hash', sha256(pass));

            if (result.error) throw result.error;

            if (!result.data || result.data.length === 0) {
                result = await supabase
                    .from('usuarios')
                    .select('*')
                    .eq('nombre', user)
                    .eq('password_hash', pass);
                if (result.error) throw result.error;
            }

            if (result.data && result.data.length > 0) {
                var usuarioDB = result.data[0];
                localStorage.setItem('erp_rol', usuarioDB.rol);
                loginError.textContent = '';

                var ahora = new Date().toISOString();
                supabase.from('usuarios').update({ ultimo_acceso: ahora }).eq('id', usuarioDB.id);
                supabase.from('auditoria').insert([{ usuario_nombre: usuarioDB.nombre, accion: 'Inicio de sesion', modulo: 'Seguridad', fecha: ahora }]);
                usuarioDB.ultimo_acceso = ahora;

                iniciarSesion(usuarioDB);
            } else {
                SwalDark.fire({
                    icon: 'error',
                    title: 'Credenciales incorrectas',
                    text: 'Verifica tu usuario y contraseña.',
                    confirmButtonText: 'Reintentar'
                });
                loginPass.value = '';
                loginPass.focus();
                loginBtn.disabled = false;
            }
        } catch (err) {
            loginError.textContent = 'Error de conexion. Intenta de nuevo.';
            loginBtn.disabled = false;
        }
    });

    /* =================================================================
       MÓDULO DE INVENTARIO — PRODUCTOS (SUPABASE)
    ================================================================= */
    var productos = [];
    var mostrandoArchivados = false;

    async function cargarInventario(soloActivos) {
        if (soloActivos === undefined) soloActivos = true;
        try {
            var query = supabase.from('productos').select('*');
            query = query.eq('activo', soloActivos);
            var prodRes = await query;
            if (prodRes.error) throw prodRes.error;

            var invRes = await supabase.from('inventario').select('*');
            if (invRes.error) throw invRes.error;

            var prods = prodRes.data || [];
            var invs  = invRes.data || [];

            var mapaInv = {};
            for (var i = 0; i < invs.length; i++) {
                mapaInv[invs[i].producto_sku] = invs[i];
            }

            productos = [];
            for (var j = 0; j < prods.length; j++) {
                var p = prods[j];
                var inv = mapaInv[p.sku] || null;
                productos.push({
                    sku:          p.sku          || '',
                    numero_serie: p.numero_serie || '',
                    marca:        p.marca        || '',
                    modelo:       p.modelo       || '',
                    categoria:    p.categoria    || '',
                    costo:        p.costo        || 0,
                    precio:       p.precio       || 0,
                    stock_actual: inv ? (inv.stock_actual || 0) : 0,
                    stock_minimo: inv ? (inv.stock_minimo || 0) : 0,
                    ubicacion:    inv ? (inv.ubicacion    || '') : ''
                });
            }
        } catch (err) {
            console.error('Error al cargar inventario:', err);
        }
    }

    function renderTablaInventario() {
        var vieja = document.getElementById('tablaInventario');
        if (!vieja) return;

        var tabla = document.createElement('table');
        tabla.className = vieja.className;
        tabla.id = 'tablaInventario';

        var thead = tabla.createTHead();
        var hr = thead.insertRow();
        var headers = ['SKU','Marca','Modelo','Categoria','Precio','Stock Actual','Stock Minimo','Ubicacion','Estado','Acciones'];
        for (var hi = 0; hi < headers.length; hi++) {
            var th = document.createElement('th');
            th.textContent = headers[hi];
            hr.appendChild(th);
        }

        var tbody = tabla.createTBody();
        var esAdmin = usuarioActivo && usuarioActivo.rol === 'Admin';
        var puedeGestionar = usuarioActivo && (usuarioActivo.rol === 'Admin' || usuarioActivo.rol === 'Gerente');

        for (var i = 0; i < productos.length; i++) {
            var p = productos[i];
            var critico = p.stock_actual <= p.stock_minimo;
            var tr = tbody.insertRow();
            if (critico) tr.className = 'fila-critica';

            var td0 = tr.insertCell(); td0.className = 'cell-id'; td0.textContent = p.sku;
            var td1 = tr.insertCell(); td1.textContent = p.marca;
            var td2 = tr.insertCell(); td2.textContent = p.modelo;
            var td3 = tr.insertCell(); td3.textContent = p.categoria;
            var td4 = tr.insertCell(); td4.textContent = '$' + (p.precio || 0).toFixed(2);
            var td5 = tr.insertCell(); td5.textContent = p.stock_actual;
            var td6 = tr.insertCell(); td6.textContent = p.stock_minimo;
            var td7 = tr.insertCell(); td7.textContent = p.ubicacion || '—';
            var td8 = tr.insertCell(); td8.innerHTML = '<span class="badge ' + (critico ? 'danger' : 'success') + '">' + (critico ? 'Critico' : 'En stock') + '</span>';

            var td9 = tr.insertCell();
            if (esAdmin || puedeGestionar) {
                if (mostrandoArchivados) {
                    if (esAdmin) {
                        var btnRest = document.createElement('button');
                        btnRest.className = 'btn-restaurar';
                        btnRest.title = 'Restaurar producto';
                        btnRest.setAttribute('data-sku', p.sku);
                        btnRest.innerHTML = '<i data-lucide="undo-2"></i>';
                        btnRest.addEventListener('click', function () {
                            var sku = this.getAttribute('data-sku');
                            restaurarProducto(sku);
                        });
                        td9.appendChild(btnRest);
                    } else {
                        td9.textContent = '—';
                        td9.style.textAlign = 'center';
                        td9.style.color = 'var(--subtle)';
                    }
                } else {
                    if (puedeGestionar) {
                        var btnReab = document.createElement('button');
                        btnReab.className = 'btn-reabastecer';
                        btnReab.title = 'Reabastecer stock';
                        btnReab.setAttribute('data-sku', p.sku);
                        btnReab.setAttribute('data-stock', p.stock_actual);
                        btnReab.innerHTML = '<i data-lucide="package-plus"></i>';
                        btnReab.addEventListener('click', function () {
                            var sku = this.getAttribute('data-sku');
                            var stock = parseInt(this.getAttribute('data-stock'), 10);
                            reabastecerStock(sku, stock);
                        });
                        td9.appendChild(btnReab);
                    }
                    if (esAdmin) {
                        var btnDel = document.createElement('button');
                        btnDel.className = 'btn-eliminar';
                        btnDel.title = 'Archivar producto';
                        btnDel.setAttribute('data-sku', p.sku);
                        btnDel.innerHTML = '<i data-lucide="archive"></i>';
                        btnDel.addEventListener('click', function () {
                            var sku = this.getAttribute('data-sku');
                            eliminarProducto(sku);
                        });
                        td9.appendChild(btnDel);
                    }
                }
            } else {
                td9.textContent = '—';
                td9.style.textAlign = 'center';
                td9.style.color = 'var(--subtle)';
            }
        }

        vieja.parentNode.replaceChild(tabla, vieja);
    }

    async function registrarProducto(sku, numeroSerie, marca, modelo, categoria, costo, precio, stockActual, stockMinimo, ubicacion) {
        try {
            var prodResult = await supabase
                .from('productos')
                .insert([{ sku: sku, numero_serie: numeroSerie, marca: marca, modelo: modelo, categoria: categoria, costo: Number(costo), precio: Number(precio) }]);
            if (prodResult.error) throw prodResult.error;

            var invResult = await supabase
                .from('inventario')
                .insert([{ producto_sku: sku, stock_actual: Number(stockActual), stock_minimo: Number(stockMinimo), ubicacion: ubicacion }]);
            if (invResult.error) throw invResult.error;

            await cargarInventario();
            renderTablaInventario();
            registrarAuditoria('Registro nuevo producto: ' + sku, 'Inventario');
            SwalDark.fire({ icon: 'success', title: 'Producto registrado', text: 'El producto se agrego al inventario.', timer: 2000, showConfirmButton: false });
            return true;
        } catch (err) {
            SwalDark.fire({ icon: 'error', title: 'Error al registrar', text: err.message || err });
            return false;
        }
    }

    async function eliminarProducto(sku) {
        var result = await SwalDark.fire({
            icon: 'warning',
            title: 'Archivar producto',
            text: 'Se archivara ' + sku + '. No se perdera el historial de ventas.',
            showCancelButton: true,
            confirmButtonColor: '#d97706',
            cancelButtonColor: '#475569',
            confirmButtonText: 'Si, archivar',
            cancelButtonText: 'Cancelar'
        });

        if (!result.isConfirmed) return;

        try {
            var updResult = await supabase.from('productos').update({ activo: false }).eq('sku', sku);
            if (updResult.error) throw updResult.error;

            await cargarInventario();
            renderTablaInventario();
            lucide.createIcons();
            registrarAuditoria('Archivo producto: ' + sku, 'Inventario');
            SwalDark.fire({ icon: 'success', title: 'Archivado', text: sku + ' fue archivado del inventario activo.', timer: 2000, showConfirmButton: false });
        } catch (err) {
            SwalDark.fire({ icon: 'error', title: 'Error al archivar', text: err.message || err });
        }
    }

    async function restaurarProducto(sku) {
        try {
            var updResult = await supabase.from('productos').update({ activo: true }).eq('sku', sku);
            if (updResult.error) throw updResult.error;

            await cargarInventario(false);
            renderTablaInventario();
            lucide.createIcons();
            registrarAuditoria('Restauro producto: ' + sku, 'Inventario');
            SwalDark.fire({ icon: 'success', title: 'Restaurado', text: sku + ' ha vuelto al inventario activo.', timer: 2000, showConfirmButton: false });
        } catch (err) {
            SwalDark.fire({ icon: 'error', title: 'Error al restaurar', text: err.message || err });
        }
    }

    async function reabastecerStock(sku, stockActual) {
        var result = await SwalDark.fire({
            icon: 'question',
            title: 'Reabastecer ' + sku,
            html: 'Stock actual: <b>' + stockActual + ' und</b><br><br>Cuantas unidades nuevas ingresaron?',
            input: 'number',
            inputAttributes: { min: '1', step: '1' },
            showCancelButton: true,
            confirmButtonColor: '#0f766e',
            cancelButtonColor: '#475569',
            confirmButtonText: 'Reabastecer',
            cancelButtonText: 'Cancelar',
            inputValidator: function (value) {
                var cant = parseInt(value, 10);
                if (!value || isNaN(cant) || cant <= 0) {
                    return 'Ingresa una cantidad valida mayor a 0.';
                }
                if (cant > 99999) {
                    return 'La cantidad no puede exceder 99,999 unidades.';
                }
            }
        });

        if (!result.isConfirmed) return;

        var cantidad = parseInt(result.value, 10);
        var nuevoTotal = stockActual + cantidad;

        try {
            var updResult = await supabase
                .from('inventario')
                .update({ stock_actual: nuevoTotal })
                .eq('producto_sku', sku);
            if (updResult.error) throw updResult.error;

            await cargarInventario(!mostrandoArchivados);
            renderTablaInventario();
            lucide.createIcons();
            registrarAuditoria('Ingreso ' + cantidad + ' und al producto ' + sku, 'Inventario');
            SwalDark.fire({ icon: 'success', title: 'Stock actualizado', text: sku + ' ahora tiene ' + nuevoTotal + ' unidades.', timer: 2000, showConfirmButton: false });
        } catch (err) {
            SwalDark.fire({ icon: 'error', title: 'Error al reabastecer', text: err.message || err });
        }
    }

    function limpiarFormularioInventario() {
        var inputs = document.querySelectorAll('.form-inventario input');
        for (var i = 0; i < inputs.length; i++) {
            inputs[i].value = '';
        }
    }

    async function autocompletarConIA() {
        var modeloInput = document.getElementById('invModelo');
        var modelo = (modeloInput ? modeloInput.value.trim() : '');

        if (!modelo) {
            SwalDark.fire({ icon: 'info', title: 'Escribe un modelo', text: 'Ingresa el nombre o modelo del producto tecnológico en el campo Modelo para usar el autocompletado.' });
            return;
        }

        Swal.fire({
            title: 'Buscando en la red neuronal...',
            html:
                '<div style="text-align:center;padding:16px 0;">' +
                '<div style="display:inline-block;position:relative;">' +
                '<div style="width:48px;height:48px;border-radius:50%;background:conic-gradient(from 0deg, #0d9488 0%, #14b8a6 25%, rgba(13,148,136,0.1) 60%, transparent 100%);animation:spinIA 1s linear infinite;mask:radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px));-webkit-mask:radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px));"></div>' +
                '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:28px;height:28px;background:rgba(13,148,136,0.12);border-radius:50%;box-shadow:0 0 20px rgba(13,148,136,0.2);"></div>' +
                '</div>' +
                '<p style="color:#a1a1aa;font-size:13px;margin:18px 0 0;font-weight:400;">Analizando "' + modelo + '"</p>' +
                '<p style="color:#52525b;font-size:11px;margin:6px 0 0;">Consultando a DeepSeek...</p>' +
                '</div>' +
                '<style>@keyframes spinIA{to{transform:rotate(360deg)}}</style>',
            background: '#09090b',
            color: '#d4d4d8',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: function () {
                var title = document.querySelector('.swal2-title');
                if (title) {
                    title.style.cssText = 'color:#5eead4;font-size:18px;font-weight:700;letter-spacing:-0.3px;';
                }
            }
        });

        try {
            var resp = await fetch(API_BASE_URL + '/api/autocompletar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ producto: modelo })
            });

            Swal.close();

            if (!resp.ok) {
                var errData = null;
                try { errData = await resp.json(); } catch (e) { }
                SwalDark.fire({
                    icon: 'error',
                    title: 'Error del servicio IA',
                    text: (errData && errData.error) ? errData.error : 'El servicio de autocompletado no respondió correctamente.',
                });
                return;
            }

            var data = await resp.json();

            var catInput = document.getElementById('invCategoria');
            var precioInput = document.getElementById('invPrecio');

            if (catInput && data.categoria) {
                catInput.value = data.categoria;
            }
            if (precioInput && data.precio_sugerido) {
                precioInput.value = data.precio_sugerido;
            }

            SwalDark.fire({
                icon: 'success',
                title: 'Campos autocompletados',
                html:
                    '<div style="font-size:13px;line-height:1.6;text-align:left;margin-top:8px;">' +
                    '<div style="display:flex;gap:10px;margin-bottom:4px;"><span style="color:#a1a1aa;">Categoria:</span><strong style="color:#5eead4;">' + (data.categoria || '—') + '</strong></div>' +
                    '<div style="display:flex;gap:10px;margin-bottom:4px;"><span style="color:#a1a1aa;">Precio sugerido:</span><strong style="color:#5eead4;">$' + (data.precio_sugerido || 0) + '</strong></div>' +
                    '</div>' +
                    '<p style="color:#52525b;font-size:11px;margin:10px 0 0;">' + (data.descripcion_corta || '') + '</p>',
                timer: 4000,
                showConfirmButton: true,
                confirmButtonText: 'Aceptar'
            });

        } catch (err) {
            Swal.close();
            SwalDark.fire({
                icon: 'error',
                title: 'Sin conexion con la IA',
                text: 'No se pudo contactar al servicio de autocompletado. Verifica tu conexion a internet.',
            });
        }
    }

    /* =================================================================
       MÓDULO DE VENTAS — PUNTO DE VENTA (SUPABASE)
    ================================================================= */
    var carrito = [];

    function buscarProductoPorSku(sku) {
        for (var i = 0; i < productos.length; i++) {
            if (productos[i].sku.toLowerCase() === sku.toLowerCase()) {
                return productos[i];
            }
        }
        return null;
    }

    async function buscarProductos(query) {
        var q = query.toLowerCase().trim();
        if (!q) {
            await cargarInventario();
            return productos;
        }

        try {
            var prodResult = await supabase
                .from('productos')
                .select('*')
                .eq('activo', true)
                .or('sku.ilike.%' + q + '%,modelo.ilike.%' + q + '%');

            if (prodResult.error) throw prodResult.error;

            var prods = prodResult.data || [];
            if (prods.length === 0) return [];

            var invResult = await supabase.from('inventario').select('*');
            if (invResult.error) throw invResult.error;

            var invs = invResult.data || [];
            var mapaInv = {};
            for (var i = 0; i < invs.length; i++) {
                mapaInv[invs[i].producto_sku] = invs[i];
            }

            var resultados = [];
            for (var j = 0; j < prods.length; j++) {
                var p = prods[j];
                var inv = mapaInv[p.sku] || {};
                resultados.push({
                    sku: p.sku, marca: p.marca, modelo: p.modelo, categoria: p.categoria,
                    precio: p.precio || 0,
                    stock_actual: inv.stock_actual || 0,
                    stock_minimo: inv.stock_minimo || 0,
                    ubicacion: inv.ubicacion || ''
                });
            }
            return resultados;
        } catch (err) {
            console.error('Error en busqueda:', err);
            return [];
        }
    }

    function renderResultadosBusqueda(resultados) {
        var contenedor = document.getElementById('posResultados');
        if (!contenedor) return;

        if (resultados.length === 0) {
            contenedor.innerHTML = '<p class="pos-empty">Sin resultados.</p>';
            return;
        }

        var html = '';
        for (var i = 0; i < resultados.length; i++) {
            var r = resultados[i];
            var sinStock = r.stock_actual <= 0;
            var sSku = sanitizar(r.sku);
            var sMarca = sanitizar(r.marca);
            var sModelo = sanitizar(r.modelo);
            var sCat = sanitizar(r.categoria);
            html += '<div class="pos-item-busqueda' + (sinStock ? ' pos-agotado' : '') + '"' +
                    (sinStock ? '' : ' data-sku="' + sSku + '"') + '>' +
                '<div class="pos-item-info">' +
                    '<span class="pos-item-sku">' + sSku + '</span>' +
                    '<span class="pos-item-modelo">' + sMarca + ' ' + sModelo + '</span>' +
                    '<span class="pos-item-cat">' + sCat + ' &middot; Stock: ' + r.stock_actual + '</span>' +
                '</div>' +
                '<div class="pos-item-precio">$' + (r.precio || 0).toFixed(2) + '</div>' +
                '<button class="pos-btn-add" data-sku="' + sSku + '"' + (sinStock ? ' disabled' : '') + '>+</button>' +
            '</div>';
        }
        contenedor.innerHTML = html;

        var btnsAdd = contenedor.querySelectorAll('.pos-btn-add');
        for (var j = 0; j < btnsAdd.length; j++) {
            btnsAdd[j].addEventListener('click', function () {
                var sku = this.getAttribute('data-sku');
                agregarAlCarrito(sku);
            });
        }
    }

    function actualizarCarrito() {
        var cartItems = document.getElementById('posCartItems');
        var cartFooter = document.getElementById('posCartFooter');
        if (!cartItems || !cartFooter) return;

        if (carrito.length === 0) {
            cartItems.innerHTML = '<p class="pos-empty">No hay productos en el carrito.</p>';
            cartFooter.style.display = 'none';
            return;
        }

        cartFooter.style.display = '';

        var subtotal = 0;
        var filas = '';
        for (var i = 0; i < carrito.length; i++) {
            var item = carrito[i];
            var prod = item.producto;
            var itemSubtotal = prod.precio * item.cantidad;
            subtotal += itemSubtotal;

            filas += '<div class="pos-cart-item">' +
                '<div class="pos-cart-item-info">' +
                    '<span class="pos-cart-item-modelo">' + sanitizar(prod.marca) + ' ' + sanitizar(prod.modelo) + '</span>' +
                    '<span class="pos-cart-item-sku">' + sanitizar(prod.sku) + ' &middot; $' + prod.precio.toFixed(2) + ' c/u</span>' +
                '</div>' +
                '<div class="pos-cart-item-cantidad">' +
                    '<button class="pos-cant-btn" data-index="' + i + '" data-delta="-1">&minus;</button>' +
                    '<span class="pos-cant-valor">' + item.cantidad + '</span>' +
                    '<button class="pos-cant-btn" data-index="' + i + '" data-delta="1">+</button>' +
                '</div>' +
                '<div class="pos-cart-item-sub">$' + itemSubtotal.toFixed(2) + '</div>' +
                '<button class="pos-cart-item-remove" data-index="' + i + '" title="Quitar">&times;</button>' +
            '</div>';
        }
        cartItems.innerHTML = filas;

        document.getElementById('posSubtotal').textContent = '$' + subtotal.toFixed(2);
        document.getElementById('posTotal').textContent = '$' + subtotal.toFixed(2);

        bindearBotonesCarrito();
    }

    function bindearBotonesCarrito() {
        var cantBtns = document.querySelectorAll('.pos-cant-btn');
        for (var j = 0; j < cantBtns.length; j++) {
            cantBtns[j].addEventListener('click', function () {
                var idx = parseInt(this.getAttribute('data-index'), 10);
                var delta = parseInt(this.getAttribute('data-delta'), 10);
                cambiarCantidad(idx, delta);
            });
        }

        var removeBtns = document.querySelectorAll('.pos-cart-item-remove');
        for (var k = 0; k < removeBtns.length; k++) {
            removeBtns[k].addEventListener('click', function () {
                var idx = parseInt(this.getAttribute('data-index'), 10);
                eliminarDelCarrito(idx);
            });
        }
    }

    function agregarAlCarrito(sku) {
        var producto = buscarProductoPorSku(sku);
        if (!producto) return;

        var cantidadEnCarrito = 0;
        for (var i = 0; i < carrito.length; i++) {
            if (carrito[i].producto.sku === sku) {
                cantidadEnCarrito += carrito[i].cantidad;
            }
        }

        if (cantidadEnCarrito >= producto.stock_actual) return;

        for (var j = 0; j < carrito.length; j++) {
            if (carrito[j].producto.sku === sku) {
                carrito[j].cantidad++;
                actualizarCarrito();
                return;
            }
        }

        carrito.push({ producto: producto, cantidad: 1 });
        actualizarCarrito();
    }

    function eliminarDelCarrito(index) {
        carrito.splice(index, 1);
        actualizarCarrito();
    }

    function cambiarCantidad(index, delta) {
        var item = carrito[index];
        var nuevaCantidad = item.cantidad + delta;

        if (nuevaCantidad <= 0) {
            eliminarDelCarrito(index);
            return;
        }

        if (nuevaCantidad > item.producto.stock_actual) return;

        item.cantidad = nuevaCantidad;
        actualizarCarrito();
    }

    async function completarVenta() {
        if (carrito.length === 0) return;

        var total = 0;
        for (var i = 0; i < carrito.length; i++) {
            total += carrito[i].producto.precio * carrito[i].cantidad;
        }

        try {
            var ventaResult = await supabase
                .from('ventas')
                .insert([{ usuario_id: usuarioActivo.id, total: total }])
                .select();
            if (ventaResult.error) throw ventaResult.error;
            var ventaId = ventaResult.data[0].id;

            for (var j = 0; j < carrito.length; j++) {
                var item = carrito[j];
                var subtotal = item.producto.precio * item.cantidad;

                var detResult = await supabase
                    .from('detalles_venta')
                    .insert([{ venta_id: ventaId, producto_sku: item.producto.sku, cantidad: item.cantidad, subtotal: subtotal }]);
                if (detResult.error) throw detResult.error;

                var nuevoStock = item.producto.stock_actual - item.cantidad;
                var invResult = await supabase
                    .from('inventario')
                    .update({ stock_actual: nuevoStock })
                    .eq('producto_sku', item.producto.sku);
                if (invResult.error) throw invResult.error;
            }

            await cargarInventario();

            for (var k = 0; k < productos.length; k++) {
                if (productos[k].stock_actual <= productos[k].stock_minimo) {
                    SwalDark.fire({
                        icon: 'warning',
                        title: 'Alerta de Stock',
                        text: productos[k].marca + ' ' + productos[k].modelo + ' requiere reabastecimiento.',
                        confirmButtonColor: '#0f766e'
                    });
                }
            }

            carrito = [];
            actualizarCarrito();
            registrarAuditoria('Completo nueva venta', 'Ventas');
            SwalDark.fire({
                icon: 'success',
                title: 'Venta completada',
                text: 'Total: $' + total.toFixed(2),
                confirmButtonColor: '#0f766e',
                timer: 2500,
                showConfirmButton: false
            });

            var searchInput = document.getElementById('posSearch');
            if (searchInput) {
                searchInput.value = '';
                renderResultadosBusqueda(productos);
            }

        } catch (err) {
            SwalDark.fire({
                icon: 'error',
                title: 'Error en la venta',
                text: err.message || err,
                confirmButtonColor: '#0f766e'
            });
        }
    }

    /* =================================================================
       DASHBOARD — KPIs DINÁMICOS (SUPABASE)
    ================================================================= */
    async function cargarKPIs() {
        var hoy = new Date().toISOString().slice(0, 10);

        try {
            var results = await Promise.all([
                supabase.from('ventas').select('total').gte('fecha', hoy).lte('fecha', hoy + 'T23:59:59'),
                supabase.from('ventas').select('id', { count: 'exact', head: true }).gte('fecha', hoy).lte('fecha', hoy + 'T23:59:59'),
                supabase.from('inventario').select('stock_actual, stock_minimo'),
                supabase.from('usuarios').select('id', { count: 'exact', head: true })
            ]);

            var ingresosEl  = document.getElementById('kpiIngresos');
            var ingresosSub = document.getElementById('kpiIngresosSub');
            var ordenesEl   = document.getElementById('kpiOrdenes');
            var ordenesSub  = document.getElementById('kpiOrdenesSub');
            var stockEl     = document.getElementById('kpiStockBajo');
            var usuariosEl  = document.getElementById('kpiUsuarios');
            var usuariosSub = document.getElementById('kpiUsuariosSub');

            var ventasHoy = results[0].data || [];
            var totalIngresos = 0;
            for (var i = 0; i < ventasHoy.length; i++) {
                totalIngresos += Number(ventasHoy[i].total || 0);
            }
            if (ingresosEl) ingresosEl.textContent = '$' + totalIngresos.toLocaleString('es-MX', { minimumFractionDigits: 2 });
            if (ingresosSub) { ingresosSub.textContent = ventasHoy.length + ' ventas hoy'; ingresosSub.className = 'stat-card-change up'; }

            var countOrdenes = results[1].count || 0;
            if (ordenesEl) ordenesEl.textContent = countOrdenes;
            if (ordenesSub) { ordenesSub.textContent = 'Ordenes del dia'; ordenesSub.className = 'stat-card-change up'; }

            var invs = results[2].data || [];
            var countStockBajo = 0;
            for (var j = 0; j < invs.length; j++) {
                if ((invs[j].stock_actual || 0) <= (invs[j].stock_minimo || 0)) countStockBajo++;
            }
            if (stockEl) stockEl.textContent = countStockBajo;

            var countUsuarios = results[3].count || 0;
            if (usuariosEl) usuariosEl.textContent = countUsuarios;
            if (usuariosSub) { usuariosSub.textContent = 'Registrados en el sistema'; usuariosSub.className = 'stat-card-change'; }

        } catch (err) {
            console.error('Error al cargar KPIs:', err);
        }
    }

    /* =================================================================
       DASHBOARD — GRÁFICOS E IA (CHART.JS + SUPABASE)
    ================================================================= */
    var chartVentasInst = null;
    var chartStockInst  = null;

    async function renderizarGraficos() {
        try {
            // --- GRÁFICO DE BARRAS: VENTAS ---
            var ventasRes = await supabase.from('ventas').select('fecha, total').order('fecha', { ascending: true });
            if (ventasRes.error) throw ventasRes.error;

            var ventas = ventasRes.data || [];
            var porDia = {};
            for (var i = 0; i < ventas.length; i++) {
                var dia = ventas[i].fecha ? ventas[i].fecha.slice(0, 10) : '—';
                porDia[dia] = (porDia[dia] || 0) + Number(ventas[i].total || 0);
            }
            var barColors = ['rgba(45, 212, 191, 0.85)', 'rgba(99, 102, 241, 0.85)', 'rgba(245, 158, 11, 0.85)', 'rgba(239, 68, 68, 0.85)', 'rgba(16, 185, 129, 0.85)', 'rgba(59, 130, 246, 0.85)', 'rgba(168, 85, 247, 0.85)', 'rgba(236, 72, 153, 0.85)'];
            var labelsV = Object.keys(porDia);
            var datosV  = Object.values(porDia);

            var ctxV = document.getElementById('chartVentas');
            if (ctxV) {
                if (chartVentasInst) { chartVentasInst.destroy(); chartVentasInst = null; }
                chartVentasInst = new Chart(ctxV, {
                    type: 'bar',
                    data: {
                        labels: labelsV.length ? labelsV : ['Sin datos'],
                        datasets: [{
                            label: 'Ventas ($)',
                            data: datosV.length ? datosV : [0],
                            backgroundColor: labelsV.map(function(_, i) { return barColors[i % barColors.length]; }),
                            hoverBackgroundColor: labelsV.map(function(_, i) { return barColors[i % barColors.length].replace('0.85', '1'); }),
                            borderRadius: 6,
                            borderSkipped: false,
                            barPercentage: 0.6,
                            categoryPercentage: 0.8
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { legend: { display: false } },
                        scales: {
                            y: {
                                ticks: { callback: function(v) { return '$' + v; }, color: '#94a3b8' },
                                grid: { display: false }
                            },
                            x: {
                                ticks: { color: '#94a3b8' },
                                grid: { display: false }
                            }
                        }
                    }
                });
            }

            // --- GRÁFICO DE DONA: INVENTARIO POR CATEGORÍA ---
            var prodRes = await supabase.from('productos').select('sku, categoria');
            if (prodRes.error) throw prodRes.error;
            var prods = prodRes.data || [];

            var invRes = await supabase.from('inventario').select('producto_sku, stock_actual');
            if (invRes.error) throw invRes.error;
            var invs = invRes.data || [];

            var stockMap = {};
            for (var j = 0; j < invs.length; j++) {
                stockMap[invs[j].producto_sku] = Number(invs[j].stock_actual) || 0;
            }

            var porCat = {};
            for (var k = 0; k < prods.length; k++) {
                var cat = prods[k].categoria || 'Sin Categoria';
                var sku = prods[k].sku || '';
                porCat[cat] = (porCat[cat] || 0) + (stockMap[sku] || 0);
            }

            var labelsS = Object.keys(porCat);
            var datosS  = Object.values(porCat);

            var sumaDatos = 0;
            for (var si = 0; si < datosS.length; si++) {
                sumaDatos += datosS[si];
            }

            var esFallback = (datosS.length === 0 || sumaDatos === 0);
            var labelsFinales = esFallback ? ['Sin Inventario'] : labelsS;
            var datosFinales   = esFallback ? [1] : datosS;
            var coloresFinales = esFallback ? ['#1f2937'] : ['#2dd4bf', '#6366f1', '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6', '#f97316', '#06b6d4', '#8b5cf6'];

            var ctxS = document.getElementById('stockCategoriaChart');
            if (ctxS) {
                if (chartStockInst) { chartStockInst.destroy(); chartStockInst = null; }
                chartStockInst = new Chart(ctxS, {
                    type: 'doughnut',
                    data: {
                        labels: labelsFinales,
                        datasets: [{
                            data: datosFinales,
                            backgroundColor: coloresFinales,
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '75%',
                        plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', font: { size: 11 } } } }
                    }
                });
            }

        } catch (err) {
            console.error('Error al renderizar graficos:', err);
        }
    }

    async function analizarTendencias() {
        Swal.fire({
            title: 'Analizando con IA',
            html:
                '<div style="text-align:center;padding:16px 0;">' +
                '<div style="display:inline-block;position:relative;">' +
                '<div style="width:56px;height:56px;border-radius:50%;background:conic-gradient(from 0deg, #0d9488 0%, #14b8a6 25%, rgba(13,148,136,0.1) 60%, transparent 100%);animation:spinIA 1s linear infinite;mask:radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px));-webkit-mask:radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px));"></div>' +
                '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:32px;height:32px;background:rgba(13,148,136,0.12);border-radius:50%;box-shadow:0 0 20px rgba(13,148,136,0.2);"></div>' +
                '</div>' +
                '<p style="color:#a1a1aa;font-size:13px;margin:20px 0 0;font-weight:400;">Consultando a DeepSeek...</p>' +
                '<p style="color:#52525b;font-size:11px;margin:6px 0 0;">Procesando ventas, inventario y alertas</p>' +
                '</div>' +
                '<style>@keyframes spinIA{to{transform:rotate(360deg)}}</style>',
            background: '#09090b',
            color: '#d4d4d8',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: function () {
                var title = document.querySelector('.swal2-title');
                if (title) {
                    title.style.cssText = 'color:#5eead4;font-size:20px;font-weight:700;letter-spacing:-0.3px;';
                }
            }
        });

        try {
            await cargarInventario();

            var detRes = await supabase.from('detalles_venta').select('producto_sku, cantidad, venta_id, ventas(fecha)');
            if (detRes.error) throw detRes.error;

            var detalles = detRes.data || [];

            var prodVelocidad = {};
            var ventasMap = {};
            for (var i = 0; i < detalles.length; i++) {
                var d = detalles[i];
                var sku = d.producto_sku;
                if (!prodVelocidad[sku]) prodVelocidad[sku] = 0;
                prodVelocidad[sku] += Number(d.cantidad || 0);

                if (!ventasMap[sku]) ventasMap[sku] = { producto: sku, cantidad: 0 };
                ventasMap[sku].cantidad += Number(d.cantidad || 0);
            }

            var fechaMin = null;
            var fechaMax = null;
            for (var j = 0; j < detalles.length; j++) {
                var f = detalles[j].ventas ? detalles[j].ventas.fecha : null;
                if (f) {
                    if (!fechaMin || f < fechaMin) fechaMin = f;
                    if (!fechaMax || f > fechaMax) fechaMax = f;
                }
            }

            var dias = 1;
            if (fechaMin && fechaMax) {
                dias = Math.max(1, Math.ceil((new Date(fechaMax) - new Date(fechaMin)) / (1000 * 60 * 60 * 24)));
            }

            var ventasData = [];
            var vKeys = Object.keys(ventasMap);
            for (var vi = 0; vi < vKeys.length; vi++) {
                var item = ventasMap[vKeys[vi]];
                var prodInfo = null;
                for (var pi = 0; pi < productos.length; pi++) {
                    if (productos[pi].sku === vKeys[vi]) { prodInfo = productos[pi]; break; }
                }
                if (prodInfo) {
                    item.producto = prodInfo.marca + ' ' + prodInfo.modelo;
                    item.total = Math.round(item.cantidad * prodInfo.precio * 100) / 100;
                }
                ventasData.push(item);
            }

            var inventarioData = [];
            var alertasData = [];
            for (var k = 0; k < productos.length; k++) {
                var prod = productos[k];
                inventarioData.push({
                    producto: prod.marca + ' ' + prod.modelo,
                    sku: prod.sku,
                    stock: prod.stock_actual || 0,
                    stock_minimo: prod.stock_minimo || 0,
                    precio: prod.precio || 0
                });

                var vendido = prodVelocidad[prod.sku] || 0;
                var velocidad = vendido / dias;
                var stock = prod.stock_actual || 0;

                if (velocidad > 0 && stock > 0) {
                    var diasAgotar = stock / velocidad;
                    if (diasAgotar <= 7) {
                        alertasData.push({
                            producto: prod.marca + ' ' + prod.modelo,
                            sku: prod.sku,
                            stock: stock,
                            velocidad: Number(Number(velocidad).toFixed(1)),
                            diasAgotar: Math.ceil(diasAgotar),
                            sugerido: Math.ceil(velocidad * 30)
                        });
                    }
                }
            }

            var payload = {
                ventas: ventasData,
                inventario: inventarioData,
                alertas: alertasData
            };

            var response = await fetch(API_BASE_URL + '/api/analisis', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                var errData = null;
                try { errData = await response.json(); } catch (ex) {}
                throw new Error(errData && errData.error ? errData.error : 'Error del servidor (' + response.status + ')');
            }

            var result = await response.json();
            var analisis = result.analisis || 'Sin respuesta de la IA.';

            Swal.fire({
                title: 'Reporte IA',
                html: _formatearReporteIA(analisis, ventasData.length, inventarioData.length, alertasData.length),
                background: '#09090b',
                color: '#d4d4d8',
                confirmButtonColor: '#0f766e',
                confirmButtonText: 'Entendido',
                width: '36em',
                customClass: { popup: 'swal-reporte-ia' },
                didOpen: function () {
                    var title = document.querySelector('.swal2-title');
                    if (title) title.style.cssText = 'color:#5eead4;font-size:19px;font-weight:700;letter-spacing:-0.3px;';
                    var popup = document.querySelector('.swal2-popup');
                    if (popup) popup.style.border = '1px solid rgba(13,148,136,0.12)';
                }
            });

        } catch (err) {
            var mensaje = 'El servicio de IA no esta disponible.';
            if (err.message && (err.message.includes('Failed to fetch') || err.message.includes('NetworkError'))) {
                mensaje = 'No se pudo conectar con el servidor de IA. Verifica que el backend este corriendo en el puerto 8000.';
            } else if (err.message) {
                mensaje = err.message;
            }
            Swal.fire({
                title: 'Servicio no disponible',
                html:
                    '<div style="text-align:center;padding:8px 0;">' +
                    '<div style="width:44px;height:44px;margin:0 auto 14px;background:rgba(239,68,68,0.08);border-radius:50%;display:flex;align-items:center;justify-content:center;">' +
                    '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>' +
                    '</div>' +
                    '<p style="color:#d4d4d8;font-size:13px;margin:0;line-height:1.6;">' + mensaje.replace(/</g, '&lt;') + '</p>' +
                    '</div>',
                background: '#09090b',
                color: '#d4d4d8',
                confirmButtonColor: '#0f766e',
                confirmButtonText: 'Cerrar',
                didOpen: function () {
                    var title = document.querySelector('.swal2-title');
                    if (title) title.style.cssText = 'color:#f87171;font-size:18px;font-weight:700;';
                }
            });
        }
    }

    function _formatearReporteIA(analisis, totalVentas, totalInventario, totalAlertas) {
        var lineas = analisis.split('\n');
        var bullets = '';
        var count = 0;

        for (var l = 0; l < lineas.length; l++) {
            var linea = lineas[l].trim();
            if (!linea) continue;

            linea = linea.replace(/^[-*•]\s*/, '');
            linea = linea.replace(/</g, '&lt;').replace(/>/g, '&gt;');

            var colorDot = count === 0 ? '#5eead4' : (count === 1 ? '#14b8a6' : '#0d9488');
            bullets +=
                '<div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;padding:13px 14px;' +
                'background:rgba(255,255,255,0.025);border:1px solid rgba(255,255,255,0.04);border-radius:10px;' +
                'transition:border-color 0.25s ease;">' +
                '<span style="width:6px;height:6px;min-width:6px;background:' + colorDot + ';border-radius:50%;margin-top:7px;' +
                'box-shadow:0 0 8px ' + colorDot + ';"></span>' +
                '<span style="color:#d4d4d8;font-size:13.5px;line-height:1.65;font-weight:400;">' + linea + '</span>' +
                '</div>';
            count++;
        }

        if (count === 0) {
            bullets = '<p style="color:#a1a1aa;font-size:13px;text-align:center;padding:20px 0;">' +
                analisis.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</p>';
        }

        var stats = totalVentas || totalInventario || totalAlertas
            ? '<div style="display:flex;gap:12px;margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.06);">' +
              (totalVentas ? '<div style="flex:1;text-align:center;"><span style="display:block;font-size:18px;font-weight:700;color:#5eead4;">' + totalVentas + '</span><span style="font-size:10px;color:#52525b;text-transform:uppercase;letter-spacing:0.5px;">Productos Vendidos</span></div>' : '') +
              (totalInventario ? '<div style="flex:1;text-align:center;"><span style="display:block;font-size:18px;font-weight:700;color:#14b8a6;">' + totalInventario + '</span><span style="font-size:10px;color:#52525b;text-transform:uppercase;letter-spacing:0.5px;">En Inventario</span></div>' : '') +
              (totalAlertas ? '<div style="flex:1;text-align:center;"><span style="display:block;font-size:18px;font-weight:700;color:#f87171;">' + totalAlertas + '</span><span style="font-size:10px;color:#52525b;text-transform:uppercase;letter-spacing:0.5px;">Alertas Criticas</span></div>' : '') +
              '</div>'
            : '';

        return '' +
            '<div style="text-align:left;">' +
            '<div style="display:flex;align-items:center;gap:7px;margin-bottom:14px;">' +
            '<span style="width:3px;height:16px;background:linear-gradient(180deg,#5eead4,#0d9488);border-radius:2px;"></span>' +
            '<span style="font-size:10.5px;font-weight:700;color:#5eead4;text-transform:uppercase;letter-spacing:0.6px;">Estrategias de Negocio</span>' +
            '</div>' +
            '<div style="margin-bottom:4px;">' + bullets + '</div>' +
            stats +
            '</div>';
    }

    async function exportarReportePDF() {
        Swal.fire({
            title: 'Redactando reporte con IA...',
            html:
                '<div style="text-align:center;padding:16px 0;">' +
                '<div style="display:inline-block;position:relative;">' +
                '<div style="width:48px;height:48px;border-radius:50%;background:conic-gradient(from 0deg, #ea580c 0%, #f97316 25%, rgba(234,88,12,0.1) 60%, transparent 100%);animation:spinIA 1s linear infinite;mask:radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px));-webkit-mask:radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px));"></div>' +
                '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:28px;height:28px;background:rgba(234,88,12,0.12);border-radius:50%;box-shadow:0 0 20px rgba(234,88,12,0.2);"></div>' +
                '</div>' +
                '<p style="color:#a1a1aa;font-size:13px;margin:18px 0 0;font-weight:400;">Generando resumen ejecutivo...</p>' +
                '<p style="color:#52525b;font-size:11px;margin:6px 0 0;">Recopilando metricas del ERP</p>' +
                '</div>' +
                '<style>@keyframes spinIA{to{transform:rotate(360deg)}}</style>',
            background: '#09090b',
            color: '#d4d4d8',
            allowOutsideClick: false,
            allowEscapeKey: false,
            showConfirmButton: false,
            didOpen: function () {
                var title = document.querySelector('.swal2-title');
                if (title) title.style.cssText = 'color:#f97316;font-size:18px;font-weight:700;letter-spacing:-0.3px;';
            }
        });

        try {
            var kpiIng = document.getElementById('kpiIngresos');
            var kpiStk = document.getElementById('kpiStockBajo');
            var kpiUsr = document.getElementById('kpiUsuarios');

            var ingresos = 0;
            var stockBajo = 0;
            var usuarios = 0;

            if (kpiIng && kpiIng.textContent !== '—' && kpiIng.textContent !== 'Cargando...') {
                ingresos = parseFloat(kpiIng.textContent.replace(/[^0-9.-]/g, '')) || 0;
            }
            if (kpiStk && kpiStk.textContent !== '—' && kpiStk.textContent !== 'Cargando...') {
                stockBajo = parseInt(kpiStk.textContent, 10) || 0;
            }
            if (kpiUsr && kpiUsr.textContent !== '—' && kpiUsr.textContent !== 'Cargando...') {
                usuarios = parseInt(kpiUsr.textContent, 10) || 0;
            }

            var gastos = await recolectarGastosCompras();
            var productoTop = '';
            if (typeof productos !== 'undefined' && productos && productos.length > 0) {
                var mejor = productos[0];
                for (var i = 1; i < productos.length; i++) {
                    if ((productos[i].precio || 0) > (mejor.precio || 0)) mejor = productos[i];
                }
                productoTop = mejor.marca + ' ' + mejor.modelo;
            }

            var resp = await fetch(API_BASE_URL + '/api/reporte-ejecutivo', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ingresos_totales: ingresos,
                    gastos_totales: gastos,
                    producto_mas_vendido: productoTop,
                    nivel_stock_critico: stockBajo
                })
            });

            Swal.close();

            if (!resp.ok) throw new Error('Error del backend');

            var data = await resp.json();
            var resumen = data.resumen_ejecutivo || 'No se pudo generar el resumen.';

            generarPDF(resumen, ingresos, gastos, productoTop, stockBajo, usuarios);

        } catch (err) {
            Swal.close();
            SwalDark.fire({
                icon: 'error',
                title: 'Error al exportar PDF',
                text: 'No se pudo generar el reporte. Verifica la conexion con el backend.'
            });
        }
    }

    function generarPDF(resumenIA, ingresos, gastos, productoTop, stockBajo, usuarios) {
        var margen = ingresos > 0 ? ((ingresos - gastos) / ingresos * 100) : 0;
        var utilidad = ingresos - gastos;

        var chartVentasCanvas = document.getElementById('chartVentas');
        var chartStockCanvas = document.getElementById('stockCategoriaChart');
        var chartVentasImg = chartVentasCanvas ? chartVentasCanvas.toDataURL('image/png') : '';
        var chartStockImg = chartStockCanvas ? chartStockCanvas.toDataURL('image/png') : '';

        var fechaHoy = new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' });

        var html = '' +
        '<div style="font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;color:#1e293b;max-width:800px;margin:0 auto;padding:40px 30px;">' +
            '<div style="text-align:center;border-bottom:3px solid #0d9488;padding-bottom:24px;margin-bottom:32px;">' +
                '<h1 style="font-size:28px;font-weight:800;color:#0f172a;margin:0 0 4px;letter-spacing:-0.5px;">ERP System</h1>' +
                '<p style="font-size:13px;color:#64748b;margin:0;">Reporte Financiero Ejecutivo &bull; ' + fechaHoy + '</p>' +
            '</div>' +
            '<div style="margin-bottom:32px;">' +
                '<h2 style="font-size:16px;font-weight:700;color:#0f766e;margin:0 0 12px;display:flex;align-items:center;gap:8px;">' +
                    '<span style="display:inline-block;width:4px;height:18px;background:linear-gradient(180deg,#14b8a6,#0d9488);border-radius:2px;"></span>Resumen Ejecutivo' +
                '</h2>' +
                '<div style="font-size:13px;line-height:1.7;color:#334155;white-space:pre-line;">' + resumenIA + '</div>' +
            '</div>' +
            '<div style="display:flex;gap:16px;margin-bottom:32px;">' +
                '<div style="flex:1;background:#f0fdfa;border-radius:10px;padding:16px;text-align:center;">' +
                    '<p style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px;">Ingresos</p>' +
                    '<p style="font-size:22px;font-weight:800;color:#0d9488;margin:0;">$' + ingresos.toLocaleString('es-MX', { minimumFractionDigits: 2 }) + '</p>' +
                '</div>' +
                '<div style="flex:1;background:#fff7ed;border-radius:10px;padding:16px;text-align:center;">' +
                    '<p style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px;">Gastos</p>' +
                    '<p style="font-size:22px;font-weight:800;color:#ea580c;margin:0;">$' + gastos.toLocaleString('es-MX', { minimumFractionDigits: 2 }) + '</p>' +
                '</div>' +
                '<div style="flex:1;background:' + (utilidad >= 0 ? '#ecfdf5' : '#fef2f2') + ';border-radius:10px;padding:16px;text-align:center;">' +
                    '<p style="font-size:10px;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 4px;">Utilidad Neta</p>' +
                    '<p style="font-size:22px;font-weight:800;color:' + (utilidad >= 0 ? '#059669' : '#e11d48') + ';margin:0;">$' + utilidad.toLocaleString('es-MX', { minimumFractionDigits: 2 }) + '</p>' +
                '</div>' +
            '</div>' +
            '<div style="display:flex;gap:16px;margin-bottom:24px;font-size:12px;color:#475569;">' +
                '<span>Margen: <strong>' + margen.toFixed(1) + '%</strong></span>' +
                '<span>Producto estrella: <strong>' + (productoTop || '—') + '</strong></span>' +
                '<span>Stock critico: <strong>' + stockBajo + ' prod.</strong></span>' +
                '<span>Usuarios: <strong>' + usuarios + '</strong></span>' +
            '</div>' +
            (chartVentasImg ? '<div style="margin-bottom:24px;"><h3 style="font-size:14px;font-weight:700;color:#0f766e;margin:0 0 10px;">Ventas Recientes</h3><img src="' + chartVentasImg + '" style="width:100%;max-height:260px;object-fit:contain;border-radius:8px;" alt="Grafico de ventas"/></div>' : '') +
            (chartStockImg ? '<div style="margin-bottom:24px;"><h3 style="font-size:14px;font-weight:700;color:#0f766e;margin:0 0 10px;">Stock por Categoria</h3><img src="' + chartStockImg + '" style="width:100%;max-height:260px;object-fit:contain;border-radius:8px;" alt="Grafico de stock"/></div>' : '') +
            '<div style="text-align:center;border-top:1px solid #e2e8f0;padding-top:16px;margin-top:8px;">' +
                '<p style="font-size:10px;color:#94a3b8;">Generado por ERP System &bull; Modulo de IA &bull; ' + fechaHoy + '</p>' +
            '</div>' +
        '</div>';

        var opt = {
            margin: [0.3, 0.4, 0.3, 0.4],
            filename: 'reporte-ejecutivo-erp-' + new Date().toISOString().slice(0, 10) + '.pdf',
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2, backgroundColor: '#ffffff', logging: false },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        html2pdf().set(opt).from(html).save().then(function () {
            SwalDark.fire({
                icon: 'success',
                title: 'PDF exportado',
                text: 'El reporte ejecutivo se descargo correctamente.',
                timer: 2500,
                showConfirmButton: false
            });
        }).catch(function () {
            SwalDark.fire({ icon: 'error', title: 'Error', text: 'No se pudo generar el PDF.' });
        });
    }

    /* =================================================================
       SIDEBAR & NAVEGACIÓN
    ================================================================= */
    var layout = appLayout;
    var collapseBtn = document.getElementById('collapseBtn');
    var contentArea = document.getElementById('contentArea');
    var pageTitle = document.getElementById('pageTitle');
    var navItems = document.querySelectorAll('.nav-item');

    var isCollapsed = false;
    var isMobileOpen = false;

    var mobileOverlay = document.createElement('div');
    mobileOverlay.className = 'mobile-overlay';
    document.body.appendChild(mobileOverlay);

    function toggleSidebar() {
        isCollapsed = !isCollapsed;
        layout.classList.toggle('collapsed', isCollapsed);
    }

    function openMobileSidebar() {
        isMobileOpen = true;
        layout.classList.add('mobile-open');
        mobileOverlay.classList.add('active');
    }

    function closeMobileSidebar() {
        isMobileOpen = false;
        layout.classList.remove('mobile-open');
        mobileOverlay.classList.remove('active');
    }

    collapseBtn.addEventListener('click', function () {
        if (window.innerWidth <= 768) {
            isMobileOpen ? closeMobileSidebar() : openMobileSidebar();
        } else {
            toggleSidebar();
        }
    });

    var hamburgerBtn = document.getElementById('hamburgerBtn');
    if (hamburgerBtn) {
        hamburgerBtn.addEventListener('click', function () {
            isMobileOpen ? closeMobileSidebar() : openMobileSidebar();
        });
    }

    mobileOverlay.addEventListener('click', closeMobileSidebar);

    window.addEventListener('resize', function () {
        if (window.innerWidth > 768 && isMobileOpen) {
            closeMobileSidebar();
        }
    });

    function setActiveNav(sectionKey) {
        navItems.forEach(function (item) {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === sectionKey) {
                item.classList.add('active');
            }
        });
    }

    /* =================================================================
       TOPBAR — NOTIFICACIONES, BÚSQUEDA, MENÚ
    ================================================================= */
    var notifDropdown = null;

    function crearDropdowns() {
        if (!document.getElementById('notifDropdown')) {
            notifDropdown = document.createElement('div');
            notifDropdown.id = 'notifDropdown';
            notifDropdown.className = 'topbar-dropdown';
            var btnBell = document.querySelector('.btn-notificaciones');
            if (btnBell) btnBell.appendChild(notifDropdown);
        }
    }

    async function cargarAlertasStock() {
        var btnBell = document.querySelector('.btn-notificaciones');
        if (!btnBell) return;

        try {
            var result = await supabase.from('inventario').select('producto_sku, stock_actual, stock_minimo');
            if (result.error) return;
            var criticos = [];
            var datos = result.data || [];
            for (var i = 0; i < datos.length; i++) {
                if ((datos[i].stock_actual || 0) <= (datos[i].stock_minimo || 0)) {
                    criticos.push(datos[i]);
                }
            }

            if (criticos.length > 0) {
                btnBell.classList.add('tiene-alertas');
            } else {
                btnBell.classList.remove('tiene-alertas');
            }

            var nombres = {};
            if (criticos.length > 0) {
                var prodRes = await supabase.from('productos').select('sku, marca, modelo');
                if (!prodRes.error && prodRes.data) {
                    for (var p = 0; p < prodRes.data.length; p++) {
                        nombres[prodRes.data[p].sku] = prodRes.data[p].marca + ' ' + prodRes.data[p].modelo;
                    }
                }
            }

            var h = '<div class="dropdown-header">Alertas de Stock (' + criticos.length + ')</div>';
            if (criticos.length === 0) {
                h += '<div class="dropdown-item" style="color:var(--subtle);cursor:default;">Sin alertas</div>';
            } else {
                for (var j = 0; j < criticos.length; j++) {
                    var c = criticos[j];
                    var nombre = nombres[c.producto_sku] || c.producto_sku;
                    h += '<div class="dropdown-item" style="cursor:default;">' +
                        '<span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + nombre + '</span>' +
                        '<span class="notif-badge">' + c.stock_actual + ' und</span>' +
                    '</div>';
                }
            }
            if (notifDropdown) notifDropdown.innerHTML = h;
        } catch (e) { /* silencioso */ }
    }

    function toggleNotificaciones(e) {
        e.stopPropagation();
        crearDropdowns();
            cargarAlertasStock();
        if (notifDropdown) notifDropdown.classList.toggle('active');
    }

    async function abrirPerfil() {
        if (!usuarioActivo) return;

        var result = await SwalDark.fire({
            title: 'Editar Perfil',
            html:
                '<div style="text-align:left;">' +
                '<label style="font-size:11px;font-weight:700;color:#52525b;text-transform:uppercase;letter-spacing:.6px;">Nombre</label>' +
                '<input id="swalNombre" class="swal2-input" style="margin-top:6px;width:100%;box-sizing:border-box;" value="' + usuarioActivo.nombre + '">' +
                '</div>',
            showCancelButton: true,
            confirmButtonColor: '#0f766e',
            cancelButtonColor: '#475569',
            confirmButtonText: 'Guardar',
            cancelButtonText: 'Cancelar',
            preConfirm: async function () {
                var nuevoNombre = document.getElementById('swalNombre').value.trim();
                if (!nuevoNombre) {
                    Swal.showValidationMessage('El nombre no puede estar vacio.');
                    return false;
                }
                return nuevoNombre;
            }
        });

        if (!result.isConfirmed || !result.value) return;

        var nuevoNombre = result.value;
        try {
            var upd = await supabase.from('usuarios').update({ nombre: nuevoNombre }).eq('id', usuarioActivo.id);
            if (upd.error) throw upd.error;

            usuarioActivo.nombre = nuevoNombre;
            actualizarSidebarUsuario();
            SwalDark.fire({ icon: 'success', title: 'Perfil actualizado', text: 'Tu nombre ha sido cambiado.', timer: 2000, showConfirmButton: false });
        } catch (err) {
            SwalDark.fire({ icon: 'error', title: 'Error', text: err.message || 'No se pudo actualizar.' });
        }
    }

    function cerrarDropdowns() {
        if (notifDropdown) notifDropdown.classList.remove('active');
    }

    var btnBell = document.querySelector('.icon-btn[title="Notificaciones"]');

    if (btnBell) {
        btnBell.addEventListener('click', toggleNotificaciones);
    }

    document.addEventListener('click', function (e) {
        try {
            if (notifDropdown && notifDropdown.classList.contains('active') && btnBell && !btnBell.contains(e.target)) {
                cerrarDropdowns();
            }
        } catch (ex) { console.error('Dropdown click error:', ex); }
    });

    var searchTopbar = document.querySelector('.search-box input');
    if (searchTopbar) {
        searchTopbar.addEventListener('input', function () {
            try {
                var q = this.value.toLowerCase().trim();
                var tbody = document.getElementById('inventarioTbody') || document.querySelector('#tablaInventario tbody');
                if (tbody) {
                    var rows = tbody.querySelectorAll('tr');
                    for (var ri = 0; ri < rows.length; ri++) {
                        var text = rows[ri].textContent.toLowerCase();
                        rows[ri].style.display = text.indexOf(q) !== -1 ? '' : 'none';
                    }
                }
            } catch (ex) { /* silencioso */ }
        });
    }

    try { crearDropdowns(); } catch (e) { console.error(e); }
    try { cargarAlertasStock(); } catch (e) { console.error(e); }
    lucide.createIcons();

    /* =================================================================
       RENDERERS DE SECCIONES
    ================================================================= */
    function renderDashboard() {
        return '' +
        '<div class="stats-grid">' +
            '<div class="stat-card">' +
                '<div class="stat-card-header">' +
                    '<span class="stat-card-label">Ingresos Hoy</span>' +
                    '<i data-lucide="dollar-sign" class="stat-icon"></i>' +
                '</div>' +
                '<div class="stat-card-value" id="kpiIngresos">—</div>' +
                '<div class="stat-card-change" id="kpiIngresosSub">Cargando...</div>' +
            '</div>' +
            '<div class="stat-card">' +
                '<div class="stat-card-header">' +
                    '<span class="stat-card-label">Ordenes Hoy</span>' +
                    '<i data-lucide="clipboard-list" class="stat-icon"></i>' +
                '</div>' +
                '<div class="stat-card-value" id="kpiOrdenes">—</div>' +
                '<div class="stat-card-change" id="kpiOrdenesSub">Cargando...</div>' +
            '</div>' +
            '<div class="stat-card">' +
                '<div class="stat-card-header">' +
                    '<span class="stat-card-label">Stock Bajo</span>' +
                    '<i data-lucide="triangle-alert" class="stat-icon"></i>' +
                '</div>' +
                '<div class="stat-card-value" id="kpiStockBajo">—</div>' +
                '<div class="stat-card-change down">Productos criticos</div>' +
            '</div>' +
            '<div class="stat-card">' +
                '<div class="stat-card-header">' +
                    '<span class="stat-card-label">Usuarios</span>' +
                    '<i data-lucide="users" class="stat-icon"></i>' +
                '</div>' +
                '<div class="stat-card-value" id="kpiUsuarios">—</div>' +
                '<div class="stat-card-change" id="kpiUsuariosSub">Cargando...</div>' +
            '</div>' +
        '</div>' +
        '<div class="content-grid">' +
            '<div class="content-panel">' +
                '<div class="panel-title"><i data-lucide="bar-chart-3" class="panel-icon"></i> Ventas Recientes</div>' +
                '<div style="position:relative;width:100%;height:300px;"><canvas id="chartVentas"></canvas></div>' +
            '</div>' +
            '<div class="content-panel">' +
                '<div class="panel-title"><i data-lucide="pie-chart" class="panel-icon"></i> Stock por Categoria</div>' +
                '<div class="card-body">' +
                    '<div style="position:relative;width:100%;height:280px;display:flex;justify-content:center;align-items:center;">' +
                        '<i data-lucide="brain-circuit" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:140px;height:140px;color:rgba(255,255,255,0.15);z-index:0;pointer-events:none;"></i>' +
                        '<canvas id="stockCategoriaChart" style="position:relative;z-index:10;"></canvas>' +
                    '</div>' +
                    '<div style="display:flex;gap:16px;justify-content:center;margin-top:30px;border-top:1px solid #1f2937;padding-top:20px;">' +
                        '<button id="btnAnalizarIA" class="btn-ia-analizar" style="display:flex;align-items:center;gap:8px;background:#111827;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;font-family:var(--font);">' +
                            '<i data-lucide="sparkles" style="width:18px;height:18px;"></i>' +
                            '<span>IA — Analizar Tendencias</span>' +
                        '</button>' +
                        '<button id="btnExportarPDF" style="display:flex;align-items:center;gap:8px;background:#450a0a;border:1px solid #991b1b;color:#f87171;padding:10px 20px;border-radius:6px;cursor:pointer;font-size:13px;font-weight:600;font-family:var(--font);">' +
                            '<i data-lucide="file-down" style="width:18px;height:18px;"></i>' +
                            '<span>Exportar Reporte PDF</span>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
            '</div>' +
        '</div>';
    }

    function renderVentas() {
        return '' +
        '<div class="section-header"><h2>Punto de Venta</h2></div>' +
        '<div class="pos-layout">' +
            '<div class="pos-panel pos-busqueda">' +
                '<div class="panel-title"><i data-lucide="search" class="panel-icon"></i> Buscar Productos</div>' +
                '<input type="text" id="posSearch" class="pos-search-input" placeholder="Buscar por SKU o modelo..." autocomplete="off">' +
                '<div class="pos-resultados" id="posResultados"></div>' +
            '</div>' +
            '<div class="pos-panel pos-carrito">' +
                '<div class="panel-title"><i data-lucide="shopping-cart" class="panel-icon"></i> Carrito de Compras</div>' +
                '<div class="pos-cart-items" id="posCartItems">' +
                    '<p class="pos-empty">No hay productos en el carrito.</p>' +
                '</div>' +
                '<div class="pos-cart-footer" id="posCartFooter" style="display:none;">' +
                    '<div class="pos-totales">' +
                        '<div class="pos-line"><span>Subtotal</span><span id="posSubtotal">$0.00</span></div>' +
                        '<div class="pos-line pos-total"><span>TOTAL</span><span id="posTotal">$0.00</span></div>' +
                    '</div>' +
                    '<button id="btnCompletarVenta" style="width:100%;padding:18px 24px;">Completar Venta</button>' +
                '</div>' +
            '</div>' +
        '</div>';
    }

    function renderInventario() {
        return '' +
        '<div class="section-header" style="display:flex;align-items:center;justify-content:space-between;">' +
            '<h2>Modulo de Inventario</h2>' +
            '<button id="btnToggleArchivados" class="btn-outline" style="font-size:12px;padding:8px 16px;">Ver archivados</button>' +
        '</div>' +
        '<div class="content-panel full-width" style="margin-bottom:20px;">' +
            '<div class="panel-title"><i data-lucide="package-plus" class="panel-icon"></i> Registrar Nuevo Producto</div>' +
            '<form class="form-inventario" id="formInventario" autocomplete="off" novalidate>' +
                '<div class="form-row">' +
                    '<div class="form-col">' +
                        '<label for="invSku">SKU</label>' +
                        '<input type="text" id="invSku" placeholder="Ej: TEC-006" required maxlength="30" pattern="[a-zA-Z0-9\-]+">' +
                    '</div>' +
                    '<div class="form-col">' +
                        '<label for="invNumSerie">Numero de Serie</label>' +
                        '<input type="text" id="invNumSerie" placeholder="Ej: SN-2026-001" required maxlength="50">' +
                    '</div>' +
                    '<div class="form-col">' +
                        '<label for="invMarca">Marca</label>' +
                        '<input type="text" id="invMarca" placeholder="Ej: Xiaomi" required maxlength="30">' +
                    '</div>' +
                '</div>' +
                '<div class="form-row">' +
                    '<div class="form-col">' +
                        '<label for="invModelo">Modelo</label>' +
                        '<div style="display:flex;gap:6px;">' +
                            '<input type="text" id="invModelo" placeholder="Ej: Redmi Note 13" style="flex:1;" required maxlength="50">' +
                            '<button type="button" id="btnAutocompletar" class="btn-magic" title="Autocompletar con IA">' +
                                '<i data-lucide="sparkles"></i>' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                    '<div class="form-col">' +
                        '<label for="invCategoria">Categoria</label>' +
                        '<input type="text" id="invCategoria" placeholder="Ej: Smartphone" required maxlength="30">' +
                    '</div>' +
                    '<div class="form-col">' +
                        '<label for="invUbicacion">Ubicacion</label>' +
                        '<input type="text" id="invUbicacion" placeholder="Ej: Bodega A-3" required maxlength="50">' +
                    '</div>' +
                '</div>' +
                '<div class="form-row">' +
                    '<div class="form-col">' +
                        '<label for="invCosto">Costo</label>' +
                        '<input type="number" id="invCosto" placeholder="0.00" min="0" max="999999" step="0.01" inputmode="decimal" required>' +
                    '</div>' +
                    '<div class="form-col">' +
                        '<label for="invPrecio">Precio</label>' +
                        '<input type="number" id="invPrecio" placeholder="0.00" min="0" max="999999" step="0.01" inputmode="decimal" required>' +
                    '</div>' +
                    '<div class="form-col">' +
                        '<label for="invStockActual">Stock Actual</label>' +
                        '<input type="number" id="invStockActual" placeholder="0" min="0" max="99999" step="1" inputmode="numeric" required>' +
                    '</div>' +
                '</div>' +
                '<div class="form-row">' +
                    '<div class="form-col">' +
                        '<label for="invStockMinimo">Stock Minimo</label>' +
                        '<input type="number" id="invStockMinimo" placeholder="0" min="0" max="99999" step="1" inputmode="numeric" required>' +
                    '</div>' +
                    '<div class="form-col"></div>' +
                    '<div class="form-col"></div>' +
                '</div>' +
                '<div class="form-row form-row-end">' +
                    '<button type="button" id="btnLimpiarInventario" class="btn-outline">Limpiar</button>' +
                    '<button type="submit" class="login-btn" style="width:auto;padding:10px 28px;font-size:13px;">Agregar Producto</button>' +
                '</div>' +
            '</form>' +
        '</div>' +
        '<div class="content-panel full-width">' +
            '<div class="panel-title"><i data-lucide="package" class="panel-icon"></i> Listado de Productos</div>' +
            '<div class="table-scroll">' +
            '<table class="table-mini" id="tablaInventario">' +
                '<thead><tr><th>SKU</th><th>Marca</th><th>Modelo</th><th>Categoria</th><th>Precio</th><th>Stock Actual</th><th>Stock Minimo</th><th>Ubicacion</th><th>Estado</th><th>Acciones</th></tr></thead>' +
                '<tbody id="inventarioTbody"></tbody>' +
            '</table>' +
            '</div>' +
        '</div>';
    }

    function renderSeguridad() {
        var ultimo = usuarioActivo && usuarioActivo.ultimo_acceso
            ? new Date(usuarioActivo.ultimo_acceso).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })
            : '—';
        var esAdmin = usuarioActivo && usuarioActivo.rol === 'Admin';

        return '' +
        '<div class="section-header" style="display:flex;align-items:center;justify-content:space-between;">' +
            '<h2>Modulo de Seguridad</h2>' +
            (esAdmin ? '<button id="btnCrearUsuario" class="login-btn" style="width:auto;padding:10px 22px;font-size:13px;">Crear Usuario</button>' : '') +
        '</div>' +
        '<div class="stats-grid">' +
            '<div class="stat-card">' +
                '<div class="stat-card-header">' +
                    '<span class="stat-card-label">Roles Configurados</span>' +
                    '<i data-lucide="shield-check" class="stat-icon"></i>' +
                '</div>' +
                '<div class="stat-card-value">3</div>' +
                '<div class="stat-card-change">Admin, Gerente, Vendedor</div>' +
            '</div>' +
            '<div class="stat-card">' +
                '<div class="stat-card-header">' +
                    '<span class="stat-card-label">Sesion Activa</span>' +
                    '<i data-lucide="key" class="stat-icon"></i>' +
                '</div>' +
                '<div class="stat-card-value">' + (usuarioActivo ? usuarioActivo.nombre : '—') + '</div>' +
                '<div class="stat-card-change">' + (usuarioActivo ? usuarioActivo.rol : '') + '</div>' +
            '</div>' +
            '<div class="stat-card">' +
                '<div class="stat-card-header">' +
                    '<span class="stat-card-label">Ultimo Acceso</span>' +
                    '<i data-lucide="history" class="stat-icon"></i>' +
                '</div>' +
                '<div class="stat-card-value" style="font-size:18px;">' + ultimo + '</div>' +
                '<div class="stat-card-change">' + (usuarioActivo ? usuarioActivo.nombre : '') + '</div>' +
            '</div>' +
        '</div>' +
        '<div class="content-panel full-width" style="margin-top:5px;">' +
            '<div class="panel-title"><i data-lucide="clipboard-check" class="panel-icon"></i> Registro de Auditoria</div>' +
            '<div class="table-scroll">' +
            '<table class="table-mini" id="tablaAuditoria">' +
                '<thead><tr><th>Usuario</th><th>Accion</th><th>Modulo</th><th>Fecha</th></tr></thead>' +
                '<tbody id="auditoriaTbody"><tr><td colspan="4" style="text-align:center;color:var(--subtle);">Cargando...</td></tr></tbody>' +
            '</table>' +
            '</div>' +
        '</div>';
    }

    function abrirModalUsuario() {
        var modal = document.getElementById('modalUsuario');
        if (modal) modal.classList.remove('hidden');
        setTimeout(function () {
            var el = document.getElementById('native-usr-nombre');
            if (el) el.focus();
        }, 200);
    }

    function cerrarModalUsuario() {
        var modal = document.getElementById('modalUsuario');
        if (modal) modal.classList.add('hidden');
        var form = document.getElementById('formUsuarioNative');
        if (form) form.reset();
    }

    async function crearNuevoUsuario() {
        abrirModalUsuario();
    }

    async function renderAuditoria() {
        var tbody = document.getElementById('auditoriaTbody');
        if (!tbody) return;

        try {
            var result = await supabase
                .from('auditoria')
                .select('*')
                .order('fecha', { ascending: false })
                .limit(15);
            if (result.error) throw result.error;

            var datos = result.data || [];
            if (datos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--subtle);">Sin registros de auditoria.</td></tr>';
                return;
            }

            var h = '';
            for (var i = 0; i < datos.length; i++) {
                var d = datos[i];
                var fecha = d.fecha ? new Date(d.fecha).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }) : '—';
                h += '<tr>' +
                    '<td>' + sanitizar(d.usuario_nombre || '—') + '</td>' +
                    '<td>' + sanitizar(d.accion || '—') + '</td>' +
                    '<td>' + sanitizar(d.modulo || '—') + '</td>' +
                    '<td>' + fecha + '</td>' +
                '</tr>';
            }
            tbody.innerHTML = h;
        } catch (err) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;color:var(--danger);">Error al cargar auditoria.</td></tr>';
        }
    }

    async function registrarAuditoria(accion, modulo) {
        if (!usuarioActivo) return;
        try {
            await supabase.from('auditoria').insert([{
                usuario_nombre: usuarioActivo.nombre,
                accion: accion,
                modulo: modulo,
                fecha: new Date().toISOString()
            }]);
        } catch (e) { /* silencioso */ }
    }

    /* =================================================================
       MÓDULO: GESTIÓN DE USUARIOS (ADMIN)
    ================================================================= */
    var usuariosCache = [];

    async function cargarUsuarios() {
        var tbody = document.getElementById('usuariosTbody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--subtle);">Cargando...</td></tr>';

        try {
            var resp = await fetch(API_BASE_URL + '/api/usuarios', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': usuarioActivo ? String(usuarioActivo.id) : ''
                }
            });
            if (!resp.ok) {
                var errData = null;
                try { errData = await resp.json(); } catch (e) {}
                var msg = errData && errData.error ? errData.error : 'Error al cargar usuarios (HTTP ' + resp.status + ')';
                if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--danger);">' + msg + '</td></tr>';
                return;
            }
            var data = await resp.json();
            usuariosCache = data.usuarios || [];
            renderTablaUsuarios();
        } catch (err) {
            if (tbody) tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--danger);">Error de conexion con el servidor.</td></tr>';
        }
    }

    function renderTablaUsuarios() {
        var tbody = document.getElementById('usuariosTbody');
        if (!tbody) return;

        if (usuariosCache.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--subtle);">No hay usuarios registrados.</td></tr>';
            return;
        }

        var h = '';
        for (var i = 0; i < usuariosCache.length; i++) {
            var u = usuariosCache[i];
            var rolBadge = '';
            if (u.rol === 'Admin') rolBadge = '<span class="badge" style="background:rgba(45,212,191,.12);color:#2dd4bf;">Admin</span>';
            else if (u.rol === 'Gerente') rolBadge = '<span class="badge" style="background:rgba(250,204,21,.12);color:#facc15;">Gerente</span>';
            else rolBadge = '<span class="badge" style="background:rgba(148,163,184,.12);color:#94a3b8;">Vendedor</span>';

            var ultimo = u.ultimo_acceso
                ? new Date(u.ultimo_acceso).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })
                : 'Nunca';

            var soyYo = usuarioActivo && String(usuarioActivo.id) === String(u.id);
            var esAdmin = u.rol === 'Admin';
            h += '<tr>' +
                '<td><strong>' + sanitizar(u.nombre || '—') + '</strong>' + (soyYo ? ' <span class="badge" style="background:rgba(45,212,191,.12);color:#2dd4bf;">Tú</span>' : '') + '</td>' +
                '<td>' + u.id + '</td>' +
                '<td>' + rolBadge + '</td>' +
                '<td>' + ultimo + '</td>' +
                '<td>' +
                    '<button class="btn-restaurar btn-editar-usuario" data-id="' + u.id + '" data-nombre="' + sanitizar(u.nombre || '') + '" data-rol="' + (u.rol || '') + '" title="Editar usuario">' +
                        '<i data-lucide="pencil"></i>' +
                    '</button> ' +
                    (soyYo || esAdmin ? '' : '<button class="btn-eliminar btn-eliminar-usuario" data-id="' + u.id + '" data-nombre="' + sanitizar(u.nombre || '') + '" title="Eliminar usuario"><i data-lucide="trash-2"></i></button>') +
                '</td>' +
            '</tr>';
        }
        tbody.innerHTML = h;
        lucide.createIcons();

        var btnsEditar = document.querySelectorAll('.btn-editar-usuario');
        for (var ei = 0; ei < btnsEditar.length; ei++) {
            btnsEditar[ei].addEventListener('click', function () {
                var id = this.getAttribute('data-id');
                var nombre = this.getAttribute('data-nombre');
                var rol = this.getAttribute('data-rol');
                abrirModalEditarUsuario(id, nombre, rol);
            });
        }

        var btnsEliminar = document.querySelectorAll('.btn-eliminar-usuario');
        for (var di = 0; di < btnsEliminar.length; di++) {
            btnsEliminar[di].addEventListener('click', function () {
                var id = this.getAttribute('data-id');
                var nombre = this.getAttribute('data-nombre');
                abrirModalEliminarUsuario(id, nombre);
            });
        }
    }

    var usuarioEditandoId = null;

    function abrirModalEditarUsuario(userId, nombreActual, rolActual) {
        usuarioEditandoId = userId;
        document.getElementById('edit-usr-id').value = userId;
        document.getElementById('edit-usr-nombre').value = nombreActual;
        document.getElementById('edit-usr-rol').value = rolActual;
        var modal = document.getElementById('modalEditarUsuario');
        if (modal) modal.classList.remove('hidden');
        setTimeout(function () {
            var el = document.getElementById('edit-usr-nombre');
            if (el) el.focus();
        }, 200);
    }

    function cerrarModalEditarUsuario() {
        usuarioEditandoId = null;
        var modal = document.getElementById('modalEditarUsuario');
        if (modal) modal.classList.add('hidden');
        var form = document.getElementById('formEditarUsuarioNative');
        if (form) form.reset();
    }

    async function guardarEdicionUsuario() {
        var userId = usuarioEditandoId;
        var nuevoNombre = document.getElementById('edit-usr-nombre').value.trim();
        var nuevoRol = document.getElementById('edit-usr-rol').value;

        var errs = [];
        var eNom = validarTexto(nuevoNombre, 'Nombre', 3, 30);
        if (eNom) errs.push(eNom);
        if (nuevoRol !== 'Admin' && nuevoRol !== 'Gerente' && nuevoRol !== 'Vendedor') errs.push('Rol no valido.');
        if (mostrarErrores(errs)) return;

        try {
            var resp = await fetch(API_BASE_URL + '/api/usuarios/' + userId, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': usuarioActivo ? String(usuarioActivo.id) : ''
                },
                body: JSON.stringify({ nombre: nuevoNombre, rol: nuevoRol })
            });
            var respData = await resp.json().catch(function () { return {}; });
            if (!resp.ok) {
                SwalDark.fire({ icon: 'error', title: 'Error', text: respData.error || 'No se pudo actualizar el usuario.' });
                return;
            }
            registrarAuditoria('Actualizo datos del usuario ID ' + userId + ': nombre=' + nuevoNombre + ', rol=' + nuevoRol, 'Gestion de Usuarios');
            cerrarModalEditarUsuario();
            SwalDark.fire({ icon: 'success', title: 'Usuario actualizado', timer: 1800, showConfirmButton: false });
            cargarUsuarios();
        } catch (err) {
            SwalDark.fire({ icon: 'error', title: 'Error de conexion', text: 'No se pudo contactar al servidor.' });
        }
    }

    function abrirModalEliminarUsuario(userId, nombre) {
        document.getElementById('delUsrMensaje').innerHTML = '¿Estás seguro de eliminar a <strong>' + sanitizar(nombre) + '</strong>?';
        var modal = document.getElementById('modalEliminarUsuario');
        if (modal) modal.classList.remove('hidden');
        modal._delUserId = userId;
        modal._delNombre = nombre;
        lucide.createIcons();
    }

    function cerrarModalEliminarUsuario() {
        var modal = document.getElementById('modalEliminarUsuario');
        if (modal) {
            modal.classList.add('hidden');
            modal._delUserId = null;
            modal._delNombre = null;
        }
    }

    async function confirmarEliminarUsuario() {
        var modal = document.getElementById('modalEliminarUsuario');
        var userId = modal._delUserId;
        var nombre = modal._delNombre;

        try {
            var resp = await fetch(API_BASE_URL + '/api/usuarios/' + userId, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': usuarioActivo ? String(usuarioActivo.id) : ''
                }
            });
            var respData = await resp.json().catch(function () { return {}; });
            if (!resp.ok) {
                SwalDark.fire({ icon: 'error', title: 'Error', text: respData.error || 'No se pudo eliminar el usuario.' });
                cerrarModalEliminarUsuario();
                return;
            }
            registrarAuditoria('Elimino usuario: ' + nombre + ' (ID: ' + userId + ')', 'Gestion de Usuarios');
            cerrarModalEliminarUsuario();
            SwalDark.fire({ icon: 'success', title: 'Usuario eliminado', text: nombre + ' ha sido eliminado del sistema.', timer: 2000, showConfirmButton: false });
            cargarUsuarios();
        } catch (err) {
            SwalDark.fire({ icon: 'error', title: 'Error de conexion', text: 'No se pudo contactar al servidor.' });
            cerrarModalEliminarUsuario();
        }
    }

    function renderGestionUsuarios() {
        return '' +
        '<div class="section-header" style="display:flex;align-items:center;justify-content:space-between;">' +
            '<h2>Gestion de Usuarios</h2>' +
            '<button id="btnRefrescarUsuarios" class="btn-outline" style="font-size:12px;padding:8px 16px;">' +
                '<i data-lucide="refresh-cw" style="width:14px;height:14px;vertical-align:middle;margin-right:4px;"></i> Refrescar' +
            '</button>' +
        '</div>' +
        '<div class="stats-grid">' +
            '<div class="stat-card">' +
                '<div class="stat-card-header">' +
                    '<span class="stat-card-label">Total Usuarios</span>' +
                    '<i data-lucide="users" class="stat-icon"></i>' +
                '</div>' +
                '<div class="stat-card-value" id="kpiTotalUsuarios">—</div>' +
                '<div class="stat-card-change">Registrados en el sistema</div>' +
            '</div>' +
            '<div class="stat-card">' +
                '<div class="stat-card-header">' +
                    '<span class="stat-card-label">Administradores</span>' +
                    '<i data-lucide="shield-check" class="stat-icon"></i>' +
                '</div>' +
                '<div class="stat-card-value" id="kpiAdmins">—</div>' +
                '<div class="stat-card-change">Acceso total al sistema</div>' +
            '</div>' +
            '<div class="stat-card">' +
                '<div class="stat-card-header">' +
                    '<span class="stat-card-label">Gerentes / Vendedores</span>' +
                    '<i data-lucide="user-check" class="stat-icon"></i>' +
                '</div>' +
                '<div class="stat-card-value" id="kpiOtrosRoles">—</div>' +
                '<div class="stat-card-change">Gerentes y Vendedores</div>' +
            '</div>' +
        '</div>' +
        '<div class="content-panel full-width" style="margin-top:5px;">' +
            '<div class="panel-title"><i data-lucide="users" class="panel-icon"></i> Listado de Usuarios</div>' +
            '<div class="table-scroll">' +
            '<table class="table-mini" id="tablaUsuarios">' +
                '<thead><tr><th>Nombre</th><th>ID</th><th>Rol</th><th>Ultimo Acceso</th><th>Acciones</th></tr></thead>' +
                '<tbody id="usuariosTbody"><tr><td colspan="5" style="text-align:center;color:var(--subtle);">Cargando...</td></tr></tbody>' +
            '</table>' +
            '</div>' +
        '</div>';
    }

    /* =================================================================
       MÓDULO DE COMPRAS — PROVEEDORES (SUPABASE)
    ================================================================= */
    var proveedoresCache = [];

    async function cargarProveedores() {
        try {
            var result = await supabase.from('proveedores').select('id, nombre_empresa').order('nombre_empresa', { ascending: true });
            if (result.error) throw result.error;
            proveedoresCache = result.data || [];
        } catch (err) {
            console.error('Error al cargar proveedores:', err);
            proveedoresCache = [];
        }
    }

    function llenarSelectProveedores() {
        var select = document.getElementById('compProveedor');
        if (!select) return;
        select.innerHTML = '<option value="">Seleccionar proveedor...</option>';
        for (var i = 0; i < proveedoresCache.length; i++) {
            var prov = proveedoresCache[i];
            select.innerHTML += '<option value="' + prov.id + '">' + prov.nombre_empresa + '</option>';
        }
    }

    function renderCompras() {
        return '' +
        '<div class="section-header" style="display:flex;align-items:center;justify-content:space-between;">' +
            '<h2>Modulo de Compras / Proveedores</h2>' +
            '<button id="btnNuevoProveedorCompra" class="btn-outline" style="font-size:12px;padding:8px 16px;">+ Nuevo Proveedor</button>' +
        '</div>' +
        '<div class="content-panel full-width" style="margin-bottom:20px;">' +
            '<div class="panel-title"><i data-lucide="clipboard-list" class="panel-icon"></i> Registrar Factura de Compra</div>' +
            '<form class="form-inventario" id="formCompra" autocomplete="off" novalidate>' +
                '<div class="form-row">' +
                    '<div class="form-col">' +
                        '<label for="compProveedor">Proveedor</label>' +
                        '<select id="compProveedor" required></select>' +
                    '</div>' +
                    '<div class="form-col">' +
                        '<label for="compFactura">Numero de Factura</label>' +
                        '<input type="text" id="compFactura" placeholder="Ej: FAC-2026-001" required maxlength="50">' +
                    '</div>' +
                '</div>' +
                '<div class="form-row">' +
                    '<div class="form-col">' +
                        '<label for="compConcepto">Concepto</label>' +
                        '<input type="text" id="compConcepto" placeholder="Ej: Compra de 50 unidades de pantallas" required maxlength="200">' +
                    '</div>' +
                    '<div class="form-col">' +
                        '<label for="compTotal">Total ($)</label>' +
                        '<input type="number" id="compTotal" placeholder="0.00" min="0.01" max="99999999" step="0.01" inputmode="decimal" required>' +
                    '</div>' +
                '</div>' +
                '<div class="form-row form-row-end">' +
                    '<button type="submit" class="login-btn" style="width:auto;padding:10px 28px;font-size:13px;">Registrar Compra</button>' +
                '</div>' +
            '</form>' +
        '</div>' +
        '<div class="content-panel full-width">' +
            '<div class="panel-title"><i data-lucide="receipt" class="panel-icon"></i> Historial de Compras</div>' +
            '<div class="table-scroll">' +
            '<table class="table-mini" id="tablaCompras">' +
                '<thead><tr><th>ID</th><th>Proveedor</th><th>Factura</th><th>Concepto</th><th>Total</th><th>Fecha</th><th>Registrado por</th></tr></thead>' +
                '<tbody id="comprasTbody"><tr><td colspan="7" style="text-align:center;color:var(--subtle);">Cargando...</td></tr></tbody>' +
            '</table>' +
            '</div>' +
        '</div>';
    }

    async function cargarCompras() {
        var tbody = document.getElementById('comprasTbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        try {
            var result = await supabase
                .from('compras_proveedores')
                .select('id, numero_factura, concepto, total_compra, fecha_compra, proveedor_id')
                .order('fecha_compra', { ascending: false })
                .limit(30);
            if (result.error) {
                console.error("DETALLE DEL ERROR SUPABASE:", result.error);
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--danger);">Error al cargar compras.</td></tr>';
                return;
            }

            var datos = result.data;
            if (!datos || datos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--subtle);">No hay compras registradas.</td></tr>';
                return;
            }

            var provRes = await supabase.from('proveedores').select('id, nombre_empresa');
            var provs = provRes.data || [];
            var mapaProv = {};
            for (var pi = 0; pi < provs.length; pi++) {
                mapaProv[provs[pi].id] = provs[pi].nombre_empresa || 'Proveedor Desconocido';
            }

            var h = '';
            for (var i = 0; i < datos.length; i++) {
                var c = datos[i];
                var fecha = c.fecha_compra ? new Date(c.fecha_compra).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' }) : '—';
                var nombreProv = mapaProv[c.proveedor_id] || 'Proveedor Desconocido';
                var nombreUser = 'Admin';
                var totalFormateado = '$' + Number(c.total_compra).toLocaleString('es-MX', { minimumFractionDigits: 2 });
                h += '<tr>' +
                    '<td class="cell-id">COMP-' + sanitizar(c.id.substring(0, 6).toUpperCase()) + '</td>' +
                    '<td>' + sanitizar(nombreProv) + '</td>' +
                    '<td>' + sanitizar(c.numero_factura || '—') + '</td>' +
                    '<td>' + sanitizar(c.concepto || '—') + '</td>' +
                    '<td>' + totalFormateado + '</td>' +
                    '<td>' + fecha + '</td>' +
                    '<td>' + nombreUser + '</td>' +
                    '</tr>';
            }
            tbody.innerHTML = h;
        } catch (err) {
            console.error("DETALLE DEL ERROR SUPABASE:", err);
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--danger);">Error al cargar compras.</td></tr>';
        }
    }

    async function registrarCompra(proveedorId, factura, concepto, total) {
        try {
            var userId = usuarioActivo ? usuarioActivo.id : null;

            if (!userId) {
                var userResult = await supabase.from('usuarios').select('id').limit(1).single();
                if (!userResult.error && userResult.data) {
                    userId = userResult.data.id;
                }
            }

            if (!userId) {
                SwalDark.fire({ icon: 'error', title: 'Error', text: 'No se pudo identificar al usuario activo. Inicia sesion nuevamente.' });
                return false;
            }

            var result = await supabase.from('compras_proveedores').insert([{
                proveedor_id: Number(proveedorId),
                numero_factura: factura,
                concepto: concepto,
                total_compra: Number(total),
                usuario_id: userId,
                estado_pago: 'Pagado'
            }]);
            if (result.error) throw result.error;

            await cargarCompras();
            registrarAuditoria('Registro compra factura ' + factura + ' $' + total, 'Compras');
            SwalDark.fire({ icon: 'success', title: 'Compra registrada', text: 'Factura ' + factura + ' por $' + Number(total).toFixed(2), timer: 2000, showConfirmButton: false });
            return true;
        } catch (err) {
            console.error('Error al registrar compra:', err);
            SwalDark.fire({ icon: 'error', title: 'Error al registrar compra', text: err.message || err });
            return false;
        }
    }

    async function recolectarGastosCompras() {
        try {
            var result = await supabase
                .from('compras_proveedores')
                .select('total_compra');
            if (result.error) return 0;
            var datos = result.data || [];
            var totalGastos = 0;
            for (var i = 0; i < datos.length; i++) {
                totalGastos += Number(datos[i].total_compra || 0);
            }
            return totalGastos;
        } catch (e) {
            return 0;
        }
    }

    async function obtenerResumenCompras() {
        try {
            var hoy = new Date().toISOString().slice(0, 10);
            var result = await supabase
                .from('compras_proveedores')
                .select('total_compra')
                .gte('fecha_compra', hoy)
                .lte('fecha_compra', hoy + 'T23:59:59');
            if (result.error) return '';

            var datos = result.data || [];
            if (datos.length === 0) return 'No se han registrado compras hoy.';

            var suma = 0;
            for (var i = 0; i < datos.length; i++) {
                suma += Number(datos[i].total_compra || 0);
            }
            return 'Compras registradas hoy: ' + datos.length + ', por un total de $' + suma.toLocaleString('es-MX', { minimumFractionDigits: 2 }) + '.';
        } catch (e) {
            return '';
        }
    }

    async function obtenerHistorialCompleto() {
        var contexto = '';
        try {
            var ventasRes = await supabase.from('ventas').select('fecha,total').order('fecha', { ascending: true });
            if (ventasRes.error) throw ventasRes.error;
            var ventas = ventasRes.data || [];

            var ventasPorMes = {};
            for (var i = 0; i < ventas.length; i++) {
                var v = ventas[i];
                var mes = v.fecha.slice(0, 7);
                if (!ventasPorMes[mes]) ventasPorMes[mes] = { total: 0, count: 0 };
                ventasPorMes[mes].total += Number(v.total || 0);
                ventasPorMes[mes].count += 1;
            }

            contexto += '--- HISTORIAL DE VENTAS (Agrupado por Mes) ---\n';
            var meses = Object.keys(ventasPorMes).sort();
            for (var m = 0; m < meses.length; m++) {
                var mesKey = meses[m];
                var datos = ventasPorMes[mesKey];
                contexto += mesKey + ': ' + datos.count + ' ventas, Total: $' + datos.total.toLocaleString('es-MX', { minimumFractionDigits: 2 }) + '\n';
            }
            if (meses.length === 0) {
                contexto += 'No hay ventas registradas.\n';
            }

            var detRes = await supabase.from('detalles_venta').select('producto_sku, cantidad, ventas(fecha)');
            if (detRes.error) throw detRes.error;
            var detalles = detRes.data || [];

            var prodVentas = {};
            for (var d = 0; d < detalles.length; d++) {
                var det = detalles[d];
                var sku = det.producto_sku;
                if (!prodVentas[sku]) prodVentas[sku] = 0;
                prodVentas[sku] += Number(det.cantidad || 0);
            }

            var prodRes = await supabase.from('productos').select('sku, marca, modelo, categoria, precio, costo');
            if (prodRes.error) throw prodRes.error;
            var productosDB = prodRes.data || [];

            var mapaProd = {};
            for (var p = 0; p < productosDB.length; p++) {
                mapaProd[productosDB[p].sku] = productosDB[p];
            }

            contexto += '\n--- TOP 10 PRODUCTOS MAS VENDIDOS (Historico) ---\n';
            var ranking = [];
            var skusProd = Object.keys(prodVentas);
            for (var r = 0; r < skusProd.length; r++) {
                ranking.push({ sku: skusProd[r], cantidad: prodVentas[skusProd[r]] });
            }
            ranking.sort(function(a, b) { return b.cantidad - a.cantidad; });
            var top = ranking.slice(0, 10);
            for (var t = 0; t < top.length; t++) {
                var item = top[t];
                var info = mapaProd[item.sku] || null;
                var nombre = info ? (info.marca + ' ' + info.modelo) : item.sku;
                contexto += (t + 1) + '. ' + nombre + ' (SKU: ' + item.sku + ') - ' + item.cantidad + ' unidades vendidas\n';
            }
            if (top.length === 0) {
                contexto += 'No hay datos de productos vendidos.\n';
            }

            contexto += '\n--- CATALOGO DE PRODUCTOS ---\n';
            contexto += 'Total productos registrados: ' + productosDB.length + '\n';
            var categorias = {};
            var valorTotalInventario = 0;
            for (var cp = 0; cp < productosDB.length; cp++) {
                var prod = productosDB[cp];
                var cat = prod.categoria || 'Sin categoria';
                if (!categorias[cat]) categorias[cat] = 0;
                categorias[cat] += 1;
                valorTotalInventario += Number(prod.costo || 0);
            }
            contexto += 'Distribucion por categoria: ';
            var catsKeys = Object.keys(categorias);
            for (var ck = 0; ck < catsKeys.length; ck++) {
                contexto += catsKeys[ck] + ': ' + categorias[catsKeys[ck]] + ' productos';
                if (ck < catsKeys.length - 1) contexto += ', ';
            }
            contexto += '\n';

            var invRes = await supabase.from('inventario').select('producto_sku, stock_actual, stock_minimo, ubicacion');
            if (invRes.error) throw invRes.error;
            var inventario = invRes.data || [];

            contexto += '\n--- ESTADO ACTUAL DEL INVENTARIO ---\n';
            contexto += 'Total productos en inventario: ' + inventario.length + '\n';

            var stockBajo = [];
            var stockTotal = 0;
            for (var s = 0; s < inventario.length; s++) {
                var inv = inventario[s];
                stockTotal += Number(inv.stock_actual || 0);
                if ((inv.stock_actual || 0) <= (inv.stock_minimo || 0)) {
                    stockBajo.push(inv);
                }
            }
            contexto += 'Unidades totales en stock: ' + stockTotal + '\n';
            if (stockBajo.length > 0) {
                contexto += 'Productos con stock bajo o critico (' + stockBajo.length + '):\n';
                for (var sb = 0; sb < stockBajo.length; sb++) {
                    var itemBajo = stockBajo[sb];
                    var infoB = mapaProd[itemBajo.producto_sku] || null;
                    var nombreB = infoB ? (infoB.marca + ' ' + infoB.modelo) : itemBajo.producto_sku;
                    contexto += '- ' + nombreB + ' (' + itemBajo.producto_sku + '): Stock=' + itemBajo.stock_actual + ', Minimo=' + itemBajo.stock_minimo + '\n';
                }
            } else {
                contexto += 'No hay productos con stock bajo.\n';
            }

            var comprasRes = await supabase.from('compras_proveedores').select('total_compra, fecha_compra').order('fecha_compra', { ascending: true });
            if (!comprasRes.error) {
                var compras = comprasRes.data || [];
                var comprasPorMes = {};
                var totalComprasHistorico = 0;
                for (var c = 0; c < compras.length; c++) {
                    var comp = compras[c];
                    var mesC = comp.fecha_compra ? comp.fecha_compra.slice(0, 7) : 'Sin fecha';
                    if (!comprasPorMes[mesC]) comprasPorMes[mesC] = { total: 0, count: 0 };
                    comprasPorMes[mesC].total += Number(comp.total_compra || 0);
                    comprasPorMes[mesC].count += 1;
                    totalComprasHistorico += Number(comp.total_compra || 0);
                }
                contexto += '\n--- HISTORIAL DE COMPRAS A PROVEEDORES (Agrupado por Mes) ---\n';
                contexto += 'Total historico en compras: $' + totalComprasHistorico.toLocaleString('es-MX', { minimumFractionDigits: 2 }) + '\n';
                var mesesC = Object.keys(comprasPorMes).sort();
                for (var mc = 0; mc < mesesC.length; mc++) {
                    var mesCK = mesesC[mc];
                    var datosC = comprasPorMes[mesCK];
                    contexto += mesCK + ': ' + datosC.count + ' compras, Total: $' + datosC.total.toLocaleString('es-MX', { minimumFractionDigits: 2 }) + '\n';
                }
                if (mesesC.length === 0) {
                    contexto += 'No hay compras registradas.\n';
                }
            }

            var provRankRes = await supabase.from('compras_proveedores')
                .select('proveedor_id, total_compra, proveedores!inner(nombre_empresa)');
            if (!provRankRes.error) {
                var comprasProv = provRankRes.data || [];
                var proveedorTotales = {};
                for (var cp2 = 0; cp2 < comprasProv.length; cp2++) {
                    var cpItem = comprasProv[cp2];
                    var nombreProv = (cpItem.proveedores && cpItem.proveedores.nombre_empresa)
                        ? cpItem.proveedores.nombre_empresa
                        : 'Proveedor #' + cpItem.proveedor_id;
                    if (!proveedorTotales[nombreProv]) proveedorTotales[nombreProv] = 0;
                    proveedorTotales[nombreProv] += Number(cpItem.total_compra || 0);
                }
                var rankingProv = [];
                var nombresProv = Object.keys(proveedorTotales);
                for (var np = 0; np < nombresProv.length; np++) {
                    rankingProv.push({ nombre: nombresProv[np], total: proveedorTotales[nombresProv[np]] });
                }
                rankingProv.sort(function(a, b) { return b.total - a.total; });
                contexto += '\n--- RANKING DE PROVEEDORES (Total Comprado) ---\n';
                if (rankingProv.length > 0) {
                    for (var rp = 0; rp < rankingProv.length; rp++) {
                        contexto += (rp + 1) + '. ' + rankingProv[rp].nombre + ': $' + rankingProv[rp].total.toLocaleString('es-MX', { minimumFractionDigits: 2 }) + '\n';
                    }
                } else {
                    contexto += 'No hay compras registradas a proveedores.\n';
                }
            }

            contexto += '\n--- TOP 5 PRODUCTOS MAS VENDIDOS ---\n';
            var top5Vendidos = ranking.slice(0, 5);
            for (var tv = 0; tv < top5Vendidos.length; tv++) {
                var itemV = top5Vendidos[tv];
                var infoV = mapaProd[itemV.sku] || null;
                var nombreV = infoV ? (infoV.marca + ' ' + infoV.modelo) : itemV.sku;
                contexto += (tv + 1) + '. ' + nombreV + ' (SKU: ' + itemV.sku + ') - ' + itemV.cantidad + ' vendidos\n';
            }
            if (top5Vendidos.length === 0) {
                contexto += 'No hay ventas registradas.\n';
            }

            contexto += '\n--- TOP 5 PRODUCTOS CON MENOS STOCK ---\n';
            var inventarioOrdenado = inventario.slice().sort(function(a, b) { return (a.stock_actual || 0) - (b.stock_actual || 0); });
            var top5BajoStock = inventarioOrdenado.slice(0, 5);
            for (var ts = 0; ts < top5BajoStock.length; ts++) {
                var itemS = top5BajoStock[ts];
                var infoS = mapaProd[itemS.producto_sku] || null;
                var nombreS = infoS ? (infoS.marca + ' ' + infoS.modelo) : itemS.producto_sku;
                contexto += (ts + 1) + '. ' + nombreS + ' (SKU: ' + itemS.producto_sku + '): Stock=' + itemS.stock_actual + ', Minimo=' + itemS.stock_minimo + '\n';
            }
            if (top5BajoStock.length === 0) {
                contexto += 'No hay inventario registrado.\n';
            }

            try {
                var clientesRes = await supabase.from('clientes').select('*');
                if (!clientesRes.error) {
                    var clientes = clientesRes.data || [];
                    contexto += '\n--- CLIENTES MAS ACTIVOS ---\n';
                    if (clientes.length > 0) {
                        for (var cl = 0; cl < Math.min(clientes.length, 10); cl++) {
                            var c = clientes[cl];
                            var nombreCli = c.nombre || c.razon_social || c.nombre_empresa || ('Cliente #' + (c.id || cl));
                            contexto += (cl + 1) + '. ' + nombreCli + '\n';
                        }
                    } else {
                        contexto += 'No hay clientes registrados.\n';
                    }
                } else {
                    contexto += '\n--- CLIENTES MAS ACTIVOS ---\n';
                    contexto += 'No existe una tabla de clientes en el sistema. No hay datos de clientes disponibles.\n';
                }
            } catch (e) {
                contexto += '\n--- CLIENTES MAS ACTIVOS ---\n';
                contexto += 'No existe una tabla de clientes en el sistema. No hay datos de clientes disponibles.\n';
            }

            return contexto;
        } catch (e) {
            console.error('Error al obtener historial completo:', e);
            return contexto || 'Error al consultar la base de datos.';
        }
    }

    function cerrarModalProveedor() {
        var modal = document.getElementById('modalProveedor');
        if (modal) modal.classList.add('hidden');
        var form = document.getElementById('formProveedorNative');
        if (form) form.reset();
    }

    /* =================================================================
       MÓDULO DE TALENTO HUMANO — EMPLEADOS (BACKEND REST API)
    ================================================================= */
    var empleadosCache = [];
    var empleadoEditandoId = null;
    var cargosCache = [];

    async function cargarCargos() {
        try {
            var resp = await fetch(API_BASE_URL + '/api/cargos', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': usuarioActivo ? String(usuarioActivo.id) : ''
                }
            });
            if (!resp.ok) {
                console.error('[cargarCargos] Error HTTP ' + resp.status + ':', await resp.text().catch(function(){return '';}));
                cargosCache = [];
                return;
            }
            var data = await resp.json();
            cargosCache = data.cargos || [];
        } catch (err) {
            console.error('Error al cargar cargos:', err);
            cargosCache = [];
        }
    }

    function llenarSelectCargos(valorSeleccionado) {
        var select = document.getElementById('emp-cargo');
        if (!select) return;
        select.innerHTML = '<option value="">Seleccionar cargo...</option>';
        for (var i = 0; i < cargosCache.length; i++) {
            var c = cargosCache[i];
            var selected = (valorSeleccionado && c.nombre === valorSeleccionado) ? ' selected' : '';
            select.innerHTML += '<option value="' + sanitizarAttr(c.nombre) + '" data-salario="' + (c.salario_predeterminado || 0) + '"' + selected + '>' + sanitizar(c.nombre) + '</option>';
        }
        if (valorSeleccionado && !select.value) {
            select.innerHTML += '<option value="' + sanitizarAttr(valorSeleccionado) + '" selected>' + sanitizar(valorSeleccionado) + '</option>';
        }
    }

    function autocompletarSalarioDesdeCargo() {
        var select = document.getElementById('emp-cargo');
        var salarioInput = document.getElementById('emp-salario');
        if (!select || !salarioInput) return;
        var selectedOption = select.options[select.selectedIndex];
        var salario = selectedOption && selectedOption.getAttribute('data-salario');
        if (salario !== null && salario !== undefined && salario !== '') {
            salarioInput.value = parseFloat(salario).toFixed(2);
        } else {
            salarioInput.value = '';
        }
    }

    function renderTalentoHumano() {
        return '' +
        '<div class="section-header" style="display:flex;align-items:center;justify-content:space-between;">' +
            '<h2>Modulo de Talento Humano</h2>' +
            '<button id="btnNuevoEmpleado" class="btn-outline" style="font-size:12px;padding:8px 16px;">+ Nuevo Empleado</button>' +
        '</div>' +
        '<div class="content-panel full-width">' +
            '<div class="panel-title"><i data-lucide="contact" class="panel-icon"></i> Listado de Empleados Activos</div>' +
            '<div class="table-scroll">' +
            '<table class="table-mini" id="tablaEmpleados">' +
                '<thead><tr><th>ID</th><th>Documento</th><th>Nombre Completo</th><th>Cargo</th><th>Salario Base</th><th>Acciones</th></tr></thead>' +
                '<tbody id="empleadosTbody"><tr><td colspan="6" style="text-align:center;color:var(--subtle);">Cargando...</td></tr></tbody>' +
            '</table>' +
            '</div>' +
        '</div>';
    }

    async function cargarEmpleados() {
        var tbody = document.getElementById('empleadosTbody');
        if (!tbody) return;
        tbody.innerHTML = '';
        try {
            var resp = await fetch(API_BASE_URL + '/api/empleados', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': usuarioActivo ? String(usuarioActivo.id) : ''
                }
            });
            if (!resp.ok) {
                var errorBody = '';
                try { errorBody = await resp.text(); } catch (ex) { errorBody = 'No se pudo leer el cuerpo del error'; }
                console.error('[cargarEmpleados] Error HTTP ' + resp.status + ' (' + resp.statusText + '):', errorBody);
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--danger);">Error al cargar empleados.</td></tr>';
                empleadosCache = [];
                return;
            }
            var data = await resp.json();
            empleadosCache = data.empleados || [];
            if (empleadosCache.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--subtle);">No hay empleados registrados.</td></tr>';
                return;
            }
            var h = '';
            for (var i = 0; i < empleadosCache.length; i++) {
                var emp = empleadosCache[i];
                var salarioFormateado = '$' + Number(emp.salario_base).toLocaleString('es-MX', { minimumFractionDigits: 2 });
                h += '<tr>' +
                    '<td class="cell-id">EMP-' + emp.id + '</td>' +
                    '<td>' + sanitizar(emp.documento_identidad) + '</td>' +
                    '<td>' + sanitizar(emp.nombre_completo) + '</td>' +
                    '<td>' + sanitizar(emp.cargo) + '</td>' +
                    '<td>' + salarioFormateado + '</td>' +
                    '<td>' +
                        '<button class="btn-outline btn-edit-emp" data-id="' + emp.id + '" style="font-size:11px;padding:4px 10px;margin-right:4px;" title="Editar">' +
                            '<i data-lucide="pencil" style="width:13px;height:13px;"></i>' +
                        '</button>' +
                        '<button class="btn-outline btn-nov-emp" data-id="' + emp.id + '" data-nombre="' + sanitizarAttr(emp.nombre_completo) + '" style="font-size:11px;padding:4px 10px;margin-right:4px;" title="Registrar Novedad">' +
                            '<i data-lucide="banknote" style="width:13px;height:13px;"></i>' +
                        '</button>' +
                        '<button class="btn-eliminar btn-del-emp" data-id="' + emp.id + '" data-nombre="' + sanitizarAttr(emp.nombre_completo) + '" style="font-size:11px;padding:4px 10px;" title="Desactivar">' +
                            '<i data-lucide="trash-2" style="width:13px;height:13px;"></i>' +
                        '</button>' +
                    '</td>' +
                    '</tr>';
            }
            tbody.innerHTML = h;
            lucide.createIcons();
            bindEmpleadoActions();
        } catch (err) {
            console.error('Error al cargar empleados:', err);
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--danger);">Error de conexion.</td></tr>';
            empleadosCache = [];
        }
    }

    function sanitizarAttr(str) {
        if (!str) return '';
        return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function bindEmpleadoActions() {
        var editBtns = document.querySelectorAll('.btn-edit-emp');
        for (var i = 0; i < editBtns.length; i++) {
            editBtns[i].addEventListener('click', function () {
                var empId = parseInt(this.getAttribute('data-id'));
                abrirModalEditarEmpleado(empId);
            });
        }
        var novBtns = document.querySelectorAll('.btn-nov-emp');
        for (var k = 0; k < novBtns.length; k++) {
            novBtns[k].addEventListener('click', function () {
                var empId = parseInt(this.getAttribute('data-id'));
                var empNombre = this.getAttribute('data-nombre') || 'Empleado';
                abrirModalNovedad(empId, empNombre);
            });
        }
        var delBtns = document.querySelectorAll('.btn-del-emp');
        for (var j = 0; j < delBtns.length; j++) {
            delBtns[j].addEventListener('click', function () {
                var empId = parseInt(this.getAttribute('data-id'));
                var empNombre = this.getAttribute('data-nombre') || 'este empleado';
                abrirModalEliminarEmpleado(empId, empNombre);
            });
        }
    }

    function abrirModalNuevoEmpleado() {
        empleadoEditandoId = null;
        var modal = document.getElementById('modalEmpleado');
        if (!modal) return;
        document.getElementById('modalEmpleadoTitle').textContent = 'Nuevo Empleado';
        document.getElementById('btnGuardarEmp').textContent = 'Guardar Empleado';
        document.getElementById('emp-id').value = '';
        var form = document.getElementById('formEmpleadoNative');
        if (form) form.reset();
        document.getElementById('emp-salario').readOnly = true;
        document.getElementById('emp-salario').value = '';
        modal.classList.remove('hidden');
        cargarCargos().then(function () {
            llenarSelectCargos(null);
        });
        setTimeout(function () {
            var el = document.getElementById('emp-documento');
            if (el) el.focus();
        }, 200);
    }

    function abrirModalEditarEmpleado(empId) {
        var emp = null;
        for (var i = 0; i < empleadosCache.length; i++) {
            if (empleadosCache[i].id === empId) { emp = empleadosCache[i]; break; }
        }
        if (!emp) return;
        empleadoEditandoId = empId;
        var modal = document.getElementById('modalEmpleado');
        if (!modal) return;
        document.getElementById('modalEmpleadoTitle').textContent = 'Editar Empleado';
        document.getElementById('btnGuardarEmp').textContent = 'Actualizar Empleado';
        document.getElementById('emp-id').value = emp.id;
        document.getElementById('emp-documento').value = emp.documento_identidad || '';
        document.getElementById('emp-nombre').value = emp.nombre_completo || '';
        document.getElementById('emp-salario').readOnly = true;
        document.getElementById('emp-salario').value = emp.salario_base || 0;
        modal.classList.remove('hidden');
        cargarCargos().then(function () {
            llenarSelectCargos(emp.cargo || '');
        });
        setTimeout(function () {
            var el = document.getElementById('emp-documento');
            if (el) el.focus();
        }, 200);
    }

    function cerrarModalEmpleado() {
        var modal = document.getElementById('modalEmpleado');
        if (modal) modal.classList.add('hidden');
        var form = document.getElementById('formEmpleadoNative');
        if (form) form.reset();
        empleadoEditandoId = null;
    }

    function abrirModalEliminarEmpleado(empId, empNombre) {
        var modal = document.getElementById('modalEliminarEmpleado');
        if (!modal) return;
        document.getElementById('delEmpMensaje').textContent = 'Desactivar a ' + empNombre + '?';
        document.getElementById('btnConfirmarModalDelEmp').setAttribute('data-id', empId);
        modal.classList.remove('hidden');
    }

    function cerrarModalEliminarEmpleado() {
        var modal = document.getElementById('modalEliminarEmpleado');
        if (modal) modal.classList.add('hidden');
    }

    function abrirModalNovedad(empId, empNombre) {
        var modal = document.getElementById('modalNovedad');
        if (!modal) return;
        var form = document.getElementById('formNovedadNative');
        if (form) form.reset();
        document.getElementById('nov-empleado-id').value = empId;
        document.getElementById('nov-empleado-nombre').value = empNombre;
        modal.classList.remove('hidden');
        setTimeout(function () {
            var el = document.getElementById('nov-tipo');
            if (el) el.focus();
        }, 200);
    }

    function cerrarModalNovedad() {
        var modal = document.getElementById('modalNovedad');
        if (modal) modal.classList.add('hidden');
        var form = document.getElementById('formNovedadNative');
        if (form) form.reset();
    }

    /* =================================================================
       NAVEGACIÓN
    ================================================================= */
    var renderers = {
        dashboard:  renderDashboard,
        ventas:     renderVentas,
        inventario: renderInventario,
        seguridad:  renderSeguridad,
        'gestion-usuarios': renderGestionUsuarios,
        compras:    renderCompras,
        'talento-humano': renderTalentoHumano
    };

    var titulos = {
        dashboard:  'Dashboard / IA',
        ventas:     'Ventas',
        inventario: 'Inventario',
        seguridad:  'Seguridad',
        'gestion-usuarios': 'Gestión de Usuarios',
        compras:    'Compras / Proveedores',
        'talento-humano': 'Talento Humano'
    };

    function navigateTo(sectionKey) {
        if (usuarioActivo && usuarioActivo.rol === 'Vendedor' && sectionKey === 'dashboard') {
            sectionKey = 'ventas';
        }

        if (sectionKey === 'gestion-usuarios' && usuarioActivo && usuarioActivo.rol !== 'Admin') {
            SwalDark.fire({ icon: 'warning', title: 'Acceso denegado', text: 'Solo los administradores pueden gestionar usuarios.', timer: 2500, showConfirmButton: false });
            return;
        }

        if (sectionKey === 'talento-humano' && usuarioActivo && usuarioActivo.rol === 'Vendedor') {
            SwalDark.fire({ icon: 'warning', title: 'Acceso denegado', text: 'El modulo de Talento Humano no esta disponible para vendedores.', timer: 2500, showConfirmButton: false });
            return;
        }

        setActiveNav(sectionKey);
        pageTitle.textContent = titulos[sectionKey] || sectionKey;

        var renderFn = renderers[sectionKey];
        contentArea.innerHTML = renderFn ? renderFn() : '<p>Seccion no encontrada.</p>';

        lucide.createIcons();

        if (sectionKey === 'dashboard') {
            cargarKPIs();
            renderizarGraficos();
            var btnIA = document.getElementById('btnAnalizarIA');
            if (btnIA) {
                btnIA.addEventListener('click', analizarTendencias);
            }
            var btnPDF = document.getElementById('btnExportarPDF');
            if (btnPDF) {
                btnPDF.addEventListener('click', exportarReportePDF);
            }
        }

        if (sectionKey === 'inventario') {
            mostrandoArchivados = false;
            cargarInventario(true).then(function () {
                renderTablaInventario();
                lucide.createIcons();
            });
            var btnToggle = document.getElementById('btnToggleArchivados');
            if (btnToggle) {
                btnToggle.addEventListener('click', async function () {
                    mostrandoArchivados = !mostrandoArchivados;
                    this.textContent = mostrandoArchivados ? 'Ver activos' : 'Ver archivados';
                    await cargarInventario(!mostrandoArchivados);
                    renderTablaInventario();
                    lucide.createIcons();
                });
            }
            var formInv = document.getElementById('formInventario');
            if (formInv) {
                formInv.addEventListener('submit', async function (e) {
                    e.preventDefault();

                    var sku          = document.getElementById('invSku').value.trim();
                    var numSerie     = document.getElementById('invNumSerie').value.trim();
                    var marca        = document.getElementById('invMarca').value.trim();
                    var modelo       = document.getElementById('invModelo').value.trim();
                    var categoria    = document.getElementById('invCategoria').value.trim();
                    var ubicacion    = document.getElementById('invUbicacion').value.trim();
                    var costo        = parseFloat(document.getElementById('invCosto').value);
                    var precio       = parseFloat(document.getElementById('invPrecio').value);
                    var stock_actual = parseInt(document.getElementById('invStockActual').value, 10);
                    var stock_minimo = parseInt(document.getElementById('invStockMinimo').value, 10);

                    var errs = [];
                    var eSku = validarTexto(sku, 'SKU', 2, 30);
                    if (eSku) errs.push(eSku);
                    if (!/^[a-zA-Z0-9\-]+$/.test(sku)) errs.push('SKU solo permite letras, numeros y guiones.');
                    var eSerie = validarTexto(numSerie, 'Numero de Serie', 3, 50);
                    if (eSerie) errs.push(eSerie);
                    var eMarca = validarTexto(marca, 'Marca', 2, 30);
                    if (eMarca) errs.push(eMarca);
                    var eModelo = validarTexto(modelo, 'Modelo', 2, 50);
                    if (eModelo) errs.push(eModelo);
                    var eCat = validarTexto(categoria, 'Categoria', 2, 30);
                    if (eCat) errs.push(eCat);
                    var eUbi = validarTexto(ubicacion, 'Ubicacion', 2, 50);
                    if (eUbi) errs.push(eUbi);
                    var eCos = validarNumero(costo, 'Costo', 0, 999999);
                    if (eCos) errs.push(eCos);
                    var ePre = validarNumero(precio, 'Precio', 0, 999999);
                    if (ePre) errs.push(ePre);
                    if (!isNaN(costo) && !isNaN(precio) && precio < costo) errs.push('El Precio no puede ser menor que el Costo.');
                    var eStk = validarNumero(stock_actual, 'Stock Actual', 0, 99999);
                    if (eStk) errs.push(eStk);
                    var eMin = validarNumero(stock_minimo, 'Stock Minimo', 0, 99999);
                    if (eMin) errs.push(eMin);
                    if (mostrarErrores(errs)) return;

                    var ok = await registrarProducto(sku, numSerie, marca, modelo, categoria, costo, precio, stock_actual, stock_minimo, ubicacion);
                    if (ok) {
                        limpiarFormularioInventario();
                        lucide.createIcons();
                    }
                });
            }
            var btnLimpiar = document.getElementById('btnLimpiarInventario');
            if (btnLimpiar) {
                btnLimpiar.addEventListener('click', limpiarFormularioInventario);
            }
            var btnMagico = document.getElementById('btnAutocompletar');
            if (btnMagico) {
                btnMagico.addEventListener('click', autocompletarConIA);
            }
        }

        if (sectionKey === 'ventas') {
            carrito = [];
            actualizarCarrito();
            var searchInput = document.getElementById('posSearch');
            if (searchInput) {
                var debounceTimer = null;
                searchInput.addEventListener('input', function () {
                    var self = this;
                    clearTimeout(debounceTimer);
                    debounceTimer = setTimeout(async function () {
                        var resultados = await buscarProductos(self.value);
                        renderResultadosBusqueda(resultados);
                    }, 250);
                });
                buscarProductos('').then(function (res) {
                    renderResultadosBusqueda(res);
                });
            }
            var btnVenta = document.getElementById('btnCompletarVenta');
            if (btnVenta) {
                btnVenta.addEventListener('click', completarVenta);
            }
        }

        if (sectionKey === 'seguridad') {
            renderAuditoria();
            var btnCrear = document.getElementById('btnCrearUsuario');
            if (btnCrear) {
                btnCrear.addEventListener('click', function () {
                    crearNuevoUsuario();
                });
            }
        }

        if (sectionKey === 'gestion-usuarios') {
            cargarUsuarios().then(function () {
                var admins = 0;
                var otros = 0;
                for (var ui = 0; ui < usuariosCache.length; ui++) {
                    if (usuariosCache[ui].rol === 'Admin') admins++;
                    else otros++;
                }
                var kpiTotal = document.getElementById('kpiTotalUsuarios');
                var kpiAdmin = document.getElementById('kpiAdmins');
                var kpiOtros = document.getElementById('kpiOtrosRoles');
                if (kpiTotal) kpiTotal.textContent = usuariosCache.length;
                if (kpiAdmin) kpiAdmin.textContent = admins;
                if (kpiOtros) kpiOtros.textContent = otros;
            });
            var btnRefrescar = document.getElementById('btnRefrescarUsuarios');
            if (btnRefrescar) {
                btnRefrescar.addEventListener('click', function () {
                    cargarUsuarios();
                });
            }
        }

        if (sectionKey === 'compras') {
            cargarProveedores().then(function () {
                llenarSelectProveedores();
            }).catch(function (err) {
                console.error('Error al inicializar proveedores:', err);
            });
            cargarCompras().catch(function (err) {
                console.error('Error al inicializar compras:', err);
            });
            var formComp = document.getElementById('formCompra');
            if (formComp) {
                formComp.addEventListener('submit', async function (e) {
                    e.preventDefault();
                    var proveedorId = document.getElementById('compProveedor').value;
                    var factura = document.getElementById('compFactura').value.trim();
                    var concepto = document.getElementById('compConcepto').value.trim();
                    var total = parseFloat(document.getElementById('compTotal').value);

                    var errs = [];
                    if (!proveedorId) errs.push('Selecciona un proveedor de la lista.');
                    var eFac = validarTexto(factura, 'Numero de Factura', 2, 50);
                    if (eFac) errs.push(eFac);
                    var eCon = validarTexto(concepto, 'Concepto', 3, 200);
                    if (eCon) errs.push(eCon);
                    var eTot = validarNumero(total, 'Total', 0.01, 99999999);
                    if (eTot) errs.push(eTot);
                    if (mostrarErrores(errs)) return;

                    var ok = await registrarCompra(proveedorId, factura, concepto, total);
                    if (ok) {
                        document.getElementById('formCompra').reset();
                    }
                });
            }
            var btnNuevoProv = document.getElementById('btnNuevoProveedorCompra');
            if (btnNuevoProv) {
                btnNuevoProv.addEventListener('click', function () {
                    var modal = document.getElementById('modalProveedor');
                    if (modal) modal.classList.remove('hidden');
                    setTimeout(function () {
                        var el = document.getElementById('native-prov-nombre');
                        if (el) el.focus();
                    }, 200);
                });
            }

            var cerrarModalProv = document.getElementById('btnCerrarModalProv');
            var cancelarModalProv = document.getElementById('btnCancelarModalProv');
            if (cerrarModalProv) cerrarModalProv.addEventListener('click', cerrarModalProveedor);
            if (cancelarModalProv) cancelarModalProv.addEventListener('click', cerrarModalProveedor);

            var formProvNative = document.getElementById('formProveedorNative');
            if (formProvNative) {
                formProvNative.addEventListener('submit', async function (e) {
                    e.preventDefault();
                    var nombre = document.getElementById('native-prov-nombre').value.trim();
                    var contacto = document.getElementById('native-prov-contacto').value.trim();
                    var telefono = document.getElementById('native-prov-telefono').value.trim();
                    var email = document.getElementById('native-prov-email').value.trim();

                    var errs = [];
                    var eNom = validarTexto(nombre, 'Nombre de la Empresa', 3, 100);
                    if (eNom) errs.push(eNom);
                    var eCon = validarTexto(contacto, 'Contacto Principal', 3, 100);
                    if (eCon) errs.push(eCon);
                    var eTel = validarTelefono(telefono);
                    if (eTel) errs.push(eTel);
                    var eMail = validarEmail(email);
                    if (eMail) errs.push(eMail);
                    if (mostrarErrores(errs)) return;

                    cerrarModalProveedor();

                    try {
                        var result = await supabase.from('proveedores').insert([{
                            nombre_empresa: nombre,
                            contacto_principal: contacto,
                            telefono: telefono || null,
                            email: email || null
                        }]);
                        if (result.error) throw result.error;

                        await cargarProveedores();
                        llenarSelectProveedores();
                        SwalDark.fire({
                            icon: 'success',
                            title: 'Proveedor registrado',
                            text: 'El nuevo proveedor ya esta disponible en el formulario de compras.',
                            timer: 2500,
                            showConfirmButton: false
                        });
                    } catch (err) {
                        SwalDark.fire({ icon: 'error', title: 'Error al registrar', text: err.message || err });
                    }
                });
            }
        }

        if (sectionKey === 'talento-humano') {
            cargarEmpleados().catch(function (err) {
                console.error('Error al inicializar empleados:', err);
            });
            cargarCargos().catch(function (err) {
                console.error('Error al inicializar cargos:', err);
            });

            var cargoSelect = document.getElementById('emp-cargo');
            if (cargoSelect) {
                cargoSelect.addEventListener('change', autocompletarSalarioDesdeCargo);
            }

            var btnNuevoEmp = document.getElementById('btnNuevoEmpleado');
            if (btnNuevoEmp) {
                btnNuevoEmp.addEventListener('click', abrirModalNuevoEmpleado);
            }

            var cerrarModalEmp = document.getElementById('btnCerrarModalEmp');
            var cancelarModalEmp = document.getElementById('btnCancelarModalEmp');
            if (cerrarModalEmp) cerrarModalEmp.addEventListener('click', cerrarModalEmpleado);
            if (cancelarModalEmp) cancelarModalEmp.addEventListener('click', cerrarModalEmpleado);

            var formEmpNative = document.getElementById('formEmpleadoNative');
            if (formEmpNative) {
                formEmpNative.addEventListener('submit', async function (e) {
                    e.preventDefault();
                    var doc = document.getElementById('emp-documento').value.trim();
                    var nombre = document.getElementById('emp-nombre').value.trim();
                    var cargo = document.getElementById('emp-cargo').value;
                    var salario = parseFloat(document.getElementById('emp-salario').value);

                    var errs = [];
                    var eDoc = validarTexto(doc, 'Documento', 3, 30);
                    if (eDoc) errs.push(eDoc);
                    var eNom = validarTexto(nombre, 'Nombre Completo', 3, 100);
                    if (eNom) errs.push(eNom);
                    if (!cargo) errs.push('Debes seleccionar un cargo de la lista.');
                    var eSal = validarNumero(salario, 'Salario Base', 0, 99999999);
                    if (eSal) errs.push(eSal);
                    if (mostrarErrores(errs)) return;

                    var isEdit = empleadoEditandoId !== null;
                    try {
                        var url = API_BASE_URL + '/api/empleados';
                        var method = 'POST';
                        var body = { documento_identidad: doc, nombre_completo: nombre, cargo: cargo, salario_base: salario };
                        if (isEdit) {
                            url = API_BASE_URL + '/api/empleados/' + empleadoEditandoId;
                            method = 'PUT';
                        }
                        var resp = await fetch(url, {
                            method: method,
                            headers: {
                                'Content-Type': 'application/json',
                                'X-User-Id': usuarioActivo ? String(usuarioActivo.id) : ''
                            },
                            body: JSON.stringify(body)
                        });
                        if (!resp.ok) {
                            var errData = await resp.json().catch(function () { return { error: 'Error desconocido' }; });
                            SwalDark.fire({ icon: 'error', title: 'Error', text: errData.error || 'No se pudo guardar el empleado.' });
                            return;
                        }
                        cerrarModalEmpleado();
                        await cargarEmpleados();
                        registrarAuditoria(isEdit ? 'Edito empleado: ' + nombre : 'Creo empleado: ' + nombre, 'Talento Humano');
                        SwalDark.fire({
                            icon: 'success',
                            title: isEdit ? 'Empleado actualizado' : 'Empleado creado',
                            text: nombre + ' guardado correctamente.',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    } catch (err) {
                        SwalDark.fire({ icon: 'error', title: 'Error de conexion', text: err.message || err });
                    }
                });
            }

            var cerrarModalDelEmp = document.getElementById('btnCerrarModalDelEmp');
            var cancelarModalDelEmp = document.getElementById('btnCancelarModalDelEmp');
            if (cerrarModalDelEmp) cerrarModalDelEmp.addEventListener('click', cerrarModalEliminarEmpleado);
            if (cancelarModalDelEmp) cancelarModalDelEmp.addEventListener('click', cerrarModalEliminarEmpleado);

            var btnConfirmarDelEmp = document.getElementById('btnConfirmarModalDelEmp');
            if (btnConfirmarDelEmp) {
                btnConfirmarDelEmp.addEventListener('click', async function () {
                    var empId = parseInt(this.getAttribute('data-id'));
                    if (!empId) return;
                    try {
                        var resp = await fetch(API_BASE_URL + '/api/empleados/' + empId, {
                            method: 'DELETE',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-User-Id': usuarioActivo ? String(usuarioActivo.id) : ''
                            }
                        });
                        if (!resp.ok) {
                            var errData = await resp.json().catch(function () { return { error: 'Error desconocido' }; });
                            SwalDark.fire({ icon: 'error', title: 'Error', text: errData.error || 'No se pudo desactivar el empleado.' });
                            return;
                        }
                        cerrarModalEliminarEmpleado();
                        await cargarEmpleados();
                        registrarAuditoria('Desactivo empleado ID ' + empId, 'Talento Humano');
                        SwalDark.fire({
                            icon: 'success',
                            title: 'Empleado desactivado',
                            text: 'El empleado fue removido de la lista activa.',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    } catch (err) {
                        SwalDark.fire({ icon: 'error', title: 'Error de conexion', text: err.message || err });
                    }
                });
            }

            var cerrarModalNov = document.getElementById('btnCerrarModalNov');
            var cancelarModalNov = document.getElementById('btnCancelarModalNov');
            if (cerrarModalNov) cerrarModalNov.addEventListener('click', cerrarModalNovedad);
            if (cancelarModalNov) cancelarModalNov.addEventListener('click', cerrarModalNovedad);

            var formNovNative = document.getElementById('formNovedadNative');
            if (formNovNative) {
                formNovNative.addEventListener('submit', async function (e) {
                    e.preventDefault();
                    var empId = parseInt(document.getElementById('nov-empleado-id').value);
                    var tipo = document.getElementById('nov-tipo').value;
                    var monto = parseFloat(document.getElementById('nov-monto').value);
                    var concepto = document.getElementById('nov-concepto').value.trim();

                    var errs = [];
                    if (!empId) errs.push('Empleado invalido.');
                    if (!tipo) errs.push('Debes seleccionar un tipo de novedad.');
                    var eMon = validarNumero(monto, 'Monto', 0.01, 99999999);
                    if (eMon) errs.push(eMon);
                    var eCon = validarTexto(concepto, 'Concepto', 3, 200);
                    if (eCon) errs.push(eCon);
                    if (mostrarErrores(errs)) return;

                    try {
                        var resp = await fetch(API_BASE_URL + '/api/novedades', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'X-User-Id': usuarioActivo ? String(usuarioActivo.id) : ''
                            },
                            body: JSON.stringify({
                                empleado_id: empId,
                                tipo: tipo,
                                monto: monto,
                                concepto: concepto
                            })
                        });
                        if (!resp.ok) {
                            var errData = await resp.json().catch(function () { return { error: 'Error desconocido' }; });
                            SwalDark.fire({ icon: 'error', title: 'Error', text: errData.error || 'No se pudo registrar la novedad.' });
                            return;
                        }
                        cerrarModalNovedad();
                        registrarAuditoria('Registro novedad (' + tipo + ') $' + monto + ' a empleado ' + empId, 'Talento Humano');
                        SwalDark.fire({
                            icon: 'success',
                            title: 'Novedad registrada',
                            text: tipo + ' por $' + monto.toFixed(2) + ' registrado correctamente.',
                            timer: 2000,
                            showConfirmButton: false
                        });
                    } catch (err) {
                        SwalDark.fire({ icon: 'error', title: 'Error de conexion', text: err.message || err });
                    }
                });
            }
        }

        if (window.innerWidth <= 768 && isMobileOpen) {
            closeMobileSidebar();
        }
    }

    navItems.forEach(function (item) {
        item.addEventListener('click', function () {
            var section = item.getAttribute('data-section');
            if (section) navigateTo(section);
        });
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth > 768 && isMobileOpen) {
            closeMobileSidebar();
        }
    });

    var btnSidebarLogout = document.getElementById('btnSidebarLogout');
    if (btnSidebarLogout) {
        btnSidebarLogout.addEventListener('click', cerrarSesion);
    }

    lucide.createIcons();

    var cerrarModalUsr = document.getElementById('btnCerrarModalUsr');
    var cancelarModalUsr = document.getElementById('btnCancelarModalUsr');
    if (cerrarModalUsr) cerrarModalUsr.addEventListener('click', cerrarModalUsuario);
    if (cancelarModalUsr) cancelarModalUsr.addEventListener('click', cerrarModalUsuario);

    var formUsrNative = document.getElementById('formUsuarioNative');
    if (formUsrNative) {
        formUsrNative.addEventListener('submit', async function (e) {
            e.preventDefault();
            var nom = document.getElementById('native-usr-nombre').value.trim();
            var pass = document.getElementById('native-usr-password').value;
            var rol = document.getElementById('native-usr-rol').value;

            var errs = [];
            var eNom = validarTexto(nom, 'Nombre', 3, 30);
            if (eNom) errs.push(eNom);
            if (!/^[a-zA-Z0-9\s]+$/.test(nom)) errs.push('Nombre solo permite letras, numeros y espacios.');
            var ePass = validarTexto(pass, 'Contrasena', 3, 50);
            if (ePass) errs.push(ePass);
            if (rol !== 'Admin' && rol !== 'Gerente' && rol !== 'Vendedor') errs.push('Rol no valido.');
            if (mostrarErrores(errs)) return;

            try {
                var ins = await supabase.from('usuarios').insert([{ nombre: nom, password_hash: sha256(pass), rol: rol }]);
                if (ins.error) throw ins.error;

                cerrarModalUsuario();
                registrarAuditoria('Creo cuenta para: ' + nom, 'Seguridad');
                SwalDark.fire({ icon: 'success', title: 'Usuario creado', text: nom + ' ahora puede iniciar sesion.', timer: 2500, showConfirmButton: false });
            } catch (err) {
                SwalDark.fire({ icon: 'error', title: 'Error al crear', text: err.message || err });
            }
        });
    }

    var cerrarModalEditUsr = document.getElementById('btnCerrarModalEditUsr');
    var cancelarModalEditUsr = document.getElementById('btnCancelarModalEditUsr');
    if (cerrarModalEditUsr) cerrarModalEditUsr.addEventListener('click', cerrarModalEditarUsuario);
    if (cancelarModalEditUsr) cancelarModalEditUsr.addEventListener('click', cerrarModalEditarUsuario);

    var formEditUsrNative = document.getElementById('formEditarUsuarioNative');
    if (formEditUsrNative) {
        formEditUsrNative.addEventListener('submit', function (e) {
            e.preventDefault();
            guardarEdicionUsuario();
        });
    }

    var cerrarModalDelUsr = document.getElementById('btnCerrarModalDelUsr');
    var cancelarModalDelUsr = document.getElementById('btnCancelarModalDelUsr');
    var confirmarModalDelUsr = document.getElementById('btnConfirmarModalDelUsr');
    if (cerrarModalDelUsr) cerrarModalDelUsr.addEventListener('click', cerrarModalEliminarUsuario);
    if (cancelarModalDelUsr) cancelarModalDelUsr.addEventListener('click', cerrarModalEliminarUsuario);
    if (confirmarModalDelUsr) confirmarModalDelUsr.addEventListener('click', confirmarEliminarUsuario);

    window.abrirPerfilGlobal = function () { cerrarDropdowns(); abrirPerfil().catch(function () {}); };
    window.cerrarSesionGlobal = function () { cerrarDropdowns(); cerrarSesion(); };


    /* =================================================================
       COPILOTO FINANCIERO — CHAT FLOTANTE
    ================================================================= */
    var copilotAbierto = false;

    window.toggleCopilot = function () {
        copilotAbierto = !copilotAbierto;
        var win = document.getElementById('copilotWindow');
        if (!win) return;
        if (copilotAbierto) {
            win.classList.add('active');
            var input = document.getElementById('copilotInput');
            if (input) setTimeout(function () { input.focus(); }, 350);
        } else {
            win.classList.remove('active');
        }
    };

    var CONTEXTO_SISTEMA =
        '--- ARQUITECTURA DEL SISTEMA ERP ---\n' +
        'El ERP tiene 5 modulos principales:\n' +
        '- Modulo de Dashboard: Panel de control con KPIs en tiempo real (ingresos del dia, ordenes, stock bajo, usuarios registrados) y graficos de tendencias de ventas e inventario generados con Chart.js.\n' +
        '- Modulo de Ventas (POS): Punto de venta dinamico con busqueda de productos, carrito de compras, calculo de totales y descuento automatico de stock al completar una venta. Cada venta se registra con fecha, total y productos involucrados.\n' +
        '- Modulo de Inventario: Gestion completa de productos tecnologicos. Permite registrar productos con SKU, numero de serie, marca, modelo, categoria, costo, precio, stock actual, stock minimo y ubicacion. Incluye alertas visuales de stock bajo, reabastecimiento manual, y borrado logico (archivado/restauracion).\n' +
        '- Modulo de Compras / Proveedores: Gestion de proveedores y facturas de compra. Permite registrar proveedores con nombre_empresa, contacto_principal, telefono y email. Cada compra se registra con numero_factura, concepto, total_compra, fecha_compra y estado_pago, vinculada a un proveedor.\n' +
        '- Modulo de Seguridad: Gestion de usuarios con control de acceso por roles (Admin, Gerente, Vendedor). Los Admins pueden crear usuarios, cambiar roles y ver el registro de auditoria (Caja Negra) que graba cada accion critica: inicios de sesion, registros de productos, ventas, reabastecimientos, archivados, creacion de usuarios. Cada usuario tiene registro de Ultimo Acceso.\n' +
        'Base de datos: PostgreSQL via Supabase (productos, inventario, ventas, detalles_venta, usuarios, auditoria, proveedores, compras_proveedores).\n';

    function recolectarDatosERP() {
        var partes = [];
        try {
            var kpiIng = document.getElementById('kpiIngresos');
            var kpiOrd = document.getElementById('kpiOrdenes');
            var kpiStk = document.getElementById('kpiStockBajo');
            var kpiUsr = document.getElementById('kpiUsuarios');

            if (kpiIng && kpiIng.textContent !== '—' && kpiIng.textContent !== 'Cargando...') {
                partes.push('Ingresos hoy: ' + kpiIng.textContent);
            }
            if (kpiOrd && kpiOrd.textContent !== '—' && kpiOrd.textContent !== 'Cargando...') {
                partes.push('Ordenes hoy: ' + kpiOrd.textContent);
            }
            if (kpiStk && kpiStk.textContent !== '—' && kpiStk.textContent !== 'Cargando...') {
                partes.push('Productos con stock bajo: ' + kpiStk.textContent);
            }
            if (kpiUsr && kpiUsr.textContent !== '—' && kpiUsr.textContent !== 'Cargando...') {
                partes.push('Usuarios registrados en el sistema: ' + kpiUsr.textContent);
            }

            if (typeof productos !== 'undefined' && productos && productos.length > 0) {
                var total = productos.length;
                var muestra = productos.slice(0, 5).map(function (p) {
                    return p.marca + ' ' + p.modelo + ' (stock:' + p.stock_actual + ', precio:$' + p.precio + ')';
                }).join('; ');
                partes.push('Total productos en inventario: ' + total);
                partes.push('Muestra del inventario: ' + muestra);
            }

            if (usuarioActivo) {
                partes.push('Usuario activo: ' + usuarioActivo.nombre + ' (' + usuarioActivo.rol + ')');
            }
        } catch (e) {}

        var contextoCompleto = CONTEXTO_SISTEMA;
        if (partes.length > 0) {
            contextoCompleto += '\n--- DATOS EN VIVO DEL ERP ---\n' + partes.join('\n');
        } else {
            contextoCompleto += '\n--- DATOS EN VIVO ---\nNo hay datos cargados en el dashboard en este momento.';
        }
        return contextoCompleto;
    }

    function mostrarAnalizando() {
        var area = document.getElementById('copilotMessages');
        if (!area) return;
        ocultarAnalizando();
        var div = document.createElement('div');
        div.className = 'copilot-msg copilot-msg-bot';
        div.id = 'copilotAnalizando';
        div.textContent = 'Analizando base de datos...';
        area.appendChild(div);
        area.scrollTop = area.scrollHeight;
    }

    function ocultarAnalizando() {
        var el = document.getElementById('copilotAnalizando');
        if (el) el.remove();
    }

    function mostrarEscribiendo() {
        var area = document.getElementById('copilotMessages');
        if (!area) return;
        var div = document.createElement('div');
        div.className = 'copilot-typing';
        div.id = 'copilotTyping';
        div.innerHTML = '<span></span><span></span><span></span>';
        area.appendChild(div);
        area.scrollTop = area.scrollHeight;
    }

    function ocultarEscribiendo() {
        var typing = document.getElementById('copilotTyping');
        if (typing) typing.remove();
    }

    function agregarMensaje(texto, tipo) {
        var area = document.getElementById('copilotMessages');
        if (!area) return;
        var div = document.createElement('div');
        div.className = 'copilot-msg copilot-msg-' + tipo;
        div.textContent = texto;
        area.appendChild(div);
        area.scrollTop = area.scrollHeight;
    }

    window.enviarMensajeCopilot = async function () {
        var input = document.getElementById('copilotInput');
        if (!input) return;
        var pregunta = input.value.trim();
        if (!pregunta) return;

        agregarMensaje(pregunta, 'user');
        input.value = '';
        mostrarAnalizando();

        try {
            var contexto = recolectarDatosERP();

            var historialCompleto = await obtenerHistorialCompleto();
            if (historialCompleto) {
                contexto += '\n' + historialCompleto;
            }

            ocultarAnalizando();
            mostrarEscribiendo();

            var resp = await fetch(API_BASE_URL + '/api/copiloto', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pregunta: pregunta,
                    contexto: contexto,
                    contexto_sistema: CONTEXTO_SISTEMA
                })
            });

            ocultarEscribiendo();

            if (!resp.ok) {
                agregarMensaje('Error: el servicio IA no respondio correctamente. Intenta de nuevo.', 'bot');
                return;
            }

            var data = await resp.json();
            agregarMensaje(data.respuesta || 'Sin respuesta.', 'bot');
        } catch (err) {
            ocultarAnalizando();
            ocultarEscribiendo();
            agregarMensaje('Error de conexion con el Copiloto. Verifica tu conexion a internet.', 'bot');
        }
    };

    var copTrigger = document.getElementById('copilotTrigger');
    var copClose = document.getElementById('copilotClose');
    var copSend = document.getElementById('copilotSend');
    var copInput = document.getElementById('copilotInput');

    if (copTrigger) copTrigger.addEventListener('click', toggleCopilot);
    if (copClose) copClose.addEventListener('click', toggleCopilot);
    if (copSend) copSend.addEventListener('click', enviarMensajeCopilot);
    if (copInput) {
        copInput.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') { e.preventDefault(); enviarMensajeCopilot(); }
        });
    }
})();
