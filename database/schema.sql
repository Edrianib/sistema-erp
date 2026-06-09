-- ============================================================
-- ERP TIENDA DE TECNOLOGÍA — Esquema Relacional
-- PostgreSQL / Supabase
-- ============================================================

-- 1. Tabla de usuarios
CREATE TABLE usuarios (
    id              BIGSERIAL   PRIMARY KEY,
    nombre          TEXT        NOT NULL,
    password_hash   TEXT        NOT NULL,
    rol             TEXT        NOT NULL CHECK (rol IN ('Admin', 'Gerente', 'Vendedor')),
    ultimo_acceso   TIMESTAMPTZ
);

-- 2. Tabla de productos
CREATE TABLE productos (
    sku             TEXT        PRIMARY KEY,
    numero_serie    TEXT        NOT NULL UNIQUE,
    marca           TEXT        NOT NULL,
    modelo          TEXT        NOT NULL,
    categoria       TEXT        NOT NULL,
    costo           NUMERIC(10,2) NOT NULL CHECK (costo >= 0),
    precio          NUMERIC(10,2) NOT NULL CHECK (precio >= 0),
    activo          BOOLEAN     NOT NULL DEFAULT true
);

-- 3. Tabla de inventario (relación 1:1 con productos)
CREATE TABLE inventario (
    producto_sku    TEXT        PRIMARY KEY REFERENCES productos(sku) ON DELETE CASCADE,
    stock_actual    INTEGER     NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
    stock_minimo    INTEGER     NOT NULL DEFAULT 5  CHECK (stock_minimo >= 0),
    ubicacion       TEXT        NOT NULL
);

-- 4. Tabla de ventas
CREATE TABLE ventas (
    id              BIGSERIAL   PRIMARY KEY,
    usuario_id      BIGINT      NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT,
    fecha           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    total           NUMERIC(10,2) NOT NULL CHECK (total >= 0)
);

-- 5. Tabla detalles_venta (relación N:M entre ventas y productos)
CREATE TABLE detalles_venta (
    venta_id        BIGINT      NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_sku    TEXT        NOT NULL REFERENCES productos(sku) ON DELETE RESTRICT,
    cantidad        INTEGER     NOT NULL CHECK (cantidad > 0),
    subtotal        NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),

    PRIMARY KEY (venta_id, producto_sku)
);

-- 6. Tabla de auditoría (registro de acciones críticas)
CREATE TABLE auditoria (
    id              BIGSERIAL   PRIMARY KEY,
    usuario_nombre  TEXT        NOT NULL,
    accion          TEXT        NOT NULL,
    modulo          TEXT        NOT NULL,
    fecha           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Tabla de proveedores
CREATE TABLE proveedores (
    id                  BIGSERIAL   PRIMARY KEY,
    nombre_empresa      TEXT        NOT NULL,
    contacto_principal  TEXT        NOT NULL,
    telefono            TEXT,
    email               TEXT
);

-- 8. Tabla de compras a proveedores
CREATE TABLE compras_proveedores (
    id              BIGSERIAL   PRIMARY KEY,
    proveedor_id    BIGINT      NOT NULL REFERENCES proveedores(id) ON DELETE RESTRICT,
    numero_factura  TEXT        NOT NULL,
    concepto        TEXT,
    total_compra    NUMERIC(10,2) NOT NULL CHECK (total_compra >= 0),
    fecha_compra    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    estado_pago     TEXT        NOT NULL DEFAULT 'Pagado',
    usuario_id      BIGINT      NOT NULL REFERENCES usuarios(id) ON DELETE RESTRICT
);

-- ============================================================
-- Índices para búsquedas frecuentes
-- ============================================================
CREATE INDEX idx_ventas_usuario_id     ON ventas(usuario_id);
CREATE INDEX idx_ventas_fecha          ON ventas(fecha);
CREATE INDEX idx_detalles_venta_id     ON detalles_venta(venta_id);
CREATE INDEX idx_productos_categoria   ON productos(categoria);
CREATE INDEX idx_productos_marca       ON productos(marca);
CREATE INDEX idx_productos_activo      ON productos(activo);
CREATE INDEX idx_auditoria_fecha       ON auditoria(fecha DESC);
CREATE INDEX idx_auditoria_modulo      ON auditoria(modulo);
CREATE INDEX idx_compras_fecha         ON compras_proveedores(fecha_compra);
CREATE INDEX idx_compras_proveedor     ON compras_proveedores(proveedor_id);
