// DigitalVerse - Main JavaScript

// Variables globales
let productos = [];
let categorias = [];
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let usuario = JSON.parse(localStorage.getItem('usuario')) || null;

// Inicialización del sitio
document.addEventListener('DOMContentLoaded', function() {
    inicializarParticulas();
    cargarDatos();
    inicializarNavegacion();
    inicializarAnimacionesScroll();
    inicializarCarrusel();
    actualizarCarritoUI();
});

// Sistema de partículas con p5.js
function inicializarParticulas() {
    new p5(function(p) {
        let particles = [];
        
        p.setup = function() {
            let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
            canvas.parent('particle-container');
            canvas.style('position', 'fixed');
            canvas.style('top', '0');
            canvas.style('left', '0');
            canvas.style('z-index', '-1');
            
            // Crear partículas
            for (let i = 0; i < 50; i++) {
                particles.push({
                    x: p.random(p.width),
                    y: p.random(p.height),
                    vx: p.random(-0.5, 0.5),
                    vy: p.random(-0.5, 0.5),
                    size: p.random(2, 6),
                    opacity: p.random(0.1, 0.3)
                });
            }
        };
        
        p.draw = function() {
            p.clear();
            
            // Dibujar y actualizar partículas
            particles.forEach(particle => {
                p.fill(37, 99, 235, particle.opacity * 255);
                p.noStroke();
                p.circle(particle.x, particle.y, particle.size);
                
                // Mover partícula
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Rebote en bordes
                if (particle.x < 0 || particle.x > p.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > p.height) particle.vy *= -1;
            });
        };
        
        p.windowResized = function() {
            p.resizeCanvas(p.windowWidth, p.windowHeight);
        };
    });
}

// Cargar datos de productos y categorías
async function cargarDatos() {
    try {
        const response = await fetch('productos.json');
        const data = await response.json();
        productos = data.productos;
        categorias = data.categorias;
        
        renderizarProductosDestacados();
        renderizarCategorias();
    } catch (error) {
        console.error('Error al cargar datos:', error);
        // Datos de respaldo
        productos = [
            {
                id: 1,
                nombre: "Cyber Forest Landscape",
                tipo: "fondo-escritorio",
                categoria: "naturaleza",
                precio: 0.99,
                imagen: "producto-1.png",
                descripcion: "Paisaje digital futurista con efectos holográficos y neón",
                destacado: true
            },
            {
                id: 2,
                nombre: "Cyberpunk Anime City",
                tipo: "fondo-movil",
                categoria: "anime",
                precio: 0.99,
                imagen: "producto-2.png",
                descripcion: "Ciudad cyberpunk estilo anime con luces de neón",
                destacado: true
            },
            {
                id: 3,
                nombre: "Christmas Holographic Card",
                tipo: "tarjeta",
                categoria: "festivo",
                precio: 1.99,
                imagen: "producto-3.png",
                descripcion: "Tarjeta de Navidad con efectos holográficos",
                destacado: false
            }
        ];
        
        categorias = [
            {id: "anime", nombre: "Anime", color: "#8B5CF6", icono: "🎌"},
            {id: "naturaleza", nombre: "Naturaleza", color: "#10B981", icono: "🌿"},
            {id: "automovilismo", nombre: "Automovilismo", color: "#EF4444", icono: "🏎️"}
        ];
        
        renderizarProductosDestacados();
        renderizarCategorias();
    }
}

// Renderizar productos destacados
function renderizarProductosDestacados() {
    const productosDestacados = productos.filter(p => p.destacado);
    const featuredList = document.getElementById('featured-list');
    
    if (!featuredList) return;
    
    featuredList.innerHTML = '';
    
    productosDestacados.forEach(producto => {
        const slide = document.createElement('li');
        slide.className = 'splide__slide';
        slide.innerHTML = `
            <div class="product-card rounded-2xl p-6 m-4">
                <div class="aspect-square mb-4 overflow-hidden rounded-xl">
                    <img src="imagenes/${producto.imagen}" 
                         alt="${producto.nombre}"
                         class="w-full h-full object-cover"
                         onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDMwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIiBmaWxsPSIjMWUyOTNiIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjQ3NDhiIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCI+SW1hZ2VuIG5vIGRpc3BvbmlibGU8L3RleHQ+Cjwvc3ZnPg=='">
                </div>
                <h3 class="font-accent font-semibold text-xl mb-2">${producto.nombre}</h3>
                <p class="text-gray-300 text-sm mb-4 line-clamp-2">${producto.descripcion}</p>
                <div class="flex justify-between items-center mb-4">
                    <span class="text-2xl font-bold text-green-400">€${producto.precio}</span>
                    <span class="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm capitalize">${producto.tipo.replace('-', ' ')}</span>
                </div>
                <button onclick="agregarAlCarrito(${producto.id})" 
                        class="w-full btn-primary py-3 rounded-xl font-semibold hover-lift">
                    Añadir al Carrito
                </button>
            </div>
        `;
        featuredList.appendChild(slide);
    });
}

