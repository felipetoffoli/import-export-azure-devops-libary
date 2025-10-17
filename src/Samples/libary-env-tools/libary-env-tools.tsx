import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";
import {
  CommonServiceIds,
  IProjectPageService,
  IExtensionDataService,
  IExtensionDataManager,
} from "azure-devops-extension-api";

import { Header } from "azure-devops-ui/Header";
import { Page } from "azure-devops-ui/Page";
import { Card } from "azure-devops-ui/Card";
import { MenuButton } from "azure-devops-ui/Menu";
import { Button } from "azure-devops-ui/Button";
import { TextField, TextFieldWidth } from "azure-devops-ui/TextField";
import { Spinner } from "azure-devops-ui/Spinner";
import { Dialog } from "azure-devops-ui/Dialog";
import { showRootComponent } from "../../Common";
import "./libary-env-tools.scss";

interface IVariableGroup {
  id: number;
  name: string;
  description?: string;
}

interface IState {
  project?: any;
  variableGroups: IVariableGroup[];
  loading: boolean;
  showPatModal: boolean;
  patInput: string;
  savingPat: boolean;
}

class LibraryEnvTools extends React.Component<{}, IState> {
  private continuationToken: string | undefined = undefined;
  private isFetching: boolean = false;
  private dataMgr?: IExtensionDataManager;

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

  public async componentDidMount(): Promise<void> {
    SDK.init();
    await SDK.ready();

    const projectService = await SDK.getService<IProjectPageService>(
      CommonServiceIds.ProjectPageService
    );
    const project = await projectService.getProject();
    this.setState({ project });

    const dataService = await SDK.getService<IExtensionDataService>(
      CommonServiceIds.ExtensionDataService
    );
    const extContext = SDK.getExtensionContext();
    const accessToken = await SDK.getAccessToken();
    this.dataMgr = await dataService.getExtensionDataManager(
      `${extContext.publisherId}.${extContext.extensionId}`,
      accessToken
    );

    if (project && project.name) {
      await this.loadVariableGroups(project.name);
    }

    SDK.notifyLoadSucceeded();
  }

  private async getUserPat(projectName: string): Promise<string> {
    if (!this.dataMgr) throw new Error("EDS não inicializado");

    const user = SDK.getUser();
    const key = `${projectName}.${user.id}.library.env.tools`;
    const pat = await this.dataMgr.getValue<string>(key);

    if (!pat) {
      this.setState({ showPatModal: true });
      throw new Error("PAT não configurado");
    }

    return pat;
  }

  private async savePat(): Promise<void> {
    try {
      if (!this.state.patInput.trim()) return;
      this.setState({ savingPat: true });

      const user = SDK.getUser();
      const key = `${this.state.project?.name}.${user.id}.library.env.tools`;

      await this.dataMgr?.setValue(key, this.state.patInput.trim());
      console.log("💾 PAT salvo com sucesso!");

      this.setState({
        showPatModal: false,
        savingPat: false,
        patInput: "",
      });

      await this.loadVariableGroups(this.state.project?.name);
    } catch (err) {
      console.error("Erro ao salvar PAT:", err);
      this.setState({ savingPat: false });
    }
  }

  private async resetPat(): Promise<void> {
    try {
      const user = SDK.getUser();
      const key = `${this.state.project?.name}.${user.id}.library.env.tools`;
      await this.dataMgr?.setValue(key, undefined);
      this.setState({ showPatModal: true, patInput: "" });
    } catch (err) {
      console.error("Erro ao resetar PAT:", err);
    }
  }

  private async loadVariableGroups(
    projectName: string,
    append = false
  ): Promise<void> {
    try {
      if (this.isFetching) return;
      this.isFetching = true;
      this.setState({ loading: true });

      const config = SDK.getConfiguration() as any;
      let orgUrl = "https://dev.azure.com/dr34mt34m";

      if (config?.host?.baseUri) {
        orgUrl = config.host.baseUri.replace(/\/$/, "");
      }

      let pat: string;
      try {
        pat = await this.getUserPat(projectName);
      } catch {
        this.setState({ loading: false });
        this.isFetching = false;
        return;
      }

      const tokenParam = this.continuationToken
        ? `&continuationToken=${encodeURIComponent(this.continuationToken)}`
        : "";

      const url = `${orgUrl}/${projectName}/_apis/distributedtask/variablegroups?api-version=7.0&$top=150${tokenParam}`;
      console.log("🔗 Fetching:", url);

      const res = await fetch(url, {
        headers: { Authorization: `Basic ${btoa(":" + pat)}` },
      });

      if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);

      const data = await res.json();
      const newItems = data.value || [];
      this.continuationToken =
        res.headers.get("x-ms-continuationtoken") || undefined;

      this.setState((prev) => ({
        variableGroups: append
          ? [...prev.variableGroups, ...newItems]
          : newItems,
        loading: false,
      }));

      this.isFetching = false;
    } catch (err) {
      console.error("Erro ao carregar Variable Groups:", err);
      this.isFetching = false;
      this.setState({ loading: false });
    }
  }

  public render(): JSX.Element {
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
                    <th>Descrição</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {variableGroups.map((lib) => (
                    <tr key={lib.id}>
                      <td>{lib.name}</td>
                      <td>{lib.description || ""}</td>
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
                                  text: "Exportar",
                                  onActivate: () =>
                                    alert(`Exportar → ${lib.name}`),
                                },
                              ],
                            },
                          }}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </Card>
        </div>

        {showPatModal && (
          <Dialog
            titleProps={{ text: "🔐 Configurar Personal Access Token (PAT)" }}
            onDismiss={() => this.setState({ showPatModal: false })}
            footerButtonProps={[
              {
                text: "Cancelar",
                onClick: () => this.setState({ showPatModal: false }),
              },
              {
                primary: true,
                text: savingPat ? "Salvando..." : "Salvar PAT",
                onClick: () => this.savePat(),
                disabled: !patInput.trim() || savingPat,
              },
            ]}
          >
            <p>
              Informe abaixo o seu <strong>Personal Access Token</strong> do
              Azure DevOps. Ele será salvo com segurança via{" "}
              <em>Extension Data Service</em>.
            </p>
            <TextField
              value={patInput}
              onChange={(_, v) => this.setState({ patInput: v })}
              placeholder="Exemplo: azdopersonalaccesstoken123..."
              width={TextFieldWidth.standard}
            />

            <Button
              subtle={true}
              text="Remover PAT atual"
              iconProps={{ iconName: "Delete" }}
              onClick={() => this.resetPat()}
            />
          </Dialog>
        )}
      </Page>
    );
  }
}

showRootComponent(<LibraryEnvTools />);
