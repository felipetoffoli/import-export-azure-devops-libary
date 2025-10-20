import * as React from "react";
import { Dialog } from "azure-devops-ui/Dialog";
import { Button } from "azure-devops-ui/Button";
import { TextField, TextFieldWidth } from "azure-devops-ui/TextField";

interface PatTokenDialogProps {
  visible: boolean;
  patInput: string;
  saving: boolean;
  onChange: (val: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onRemove: () => void;
}

export const PatTokenDialog: React.FC<PatTokenDialogProps> = ({
  visible,
  patInput,
  saving,
  onChange,
  onSave,
  onCancel,
  onRemove,
}) => {
  if (!visible) return null;

  return (
    <Dialog
      titleProps={{ text: "🔐 Configurar Personal Access Token (PAT)" }}
      onDismiss={onCancel}
      footerButtonProps={[
        { text: "Cancelar", onClick: onCancel },
        {
          primary: true,
          text: saving ? "Salvando..." : "Salvar PAT",
          onClick: onSave,
          disabled: !patInput.trim() || saving,
        },
      ]}
    >
      <p>
        Informe abaixo o seu <strong>Personal Access Token</strong> do Azure
        DevOps. Ele será salvo com segurança via{" "}
        <em>Extension Data Service</em>.
      </p>

      <TextField
        value={patInput}
        onChange={(_, v) => onChange(v)}
        placeholder="Exemplo: azdopersonalaccesstoken123..."
        width={TextFieldWidth.standard}
      />

      <Button
        subtle
        text="Remover PAT atual"
        iconProps={{ iconName: "Delete" }}
        onClick={onRemove}
      />
    </Dialog>
  );
};