// Renderizar categorías
function renderizarCategorias() {
    const categoriesGrid = document.getElementById('categories-grid');
    
    if (!categoriesGrid) return;
    
    categoriesGrid.innerHTML = '';
    
    categorias.forEach(categoria => {
        const categoriaCard = document.createElement('div');
        categoriaCard.className = 'glass-effect rounded-2xl p-6 text-center hover-lift cursor-pointer reveal';
        categoriaCard.onclick = () => window.location.href = `catalogo.html?categoria=${categoria.id}`;
        
        categoriaCard.innerHTML = `
            <div class="category-icon mb-4" style="color: ${categoria.color}">
                ${categoria.icono}
            </div>
            <h3 class="font-accent font-bold text-xl mb-2" style="color: ${categoria.color}">
                ${categoria.nombre}
            </h3>
            <p class="text-gray-400 text-sm">
                Explorar productos de ${categoria.nombre.toLowerCase()}
            </p>
        `;
        
        categoriesGrid.appendChild(categoriaCard);
    });
}

// Sistema de navegación
function inicializarNavegacion() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    // Cerrar menú móvil al hacer clic en un enlace
    const mobileLinks = mobileMenu?.querySelectorAll('a');
    if (mobileLinks) {
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }
}

// Animaciones de scroll
function inicializarAnimacionesScroll() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Animación con stagger
                const index = Array.from(entry.target.parentNode.children).indexOf(entry.target);
                setTimeout(() => {
                    anime({
                        targets: entry.target,
                        opacity: [0, 1],
                        translateY: [30, 0],
                        duration: 800,
                        easing: 'easeOutQuart'
                    });
                }, index * 100);
            }
        });
    }, observerOptions);
    
    // Observar elementos con clase reveal
    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });
}

// Inicializar carrusel
function inicializarCarrusel() {
    const splide = new Splide('#featured-products', {
        type: 'loop',
        perPage: 3,
        perMove: 1,
        gap: '2rem',
        autoplay: true,
        interval: 4000,
        pauseOnHover: true,
        breakpoints: {
            1024: {
                perPage: 2,
            },
            640: {
                perPage: 1,
            }
        }
    });
    
    splide.mount();
}

// Sistema de carrito
function agregarAlCarrito(productoId) {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;
    
    const itemExistente = carrito.find(item => item.id === productoId);
    
    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({
            ...producto,
            cantidad: 1
        });
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarCarritoUI();
    mostrarNotificacion('Producto añadido al carrito', 'success');
}

function actualizarCarritoUI() {
    // Actualizar contador del carrito si existe
    const carritoCounter = document.getElementById('carrito-counter');
    if (carritoCounter) {
        const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
        carritoCounter.textContent = totalItems;
        carritoCounter.style.display = totalItems > 0 ? 'block' : 'none';
    }
}

