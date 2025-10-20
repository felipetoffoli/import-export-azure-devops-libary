# 📦 Library .env Tools — Extensão Azure DevOps

Gerencie e integre seus arquivos `.env` e `.json` diretamente com as **Variable Groups (Libraries)** do Azure DevOps!
Com esta extensão, você pode **exportar, importar e sincronizar variáveis de ambiente** de forma simples e segura, sem precisar navegar manualmente pela interface do Azure.

---

## 🚀 Funcionalidades Principais

### ✅ **Listagem de Libraries**

* Visualize todas as Variable Groups disponíveis no projeto atual.
* Pesquise rapidamente pelo nome da library.


> `screenshot-library-list.png`


---

### 📤 **Exportar variáveis**

* Exporte qualquer Library para um arquivo `.env` ou `.json`.
* Escolha se deseja **incluir ou ocultar variáveis secretas**.
* Útil para replicar configurações entre projetos ou ambientes.


> `screenshot-export-dialog.png`

---

### 📥 **Importar variáveis**

* Importe um arquivo `.env` ou `.json` diretamente para o Azure DevOps.
* A extensão converte automaticamente o arquivo em um **Variable Group**.
* Caso o nome já exista, você pode:

  * Criar um novo grupo com outro nome;
  * **Ou substituir (REPLACE)** a library existente com as novas variáveis.



---

### 🔁 **Importar com REPLACE direto**

* Na lista principal, clique em **“Import .env (REPLACE)”** para abrir o modal já configurado:

  * O nome da Library é preenchido automaticamente.
  * O checkbox “Substituir existente” vem ativado e bloqueado (não editável).


> `screenshot-import-replace.png`

---

### 🔐 **Autenticação com PAT**

* A extensão solicita seu **Personal Access Token (PAT)** apenas uma vez.
* Ele é armazenado localmente e usado para autenticar as operações de leitura e escrita nas APIs do Azure DevOps.
* Você pode remover ou reconfigurar o PAT a qualquer momento no botão **“Configurar PAT”**.


> `screenshot-pat-dialog.png`

---

## ⚙️ Requisitos

* Azure DevOps com permissões de acesso a **Libraries (Variable Groups)**.
* Token PAT com escopos mínimos:

  * `Read & Write` em **Variable Groups**
  * `Project and Team Read`

---

## 🧩 Como usar

1. Abra o menu lateral do Azure DevOps.
2. Acesse **Library .env Tools**.
3. Se for sua primeira vez, insira seu **PAT Token**.
4. Use os botões:

   * 🔍 Pesquisar Libraries
   * 📤 Exportar `.env / .json`
   * 📥 Importar novo arquivo
   * 🔁 Substituir Library existente
5. Verifique os logs do navegador caso ocorra algum erro (a extensão exibe alertas descritivos).

---

## 💡 Dicas de uso

* Utilize o formato `.env` para facilitar integração com aplicações.
* Use o formato `.json` para importar/exportar com automações.
* Sempre mantenha nomes de variáveis em **MAIÚSCULAS e sem espaços**.
* Ao importar, o nome da Library pode ser alterado antes de confirmar o envio.

---

## ⚠️ Erros comuns

| Erro                                                          | Causa provável                            | Solução                                       |
| ------------------------------------------------------------- | ----------------------------------------- | --------------------------------------------- |
| ❌ `403 Forbidden`                                             | PAT inválido ou expirado                  | Reconfigure o PAT                             |
| ❌ `Variable group already exists`                             | Nome duplicado e replace desativado       | Ative o checkbox “Substituir existente”       |
| ❌ `At least one variable group project reference is required` | Falta de referência do projeto no payload | Atualize para versão mais recente da extensão |

---

## 🧠 Próximas melhorias (roadmap)

* [ ] Suporte a variáveis complexas (JSON aninhado).
* [ ] Histórico de importações/exportações.
* [ ] Validação automática de variáveis secretas.
* [ ] Interface com dark mode.

---

## 👨‍💻 Autor

**Felipe Matheus Toffoli Martins**
🔹 DevOps Engineer | Plataform Engenner
🔗 [LinkedIn](https://www.linkedin.com/in/felipetoffoli/)
💼 [GitHub](https://github.com/felipetoffoli)

---

Quer que eu gere também uma **versão em Markdown com placeholders de imagem prontos** (para você só substituir os caminhos dos screenshots depois)?
Posso formatar o README.md final já pronto para colar no repositório.
