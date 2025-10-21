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
import * as SDK from "azure-devops-extension-sdk";

import {
  AzureDevOpsService,
  getProjectContext,
  VariableGroup,
} from "./services/AzureDevOpsService";
import { PatTokenDialog } from "./components/PatTokenDialog";

import "./libary-env-tools.scss";
import { Dialog } from "azure-devops-ui/Dialog";
import { Checkbox } from "azure-devops-ui/Checkbox";
import { Button } from "azure-devops-ui/Button";
import { importLibrary } from "./utils/importLibary";

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
  showImportModal: boolean;
  fileToImport?: File | null;
  libraryNameInput: string;
  replaceExisting: boolean;
  orgUrl: string;
  forceReplace: boolean;
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
      showImportModal: false,
      fileToImport: null,
      libraryNameInput: "",
      replaceExisting: false,
      orgUrl: "",
      forceReplace: false,
    };
  }

  async componentDidMount(): Promise<void> {
    await this.adoService.init();
    const { project, orgUrl } = await getProjectContext();
    this.setState({ project });
    this.setState({ orgUrl });

    const pat = await this.adoService.getUserPat(project.name);
    if (!pat) {
      this.setState({ showPatModal: true });
      return;
    }
    await this.loadVariableGroups(pat);
  }

  private async loadVariableGroups(pat: string) {
    try {
      this.setState({ loading: true });
      const { project, orgUrl } = this.state;
      const groups = await this.adoService.getVariableGroups(
        project.name,
        orgUrl,
        pat
      );
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
    await this.loadVariableGroups(patInput.trim());
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
    const { project, orgUrl } = this.state;
    if (!project) return;
    // ✅ URL correta para abrir o VariableGroup específico
    const targetUrl = `${orgUrl}/${project.name}/_library?itemType=VariableGroups&variableGroupId=${id}&view=VariableGroupView`;

    window.open(targetUrl, "_blank");
  };

  private async handleExport(
    group: any,
    format: "env" | "json",
    includeSecrets: boolean
  ) {
    const { project, orgUrl } = this.state;
    if (!project) return;

    const pat = await this.adoService.getUserPat(project.name);
    if (!pat) {
      this.setState({ showPatModal: true });
      return;
    }

    await exportLibrary(
      group,
      format,
      includeSecrets,
      project.name,
      orgUrl,
      pat
    );
  }
  private handleFileSelection(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!this.state.forceReplace) {
      const nameWithoutExt = file.name.replace(/\.(env|json)$/i, "");
      this.setState({
        libraryNameInput: nameWithoutExt,
      });
    }
    this.setState({
      fileToImport: file,
    });
  }
  private async handleImportSubmit() {
    const { fileToImport, libraryNameInput, replaceExisting, project, orgUrl } =
      this.state;
    console.log("libraryNameInput", libraryNameInput);

    if (!fileToImport || !project) return;

    try {
      const pat = await this.adoService.getUserPat(project.name);
      if (!pat) {
        this.setState({ showPatModal: true });
        return;
      }

      const result = await importLibrary(
        orgUrl,
        project,
        pat,
        fileToImport,
        replaceExisting,
        false, // ignoreSecrets = false por padrão
        libraryNameInput // 🆕 novo argumento: nome definido no modal
      );

      if (result.replaced) {
        alert(`✅ Library "${libraryNameInput}" substituída com sucesso!`);
      } else if (result.created) {
        alert(`✅ Library "${libraryNameInput}" criada com sucesso!`);
      }

      this.setState({ showImportModal: false });
      await this.loadVariableGroups(pat);
    } catch (err: any) {
      alert(`❌ Erro ao importar: ${err.message}`);
      console.error("Erro no importLibrary:", err);
    } finally {
      this.setState({
        fileToImport: null,
        libraryNameInput: "",
        forceReplace: false,
      });
    }
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "10px",
            }}
          >
            <div style={{ flex: 1, maxWidth: "400px" }}>
              <TextField
                value={search}
                onChange={(_, v) => this.handleSearch(v || "")}
                placeholder="Pesquisar Library..."
              />
            </div>

            <div style={{ paddingTop: "10px" }}>
              <Button
                primary={true}
                iconProps={{ iconName: "Upload" }}
                text="Importar .env / .json"
                onClick={() => this.setState({ 
                  forceReplace: false,
                  libraryNameInput: "",
                  showImportModal: true
                 })}
              />
            </div>
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
                                    onActivate: () => {
                                      this.openLibraryItem(lib.id);
                                    },
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
                                      this.setState({
                                        showImportModal: true,
                                        replaceExisting: true,
                                        forceReplace: true,
                                        libraryNameInput: lib.name,
                                      }),
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
          orgUrl={this.state.orgUrl}
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
        {this.state.showImportModal && (
          <Dialog
            titleProps={{ text: "📥 Importar Library .env / .json" }}
            onDismiss={() =>
              this.setState({
                showImportModal: false,
                forceReplace: false,
                replaceExisting: false,
                libraryNameInput: "",
                fileToImport: null,
              })
            }
            footerButtonProps={[
              {
                text: "Cancelar",
                onClick: () =>
                  this.setState({
                    showImportModal: false,
                    forceReplace: false,
                    replaceExisting: false,
                    libraryNameInput: "",
                    fileToImport: null,
                  }),
              },
              {
                primary: true,
                text: "Importar",
                onClick: () => this.handleImportSubmit(),

                disabled:
                  !this.state.fileToImport ||
                  !this.state.libraryNameInput.trim(),
              },
            ]}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <input
                type="file"
                accept=".env,.json"
                onChange={(e) => this.handleFileSelection(e)}
              />

              <TextField
                value={this.state.libraryNameInput}
                onChange={(_, v) => {
                  if (this.state.forceReplace == false) {
                    this.setState({ libraryNameInput: v });
                  }
                }}
                placeholder="Nome da Library"
                label="Nome da Library"
                required={true}
                disabled={this.state.forceReplace}
              />

              <Checkbox
                checked={this.state.replaceExisting}
                onChange={(_, checked) =>
                  this.setState({ replaceExisting: checked })
                }
                label="Substituir Library existente (REPLACE)"
                disabled={this.state.forceReplace} 
                
              />
            </div>
          </Dialog>
        )}
      </Page>
    );
  }
}

showRootComponent(<LibraryEnvTools />);
