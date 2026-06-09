-- ============================================================
-- Limpiar compras existentes
-- ============================================================
DELETE FROM compras_proveedores;

-- ============================================================
-- SEED: 6 Proveedores (IDs UUID generados por Supabase)
-- ============================================================
INSERT INTO proveedores (nombre_empresa, contacto_principal, telefono, email) VALUES
('Tecnologos S.A. de C.V.', 'Carlos Mendoza', '+52 55 1234 5678', 'carlos@tecnologos.mx'),
('Distribuidora Electronica del Norte', 'Maria Gutierrez', '+52 81 2345 6789', 'maria@den.com.mx'),
('Importaciones TechGlobal', 'Roberto Alvarez', '+52 33 3456 7890', 'roberto@techglobal.mx'),
('Mayoreo Digital Express', 'Laura Castillo', '+52 55 4567 8901', 'laura@mayoreodigital.mx'),
('Soluciones TI Avanzadas', 'Andres Romero', '+52 81 5678 9012', 'andres@solucionesti.mx'),
('Grupo Comercial Innovatech', 'Diana Herrera', '+52 55 6789 0123', 'diana@innovatech.mx');

-- ============================================================
-- SEED: 15 Compras (usa subconsultas para obtener UUIDs)
-- ============================================================
INSERT INTO compras_proveedores (proveedor_id, numero_factura, concepto, total_compra, fecha_compra, estado_pago, usuario_id)
SELECT p.id, 'FAC-2026-001', 'Compra de 50 iPhone 16 Pro Max', 42500.00, '2026-01-15T10:30:00-05:00', 'Pagado', (SELECT id FROM usuarios LIMIT 1)
FROM proveedores p WHERE p.nombre_empresa = 'Tecnologos S.A. de C.V.';

INSERT INTO compras_proveedores (proveedor_id, numero_factura, concepto, total_compra, fecha_compra, estado_pago, usuario_id)
SELECT p.id, 'FAC-2026-002', 'Compra de 30 MacBook Pro M4 16"', 48000.00, '2026-01-22T14:15:00-05:00', 'Pagado', (SELECT id FROM usuarios LIMIT 1)
FROM proveedores p WHERE p.nombre_empresa = 'Tecnologos S.A. de C.V.';

INSERT INTO compras_proveedores (proveedor_id, numero_factura, concepto, total_compra, fecha_compra, estado_pago, usuario_id)
SELECT p.id, 'FAC-2026-003', 'Compra de 100 Galaxy S25 Ultra', 78000.00, '2026-02-05T09:00:00-05:00', 'Pagado', (SELECT id FROM usuarios LIMIT 1)
FROM proveedores p WHERE p.nombre_empresa = 'Distribuidora Electronica del Norte';

INSERT INTO compras_proveedores (proveedor_id, numero_factura, concepto, total_compra, fecha_compra, estado_pago, usuario_id)
SELECT p.id, 'FAC-2026-004', 'Compra de 40 tabletas Galaxy Tab S10', 23200.00, '2026-02-18T11:45:00-05:00', 'Pagado', (SELECT id FROM usuarios LIMIT 1)
FROM proveedores p WHERE p.nombre_empresa = 'Distribuidora Electronica del Norte';

INSERT INTO compras_proveedores (proveedor_id, numero_factura, concepto, total_compra, fecha_compra, estado_pago, usuario_id)
SELECT p.id, 'FAC-2026-005', 'Compra de 200 AirPods Pro 3', 28000.00, '2026-03-01T08:20:00-05:00', 'Pagado', (SELECT id FROM usuarios LIMIT 1)
FROM proveedores p WHERE p.nombre_empresa = 'Importaciones TechGlobal';

INSERT INTO compras_proveedores (proveedor_id, numero_factura, concepto, total_compra, fecha_compra, estado_pago, usuario_id)
SELECT p.id, 'FAC-2026-006', 'Compra de 60 Pixel 9 Pro', 33000.00, '2026-03-14T16:30:00-05:00', 'Pagado', (SELECT id FROM usuarios LIMIT 1)
FROM proveedores p WHERE p.nombre_empresa = 'Importaciones TechGlobal';

