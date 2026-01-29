<?php
// view_item.php
require_once 'amazon_links.php';

// --- MOCK DE BANCO DE DADOS ---
// Em produção, isso seria uma query SQL: SELECT * FROM sugestoes ... WHERE id = $id
function getItemDoBanco($id)
{
    // Simulando dados vindos do MySQL
    if ($id == 1) {
        return [
            'id' => 1,
            'titulo' => 'Interestelar',
            'descricao' => 'Uma equipe de exploradores viaja através de um buraco de minhoca no espaço, na tentativa de garantir a sobrevivência da humanidade.',
            'categoria_nome' => 'Filmes',
            'categoria_slug' => 'filmes',
            'amazon_index' => 'Movies',
            'termo_amazon' => 'Interestelar Blu-ray',
            'imagem_capa' => 'https://m.media-amazon.com/images/I/91kFYg4fX3L._AC_SL1500_.jpg',
            // O campo JSON puro vindo do banco
            'dados_extras_json' => '{"diretor": "Christopher Nolan", "ano": 2014, "duracao": "2h 49m", "genero": "Sci-Fi", "nota_imdb": 8.7}'
        ];
    } elseif ($id == 2) {
        return [
            'id' => 2,
            'titulo' => 'Nespresso Essenza Mini',
            'descricao' => 'Cafeteira ultracompacta que oferece o sabor perfeito do café Nespresso. Design moderno e minimalista.',
            'categoria_nome' => 'Cafeteiras',
            'categoria_slug' => 'cafeteiras',
            'amazon_index' => 'Kitchen',
            'termo_amazon' => 'Nespresso Essenza Mini 220v',
            'imagem_capa' => 'https://m.media-amazon.com/images/I/61X-7B+5jAL._AC_SL1500_.jpg',
            // O campo JSON puro vindo do banco
            'dados_extras_json' => '{"marca": "Nespresso", "voltagem": "220v", "cor": "Preto", "peso": "2.3kg", "pressao": "19 bar"}'
        ];
    }
    return null;
}

// 1. Receber ID da URL (ex: view_item.php?id=1)
$id_item = isset($_GET['id']) ? (int) $_GET['id'] : 1;
$item = getItemDoBanco($id_item);

if (!$item) {
    die("Item não encontrado.");
}

// 2. Decodificar o JSON Flexível
$dados_extras = json_decode($item['dados_extras_json'], true);

// 3. Gerar SEO Dinâmico
$page_title = "";
$meta_description = "";
$schema_json = [];

if ($item['categoria_slug'] == 'filmes') {
    // SEO para Filmes
    $page_title = "Assistir {$item['titulo']} ({$dados_extras['ano']}) | Melhores Filmes Sci-Fi";
    $meta_description = "Descubra onde assistir {$item['titulo']} de {$dados_extras['diretor']}. Sinopse: " . substr($item['descricao'], 0, 100) . "... Veja sugestões similares.";

    // Schema.org para Filmes
    $schema_json = [
        "@context" => "https://schema.org",
        "@type" => "Movie",
        "name" => $item['titulo'],
        "image" => $item['imagem_capa'],
        "director" => ["@type" => "Person", "name" => $dados_extras['diretor'] ?? ''],
        "dateCreated" => $dados_extras['ano'] ?? '',
        "description" => $item['descricao'],
        "aggregateRating" => [
            "@type" => "AggregateRating",
            "ratingValue" => $dados_extras['nota_imdb'] ?? "8.0",
            "bestRating" => "10",
            "ratingCount" => "15000" // Mock
        ]
    ];
} else {
    // SEO para Outils/Produtos
    $page_title = "Comprar {$item['titulo']} | Melhor Preço e Review";
    $meta_description = "Vale a pena comprar a {$item['titulo']}? Veja detalhes de voltagem ({$dados_extras['voltagem']}) e especificações completas.";

    // Schema.org para Produtos
    $schema_json = [
        "@context" => "https://schema.org",
        "@type" => "Product",
        "name" => $item['titulo'],
        "image" => $item['imagem_capa'],
        "description" => $item['descricao'],
        "brand" => ["@type" => "Brand", "name" => $dados_extras['marca'] ?? 'Genérico'],
        "offers" => [
            "@type" => "Offer",
            "url" => gerarLinkUniversal($item['termo_amazon'], $item['amazon_index']),
            "availability" => "https://schema.org/InStock",
            "priceCurrency" => "BRL",
            "price" => "450.00" // Preço estimado/mock para o schema
        ]
    ];
}

