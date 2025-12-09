-- migrations/etl_additions.sql

-- 1) Agregar columnas de control en ingesta_raw
ALTER TABLE IF EXISTS ingesta_raw
  ADD COLUMN IF NOT EXISTS processed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS processed_at TIMESTAMP WITH TIME ZONE NULL;

-- 2) Tabla de resultados procesados
CREATE TABLE IF NOT EXISTS ingesta_processed (
  id UUID PRIMARY KEY,
  raw_id UUID NOT NULL,                -- referencia al registro en ingesta_raw
  folio VARCHAR(50),
  monto NUMERIC(12,2),
  fecha TIMESTAMP WITH TIME ZONE,
  cliente JSONB,
  items JSONB,
  total_items INTEGER,
  monto_calculado NUMERIC(12,2),
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ingesta_processed_fecha ON ingesta_processed(fecha);
CREATE INDEX IF NOT EXISTS idx_ingesta_raw_processed ON ingesta_raw(processed);
