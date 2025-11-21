-- Permitir a los administradores eliminar votos
-- Esto es necesario para la funcionalidad de limpieza de datos

-- Crear política que permite a los admins eliminar votos
CREATE POLICY "Admins can delete votes"
  ON public.votes FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Función para eliminar votos con valores nulos (ejecutada con permisos de admin)
CREATE OR REPLACE FUNCTION public.delete_null_votes()
RETURNS TABLE(deleted_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_votes INTEGER := 0;
  temp_count INTEGER := 0;
BEGIN
  -- Eliminar votos donde candidate_id es NULL
  DELETE FROM public.votes
  WHERE candidate_id IS NULL;
  
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_votes := deleted_votes + temp_count;
  
  -- Eliminar votos donde voter_dni es NULL o vacío
  DELETE FROM public.votes
  WHERE voter_dni IS NULL OR voter_dni = '';
  
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_votes := deleted_votes + temp_count;
  
  -- Eliminar votos donde category es NULL
  DELETE FROM public.votes
  WHERE category IS NULL;
  
  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_votes := deleted_votes + temp_count;
  
  RETURN QUERY SELECT deleted_votes;
END;
$$;

-- Función para eliminar votos duplicados (ejecutada con permisos de admin)
-- Si un votante vota más de una vez en cualquier categoría, elimina TODOS los votos de ese votante (todas las categorías)
CREATE OR REPLACE FUNCTION public.delete_duplicate_votes()
RETURNS TABLE(deleted_count INTEGER)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_votes INTEGER := 0;
BEGIN
  -- Identificar DNIs que tienen duplicados (más de un voto en alguna categoría)
  -- Luego eliminar TODOS los votos de esos DNIs, sin importar la categoría
  WITH duplicate_dnis AS (
    SELECT DISTINCT voter_dni
    FROM public.votes
    WHERE (voter_dni, category) IN (
      SELECT voter_dni, category
      FROM public.votes
      GROUP BY voter_dni, category
      HAVING COUNT(*) > 1
    )
  )
  DELETE FROM public.votes
  WHERE voter_dni IN (
    SELECT voter_dni FROM duplicate_dnis
  );
  
  GET DIAGNOSTICS deleted_votes = ROW_COUNT;
  
  RETURN QUERY SELECT deleted_votes;
END;
$$;

