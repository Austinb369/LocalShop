/**
 * LocalShop PWA - app.js
 * Maneja: registro del Service Worker, Geolocalización, instalación PWA,
 * detección offline y notificaciones Toast.
 */

/* ============================================
   1. REGISTRO DEL SERVICE WORKER
   ============================================ */
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('[SW] Registrado con éxito. Scope:', registration.scope);
                // Actualizar indicador en stats bar
                const swStatus = document.getElementById('swStatus');
                if (swStatus) swStatus.textContent = 'Activo';
                showToast('✅ Service Worker registrado - Modo offline disponible', 'success');
            })
            .catch(error => {
                console.error('[SW] Error al registrar:', error);
                const swStatus = document.getElementById('swStatus');
                if (swStatus) swStatus.textContent = 'Error';
            });
    });
} else {
    console.warn('[SW] Service Workers no son soportados en este navegador.');
    const swStatus = document.getElementById('swStatus');
    if (swStatus) swStatus.textContent = 'N/A';
}

/* ============================================
   2. GEOLOCALIZACIÓN (API nativa del dispositivo)
   ============================================ */
const btnGeo = document.getElementById('btnGeo');
const locationPanel = document.getElementById('locationPanel');
const locationText = document.getElementById('locationText');

if (btnGeo) {
    btnGeo.addEventListener('click', () => {
        if (!navigator.geolocation) {
            showToast('❌ Geolocalización no disponible en este navegador', 'error');
            return;
        }

        // Indicar carga
        btnGeo.disabled = true;
        btnGeo.innerHTML = '<i class="bi bi-hourglass-split"></i> <span>Obteniendo...</span>';

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat  = position.coords.latitude.toFixed(6);
                const lon  = position.coords.longitude.toFixed(6);
                const acc  = Math.round(position.coords.accuracy);

                // Actualizar el panel de ubicación
                locationText.textContent = `Lat: ${lat}  |  Lon: ${lon}  |  Precisión: ±${acc}m`;
                locationPanel.style.display = 'block';

                // Restaurar botón
                btnGeo.disabled = false;
                btnGeo.innerHTML = '<i class="bi bi-geo-alt-fill"></i> <span class="btn-geo-text">Mi Ubicación</span>';

                showToast(`📍 Ubicación obtenida: ${lat}, ${lon}`, 'success');
            },
            (error) => {
                btnGeo.disabled = false;
                btnGeo.innerHTML = '<i class="bi bi-geo-alt-fill"></i> <span class="btn-geo-text">Mi Ubicación</span>';

                let mensaje = 'No se pudo obtener la ubicación.';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        mensaje = '❌ Permiso de geolocalización denegado por el usuario.';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        mensaje = '❌ Posición no disponible en este momento.';
                        break;
                    case error.TIMEOUT:
                        mensaje = '❌ Tiempo de espera agotado para obtener la ubicación.';
                        break;
                }
                showToast(mensaje, 'error');
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

/* ============================================
   3. BOTÓN INSTALAR PWA (beforeinstallprompt)
   ============================================ */
let deferredPrompt = null;
const btnInstall = document.getElementById('btnInstall');

window.addEventListener('beforeinstallprompt', (event) => {
    // Previene el mini-infobar automático del navegador
    event.preventDefault();
    deferredPrompt = event;

    // Mostrar el botón de instalación personalizado
    if (btnInstall) {
        btnInstall.classList.remove('d-none');
    }
    console.log('[PWA] beforeinstallprompt disparado, instalación disponible.');
});

if (btnInstall) {
    btnInstall.addEventListener('click', async () => {
        if (!deferredPrompt) return;

        // Muestra el diálogo de instalación nativo del navegador
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('[PWA] Usuario aceptó instalar la app.');
            showToast('🎉 ¡LocalShop instalada en tu dispositivo!', 'success');
        } else {
            console.log('[PWA] Usuario rechazó la instalación.');
        }
        deferredPrompt = null;
        btnInstall.classList.add('d-none');
    });
}

// Ocultar botón instalar si la PWA ya está instalada
window.addEventListener('appinstalled', () => {
    if (btnInstall) btnInstall.classList.add('d-none');
    showToast('📲 App instalada correctamente', 'success');
    deferredPrompt = null;
});

/* ============================================
   4. DETECCIÓN ONLINE / OFFLINE
   ============================================ */
const offlineIndicator = document.getElementById('offlineIndicator');

function updateOnlineStatus() {
    if (!navigator.onLine) {
        if (offlineIndicator) offlineIndicator.classList.remove('d-none');
        showToast('📴 Sin conexión. Mostrando datos en caché.', 'warning');
    } else {
        if (offlineIndicator) offlineIndicator.classList.add('d-none');
    }
}

window.addEventListener('online',  updateOnlineStatus);
window.addEventListener('offline', updateOnlineStatus);
// Verificar al cargar
updateOnlineStatus();

/* ============================================
   5. NAVBAR - efecto scroll
   ============================================ */
const mainNav = document.getElementById('mainNav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        mainNav.classList.add('scrolled');
    } else {
        mainNav.classList.remove('scrolled');
    }
}, { passive: true });

/* ============================================
   6. FUNCIÓN DE CIERRE DEL PANEL DE UBICACIÓN
   ============================================ */
function closeLocationPanel() {
    const panel = document.getElementById('locationPanel');
    if (panel) panel.style.display = 'none';
}
// Exponer globalmente para el onclick en HTML
window.closeLocationPanel = closeLocationPanel;

/* ============================================
   7. SISTEMA DE TOAST NOTIFICATIONS
   ============================================ */
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const colorMap = {
        success: '#00b894',
        error:   '#d63031',
        warning: '#fdcb6e',
        info:    '#6c63ff'
    };

    const iconMap = {
        success: 'bi-check-circle-fill',
        error:   'bi-x-circle-fill',
        warning: 'bi-exclamation-triangle-fill',
        info:    'bi-info-circle-fill'
    };

    const id = `toast-${Date.now()}`;
    const toastEl = document.createElement('div');
    toastEl.id = id;
    toastEl.className = 'toast show';
    toastEl.style.cssText = `
        background: #12122a;
        border: 1px solid rgba(108,99,255,0.2);
        color: #f0f0ff;
        border-radius: 12px;
        min-width: 280px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        margin-bottom: 8px;
    `;
    toastEl.setAttribute('role', 'alert');
    toastEl.innerHTML = `
        <div class="toast-body d-flex align-items-center gap-2" style="padding:12px 16px;">
            <i class="bi ${iconMap[type]}" style="color:${colorMap[type]};font-size:1rem;flex-shrink:0;"></i>
            <span style="font-size:0.85rem;font-weight:500;">${message}</span>
        </div>
    `;

    container.appendChild(toastEl);

    // Auto-eliminar tras 4 segundos con animación
    setTimeout(() => {
        toastEl.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        toastEl.style.opacity = '0';
        toastEl.style.transform = 'translateX(20px)';
        setTimeout(() => toastEl.remove(), 400);
    }, 4000);
}

console.log('[LocalShop PWA] app.js cargado correctamente ✅');
