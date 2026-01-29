-- Arquivo de Seed para popular o banco de dados com exemplos iniciais
-- Execute este script no SQL Editor do Supabase

-- Limpar dados anteriores para evitar duplicação
TRUNCATE TABLE public.books CASCADE;
TRUNCATE TABLE public.series CASCADE;

-- --- LIVROS ---
-- Usando placeholders diretos para evitar bloqueios de CORS/Referer de sites externos

INSERT INTO public.books (title, author, overview, poster_path, release_date, vote_average, page_count, genres)
VALUES 
(
  'O Senhor dos Anéis: A Sociedade do Anel',
  'J.R.R. Tolkien',
  'Em uma terra fantástica e única, um hobbit recebe de presente de seu tio um anel mágico e maligno que precisa ser destruído antes que caia nas mãos do mal.',
  'https://placehold.co/400x600/1e293b/white?text=Lord+of+the+Rings', 
  '1954-07-29',
  9.5,
  576,
  '["Fantasia", "Aventura"]'::jsonb
),
(
  '1984',
  'George Orwell',
  'Winston Smith vive em uma sociedade totalitária sob a vigilância constante do Grande Irmão.',
  'https://placehold.co/400x600/1e293b/white?text=1984',
  '1949-06-08',
  9.0,
  328,
  '["Ficção", "Distopia"]'::jsonb
),
(
  'O Código Da Vinci',
  'Dan Brown',
  'Um assassinato no Louvre revela um sinistro segredo defendido por uma sociedade secreta desde os tempos de Jesus Cristo.',
  'https://placehold.co/400x600/1e293b/white?text=Da+Vinci+Code',
  '2003-03-18',
  8.5,
  689,
  '["Suspense", "Mistério"]'::jsonb
),
(
  'Duna',
  'Frank Herbert',
  'A história de Paul Atreides, um jovem brilhante e talentoso nascido com um grande destino, que deve viajar para o planeta mais perigoso do universo.',
  'https://placehold.co/400x600/1e293b/white?text=Dune',
  '1965-08-01',
  9.2,
  680,
  '["Ficção Científica", "Aventura"]'::jsonb
),
(
  'O Pequeno Príncipe',
  'Antoine de Saint-Exupéry',
  'Um piloto cai no deserto do Saara e encontra um jovem príncipe loiro que caiu na Terra vindo de um minúsculo asteroide.',
  'https://placehold.co/400x600/1e293b/white?text=Pequeno+Principe',
  '1943-04-06',
  9.8,
  96,
  '["Infantil", "Filosofia"]'::jsonb
);

-- --- SÉRIES ---
-- TMDB Images costumar funcionar bem sem bloqueios

INSERT INTO public.series (title, overview, poster_path, release_date, vote_average, seasons, episodes, genres)
VALUES
(
  'Breaking Bad',
  'Ao saber que tem câncer, um professor passa a fabricar metanfetamina pelo futuro da família, mudando o destino de todos.',
  'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
  '2008-01-20',
  9.5,
  '["Temporada 1", "Temporada 2", "Temporada 3", "Temporada 4", "Temporada 5"]'::jsonb,
  '[]'::jsonb,
  '["Drama", "Crime"]'::jsonb
),
(
  'Stranger Things',
  'Um grupo de amigos se envolve em uma série de eventos sobrenaturais após o desaparecimento de um deles.',
  'https://image.tmdb.org/t/p/w500/uOVpJ62yB5k4pE5gqG8T9y6M52V.jpg',
  '2016-07-15',
  8.9,
  '["Temporada 1", "Temporada 2", "Temporada 3", "Temporada 4"]'::jsonb,
  '[]'::jsonb,
  '["Ficção Científica", "Suspense"]'::jsonb
),
(
  'The Office (US)',
  'O dia a dia cômico de um grupo de funcionários de escritório na filial de Scranton da Dunder Mifflin Paper Company.',
  'https://image.tmdb.org/t/p/w500/qWnJzyZhyy74gJPoOqUoSim5Dq.jpg',
  '2005-03-24',
  8.9,
  '["Temporada 1", "Temporada 2", "Temporada 3", "Temporada 4", "Temporada 5", "Temporada 6", "Temporada 7", "Temporada 8", "Temporada 9"]'::jsonb,
  '[]'::jsonb,
  '["Comédia"]'::jsonb
),
(
  'Game of Thrones',
  'Em uma terra onde os verões podem durar décadas e o inverno toda uma vida, nove famílias nobres lutam pelo controle de Westeros.',
  'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbGw83trZr90cK2.jpg',
  '2011-04-17',
  9.3,
  '["Temporada 1", "Temporada 2", "Temporada 3", "Temporada 4", "Temporada 5", "Temporada 6", "Temporada 7", "Temporada 8"]'::jsonb,
  '[]'::jsonb,
  '["Fantasia", "Drama"]'::jsonb
),
(
  'The Mandalorian',
  'Após a queda do Império Galáctico, um pistoleiro solitário desbrava a galáxia longe da autoridade da Nova República.',
  'https://image.tmdb.org/t/p/w500/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg',
  '2019-11-12',
  8.8,
  '["Temporada 1", "Temporada 2", "Temporada 3"]'::jsonb,
  '[]'::jsonb,
  '["Ficção Científica", "Ação"]'::jsonb
);
