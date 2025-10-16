import * as React from "react";
import { Button } from "azure-devops-ui/Button";
import { Card } from "azure-devops-ui/Card";

export const App: React.FC = () => {
  return (
    <div style={{ padding: 20 }}>
      <Card titleProps={{ text: "Library .env Tools" }}>
        <p>Importe e exporte variáveis como arquivos .env</p>
        <div style={{ display: "flex", gap: 10 }}>
          <Button text="Importar .env" onClick={() => alert("Importar ainda não implementado")} />
          <Button text="Exportar .env" onClick={() => alert("Exportar ainda não implementado")} />
        </div>
      </Card>
    </div>
  );
};
