-- ============================================================
-- SEED: 29 Productos Tecnológicos (TEC-002 al TEC-030)
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- Smartphones
INSERT INTO productos (sku, numero_serie, marca, modelo, categoria, costo, precio, activo) VALUES
('TEC-002', 'SN-2026-002', 'Samsung', 'Galaxy S25 Ultra', 'Smartphones', 780.00, 1099.99, true),
('TEC-003', 'SN-2026-003', 'Xiaomi', 'Redmi Note 14 Pro', 'Smartphones', 220.00, 349.99, true),
('TEC-004', 'SN-2026-004', 'Google', 'Pixel 9 Pro', 'Smartphones', 550.00, 799.99, true),
('TEC-005', 'SN-2026-005', 'OnePlus', 'OnePlus 13', 'Smartphones', 480.00, 699.99, true),
('TEC-006', 'SN-2026-006', 'Samsung', 'Galaxy A56', 'Smartphones', 180.00, 299.99, true);

INSERT INTO inventario (producto_sku, stock_actual, stock_minimo, ubicacion) VALUES
('TEC-002', 22, 8, 'Bodega A-1'),
('TEC-003', 45, 10, 'Bodega A-2'),
('TEC-004', 8, 5, 'Bodega A-1'),
('TEC-005', 12, 5, 'Bodega A-1'),
('TEC-006', 30, 10, 'Bodega A-2');

-- Laptops
INSERT INTO productos (sku, numero_serie, marca, modelo, categoria, costo, precio, activo) VALUES
('TEC-007', 'SN-2026-007', 'Apple', 'MacBook Pro 16" M4', 'Laptops', 1600.00, 2499.99, true),
('TEC-008', 'SN-2026-008', 'Dell', 'XPS 15 9530', 'Laptops', 950.00, 1399.99, true),
('TEC-009', 'SN-2026-009', 'Lenovo', 'ThinkPad X1 Carbon Gen 12', 'Laptops', 1100.00, 1599.99, true),
('TEC-010', 'SN-2026-010', 'ASUS', 'ROG Zephyrus G16', 'Laptops', 1200.00, 1799.99, true),
('TEC-011', 'SN-2026-011', 'HP', 'Spectre x360 14"', 'Laptops', 850.00, 1299.99, true);

INSERT INTO inventario (producto_sku, stock_actual, stock_minimo, ubicacion) VALUES
('TEC-007', 10, 3, 'Bodega B-1'),
('TEC-008', 7, 4, 'Bodega B-1'),
('TEC-009', 14, 5, 'Bodega B-1'),
('TEC-010', 6, 3, 'Bodega B-1'),
('TEC-011', 9, 4, 'Bodega B-2');

-- Tablets
INSERT INTO productos (sku, numero_serie, marca, modelo, categoria, costo, precio, activo) VALUES
('TEC-012', 'SN-2026-012', 'Apple', 'iPad Pro 13" M4', 'Tablets', 750.00, 1099.99, true),
('TEC-013', 'SN-2026-013', 'Samsung', 'Galaxy Tab S10 Ultra', 'Tablets', 580.00, 849.99, true),
('TEC-014', 'SN-2026-014', 'Xiaomi', 'Pad 7 Pro', 'Tablets', 250.00, 399.99, true),
('TEC-015', 'SN-2026-015', 'Lenovo', 'Tab P12 Pro', 'Tablets', 300.00, 449.99, true);

INSERT INTO inventario (producto_sku, stock_actual, stock_minimo, ubicacion) VALUES
('TEC-012', 12, 5, 'Bodega A-3'),
('TEC-013', 8, 4, 'Bodega A-3'),
('TEC-014', 25, 8, 'Bodega A-3'),
('TEC-015', 10, 5, 'Bodega A-3');

-- Audio
INSERT INTO productos (sku, numero_serie, marca, modelo, categoria, costo, precio, activo) VALUES
('TEC-016', 'SN-2026-016', 'Apple', 'AirPods Pro 3', 'Audio', 140.00, 249.99, true),
('TEC-017', 'SN-2026-017', 'Sony', 'WH-1000XM6', 'Audio', 200.00, 349.99, true),
('TEC-018', 'SN-2026-018', 'Samsung', 'Galaxy Buds3 Pro', 'Audio', 110.00, 199.99, true),
('TEC-019', 'SN-2026-019', 'JBL', 'Charge 6', 'Audio', 80.00, 149.99, true);

INSERT INTO inventario (producto_sku, stock_actual, stock_minimo, ubicacion) VALUES
('TEC-016', 35, 10, 'Bodega C-1'),
('TEC-017', 18, 6, 'Bodega C-1'),
('TEC-018', 28, 8, 'Bodega C-1'),
('TEC-019', 40, 12, 'Bodega C-2');

-- Wearables
INSERT INTO productos (sku, numero_serie, marca, modelo, categoria, costo, precio, activo) VALUES
('TEC-020', 'SN-2026-020', 'Apple', 'Watch Ultra 3', 'Wearables', 450.00, 799.99, true),
('TEC-021', 'SN-2026-021', 'Samsung', 'Galaxy Watch7 Pro', 'Wearables', 250.00, 449.99, true),
('TEC-022', 'SN-2026-022', 'Garmin', 'Fenix 8', 'Wearables', 380.00, 599.99, true),
('TEC-023', 'SN-2026-023', 'Xiaomi', 'Smart Band 9 Pro', 'Wearables', 40.00, 79.99, true);

INSERT INTO inventario (producto_sku, stock_actual, stock_minimo, ubicacion) VALUES
('TEC-020', 5, 3, 'Bodega C-2'),
('TEC-021', 14, 6, 'Bodega C-2'),
('TEC-022', 9, 4, 'Bodega C-2'),
('TEC-023', 60, 15, 'Bodega C-2');

-- Gaming
INSERT INTO productos (sku, numero_serie, marca, modelo, categoria, costo, precio, activo) VALUES
('TEC-024', 'SN-2026-024', 'Sony', 'PlayStation 5 Pro', 'Gaming', 450.00, 699.99, true),
('TEC-025', 'SN-2026-025', 'Nintendo', 'Switch OLED', 'Gaming', 220.00, 349.99, true),
('TEC-026', 'SN-2026-026', 'Microsoft', 'Xbox Series X', 'Gaming', 350.00, 499.99, true);

INSERT INTO inventario (producto_sku, stock_actual, stock_minimo, ubicacion) VALUES
('TEC-024', 20, 8, 'Bodega D-1'),
('TEC-025', 32, 10, 'Bodega D-1'),
('TEC-026', 16, 6, 'Bodega D-1');

-- Monitores
INSERT INTO productos (sku, numero_serie, marca, modelo, categoria, costo, precio, activo) VALUES
('TEC-027', 'SN-2026-027', 'Samsung', 'Odyssey G9 49"', 'Monitores', 750.00, 1199.99, true),
('TEC-028', 'SN-2026-028', 'LG', 'UltraFine 32" 4K', 'Monitores', 480.00, 749.99, true),
('TEC-029', 'SN-2026-029', 'Dell', 'UltraSharp U2724D', 'Monitores', 320.00, 499.99, true),
('TEC-030', 'SN-2026-030', 'ASUS', 'ProArt PA329C', 'Monitores', 580.00, 899.99, true);

INSERT INTO inventario (producto_sku, stock_actual, stock_minimo, ubicacion) VALUES
('TEC-027', 6, 3, 'Bodega D-2'),
('TEC-028', 11, 4, 'Bodega D-2'),
('TEC-029', 15, 6, 'Bodega D-2'),
('TEC-030', 4, 2, 'Bodega D-2');
