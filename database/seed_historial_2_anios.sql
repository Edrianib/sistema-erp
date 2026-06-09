-- ============================================================
-- SEED: 50 Ventas históricas (2024-2025) con detalles_venta
-- Compatible con PostgreSQL / Supabase
-- Distribución con estacionalidad: picos en jul, nov, dic
-- ============================================================

DELETE FROM detalles_venta;
DELETE FROM ventas;

-- ============================================================
-- 50 VENTAS con IDs explícitos (101 al 150)
-- ============================================================

-- === 2024 ===

-- Enero 2024 (1 venta — mes bajo post-fiestas)
INSERT INTO ventas (id, usuario_id, fecha, total) VALUES
(101, (SELECT id FROM usuarios LIMIT 1), '2024-01-05T14:20:00-05:00', 299.99);

-- Febrero 2024 (1 venta — bajo)
INSERT INTO ventas (id, usuario_id, fecha, total) VALUES
(102, (SELECT id FROM usuarios LIMIT 1), '2024-02-12T11:10:00-05:00', 399.98);

-- Marzo 2024 (2 ventas — inicio de primavera)
INSERT INTO ventas (id, usuario_id, fecha, total) VALUES
(103, (SELECT id FROM usuarios LIMIT 1), '2024-03-08T09:45:00-05:00', 749.98),
(104, (SELECT id FROM usuarios LIMIT 1), '2024-03-22T16:30:00-05:00', 1399.99);

-- Abril 2024 (2 ventas)
INSERT INTO ventas (id, usuario_id, fecha, total) VALUES
(105, (SELECT id FROM usuarios LIMIT 1), '2024-04-04T10:00:00-05:00', 509.97),
(106, (SELECT id FROM usuarios LIMIT 1), '2024-04-19T15:15:00-05:00', 699.99);

-- Mayo 2024 (2 ventas)
INSERT INTO ventas (id, usuario_id, fecha, total) VALUES
(107, (SELECT id FROM usuarios LIMIT 1), '2024-05-10T12:30:00-05:00', 2099.98),
(108, (SELECT id FROM usuarios LIMIT 1), '2024-05-25T09:00:00-05:00', 449.97);

-- Junio 2024 (2 ventas)
INSERT INTO ventas (id, usuario_id, fecha, total) VALUES
(109, (SELECT id FROM usuarios LIMIT 1), '2024-06-07T17:45:00-05:00', 849.98),
(110, (SELECT id FROM usuarios LIMIT 1), '2024-06-20T13:20:00-05:00', 849.99);

-- Julio 2024 (3 ventas — pico de verano)
INSERT INTO ventas (id, usuario_id, fecha, total) VALUES
(111, (SELECT id FROM usuarios LIMIT 1), '2024-07-03T11:00:00-05:00', 1049.98),
(112, (SELECT id FROM usuarios LIMIT 1), '2024-07-15T14:50:00-05:00', 2599.97),
(113, (SELECT id FROM usuarios LIMIT 1), '2024-07-28T10:15:00-05:00', 599.99);

-- Agosto 2024 (2 ventas)
INSERT INTO ventas (id, usuario_id, fecha, total) VALUES
(114, (SELECT id FROM usuarios LIMIT 1), '2024-08-09T15:40:00-05:00', 1799.99),
(115, (SELECT id FROM usuarios LIMIT 1), '2024-08-23T12:10:00-05:00', 999.96);

-- Septiembre 2024 (2 ventas — regreso a clases)
INSERT INTO ventas (id, usuario_id, fecha, total) VALUES
(116, (SELECT id FROM usuarios LIMIT 1), '2024-09-06T14:25:00-05:00', 1349.98),
(117, (SELECT id FROM usuarios LIMIT 1), '2024-09-19T10:55:00-05:00', 2149.98);

-- Octubre 2024 (2 ventas)
INSERT INTO ventas (id, usuario_id, fecha, total) VALUES
(118, (SELECT id FROM usuarios LIMIT 1), '2024-10-08T16:15:00-05:00', 939.95),
(119, (SELECT id FROM usuarios LIMIT 1), '2024-10-21T09:30:00-05:00', 449.99);

-- Noviembre 2024 (2 ventas — Black Friday inicia)
INSERT INTO ventas (id, usuario_id, fecha, total) VALUES
(120, (SELECT id FROM usuarios LIMIT 1), '2024-11-15T13:00:00-05:00', 1899.96),
(121, (SELECT id FROM usuarios LIMIT 1), '2024-11-29T17:30:00-05:00', 4399.97);

