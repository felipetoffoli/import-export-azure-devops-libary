import * as React from "react";
import { Header } from "azure-devops-ui/Header";
import { Page } from "azure-devops-ui/Page";
import { Card } from "azure-devops-ui/Card";
import { Spinner } from "azure-devops-ui/Spinner";
import { MenuButton } from "azure-devops-ui/Menu";
import { showRootComponent } from "../../Common";

import {
  AzureDevOpsService,
  VariableGroup,
} from "./services/AzureDevOpsService";
import { PatTokenDialog } from "./components/PatTokenDialog";

import "./libary-env-tools.scss";

interface IState {
  project?: any;
  variableGroups: VariableGroup[];
  loading: boolean;
  showPatModal: boolean;
  patInput: string;
  savingPat: boolean;
}

class LibraryEnvTools extends React.Component<{}, IState> {
  private adoService = new AzureDevOpsService();

  constructor(props: {}) {
    super(props);
    this.state = {
      variableGroups: [],
      loading: true,
      showPatModal: false,
      patInput: "",
      savingPat: false,
    };
  }

  async componentDidMount(): Promise<void> {
    await this.adoService.init();
    const project = await this.adoService.getProject();
    this.setState({ project });

    const pat = await this.adoService.getUserPat(project.name);
    if (!pat) {
      this.setState({ showPatModal: true });
      return;
    }
    await this.loadVariableGroups(project.name, pat);
  }

  private async loadVariableGroups(projectName: string, pat: string) {
    try {
      this.setState({ loading: true });
      const groups = await this.adoService.getVariableGroups(projectName, pat);
      this.setState({ variableGroups: groups, loading: false });
    } catch (err) {
      console.error("Erro ao carregar Variable Groups:", err);
      this.setState({ loading: false });
    }
  }

  private async savePat() {
    const { project, patInput } = this.state;
    if (!project || !patInput.trim()) return;
    await this.adoService.saveUserPat(project.name, patInput.trim());
    this.setState({ showPatModal: false });
    await this.loadVariableGroups(project.name, patInput.trim());
  }

  private async removePat() {
    const { project } = this.state;
    if (!project) return;
    await this.adoService.removeUserPat(project.name);
    this.setState({ showPatModal: true, patInput: "" });
  }

  render() {
    const { variableGroups, loading, showPatModal, patInput, savingPat } =
      this.state;

    return (
      <Page className="envtools-page flex-grow">
        <Header
          title="Library .env Tools"
          commandBarItems={[
            {
              id: "config",
              text: "Configurar PAT",
              onActivate: () => this.setState({ showPatModal: true }),
              iconProps: { iconName: "Unlock" },
            },
          ]}
        />

        <div className="page-content">
          <Card titleProps={{ text: "Libraries encontradas" }}>
            {loading ? (
              <Spinner label="Carregando Variable Groups..." />
            ) : (
              <table className="library-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Data de Modificação</th>
                    <th>Modificado por</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {variableGroups.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center" }}>
                        Nenhuma Library encontrada.
                      </td>
                    </tr>
                  ) : (
                    variableGroups.map((lib) => (
                      <tr key={lib.id}>
                        <td>{lib.name}</td>
                        <td>
                          {lib.modifiedOn
                            ? new Date(lib.modifiedOn).toLocaleString("pt-BR")
                            : "—"}
                        </td>
                        <td>{lib.modifiedBy?.displayName || "—"}</td>
                        <td style={{ textAlign: "right" }}>
                          <MenuButton
                            iconProps={{ iconName: "MoreVertical" }}
                            contextualMenuProps={{
                              menuProps: {
                                id: `menu-${lib.id}`,
                                items: [
                                  {
                                    id: "edit",
                                    text: "Editar",
                                    onActivate: () =>
                                      alert(`Editar → ${lib.name}`),
                                  },
                                  {
                                    id: "export",
                                    text: "Exportar .env",
                                    onActivate: () =>
                                      alert(`Exportar → ${lib.name}`),
                                  },
                                  {
                                    id: "import",
                                    text: "Import .env (REPLACE)",
                                    onActivate: () =>
                                      alert(`Exportar → ${lib.name}`),
                                  },
                                ],
                              },
                            }}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        {/* Modal para configuração do PAT */}
        <PatTokenDialog
          visible={showPatModal}
          patInput={patInput}
          saving={savingPat}
          onChange={(v) => this.setState({ patInput: v })}
          onSave={() => this.savePat()}
          onCancel={() => this.setState({ showPatModal: false })}
          onRemove={() => this.removePat()}
        />
      </Page>
    );
  }
}

showRootComponent(<LibraryEnvTools />);
