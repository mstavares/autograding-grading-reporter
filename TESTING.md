# Testing Guide

## Testes de Integração da Spreadsheet API

Este guia explica como configurar e executar os testes de integração para validar a funcionalidade de atualização de células específicas (v5.2.0).

## 🎯 Objetivo dos Testes

Validar que a migração para `google-spreadsheet` v5.2.0 funciona corretamente:
- ✅ Atualiza apenas células específicas (não sobrescreve a linha inteira)
- ✅ Batch updates funcionam (múltiplas células numa única chamada API)
- ✅ Autenticação funciona com JWT
- ✅ Leitura de dados funciona com `row.get()`

## 📋 Pré-requisitos

### 1. Variáveis de Ambiente

As mesmas variáveis que usas nas GitHub Actions:

```bash
export SHEETS_CREDENTIALS="<base64-encoded-service-account-json>"
export SPREADSHEET_ID="<your-spreadsheet-id>"
export WORKSHEET_NAME="<worksheet-name>"
export AUTHORS_AMOUNT="2"
export GITHUB_REPOSITORY="test-user/test-repo"
```

**Nota:** Se já tens estas variáveis configuradas nas GitHub Actions secrets, não precisas de fazer nada - os testes vão usar as mesmas.

### 2. Ficheiro AUTHORS.txt

Cria um ficheiro `AUTHORS.txt` na raiz do projeto com números de alunos reais da tua spreadsheet:

```bash
cp AUTHORS.txt.example AUTHORS.txt
# Depois edita com números reais
```

Exemplo:
```
12345
67890
```

### 3. Estrutura da Spreadsheet

A tua Google Sheet deve ter estas colunas:
- **numero** - Número do aluno
- **nome** - Nome do aluno
- **repositorio** - URL do repositório
- Colunas de testes (ex: `test1`, `test2`, etc.)

## 🚀 Executar Testes

### Executar todos os testes
```bash
npm test
```

### Executar apenas testes de integração
```bash
npm run test:integration
```

### Executar apenas testes unitários (excluindo integração)
```bash
npm run test:unit
```

### Executar um teste específico
```bash
npm test -- -t "should update only repositorio cell"
```

## 📊 O que cada teste valida

### 1. Conexão à Spreadsheet
```bash
✅ Connected to worksheet: <nome-da-folha>
```
Valida que a autenticação funciona e consegue aceder à spreadsheet.

### 2. Leitura de Colunas
```bash
✅ Found columns: numero, nome, repositorio, test1, test2...
```
Verifica que todas as colunas necessárias existem.

### 3. Atualização de Célula Individual
```bash
✅ Updated only repositorio cell
   Original nome: João Silva -> Current: João Silva
   Original numero: 12345 -> Current: 12345
   New repositorio: https://github.com/test/repo-123456789
```
**IMPORTANTE:** Este é o teste crítico que valida que:
- ❌ **Antes (v3.x):** `row.save()` sobrescrevia toda a linha
- ✅ **Agora (v5.2.0):** Apenas a célula `repositorio` é atualizada

### 4. Atualização em Batch
```bash
✅ Updated 3 test score cells in single batch
   test1: 5
   test2: 10
   test3: 8
```
Valida que múltiplas células podem ser atualizadas com uma única chamada API.

### 5. Autenticação de Autores
```bash
✅ Authenticated 2 authors:
   12345 - João Silva
   67890 - Maria Santos
```
Testa o fluxo completo de autenticação usado pela ação.

### 6. Post Results Completo
```bash
✅ Successfully posted test results
   Total score: 25
```
Testa o fluxo end-to-end de publicação de resultados.

## 🔧 Integração com GitHub Actions

Adiciona este step ao teu workflow:

```yaml
- name: Run Integration Tests
  env:
    SHEETS_CREDENTIALS: ${{ secrets.SHEETS_CREDENTIALS }}
    SPREADSHEET_ID: ${{ secrets.SPREADSHEET_ID }}
    WORKSHEET_NAME: ${{ secrets.WORKSHEET_NAME }}
    AUTHORS_AMOUNT: ${{ secrets.AUTHORS_AMOUNT }}
  run: npm run test:integration
```

## ⚠️ Notas Importantes

### Timeout
Os testes de integração têm timeout de 30-60 segundos devido a:
- Chamadas à API do Google Sheets
- Overhead de autenticação
- Operações de carregamento de células

### Dados de Teste
Alguns testes escrevem dados temporários na spreadsheet:
- URLs de repositório com timestamps
- Scores de testes

**Recomendação:** Usa uma spreadsheet de teste dedicada, ou limpa os dados manualmente após os testes.

### Rate Limits
A Google Sheets API tem rate limits. Se executares muitos testes seguidos, podes receber erros 429. Aguarda alguns segundos entre execuções.

## 🐛 Troubleshooting

### Erro: "SHEETS_CREDENTIALS environment variable is required"
```bash
# Verifica se a variável está definida
echo $SHEETS_CREDENTIALS

# Se não estiver, define-a
export SHEETS_CREDENTIALS="..."
```

### Erro: "Invalid auth"
Verifica que:
1. O JSON da service account está correto
2. A service account tem acesso à spreadsheet
3. O base64 encoding está correto

### Erro: "No rows in sheet, skipping test"
A spreadsheet precisa de pelo menos uma linha com dados (além do header).

### Erro: "Column 'repositorio' not found"
Verifica que a tua spreadsheet tem todas as colunas necessárias: `numero`, `nome`, `repositorio`.

## 📈 Verificar Sucesso

Após executar os testes com sucesso:

1. **Abre a tua Google Sheet**
2. **Verifica que apenas as células esperadas foram atualizadas**
3. **Confirma que não há sobrescrita acidental de dados**

Se todos os testes passarem com ✅, a migração para v5.2.0 está funcional!

## 🎓 Próximos Passos

1. Executar os testes localmente
2. Verificar manualmente a spreadsheet após os testes
3. Integrar os testes no CI/CD
4. Deploy da nova versão (v1.0.6) com cell-level updates