// 4. Gerar Link de Afiliado
$link_afiliado = gerarLinkUniversal($item['termo_amazon'], $item['amazon_index']);

?>
<!DOCTYPE html>
<html lang="pt-BR">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- SEO ON-PAGE DINÂMICO -->
    <title><?php echo htmlspecialchars($page_title); ?></title>
    <meta name="description" content="<?php echo htmlspecialchars($meta_description); ?>">

    <!-- SCHEMA.ORG (VITAL PARA IAs) -->
    <script type="application/ld+json">
    <?php echo json_encode($schema_json, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES); ?>
    </script>

    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f9;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
        }

        .card {
            background: white;
            width: 400px;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .card img {
            width: 100%;
            border-radius: 8px;
            margin-bottom: 15px;
        }

        .badge {
            background: #eee;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 0.8em;
            text-transform: uppercase;
            font-weight: bold;
            color: #555;
        }

        .btn-amazon {
            display: block;
            width: 100%;
            padding: 15px;
            background: #FF9900;
            color: white;
            text-align: center;
            text-decoration: none;
            font-weight: bold;
            border-radius: 8px;
            margin-top: 20px;
            transition: background 0.3s;
        }

        .btn-amazon:hover {
            background: #e68a00;
        }

        .specs {
            margin-top: 15px;
            padding: 10px;
            background: #fafafa;
            border-radius: 8px;
            border: 1px solid #eee;
        }

        .specs ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .specs li {
            padding: 5px 0;
            border-bottom: 1px solid #eee;
            font-size: 0.9em;
            display: flex;
            justify-content: space-between;
        }

        .specs li:last-child {
            border-bottom: none;
        }

        .specs strong {
            color: #333;
        }
    </style>
</head>

<body>

    <div class="card">
        <!-- Imagem -->
        <img src="<?php echo $item['imagem_capa']; ?>" alt="<?php echo htmlspecialchars($item['titulo']); ?>">

        <!-- Categoria -->
        <span class="badge"><?php echo $item['categoria_nome']; ?></span>

        <!-- Título -->
        <h1><?php echo $item['titulo']; ?></h1>

        <!-- Descrição -->
        <p><?php echo $item['descricao']; ?></p>

        <!-- Área Dinâmica: Aqui iteramos sobre o JSON flexível! -->
        <div class="specs">
            <h3>Detalhes Técnicos:</h3>
            <ul>
                <?php foreach ($dados_extras as $chave => $valor): ?>
                    <li>
                        <strong><?php echo ucfirst($chave); ?>:</strong>
                        <span><?php echo $valor; ?></span>
                    </li>
                <?php endforeach; ?>
            </ul>
        </div>

        <!-- Call to Action (Monetização) -->
        <a href="<?php echo $link_afiliado; ?>" target="_blank" class="btn-amazon">
            Ver Preço na Amazon ↗
        </a>

        <p style="font-size: 0.8em; text-align: center; color: #999; margin-top: 10px;">
            <small>Participamos do Programa de Associados da Amazon.</small>
        </p>
    </div>

    <!-- Links de Teste -->
    <div style="position: absolute; top: 10px; right: 10px;">
        <a href="?id=1">Ver Filme</a> | <a href="?id=2">Ver Produto</a>
    </div>

</body>

</html>