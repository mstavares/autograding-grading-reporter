# 🚀 Quick Start - Testes de Integração

Guia rápido para executar os testes e validar a correção do problema de sobrescrita de linhas.

## ⚡ Setup Rápido (2 minutos)

### 1. Criar ficheiro .env

```bash
cp .env.example .env
```

Edita o `.env` e preenche com as tuas credenciais (as mesmas das GitHub Actions):

```bash
SHEETS_CREDENTIALS=<base64-do-service-account-json>
SPREADSHEET_ID=<id-da-tua-spreadsheet>
WORKSHEET_NAME=<nome-da-folha>
AUTHORS_AMOUNT=2
```

### 2. Criar AUTHORS.txt

```bash
cp AUTHORS.txt.example AUTHORS.txt
```

Edita com números de alunos **reais** da tua spreadsheet:

```
12345
67890
```

### 3. Executar testes

```bash
npm run test:integration
```

## ✅ O que esperar

### Se tudo correr bem, vais ver:

```
✅ Connected to worksheet: MinhaFolha
✅ Found columns: numero, nome, repositorio, test1, test2...
✅ Read 50 rows
✅ Found student 12345: João Silva
✅ Updated only repositorio cell
   Original nome: João Silva -> Current: João Silva
   Original numero: 12345 -> Current: 12345
   New repositorio: https://github.com/test/repo-1714773892000
✅ Updated 3 test score cells in single batch
   test1: 5
   test2: 10
   test3: 8
✅ Authenticated 2 authors:
   12345 - João Silva
   67890 - Maria Santos
✅ Successfully posted test results
   Total score: 25

Test Suites: 1 passed, 1 total
Tests:       8 passed, 8 total
```

### 🎯 Teste Crítico: "Updated only repositorio cell"

Este é **o teste mais importante**:

```
✅ Updated only repositorio cell
   Original nome: João Silva -> Current: João Silva  ← nome NÃO mudou
   Original numero: 12345 -> Current: 12345          ← numero NÃO mudou
   New repositorio: https://github.com/...          ← APENAS repositorio mudou
```

**Isto prova que:**
- ✅ Apenas a célula `repositorio` foi atualizada
- ✅ As outras células (nome, numero) **não foram sobrescritas**
- ✅ O problema da v3.x está resolvido!

## 🔍 Validação Manual

Depois dos testes, **abre a tua Google Sheet** e verifica:

1. A célula `repositorio` da primeira linha deve ter um URL novo com timestamp
2. As outras células (nome, numero, testes anteriores) devem estar intactas
3. Não deve haver dados perdidos ou sobrescritos

## 🐛 Problemas Comuns

### "SHEETS_CREDENTIALS environment variable is required"
→ Verifica que criaste o ficheiro `.env` e preencheste as credenciais

### "No rows in sheet, skipping test"
→ A tua spreadsheet precisa de pelo menos uma linha com dados

### "Column 'repositorio' not found"
→ Verifica que a tua spreadsheet tem as colunas: `numero`, `nome`, `repositorio`

### "Nao encontrei o author: 12345"
→ Os números em `AUTHORS.txt` devem existir na coluna `numero` da spreadsheet

## 📦 Próximos Passos

Se todos os testes passarem:

1. ✅ A migração para v5.2.0 está funcional
2. ✅ O problema de sobrescrita está resolvido
3. ✅ Podes fazer commit e criar uma nova release
4. ✅ Atualiza a versão nas tuas GitHub Actions

```bash
# Build para produção
npm run build

# Commit das mudanças
git add .
git commit -m "fix: migrate to google-spreadsheet v5.2.0 with cell-level updates"

# Tag nova versão
git tag v1.0.6
git push origin main --tags
```

## 📚 Documentação Completa

Para mais detalhes, consulta:
- `TESTING.md` - Guia completo de testes
- `__tests__/README.md` - Documentação dos testes
- `CLAUDE.md` - Documentação do plano de implementação

## 🎉 Sucesso!

Se viste todos os ✅ verdes, parabéns! A migração está completa e o bug está resolvido.