-- Diciembre 2024 (3 ventas — temporada navideña)
INSERT INTO ventas (id, usuario_id, fecha, total) VALUES
(122, (SELECT id FROM usuarios LIMIT 1), '2024-12-06T11:40:00-05:00', 1749.97),
(123, (SELECT id FROM usuarios LIMIT 1), '2024-12-16T15:05:00-05:00', 1649.98),
(124, (SELECT id FROM usuarios LIMIT 1), '2024-12-23T18:20:00-05:00', 2019.88);

-- === 2025 ===

-- Enero 2025 (1 venta — bajo post-fiestas)
INSERT INTO ventas (id, usuario_id, fecha, total) VALUES
(125, (SELECT id FROM usuarios LIMIT 1), '2025-01-10T14:45:00-05:00', 299.99);

-- Febrero 2025 (2 ventas — San Valentín impulsa wearables/audio)
INSERT INTO ventas (id, usuario_id, fecha, total) VALUES
(126, (SELECT id FROM usuarios LIMIT 1), '2025-02-06T10:20:00-05:00', 1599.98),
(127, (SELECT id FROM usuarios LIMIT 1), '2025-02-20T16:00:00-05:00', 1299.98);

-- Marzo 2025 (2 ventas)
INSERT INTO ventas (id, usuario_id, fecha, total) VALUES
(128, (SELECT id FROM usuarios LIMIT 1), '2025-03-07T12:50:00-05:00', 2699.98),
(129, (SELECT id FROM usuarios LIMIT 1), '2025-03-21T09:15:00-05:00', 1099.98);

-- Abril 2025 (2 ventas)
INSERT INTO ventas (id, usuario_id, fecha, total) VALUES
(130, (SELECT id FROM usuarios LIMIT 1), '2025-04-08T11:30:00-05:00', 3199.98),
(131, (SELECT id FROM usuarios LIMIT 1), '2025-04-22T15:55:00-05:00', 949.98);

-- Mayo 2025 (3 ventas — demanda de primavera)
INSERT INTO ventas (id, usuario_id, fecha, total) VALUES
(132, (SELECT id FROM usuarios LIMIT 1), '2025-05-05T10:40:00-05:00', 1159.95),
(133, (SELECT id FROM usuarios LIMIT 1), '2025-05-14T14:10:00-05:00', 1199.99),
(134, (SELECT id FROM usuarios LIMIT 1), '2025-05-26T13:25:00-05:00', 1549.93);

-- Junio 2025 (2 ventas)
INSERT INTO ventas (id, usuario_id, fecha, total) VALUES
(135, (SELECT id FROM usuarios LIMIT 1), '2025-06-09T16:50:00-05:00', 2149.98),
(136, (SELECT id FROM usuarios LIMIT 1), '2025-06-23T09:05:00-05:00', 699.99);

-- Julio 2025 (3 ventas — pico de verano)
INSERT INTO ventas (id, usuario_id, fecha, total) VALUES
(137, (SELECT id FROM usuarios LIMIT 1), '2025-07-04T12:15:00-05:00', 2599.96),
(138, (SELECT id FROM usuarios LIMIT 1), '2025-07-16T11:45:00-05:00', 2499.99),
(139, (SELECT id FROM usuarios LIMIT 1), '2025-07-29T17:10:00-05:00', 1899.96);

-- Agosto 2025 (2 ventas)
INSERT INTO ventas (id, usuario_id, fecha, total) VALUES
(140, (SELECT id FROM usuarios LIMIT 1), '2025-08-11T14:30:00-05:00', 1049.98),
(141, (SELECT id FROM usuarios LIMIT 1), '2025-08-25T10:55:00-05:00', 1799.98);

-- Septiembre 2025 (2 ventas)
INSERT INTO ventas (id, usuario_id, fecha, total) VALUES
(142, (SELECT id FROM usuarios LIMIT 1), '2025-09-08T15:20:00-05:00', 1999.97),
(143, (SELECT id FROM usuarios LIMIT 1), '2025-09-22T09:40:00-05:00', 899.97);

-- Octubre 2025 (2 ventas)
INSERT INTO ventas (id, usuario_id, fecha, total) VALUES
(144, (SELECT id FROM usuarios LIMIT 1), '2025-10-07T13:15:00-05:00', 1179.97),
(145, (SELECT id FROM usuarios LIMIT 1), '2025-10-20T16:35:00-05:00', 1049.97);

-- Noviembre 2025 (3 ventas — pico Black Friday/Cyber Monday)
INSERT INTO ventas (id, usuario_id, fecha, total) VALUES
(146, (SELECT id FROM usuarios LIMIT 1), '2025-11-07T11:00:00-05:00', 5199.97),
(147, (SELECT id FROM usuarios LIMIT 1), '2025-11-18T14:25:00-05:00', 2949.96),
(148, (SELECT id FROM usuarios LIMIT 1), '2025-11-28T17:50:00-05:00', 4549.93);

