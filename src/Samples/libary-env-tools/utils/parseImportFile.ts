/**
 * 📦 Faz o parse de um arquivo .env ou .json para o formato esperado no importLibrary().
 *
 * @param file Arquivo importado (.env ou .json)
 * @param ignoreSecrets Se true, ignora variáveis marcadas como secret
 */
export async function parseImportFile(
  file: File,
  ignoreSecrets: boolean
): Promise<{
  name: string;
  variables: { name: string; value: string; type: string }[];
}> {
  const text = await file.text();
  const fileName = file.name.replace(/\.(env|json)$/i, "");
  const ext = file.name.split(".").pop()?.toLowerCase();

  let variables: { name: string; value: string; type: string }[] = [];

  if (ext === "env") {
    // 📄 Parse manual do arquivo .env
    variables = text
      .split(/\r?\n/)
      .filter((line) => line.trim() && !line.trim().startsWith("#"))
      .map((line) => {
        const [key, ...rest] = line.split("=");
        const value = rest.join("=").trim();
        const isSecret =
          key.toLowerCase().includes("secret") ||
          key.toLowerCase().includes("token");
        return {
          name: key.trim(),
          value: ignoreSecrets && isSecret ? "" : value.replace(/^"|"$/g, ""),
          type: isSecret ? "secret" : "normal",
        };
      });
  } else if (ext === "json") {
    // 📘 Parse de JSON (espera formato de variáveis com type)
    try {
      const json = JSON.parse(text);

      // 🧩 Compatibilidade com exports antigos (sem wrapper)
      if (Array.isArray(json)) {
        return {
          name: file.name.replace(/\.[^.]+$/, ""),
          variables: json,
        };
      }

      // 🧩 Verifica se é o novo formato correto
      if (json.variables && Array.isArray(json.variables)) {
        return json;
      }

      throw new Error("Arquivo JSON inválido. Esperado campo 'variables'.");
    } catch (e) {
      throw new Error("Arquivo JSON inválido ou mal formatado.");
    }
  } else {
    throw new Error("Formato de arquivo não suportado. Use .env ou .json");
  }

  return {
    name: fileName,
    variables,
  };
}
