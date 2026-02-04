-- ============================================================================
-- FCH NOTICIAS - Database Schema SQL
-- PostgreSQL + Drizzle ORM 0.44
-- 
-- Este archivo contiene el SQL equivalente al schema de Drizzle
-- Para referencia y migraciones manuales
-- ============================================================================

-- ============================================================================
-- EXTENSIONES
-- ============================================================================

-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUMS
-- ============================================================================

-- Posiciones de jugadores
CREATE TYPE player_position AS ENUM (
  'Portero',
  'Defensa Central',
  'Lateral Izquierdo',
  'Lateral Derecho',
  'Mediocampista Defensivo',
  'Mediocampista Central',
  'Mediocampista Ofensivo',
  'Extremo Izquierdo',
  'Extremo Derecho',
  'Delantero Centro',
  'Segundo Delantero'
);

-- Tipos de transferencia
CREATE TYPE transfer_type AS ENUM (
  'transfer',
  'loan',
  'free',
  'return'
);

-- Estados de transferencia
CREATE TYPE transfer_status AS ENUM (
  'confirmed',
  'rumor',
  'pending'
);

-- Tipos de leaderboard
CREATE TYPE leaderboard_type AS ENUM (
  'goals',
  'assists',
  'mvps',
  'matches',
  'minutes'
);

-- ============================================================================
-- TABLA: CATEGORIES
-- ============================================================================

CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(7),
  icon VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices
CREATE INDEX categories_slug_idx ON categories(slug);
CREATE INDEX categories_name_idx ON categories(name);

-- Comentarios
COMMENT ON TABLE categories IS 'Categorías para clasificar noticias';
COMMENT ON COLUMN categories.slug IS 'Identificador URL-friendly único';
COMMENT ON COLUMN categories.color IS 'Color HEX para UI (#FF5733)';
COMMENT ON COLUMN categories.icon IS 'Nombre del icono de Lucide';

-- ============================================================================
-- TABLA: NEWS
-- ============================================================================

CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL UNIQUE,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(500),
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  author_id VARCHAR(100),
  published_at TIMESTAMP WITH TIME ZONE,
  views INTEGER DEFAULT 0 NOT NULL,
  featured BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices
CREATE INDEX news_slug_idx ON news(slug);
CREATE INDEX news_category_idx ON news(category_id);
CREATE INDEX news_published_idx ON news(published_at);
CREATE INDEX news_featured_idx ON news(featured);
CREATE INDEX news_author_idx ON news(author_id);
CREATE INDEX news_published_at_idx ON news(published_at DESC);

-- Comentarios
COMMENT ON TABLE news IS 'Noticias y artículos del portal';
COMMENT ON COLUMN news.slug IS 'URL única para la noticia';
COMMENT ON COLUMN news.excerpt IS 'Resumen/copete de la noticia';
COMMENT ON COLUMN news.featured IS 'Destacada en la página principal';
COMMENT ON COLUMN news.author_id IS 'ID de usuario OAuth del autor';

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_news_updated_at
  BEFORE UPDATE ON news
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLA: PLAYERS
-- ============================================================================

CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  position VARCHAR(50),
  team VARCHAR(100),
  nationality VARCHAR(50) DEFAULT 'Chile' NOT NULL,
  age INTEGER,
  height INTEGER, -- cm
  weight INTEGER, -- kg
  image_url VARCHAR(500),
  stats JSONB DEFAULT '{}',
  market_value INTEGER, -- euros
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices
CREATE INDEX players_slug_idx ON players(slug);
CREATE INDEX players_name_idx ON players(name);
CREATE INDEX players_team_idx ON players(team);
CREATE INDEX players_position_idx ON players(position);
CREATE INDEX players_name_search_idx ON players(name ASC);

-- Comentarios
COMMENT ON TABLE players IS 'Jugadores de fútbol con estadísticas';
COMMENT ON COLUMN players.slug IS 'URL única para el perfil del jugador';
COMMENT ON COLUMN players.position IS 'Posición en el campo de juego';
COMMENT ON COLUMN players.height IS 'Altura en centímetros';
COMMENT ON COLUMN players.weight IS 'Peso en kilogramos';
COMMENT ON COLUMN players.stats IS 'Estadísticas en formato JSON {goals, assists, matches, ...}';
COMMENT ON COLUMN players.market_value IS 'Valor de mercado en euros';

-- ============================================================================
-- TABLA: TRANSFERS
-- ============================================================================

CREATE TABLE transfers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  from_team VARCHAR(100),
  to_team VARCHAR(100),
  date TIMESTAMP WITH TIME ZONE,
  fee VARCHAR(50),
  type VARCHAR(20) DEFAULT 'transfer',
  status VARCHAR(20) DEFAULT 'rumor',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices
CREATE INDEX transfers_player_idx ON transfers(player_id);
CREATE INDEX transfers_status_idx ON transfers(status);
CREATE INDEX transfers_date_idx ON transfers(date);
CREATE INDEX transfers_player_date_idx ON transfers(player_id, date DESC);

-- Comentarios
COMMENT ON TABLE transfers IS 'Transferencias y movimientos de jugadores';
COMMENT ON COLUMN transfers.from_team IS 'Equipo de origen';
COMMENT ON COLUMN transfers.to_team IS 'Equipo destino';
COMMENT ON COLUMN transfers.fee IS 'Monto de la transferencia (ej: €5M, Free, Loan)';
COMMENT ON COLUMN transfers.type IS 'Tipo: transfer, loan, free';
COMMENT ON COLUMN transfers.status IS 'Estado: confirmed, rumor';

