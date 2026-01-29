<?php

// Configurações Globais
define('AMAZON_TAG', 'sua-tag-20'); // SUBSTITUA PELA SUA TAG DE AFILIADO REAL
define('AMAZON_BASE_URL', 'https://www.amazon.com.br/s');

/**
 * Gera um Link Universal de Busca da Amazon com Tag de Afiliado.
 * 
 * Estratégia: Em vez de linkar para um produto específico (que pode sair de estoque),
 * linkamas para uma BUSCA qualificada. Isso aumenta a conversão pois o usuário vê
 * várias opções disponíveis.
 * 
 * @param string $termo O termo de busca (ex: "Interestelar Blu-ray", "Cafeteira Nespresso")
 * @param string $categoria_index O índice de busca da Amazon (ex: 'Movies', 'Electronics')
 * @return string URL formatada para clicar
 */
function gerarLinkUniversal($termo, $categoria_index = 'All') {
    // 1. Limpeza e codificação do termo para URL
    $termo_codificado = urlencode($termo);
    
    // 2. Montagem dos parâmetros da Query String
    $params = [
        'k' => $termo,          // Keyword: O termo de busca
        'i' => $categoria_index, // Index: A categoria na Amazon (filtra resultados irrelevantes)
        'tag' => AMAZON_TAG,     // Tracking: Sua tag de afiliado para comissão
        'linkCode' => 'll2'      // Link Code padrão para links de texto
    ];
    
    // 3. Construção da URL Final
    $url = AMAZON_BASE_URL . '?' . http_build_query($params);
    
    return $url;
}

// Exemplos de Uso (apenas para teste se rodar este arquivo diretamente)
if (basename(__FILE__) == basename($_SERVER['PHP_SELF'])) {
    echo "<h3>Testes de Geração de Link Amazon:</h3>";
    
    echo "<p><strong>Filme:</strong> " . gerarLinkUniversal("Interestelar 4k", "Movies") . "</p>";
    echo "<p><strong>Cafeteira:</strong> " . gerarLinkUniversal("Nespresso Essenza Mini 220v", "Kitchen") . "</p>";
}

?>
