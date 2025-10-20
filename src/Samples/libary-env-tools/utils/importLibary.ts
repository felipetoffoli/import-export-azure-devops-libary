import { parseImportFile } from "./parseImportFile";



interface AzureVariable {
  value?: string;
  isSecret?: boolean;
}

interface VariableGroupPayload {
  name: string;
  type: string;
  variables: Record<string, AzureVariable>;
}

interface VariableGroupPayload {
  name: string;
  type: string;
  variables: Record<string, AzureVariable>;
  variableGroupProjectReferences: {
    name: string;
    projectReference: {
      id: string;
      name: string;
    };
  }[];
}

/**
 * 📤 Faz o import do arquivo (.env ou .json) como Library no Azure DevOps.
 *
 * 🔹 Se `replaceExisting = true`: substitui a Library existente.
 * 🔹 Se `replaceExisting = false` e já existir uma Library com mesmo nome: lança erro.
 * 🔹 Se não existir, cria uma nova Library.
 */
export async function importLibrary(
  orgUrl: string,
  project: any,
  pat: string,
  file: File,
  replaceExisting: boolean,
  ignoreSecrets: boolean,
  libraryNameInput: string
): Promise<{ created: boolean; replaced?: boolean }> {
  const parsed = await parseImportFile(file, ignoreSecrets);

  // 📋 Busca libraries existentes
  const getUrl = `${orgUrl}/${project.name}/_apis/distributedtask/variablegroups?api-version=7.0`;
  const res = await fetch(getUrl, {
    headers: { Authorization: `Basic ${btoa(":" + pat)}` },
  });

  if (!res.ok) throw new Error(`Erro ao buscar libraries: HTTP ${res.status}`);
  const data = await res.json();

  const existing = (data.value || []).find(
    (v: any) => v.name.toLowerCase() === libraryNameInput.toLowerCase()
  );

  // 📦 Monta o payload no formato aceito pelo Azure DevOps
const payload: VariableGroupPayload = {
  name: parsed.name,
  type: "Vsts",
  variables: {},
  variableGroupProjectReferences: [
    {
      name: libraryNameInput.toLocaleUpperCase(),
      projectReference: {
        id: project.id,
        name: project.name,
      },
    },
  ],
};

for (const variable of parsed.variables) {
  payload.variables[variable.name] = {
    value: variable.value,
    isSecret: variable.type === "secret",
  };
}

  if (existing) {
    if (!replaceExisting) {
      // ❌ Caso não possa substituir
      throw new Error(
        `Já existe uma Library com o nome "${libraryNameInput}". Escolha outro nome ou habilite a substituição.`
      );
    }

    // 📝 Atualiza (PUT)
    const updateUrl = `${orgUrl}/${project.name}/_apis/distributedtask/variablegroups/${existing.id}?api-version=7.0`;
    const updateRes = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        Authorization: `Basic ${btoa(":" + pat)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!updateRes.ok) throw new Error(`Erro ao substituir Library: ${updateRes.status}`);
    return { created: false, replaced: true };
  } else {
    // 🆕 Cria nova Library (POST)
    const createUrl = `${orgUrl}/${project.name}/_apis/distributedtask/variablegroups?api-version=7.0`;
    const createRes = await fetch(createUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(":" + pat)}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!createRes.ok) throw new Error(`Erro ao criar Library: ${createRes.status}`);
    return { created: true };
  }
}
