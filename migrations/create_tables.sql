CREATE TABLE IF NOT EXISTS ingesta_raw (
    id UUID PRIMARY KEY,
    folio VARCHAR(50),
    monto NUMERIC(12,2),
    fecha TIMESTAMP WITH TIME ZONE,
    cliente JSONB,
    items JSONB,
    received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ingesta_raw_fecha ON ingesta_raw(fecha);