-- Diciembre 2025 (2 ventas — cierre de año)
INSERT INTO ventas (id, usuario_id, fecha, total) VALUES
(149, (SELECT id FROM usuarios LIMIT 1), '2025-12-08T10:05:00-05:00', 1649.96),
(150, (SELECT id FROM usuarios LIMIT 1), '2025-12-22T15:45:00-05:00', 3749.97);


-- ============================================================
-- DETALLES_VENTA para cada venta (101 al 150)
-- subtotal = cantidad × precio del producto
-- ============================================================

INSERT INTO detalles_venta (venta_id, producto_sku, cantidad, subtotal) VALUES

-- Venta 101 (ene 2024): smartphone económico
(101, 'TEC-006', 1, 299.99),

-- Venta 102 (feb 2024): audífonos
(102, 'TEC-018', 2, 399.98),

-- Venta 103 (mar 2024): smartphone + tablet
(103, 'TEC-003', 1, 349.99),
(103, 'TEC-014', 1, 399.99),

-- Venta 104 (mar 2024): laptop empresarial
(104, 'TEC-008', 1, 1399.99),

-- Venta 105 (abr 2024): audio + wearable económico
(105, 'TEC-017', 1, 349.99),
(105, 'TEC-023', 2, 159.98),

-- Venta 106 (abr 2024): smartphone gama media-alta
(106, 'TEC-005', 1, 699.99),

-- Venta 107 (may 2024): laptop premium + monitor
(107, 'TEC-009', 1, 1599.99),
(107, 'TEC-029', 1, 499.99),

-- Venta 108 (may 2024): bocinas portátiles al por mayor
(108, 'TEC-019', 3, 449.97),

-- Venta 109 (jun 2024): consolas de videojuegos
(109, 'TEC-026', 1, 499.99),
(109, 'TEC-025', 1, 349.99),

-- Venta 110 (jun 2024): tablet premium
(110, 'TEC-013', 1, 849.99),

-- Venta 111 (jul 2024): smartphone + accesorio audio
(111, 'TEC-004', 1, 799.99),
(111, 'TEC-016', 1, 249.99),

-- Venta 112 (jul 2024): setup gamer (consolas + monitor)
(112, 'TEC-024', 2, 1399.98),
(112, 'TEC-027', 1, 1199.99),

-- Venta 113 (jul 2024): reloj deportivo GPS
(113, 'TEC-022', 1, 599.99),

-- Venta 114 (ago 2024): laptop gamer
(114, 'TEC-010', 1, 1799.99),

-- Venta 115 (ago 2024): smartphones + audífonos
(115, 'TEC-006', 2, 599.98),
(115, 'TEC-018', 2, 399.98),

-- Venta 116 (sep 2024): tablet + audio (regreso a clases)
(116, 'TEC-012', 1, 1099.99),
(116, 'TEC-016', 1, 249.99),

-- Venta 117 (sep 2024): laptop + monitor (oficina en casa)
(117, 'TEC-008', 1, 1399.99),
(117, 'TEC-028', 1, 749.99),

-- Venta 118 (oct 2024): smartphones + wearables económicos
(118, 'TEC-003', 2, 699.98),
(118, 'TEC-023', 3, 239.97),

-- Venta 119 (oct 2024): smartwatch
(119, 'TEC-021', 1, 449.99),

-- Venta 120 (nov 2024): Black Friday — consolas
(120, 'TEC-024', 1, 699.99),
(120, 'TEC-025', 2, 699.98),
(120, 'TEC-026', 1, 499.99),

-- Venta 121 (nov 2024): Black Friday — combo Apple premium
(121, 'TEC-007', 1, 2499.99),
(121, 'TEC-020', 1, 799.99),
(121, 'TEC-012', 1, 1099.99),

-- Venta 122 (dic 2024): ecosistema Samsung
(122, 'TEC-002', 1, 1099.99),
(122, 'TEC-018', 1, 199.99),
(122, 'TEC-021', 1, 449.99),

-- Venta 123 (dic 2024): laptop premium + audífonos
(123, 'TEC-011', 1, 1299.99),
(123, 'TEC-017', 1, 349.99),

-- Venta 124 (dic 2024): regalos de último momento (accesorios)
(124, 'TEC-016', 5, 1249.95),
(124, 'TEC-019', 3, 449.97),
(124, 'TEC-023', 4, 319.96),

-- Venta 125 (ene 2025): smartphone económico
(125, 'TEC-006', 1, 299.99),

