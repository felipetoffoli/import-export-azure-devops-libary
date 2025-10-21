import * as React from "react";
import { Dialog } from "azure-devops-ui/Dialog";
import { Button } from "azure-devops-ui/Button";
import { Icon } from "azure-devops-ui/Icon";
import { Tooltip } from "azure-devops-ui/TooltipEx";

interface PatTokenDialogProps {
  visible: boolean;
  patInput: string;
  saving: boolean;
  onChange: (val: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onRemove: () => void;
  orgUrl: string; // 🆕 URL dinâmica da organização (ex: https://dev.azure.com/dr34mt34m)
}

export const PatTokenDialog: React.FC<PatTokenDialogProps> = ({
  visible,
  patInput,
  saving,
  onChange,
  onSave,
  onCancel,
  onRemove,
  orgUrl,
}) => {
  const [showPassword, setShowPassword] = React.useState(false);

  if (!visible) return null;

  // Monta link para página de criação de PAT
  const patLink = `${orgUrl.replace(/\/$/, "")}/_usersSettings/tokens`;

  // Texto do tooltip
  const tooltipText = `Como gerar seu PAT:

1️⃣ Vá em Azure DevOps → Perfil → Personal Access Tokens
2️⃣ Clique em "New Token"
3️⃣ Em Scopes, selecione:
   🔹 Variable Groups - Read, Create, & Manage
4️⃣ Copie o token e cole aqui.

💡 Clique para abrir a página de criação de PAT.`;

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

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          marginTop: "10px",
        }}
      >
        {/* Campo do PAT */}
        <input
          type={showPassword ? "text" : "password"}
          value={patInput}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Exemplo: azdopersonalaccesstoken123..."
          style={{
            width: "100%",
            padding: "6px 60px 6px 10px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontSize: "13px",
            fontFamily: "monospace",
          }}
        />

        {/* 👁️ Mostrar/ocultar token */}
        <Icon
          iconName={showPassword ? "EyeOff" : "Eye"}
          style={{
            position: "absolute",
            right: "34px",
            cursor: "pointer",
            color: "#0078d4",
          }}
          onClick={() => setShowPassword(!showPassword)}
          title={showPassword ? "Ocultar token" : "Mostrar token"}
        />

        {/* ℹ️ Tooltip com link dinâmico */}
        <Tooltip delayMs={500} text={tooltipText}>
          <div
            onClick={() => window.open(patLink, "_blank")}
            style={{
              position: "absolute",
              right: "8px",
              cursor: "pointer",
              color: "#0078d4",
              display: "flex",
              alignItems: "center",
            }}
            title="Abrir página de criação de PAT"
          >
            <Icon iconName="Info" />
          </div>
        </Tooltip>
      </div>

      <div style={{ marginTop: "12px" }}>
        <Button
          subtle
          text="Remover PAT atual"
          iconProps={{ iconName: "Delete" }}
          onClick={onRemove}
        />
      </div>
    </Dialog>
  );
};
