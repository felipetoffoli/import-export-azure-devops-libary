import * as React from "react";
import { Dialog } from "azure-devops-ui/Dialog";
import { Checkbox } from "azure-devops-ui/Checkbox";
import { Dropdown } from "azure-devops-ui/Dropdown";
import { Button } from "azure-devops-ui/Button";

interface ExportDialogProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (format: "env" | "json", includeSecrets: boolean) => void;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const [format, setFormat] = React.useState<"env" | "json">("env");
  const [includeSecrets, setIncludeSecrets] = React.useState(true);

  if (!visible) return null;

  return (
    <Dialog
      titleProps={{ text: "Exportar variáveis" }}
      onDismiss={onClose}
      footerButtonProps={[
        { text: "Cancelar", onClick: onClose },
        {
          text: "Exportar",
          primary: true,
          onClick: () => onConfirm(format, includeSecrets),
        },
      ]}
    >
      <div style={{ margin: "10px 0" }}>
        <Dropdown
          placeholder="Formato do arquivo"
          ariaLabel="Formato"
          items={[
            { id: "env", text: ".env" },
            { id: "json", text: ".json" },
          ]}
          onSelect={(_, item) => setFormat(item.id as "env" | "json")}
          
          
        />
      </div>

      <Checkbox
        label="Incluir variáveis secretas"
        checked={includeSecrets}
        onChange={(_, checked) => setIncludeSecrets(!!checked)}
      />
    </Dialog>
  );
};
