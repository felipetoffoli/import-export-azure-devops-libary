import * as React from "react";
import { Header } from "azure-devops-ui/Header";
import { Page } from "azure-devops-ui/Page";
import { Card } from "azure-devops-ui/Card";
import { Spinner } from "azure-devops-ui/Spinner";
import { MenuButton } from "azure-devops-ui/Menu";
import { TextField } from "azure-devops-ui/TextField";
import { showRootComponent } from "../../Common";
import { ExportDialog } from "./components/ExportDialog";
import { exportLibrary } from "./utils/exportLibrary";

import {
  AzureDevOpsService,
  VariableGroup,
  
} from "./services/AzureDevOpsService";
import { PatTokenDialog } from "./components/PatTokenDialog";

import "./libary-env-tools.scss";

interface IState {
  project?: any;
  variableGroups: VariableGroup[];
  filteredGroups: VariableGroup[];
  loading: boolean;
  showPatModal: boolean;
  patInput: string;
  savingPat: boolean;
  search: string;
  showExportModal: boolean;
  selectedGroup?: VariableGroup;
}

class LibraryEnvTools extends React.Component<{}, IState> {
  private adoService = new AzureDevOpsService();

  constructor(props: {}) {
    super(props);
    this.state = {
      variableGroups: [],
      filteredGroups: [],
      loading: true,
      showPatModal: false,
      patInput: "",
      savingPat: false,
      search: "",
      showExportModal: false,
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
      this.setState({
        variableGroups: groups,
        filteredGroups: groups,
        loading: false,
      });
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

  private handleSearch = (value: string): void => {
    const search = value.toLowerCase();
    const filtered = this.state.variableGroups.filter((v) =>
      v.name.toLowerCase().includes(search)
    );
    this.setState({ search: value, filteredGroups: filtered });
  };

  public openLibraryItem = (id: number): void => {
    const { project } = this.state;
    if (!project) return;

    const orgUrl = "https://dev.azure.com/dr34mt34m";
    // ✅ URL correta para abrir o VariableGroup específico
    const targetUrl = `${orgUrl}/${project.name}/_library?itemType=VariableGroups&variableGroupId=${id}&view=VariableGroupView`;

    window.open(targetUrl, "_blank");
  };

private async handleExport(group: any, format: "env" | "json", includeSecrets: boolean) {
  const { project } = this.state;
  if (!project) return;

  const pat = await this.adoService.getUserPat(project.name);
  if (!pat) {
    this.setState({ showPatModal: true });
    return;
  }

  await exportLibrary(group, format, includeSecrets, project.name, pat);
}

  render() {
    const {
      filteredGroups,
      loading,
      showPatModal,
      patInput,
      savingPat,
      search,
    } = this.state;

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
          <div style={{ marginBottom: "10px", maxWidth: "400px" }}>
            <TextField
              value={search}
              onChange={(_, v) => this.handleSearch(v || "")}
              placeholder="Pesquisar Library..."
              maxWidth={400}
            />
          </div>
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
                  {filteredGroups.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ textAlign: "center" }}>
                        Nenhuma Library encontrada.
                      </td>
                    </tr>
                  ) : (
                    filteredGroups.map((lib) => (
                      <tr key={lib.id}>
                        <td>
                          <a
                            href={`https://dev.azure.com/dr34mt34m/${this.state.project?.name}/_library?itemType=VariableGroups&variableGroupId=${lib.id}&view=VariableGroupView`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "#222",
                              textDecoration: "none",
                              fontWeight: 500,
                              cursor: "pointer",
                              display: "inline-block",
                              width: "100%",
                            }}
                            title="Abrir na Library original"
                          >
                            {lib.name}
                          </a>
                        </td>

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
                                    text: "Editar (abrir Library)",
                                    onActivate: () =>
                                      this.openLibraryItem(lib.id),
                                  },
                                  {
                                    id: "export",
                                    text: "Exportar .env / .json",
                                    onActivate: () =>
                                      this.setState({
                                        selectedGroup: lib,
                                        showExportModal: true,
                                      }),
                                  },

                                  {
                                    id: "import",
                                    text: "Import .env (REPLACE)",
                                    onActivate: () =>
                                      alert(`Importar → ${lib.name}`),
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
        <ExportDialog
          visible={this.state.showExportModal}
          onClose={() => this.setState({ showExportModal: false })}
          onConfirm={(format, includeSecrets) => {
            if (this.state.selectedGroup) {
              this.handleExport(
                this.state.selectedGroup,
                format,
                includeSecrets
              );
              this.setState({ showExportModal: false });
            }
          }}
        />
      </Page>
    );
  }
}

showRootComponent(<LibraryEnvTools />);