-- Venta 126 (feb 2025): San Valentín — smartwatch + smartphone
(126, 'TEC-020', 1, 799.99),
(126, 'TEC-004', 1, 799.99),

-- Venta 127 (feb 2025): tablets
(127, 'TEC-013', 1, 849.99),
(127, 'TEC-015', 1, 449.99),

-- Venta 128 (mar 2025): laptop gamer + monitor profesional
(128, 'TEC-010', 1, 1799.99),
(128, 'TEC-030', 1, 899.99),

-- Venta 129 (mar 2025): smartphone + tablet económica
(129, 'TEC-005', 1, 699.99),
(129, 'TEC-014', 1, 399.99),

-- Venta 130 (abr 2025): laptops empresariales (2 unidades)
(130, 'TEC-009', 2, 3199.98),

-- Venta 131 (abr 2025): reloj deportivo + audífonos premium
(131, 'TEC-022', 1, 599.99),
(131, 'TEC-017', 1, 349.99),

-- Venta 132 (may 2025): smartphones + wearables (venta múltiple)
(132, 'TEC-003', 2, 699.98),
(132, 'TEC-006', 1, 299.99),
(132, 'TEC-023', 2, 159.98),

-- Venta 133 (may 2025): monitor gamer curvo
(133, 'TEC-027', 1, 1199.99),

-- Venta 134 (may 2025): audífonos al por mayor
(134, 'TEC-018', 4, 799.96),
(134, 'TEC-016', 3, 749.97),

-- Venta 135 (jun 2025): laptop + monitor
(135, 'TEC-008', 1, 1399.99),
(135, 'TEC-028', 1, 749.99),

-- Venta 136 (jun 2025): consola de videojuegos
(136, 'TEC-024', 1, 699.99),

-- Venta 137 (jul 2025): ecosistema completo Galaxy
(137, 'TEC-002', 1, 1099.99),
(137, 'TEC-013', 1, 849.99),
(137, 'TEC-018', 1, 199.99),
(137, 'TEC-021', 1, 449.99),

-- Venta 138 (jul 2025): laptop premium Apple
(138, 'TEC-007', 1, 2499.99),

-- Venta 139 (jul 2025): combo de consolas
(139, 'TEC-025', 2, 699.98),
(139, 'TEC-026', 1, 499.99),
(139, 'TEC-024', 1, 699.99),

-- Venta 140 (ago 2025): smartphone + audio
(140, 'TEC-004', 1, 799.99),
(140, 'TEC-016', 1, 249.99),

-- Venta 141 (ago 2025): laptop premium + monitor productividad
(141, 'TEC-011', 1, 1299.99),
(141, 'TEC-029', 1, 499.99),

-- Venta 142 (sep 2025): tablets para estudiantes
(142, 'TEC-012', 1, 1099.99),
(142, 'TEC-015', 2, 899.98),

-- Venta 143 (sep 2025): reloj deportivo + bocinas
(143, 'TEC-022', 1, 599.99),
(143, 'TEC-019', 2, 299.98),

-- Venta 144 (oct 2025): smartphone + tablet + wearable
(144, 'TEC-005', 1, 699.99),
(144, 'TEC-014', 1, 399.99),
(144, 'TEC-023', 1, 79.99),

-- Venta 145 (oct 2025): smartphones económicos (3 unidades)
(145, 'TEC-003', 3, 1049.97),

-- Venta 146 (nov 2025): Black Friday — combo productividad alta
(146, 'TEC-007', 1, 2499.99),
(146, 'TEC-010', 1, 1799.99),
(146, 'TEC-030', 1, 899.99),

-- Venta 147 (nov 2025): Black Friday — setup gamer completo
(147, 'TEC-024', 2, 1399.98),
(147, 'TEC-027', 1, 1199.99),
(147, 'TEC-017', 1, 349.99),

-- Venta 148 (nov 2025): Black Friday — combo Samsung + Apple
(148, 'TEC-002', 2, 2199.98),
(148, 'TEC-020', 2, 1599.98),
(148, 'TEC-016', 3, 749.97),

-- Venta 149 (dic 2025): smartphone + accesorios para regalo
(149, 'TEC-004', 1, 799.99),
(149, 'TEC-021', 1, 449.99),
(149, 'TEC-018', 2, 399.98),

-- Venta 150 (dic 2025): laptops + monitor (compra corporativa)
(150, 'TEC-009', 1, 1599.99),
(150, 'TEC-008', 1, 1399.99),
(150, 'TEC-028', 1, 749.99);


-- ============================================================
-- Ajustar la secuencia de IDs para futuras inserciones
-- ============================================================
SELECT setval('ventas_id_seq', 150, true);
