export async function exportLibrary(
  group: any,
  format: "env" | "json",
  includeSecrets: boolean,
  projectName: string,
  orgUrl: string,
  pat: string
) {
  const url = `${orgUrl}/${projectName}/_apis/distributedtask/variablegroups/${group.id}?api-version=7.0`;

  const res = await fetch(url, {
    headers: { Authorization: `Basic ${btoa(":" + pat)}` },
  });

  if (!res.ok) {
    alert("Erro ao exportar variáveis.");
    return;
  }

  const data = await res.json();
  const variables = data.variables || {};

  let output: string;

  if (format === "env") {
    // 🔹 Formato .env
    output = Object.entries(variables)
      .map(([key, val]: any) => {
        if (val.isSecret && !includeSecrets) return `# ${key}=`;
        const value = val.isSecret ? "" : val.value ?? "";
        return `${key}=${value}`;
      })
      .join("\n");
  } else {
    // 🔹 Formato JSON no padrão esperado pelo importLibrary()
    const json = {
      name: group.name,
      variables: Object.entries(variables).map(([key, val]: any) => ({
        name: key,
        value: val.isSecret && !includeSecrets ? "" : val.value ?? "",
        type: val.isSecret ? "secret" : "normal",
      })),
    };

    output = JSON.stringify(json, null, 2); // formata com indentação
  }

  // 💾 Cria o download
  const blob = new Blob([output], {
    type: format === "json" ? "application/json" : "text/plain",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${group.name}.${format}`;
  link.click();
}
