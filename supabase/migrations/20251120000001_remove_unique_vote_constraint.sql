-- Eliminar temporalmente la restricción UNIQUE para permitir votos duplicados
-- Esto es necesario para probar la funcionalidad de "eliminar datos duplicados"

-- Eliminar la restricción UNIQUE de (voter_dni, category)
ALTER TABLE public.votes
DROP CONSTRAINT IF EXISTS votes_voter_dni_category_key;

-- Nota: Si la restricción tiene un nombre diferente, puedes verificar con:
-- SELECT constraint_name 
-- FROM information_schema.table_constraints 
-- WHERE table_name = 'votes' AND constraint_type = 'UNIQUE';

