async function exportEnvFile() {
  const groupId = document.getElementById("groupId").value;
  const pat = document.getElementById("pat").value;
  const org = document.getElementById("org").value;
  const project = document.getElementById("project").value;

  const response = await fetch(
    `https://dev.azure.com/${org}/${project}/_apis/distributedtask/variablegroups/${groupId}?api-version=7.1-preview.2`,
    {
      headers: {
        Authorization: `Basic ${btoa(":" + pat)}`
      }
    }
  );

  const data = await response.json();
  const variables = data.variables;

  let envContent = "";
  for (const [key, valueObj] of Object.entries(variables)) {
    envContent += `${key}=${valueObj.value}\n`;
  }

  const blob = new Blob([envContent], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${data.name}.env`;
  link.click();
}

async function importEnvFile(event) {
  const file = event.target.files[0];
  const text = await file.text();
  const lines = text.split('\n').filter(line => line.trim());

  const variables = {};
  for (const line of lines) {
    const [key, value] = line.split('=');
    variables[key.trim()] = {
      value: value.trim(),
      isSecret: false
    };
  }

  // Aqui você pode atualizar ou criar um Variable Group
  // usando um POST ou PUT via Azure DevOps REST API
  // Exemplo de criação:
  const response = await fetch(
    `https://dev.azure.com/${org}/${project}/_apis/distributedtask/variablegroups?api-version=7.1-preview.2`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(":" + pat)}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: "ImportedFromEnv",
        variables
      })
    }
  );
  const result = await response.json();
  alert("Importado com sucesso!");
}