-- ============================================================================
-- TABLA: FAVORITES
-- ============================================================================

CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(100) NOT NULL,
  news_id UUID REFERENCES news(id) ON DELETE CASCADE,
  player_id UUID REFERENCES players(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  
  -- Constraint: al menos uno debe ser no-null
  CONSTRAINT favorites_check_type CHECK (
    news_id IS NOT NULL OR player_id IS NOT NULL
  )
);

-- Índices
CREATE INDEX favorites_user_idx ON favorites(user_id);
CREATE INDEX favorites_news_idx ON favorites(news_id);
CREATE INDEX favorites_player_idx ON favorites(player_id);

-- Índices únicos para evitar duplicados
CREATE UNIQUE INDEX favorites_user_news_unique_idx 
  ON favorites(user_id, news_id) 
  WHERE news_id IS NOT NULL;

CREATE UNIQUE INDEX favorites_user_player_unique_idx 
  ON favorites(user_id, player_id) 
  WHERE player_id IS NOT NULL;

-- Comentarios
COMMENT ON TABLE favorites IS 'Favoritos de usuarios (noticias y jugadores)';
COMMENT ON COLUMN favorites.user_id IS 'ID de usuario OAuth';
COMMENT ON COLUMN favorites.news_id IS 'Referencia a noticia favorita (opcional)';
COMMENT ON COLUMN favorites.player_id IS 'Referencia a jugador favorito (opcional)';

-- ============================================================================
-- TABLA: LEADERBOARDS
-- ============================================================================

CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  season VARCHAR(20) DEFAULT '2024-25',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Índices
CREATE INDEX leaderboards_type_idx ON leaderboards(type);
CREATE INDEX leaderboards_updated_idx ON leaderboards(updated_at);
CREATE INDEX leaderboards_type_season_idx ON leaderboards(type, season);

-- Comentarios
COMMENT ON TABLE leaderboards IS 'Tablas de clasificación (goleadores, asistencias, MVPs)';
COMMENT ON COLUMN leaderboards.type IS 'Tipo: goals, assists, mvps, matches, minutes';
COMMENT ON COLUMN leaderboards.data IS 'Array JSON con entradas de la tabla';
COMMENT ON COLUMN leaderboards.season IS 'Temporada de la clasificación';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_leaderboards_updated_at
  BEFORE UPDATE ON leaderboards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VISTAS ÚTILES
-- ============================================================================

-- Vista de noticias publicadas con categoría
CREATE VIEW news_published AS
SELECT 
  n.*,
  c.name as category_name,
  c.slug as category_slug,
  c.color as category_color
FROM news n
LEFT JOIN categories c ON n.category_id = c.id
WHERE n.published_at IS NOT NULL AND n.published_at <= NOW();

-- Vista de jugadores con stats desnormalizados
CREATE VIEW players_stats AS
SELECT 
  p.*,
  (p.stats->>'goals')::INTEGER as stat_goals,
  (p.stats->>'assists')::INTEGER as stat_assists,
  (p.stats->>'matches')::INTEGER as stat_matches,
  (p.stats->>'minutes')::INTEGER as stat_minutes,
  (p.stats->>'yellowCards')::INTEGER as stat_yellow_cards,
  (p.stats->>'redCards')::INTEGER as stat_red_cards
FROM players p;

-- Vista de transferencias con info del jugador
CREATE VIEW transfers_complete AS
SELECT 
  t.*,
  p.name as player_name,
  p.slug as player_slug,
  p.image_url as player_image,
  p.position as player_position
FROM transfers t
JOIN players p ON t.player_id = p.id;

-- ============================================================================
-- FUNCIONES AUXILIARES
-- ============================================================================

-- Función para buscar noticias por texto
CREATE OR REPLACE FUNCTION search_news(search_term TEXT)
RETURNS TABLE (
  id UUID,
  title VARCHAR(255),
  slug VARCHAR(255),
  excerpt TEXT,
  similarity REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    n.id,
    n.title,
    n.slug,
    n.excerpt,
    similarity(n.title, search_term) as sim
  FROM news n
  WHERE 
    n.title ILIKE '%' || search_term || '%'
    OR n.excerpt ILIKE '%' || search_term || '%'
    OR n.content ILIKE '%' || search_term || '%'
  ORDER BY sim DESC, n.published_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para incrementar views de noticia
CREATE OR REPLACE FUNCTION increment_news_views(news_uuid UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE news 
  SET views = views + 1 
  WHERE id = news_uuid;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- DATOS INICIALES
-- ============================================================================

-- Categorías por defecto
INSERT INTO categories (name, slug, description, color, icon) VALUES
  ('Primera División', 'primera-division', 'Noticias de la Chilean Premier League', '#EF4444', 'Trophy'),
  ('Selección Nacional', 'seleccion-nacional', 'Noticias de La Roja', '#D946EF', 'Shield'),
  ('Copas', 'copas', 'Copa Chile y competiciones internacionales', '#F59E0B', 'Award'),
  ('Mercado de Pases', 'mercado-pases', 'Transferencias y rumores', '#10B981', 'ArrowRightLeft'),
  ('Fútbol Joven', 'futbol-joven', 'Noticias de divisiones inferiores', '#3B82F6', 'Users'),
  ('Análisis', 'analisis', 'Análisis tácticos y opiniones', '#6366F1', 'BarChart3')
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- PERMISOS
-- ============================================================================

-- Asegurar que las secuencias estén accesibles (si se usan)
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;

-- ============================================================================
-- FIN DEL SCHEMA
-- ============================================================================
