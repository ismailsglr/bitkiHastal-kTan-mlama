-- Add severity_percentage and yield_loss_risk columns to analyses table
ALTER TABLE analyses 
ADD COLUMN IF NOT EXISTS severity_percentage DECIMAL(5, 2) CHECK (severity_percentage >= 0 AND severity_percentage <= 100),
ADD COLUMN IF NOT EXISTS yield_loss_risk DECIMAL(5, 2) CHECK (yield_loss_risk >= 0 AND yield_loss_risk <= 100);

-- Add comments for documentation
COMMENT ON COLUMN analyses.severity_percentage IS 'Hasar yüzdesi (0-100)';
COMMENT ON COLUMN analyses.yield_loss_risk IS 'Verim kaybı riski (0-100)';