// Sistema de notificaciones
function mostrarNotificacion(mensaje, tipo = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-20 right-4 z-50 px-6 py-4 rounded-lg text-white font-medium transform translate-x-full transition-transform duration-300 ${
        tipo === 'success' ? 'bg-green-500' : 
        tipo === 'error' ? 'bg-red-500' : 
        'bg-blue-500'
    }`;
    
    notification.textContent = mensaje;
    document.body.appendChild(notification);
    
    // Mostrar notificación
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Ocultar notificación
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Función de búsqueda
function buscarProductos(termino) {
    if (!productos.length) return [];
    
    return productos.filter(producto => 
        producto.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        producto.descripcion.toLowerCase().includes(termino.toLowerCase()) ||
        producto.categoria.toLowerCase().includes(termino.toLowerCase())
    );
}

// Función para filtrar productos
function filtrarProductos(filtros) {
    if (!productos.length) return [];
    
    return productos.filter(producto => {
        let coincide = true;
        
        if (filtros.categoria && filtros.categoria !== 'todos') {
            coincide = coincide && producto.categoria === filtros.categoria;
        }
        
        if (filtros.tipo && filtros.tipo !== 'todos') {
            coincide = coincide && producto.tipo === filtros.tipo;
        }
        
        if (filtros.precioMin) {
            coincide = coincide && producto.precio >= filtros.precioMin;
        }
        
        if (filtros.precioMax) {
            coincide = coincide && producto.precio <= filtros.precioMax;
        }
        
        return coincide;
    });
}

// Función para obtener productos recomendados
function obtenerRecomendados(productoId, limite = 4) {
    const productoActual = productos.find(p => p.id === productoId);
    if (!productoActual) return [];
    
    return productos
        .filter(p => p.id !== productoId && p.categoria === productoActual.categoria)
        .slice(0, limite);
}

// Función para calcular descuentos
function calcularDescuento(precio, porcentaje) {
    return precio * (1 - porcentaje / 100);
}

// Función para formatear precio
function formatearPrecio(precio) {
    return `€${precio.toFixed(2)}`;
}

// Función para validar edad
function validarEdad(fechaNacimiento) {
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    const edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        return edad - 1;
    }
    
    return edad;
}

// Función para generar ID único
function generarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Función para guardar en localStorage
function guardarEnStorage(clave, valor) {
    try {
        localStorage.setItem(clave, JSON.stringify(valor));
        return true;
    } catch (error) {
        console.error('Error al guardar en localStorage:', error);
        return false;
    }
}

// Función para obtener de localStorage
function obtenerDeStorage(clave, valorPorDefecto = null) {
    try {
        const valor = localStorage.getItem(clave);
        return valor ? JSON.parse(valor) : valorPorDefecto;
    } catch (error) {
        console.error('Error al obtener de localStorage:', error);
        return valorPorDefecto;
    }
}

// Función para limpiar localStorage
function limpiarStorage() {
    localStorage.clear();
}

// Función para descargar producto (simulado)
function descargarProducto(productoId) {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) {
        mostrarNotificacion('Producto no encontrado', 'error');
        return;
    }
    
    // Simular descarga
    mostrarNotificacion(`Descargando ${producto.nombre}...`, 'success');
    
    // En una implementación real, aquí se descargaría el archivo real
    setTimeout(() => {
        const link = document.createElement('a');
        link.href = `imagenes/${producto.imagen}`;
        link.download = `${producto.nombre.replace(/\s+/g, '_')}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, 1000);
}

// Función para compartir producto
function compartirProducto(productoId) {
    const producto = productos.find(p => p.id === productoId);
    if (!producto) return;
    
    if (navigator.share) {
        navigator.share({
            title: producto.nombre,
            text: producto.descripcion,
            url: `${window.location.origin}/producto.html?id=${productoId}`
        });
    } else {
        // Fallback: copiar URL al portapapeles
        const url = `${window.location.origin}/producto.html?id=${productoId}`;
        navigator.clipboard.writeText(url).then(() => {
            mostrarNotificacion('Enlace copiado al portapapeles', 'success');
        });
    }
}

// Función para obtener estadísticas del sitio
function obtenerEstadisticas() {
    return {
        totalProductos: productos.length,
        totalCategorias: categorias.length,
        productosDestacados: productos.filter(p => p.destacado).length,
        productosEnCarrito: carrito.reduce((sum, item) => sum + item.cantidad, 0),
        totalCarrito: carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
    };
}

// Función para inicializar tooltips
function inicializarTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', mostrarTooltip);
        element.addEventListener('mouseleave', ocultarTooltip);
    });
}

function mostrarTooltip(event) {
    const tooltip = document.createElement('div');
    tooltip.className = 'absolute z-50 px-3 py-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg';
    tooltip.textContent = event.target.getAttribute('data-tooltip');
    
    document.body.appendChild(tooltip);
    
    const rect = event.target.getBoundingClientRect();
    tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
    tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
}

function ocultarTooltip() {
    const tooltip = document.querySelector('.absolute.z-50');
    if (tooltip) {
        tooltip.remove();
    }
}

// Función para manejar errores
function manejarError(error, mensajeUsuario = 'Ha ocurrido un error') {
    console.error('Error:', error);
    mostrarNotificacion(mensajeUsuario, 'error');
}

// Función para inicializar la aplicación
function inicializarApp() {
    try {
        // Verificar si es la primera visita
        const primeraVisita = !localStorage.getItem('primeraVisita');
        if (primeraVisita) {
            localStorage.setItem('primeraVisita', 'false');
            // Mostrar tutorial o mensaje de bienvenida
        }
        
        // Inicializar tooltips
        inicializarTooltips();
        
        // Configurar manejo de errores global
        window.addEventListener('error', (event) => {
            manejarError(event.error, 'Error inesperado en la aplicación');
        });
        
        // Configurar manejo de promesas rechazadas
        window.addEventListener('unhandledrejection', (event) => {
            manejarError(event.reason, 'Error de conexión');
        });
        
    } catch (error) {
        manejarError(error, 'Error al inicializar la aplicación');
    }
}

// Inicializar la aplicación cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarApp);
} else {
    inicializarApp();
}