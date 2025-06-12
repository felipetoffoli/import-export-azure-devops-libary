
# Library .env Tools – Azure DevOps Extension

Extensão para Azure DevOps que permite **exportar** e **importar** bibliotecas de variáveis (Variable Groups) no formato `.env`.

Ideal para gerenciar configurações entre ambientes de forma simples e reutilizável.

---

## 🚀 Funcionalidades

- 🔄 **Exportar** bibliotecas de variáveis para um arquivo `.env`.
- ⬆️ **Importar** um arquivo `.env` e criar automaticamente uma nova biblioteca.
- 🔐 Suporte a variáveis comuns (não secretas).

---

## 🖥️ Interface

A extensão é acessada por meio do menu lateral de projeto e exibe um painel com campos para:

- Organização (`org`)
- Projeto (`project`)
- PAT (Token de Acesso Pessoal)
- ID da biblioteca existente
- Upload de arquivo `.env`

---

## 📦 Instalação

1. Instale a extensão via Marketplace do Azure DevOps.
2. Acesse um projeto no Azure DevOps.
3. Clique em **"Library .env Tools"** no menu lateral ou na seção do hub de extensões.

---

## 📤 Exportar uma biblioteca para `.env`

1. Informe:
   - Organização (ex: `minha-org`)
   - Projeto (ex: `meu-projeto`)
   - Token PAT com permissões de leitura em Library
   - ID do Variable Group (ex: `12`)
2. Clique em **"Exportar .env"**
3. Um arquivo será baixado com as variáveis no seguinte formato:

```

API\_URL=[https://api.meusistema.com](https://api.meusistema.com)
APP\_MODE=production
JWT\_SECRET=123abc456def

````

---

## 📥 Importar um `.env` para criar nova biblioteca

1. Informe:
   - Organização
   - Projeto
   - Token PAT com permissões de escrita em Library
2. Faça upload de um arquivo `.env`
3. A extensão criará um novo Variable Group com as variáveis do arquivo

> 📝 Variáveis secretas não são suportadas por padrão (por segurança).

---

## 🔐 Requisitos

- PAT com escopo:
  - `Variable Groups (Read & Write)`
  - `Project and Team`
- Organização deve estar em Azure DevOps Services (não funciona em Azure DevOps Server on-premises no momento)

---

## 📎 Exemplo de `.env`

```env
DB_HOST=sql.inovvati.corp
DB_PORT=5432
DB_USER=admin
DB_PASS=strongpassword
````

---

## ❗ Importante

* A extensão **não exporta variáveis secretas** (`isSecret: true`), por segurança.
* Recomendado usar tokens com permissões mínimas apenas para esta tarefa.

---

## 🛠️ Desenvolvimento

Você pode empacotar essa extensão com o `tfx-cli`:

```bash
tfx extension create --manifest-globs vss-extension.json
```

Para instalar em uma organização específica:

```bash
tfx extension install --vsix library-env-extension.vsix --service-url https://dev.azure.com/minha-org
```

---

## 📮 Contato

Desenvolvido por [Felipe Matheus Toffoli Martins](https://www.linkedin.com/in/felipetoffoli/).
