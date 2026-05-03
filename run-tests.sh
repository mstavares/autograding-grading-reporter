#!/bin/bash

echo "🧪 Configuração e Execução de Testes de Integração"
echo "=================================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ Ficheiro .env não encontrado!"
    echo ""
    echo "Por favor, cria o ficheiro .env com as seguintes variáveis:"
    echo ""
    echo "SHEETS_CREDENTIALS=<tuas-credenciais-base64>"
    echo "SPREADSHEET_ID=<id-da-spreadsheet>"
    echo "WORKSHEET_NAME=<nome-da-folha>"
    echo "AUTHORS_AMOUNT=2"
    echo ""
    echo "Ou copia do exemplo:"
    echo "  cp .env.example .env"
    echo "  # Depois edita o ficheiro"
    echo ""
    exit 1
fi

# Check if AUTHORS.txt exists
if [ ! -f AUTHORS.txt ]; then
    echo "⚠️  Ficheiro AUTHORS.txt não encontrado!"
    echo ""
    echo "A criar AUTHORS.txt a partir do exemplo..."
    if [ -f AUTHORS.txt.example ]; then
        cp AUTHORS.txt.example AUTHORS.txt
        echo "✅ AUTHORS.txt criado com: $(cat AUTHORS.txt | head -1)"
        echo ""
        echo "⚠️  IMPORTANTE: Verifica se os números em AUTHORS.txt existem na tua spreadsheet!"
        echo ""
    else
        echo "❌ AUTHORS.txt.example não encontrado!"
        echo "Por favor, cria AUTHORS.txt manualmente com números de alunos."
        exit 1
    fi
fi

# Load .env
echo "📋 A carregar variáveis de ambiente de .env..."
export $(cat .env | grep -v '^#' | xargs)

# Validate required variables
if [ -z "$SHEETS_CREDENTIALS" ]; then
    echo "❌ SHEETS_CREDENTIALS não definido no .env"
    exit 1
fi

if [ -z "$SPREADSHEET_ID" ]; then
    echo "❌ SPREADSHEET_ID não definido no .env"
    exit 1
fi

if [ -z "$WORKSHEET_NAME" ]; then
    echo "❌ WORKSHEET_NAME não definido no .env"
    exit 1
fi

echo "✅ Variáveis carregadas:"
echo "   SPREADSHEET_ID: $SPREADSHEET_ID"
echo "   WORKSHEET_NAME: $WORKSHEET_NAME"
echo "   AUTHORS_AMOUNT: ${AUTHORS_AMOUNT:-2}"
echo ""

# Show AUTHORS.txt content
echo "📄 Alunos em AUTHORS.txt:"
cat AUTHORS.txt | while read line; do
    if [ ! -z "$line" ]; then
        echo "   - $line"
    fi
done
echo ""

# Run tests
echo "🚀 A executar testes de integração..."
echo "=================================================="
echo ""

npm run test:integration

# Check exit code
if [ $? -eq 0 ]; then
    echo ""
    echo "=================================================="
    echo "✅ Todos os testes passaram!"
    echo ""
    echo "🎯 Validação Manual:"
    echo "   1. Abre a tua Google Sheet"
    echo "   2. Verifica que apenas as células esperadas foram atualizadas"
    echo "   3. Confirma que não há sobrescrita de dados"
    echo ""
else
    echo ""
    echo "=================================================="
    echo "❌ Alguns testes falharam!"
    echo ""
    echo "💡 Troubleshooting:"
    echo "   - Verifica que os números em AUTHORS.txt existem na spreadsheet"
    echo "   - Confirma que a service account tem acesso à spreadsheet"
    echo "   - Verifica que as colunas existem: numero, nome, repositorio"
    echo ""
    exit 1
fi
