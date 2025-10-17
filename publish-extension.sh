#!/bin/bash
set -e  # para o script se der erro em qualquer comando

# 🧩 Caminho do manifest
MANIFEST_FILE="azure-devops-extension.json"

# 🧩 Lê a versão atual
CURRENT_VERSION=$(grep '"version"' "$MANIFEST_FILE" | head -1 | sed -E 's/.*"version": *"([^"]+)".*/\1/')
echo "🔹 Versão atual: $CURRENT_VERSION"

# 🧩 Incrementa o último número da versão (ex: 1.0.17 → 1.0.18)
IFS='.' read -r major minor patch <<< "$CURRENT_VERSION"
NEW_VERSION="${major}.${minor}.$((patch + 1))"
echo "🔹 Nova versão: $NEW_VERSION"

# 🧩 Atualiza o JSON com a nova versão
sed -i "s/\"version\": *\"[0-9.]*\"/\"version\": \"${NEW_VERSION}\"/" "$MANIFEST_FILE"

# 🧩 Exibe o resultado
grep '"version"' "$MANIFEST_FILE"

# 🧩 Executa build
echo "🏗️  Executando build..."
npm run build:dev

sleep 2  # espera 2 segundos para garantir que o arquivo .vsix seja gerado

# 🧩 Nome esperado do arquivo .vsix
PUBLISHER="felipetoffoli"
EXTENSION_ID=$(grep '"id"' "$MANIFEST_FILE" | head -1 | sed -E 's/.*"id": *"([^"]+)".*/\1/')
VSIX_FILE="${PUBLISHER}.${EXTENSION_ID}-${NEW_VERSION}.vsix"

# 🧩 Verifica se o arquivo existe
if [ ! -f "$VSIX_FILE" ]; then
  echo "❌ Arquivo esperado não encontrado: $VSIX_FILE"
  echo "📁 Conteúdo da pasta atual:"
  ls -lh *.vsix || echo "(nenhum arquivo .vsix encontrado)"
  exit 1
fi

echo "📦 Artefato encontrado: $VSIX_FILE"

# 🧩 Lê o token do arquivo .env
if [ ! -f ".env" ]; then
  echo "❌ Arquivo .env não encontrado!"
  exit 1
fi

PAT_TOKEN=$(grep -E '^PAT_TOKEN=' .env | cut -d '=' -f2 | tr -d '\r\n')

if [ -z "$PAT_TOKEN" ]; then
  echo "❌ PAT_TOKEN não encontrado no arquivo .env"
  exit 1
fi

# 🧩 Publica a extensão no Marketplace com o arquivo correto
echo "🚀 Publicando extensão (versão $NEW_VERSION)..."

tfx extension publish \
  --vsix "$VSIX_FILE" \
  --token "$PAT_TOKEN" \
  --publisher "$PUBLISHER"

echo "✅ Publicação concluída com sucesso! (Versão $NEW_VERSION)"