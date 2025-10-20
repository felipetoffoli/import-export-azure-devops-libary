#!/bin/bash
set -e  # para o script parar se der erro em qualquer comando

MANIFEST_FILE="azure-devops-extension.json"
ERROR_FILE=".publish_error"

# 🧩 Se existe um erro pendente, reutiliza a versão anterior
if [ -f "$ERROR_FILE" ]; then
  FAILED_VERSION=$(cat "$ERROR_FILE")
  echo "⚠️  Publicação anterior falhou na versão $FAILED_VERSION."
  echo "🔁 Tentando novamente com a mesma versão..."
  CURRENT_VERSION="$FAILED_VERSION"
  NEW_VERSION="$FAILED_VERSION"
  rm -f "$ERROR_FILE"
else
  # 🧩 Lê a versão atual
  CURRENT_VERSION=$(grep '"version"' "$MANIFEST_FILE" | head -1 | sed -E 's/.*"version": *"([^"]+)".*/\1/')
  echo "🔹 Versão atual: $CURRENT_VERSION"

  # 🧩 Incrementa o último número da versão (ex: 1.0.17 → 1.0.18)
  IFS='.' read -r major minor patch <<< "$CURRENT_VERSION"
  NEW_VERSION="${major}.${minor}.$((patch + 1))"

  echo "🔹 Nova versão: $NEW_VERSION"

  # 🧩 Atualiza o JSON com a nova versão
  sed -i "s/\"version\": *\"[0-9.]*\"/\"version\": \"${NEW_VERSION}\"/" "$MANIFEST_FILE"
fi

# 🧩 Mostra versão no manifest
grep '"version"' "$MANIFEST_FILE"

# 🧩 Executa build
echo "🏗️  Executando build..."
npm run build:dev

sleep 2  # pequena pausa para garantir geração do .vsix

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

# 🧩 Publica a extensão
echo "🚀 Publicando extensão (versão $NEW_VERSION)..."

if ! tfx extension publish \
  --vsix "$VSIX_FILE" \
  --token "$PAT_TOKEN" \
  --publisher "$PUBLISHER"; then

  echo "❌ Erro ao publicar a extensão!"
  echo "$NEW_VERSION" > "$ERROR_FILE"
  echo "⚠️  Versão $NEW_VERSION registrada em $ERROR_FILE para retry futuro."
  exit 1
fi

# 🧩 Se chegou até aqui, deu tudo certo
echo "✅ Publicação concluída com sucesso! (Versão $NEW_VERSION)"
rm -f "$ERROR_FILE" 2>/dev/null || true
