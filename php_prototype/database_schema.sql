-- Database Schema for Suggesto (Hybrid JSON Approach)

CREATE DATABASE IF NOT EXISTS suggesto_db;
USE suggesto_db;

-- 1. Tabela de Categorias
-- Armazena os tipos de itens e o índice correspondente na Amazon (Search Index)
CREATE TABLE IF NOT EXISTS categorias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    amazon_index VARCHAR(50) NOT NULL, -- Ex: 'Movies', 'Electronics', 'Books'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabela Mestra de Sugestões
-- Armazena todos os itens (Filmes, Produtos, Livros) na mesma estrutura
CREATE TABLE IF NOT EXISTS sugestoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    imagem_capa VARCHAR(255),
    termo_amazon VARCHAR(255) NOT NULL, -- Termo exato para busca na Amazon
    dados_extras JSON, -- O "Pulo do Gato": Atributos flexíveis (Diretor, Voltagem, Autor)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON DELETE CASCADE
);

-- Inserção de Dados de Exemplo (Seed)

-- Categorias
INSERT INTO categorias (nome, slug, amazon_index) VALUES 
('Filmes', 'filmes', 'Movies'),
('Livros', 'livros', 'Books'),
('Cafeteiras', 'cafeteiras', 'Kitchen');

-- Sugestões (Exemplos Híbridos)

-- Exemplo 1: Filme
INSERT INTO sugestoes (categoria_id, titulo, descricao, imagem_capa, termo_amazon, dados_extras) 
VALUES (
    1, 
    'Interestelar', 
    'Uma viagem através de um buraco de minhoca no espaço-tempo.', 
    'https://example.com/interestelar.jpg', 
    'Interstellar Movie custom edition', 
    '{"diretor": "Christopher Nolan", "ano": 2014, "duracao": "2h 49m", "genero": "Sci-Fi"}'
);

-- Exemplo 2: Produto Físico (Cafeteira)
INSERT INTO sugestoes (categoria_id, titulo, descricao, imagem_capa, termo_amazon, dados_extras) 
VALUES (
    3, 
    'Nespresso Essenza Mini', 
    'Cafeteira compacta para café espresso.', 
    'https://example.com/nespresso.jpg', 
    'Nespresso Essenza Mini Machine', 
    '{"marca": "Nespresso", "voltagem": "220v", "cor": "Preto", "peso": "2.3kg"}'
);