INSERT INTO compras_proveedores (proveedor_id, numero_factura, concepto, total_compra, fecha_compra, estado_pago, usuario_id)
SELECT p.id, 'FAC-2026-007', 'Compra de 80 Galaxy Buds3 Pro', 8800.00, '2026-03-28T10:00:00-05:00', 'Pagado', (SELECT id FROM usuarios LIMIT 1)
FROM proveedores p WHERE p.nombre_empresa = 'Mayoreo Digital Express';

INSERT INTO compras_proveedores (proveedor_id, numero_factura, concepto, total_compra, fecha_compra, estado_pago, usuario_id)
SELECT p.id, 'FAC-2026-008', 'Compra de 25 PS5 Pro', 11250.00, '2026-04-10T13:15:00-05:00', 'Pagado', (SELECT id FROM usuarios LIMIT 1)
FROM proveedores p WHERE p.nombre_empresa = 'Mayoreo Digital Express';

INSERT INTO compras_proveedores (proveedor_id, numero_factura, concepto, total_compra, fecha_compra, estado_pago, usuario_id)
SELECT p.id, 'FAC-2026-009', 'Compra de 35 ROG Zephyrus G16', 42000.00, '2026-04-22T09:45:00-05:00', 'Pagado', (SELECT id FROM usuarios LIMIT 1)
FROM proveedores p WHERE p.nombre_empresa = 'Soluciones TI Avanzadas';

INSERT INTO compras_proveedores (proveedor_id, numero_factura, concepto, total_compra, fecha_compra, estado_pago, usuario_id)
SELECT p.id, 'FAC-2026-010', 'Compra de 70 Xiaomi Redmi Note 14 Pro', 15400.00, '2026-05-03T11:00:00-05:00', 'Pagado', (SELECT id FROM usuarios LIMIT 1)
FROM proveedores p WHERE p.nombre_empresa = 'Soluciones TI Avanzadas';

INSERT INTO compras_proveedores (proveedor_id, numero_factura, concepto, total_compra, fecha_compra, estado_pago, usuario_id)
SELECT p.id, 'FAC-2026-011', 'Compra de 45 Apple Watch Ultra 3', 20250.00, '2026-05-15T14:30:00-05:00', 'Pagado', (SELECT id FROM usuarios LIMIT 1)
FROM proveedores p WHERE p.nombre_empresa = 'Grupo Comercial Innovatech';

INSERT INTO compras_proveedores (proveedor_id, numero_factura, concepto, total_compra, fecha_compra, estado_pago, usuario_id)
SELECT p.id, 'FAC-2026-012', 'Compra de 90 JBL Charge 6', 7200.00, '2026-05-28T08:00:00-05:00', 'Pagado', (SELECT id FROM usuarios LIMIT 1)
FROM proveedores p WHERE p.nombre_empresa = 'Grupo Comercial Innovatech';

INSERT INTO compras_proveedores (proveedor_id, numero_factura, concepto, total_compra, fecha_compra, estado_pago, usuario_id)
SELECT p.id, 'FAC-2026-013', 'Compra de 20 monitores Odyssey G9 49"', 15000.00, '2026-06-01T10:15:00-05:00', 'Pagado', (SELECT id FROM usuarios LIMIT 1)
FROM proveedores p WHERE p.nombre_empresa = 'Tecnologos S.A. de C.V.';

INSERT INTO compras_proveedores (proveedor_id, numero_factura, concepto, total_compra, fecha_compra, estado_pago, usuario_id)
SELECT p.id, 'FAC-2026-014', 'Compra de 65 Galaxy Watch7 Pro', 16250.00, '2026-06-05T15:45:00-05:00', 'Pendiente', (SELECT id FROM usuarios LIMIT 1)
FROM proveedores p WHERE p.nombre_empresa = 'Distribuidora Electronica del Norte';

INSERT INTO compras_proveedores (proveedor_id, numero_factura, concepto, total_compra, fecha_compra, estado_pago, usuario_id)
SELECT p.id, 'FAC-2026-015', 'Compra de 120 Power Bank Anker 20k mAh', 3000.00, '2026-06-07T09:30:00-05:00', 'Pagado', (SELECT id FROM usuarios LIMIT 1)
FROM proveedores p WHERE p.nombre_empresa = 'Importaciones TechGlobal';
