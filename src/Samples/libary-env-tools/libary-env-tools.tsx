import * as React from "react";
import * as SDK from "azure-devops-extension-sdk";
import {
  CommonServiceIds,
  IProjectPageService,
} from "azure-devops-extension-api";

import { Header } from "azure-devops-ui/Header";
import { Page } from "azure-devops-ui/Page";
import { Card } from "azure-devops-ui/Card";
import { MenuButton } from "azure-devops-ui/Menu";
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
}

class LibraryEnvTools extends React.Component<{}, IState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      variableGroups: [],
      loading: true,
    };
  }
  private handleScroll = (): void => {
  const bottom =
    window.innerHeight + window.scrollY >=
    document.body.offsetHeight - 200;

  if (bottom && this.continuationToken && !this.state.loading) {
    console.log("📥 Carregando mais Variable Groups...");
    this.loadVariableGroups(this.state.project?.name, true);
  }
};

  public async componentDidMount(): Promise<void> {
    SDK.init();
    await SDK.ready();

    const projectService = await SDK.getService<IProjectPageService>(
      CommonServiceIds.ProjectPageService
    );
    const project = await projectService.getProject();
    this.setState({ project });

    if (project && project.name) {
      await this.loadVariableGroups(project.name);
    }

    window.addEventListener("scroll", this.handleScroll);

    SDK.notifyLoadSucceeded();
  }
public componentWillUnmount(): void {
  window.removeEventListener("scroll", this.handleScroll);
}

  private continuationToken: string | undefined = undefined;
private isFetching: boolean = false;

private async loadVariableGroups(projectName: string, append = false): Promise<void> {
  try {
    if (this.isFetching) return; // evita requisições simultâneas
    this.isFetching = true;
    this.setState({ loading: true });

    const config = SDK.getConfiguration() as any;
    let orgUrl = "https://dev.azure.com/dr34mt34m";

    if (config?.host?.baseUri) {
      orgUrl = config.host.baseUri.replace(/\/$/, "");
    }

    const pat =
      localStorage.getItem("azdo_pat") ||
      prompt("Digite seu Personal Access Token:") ||
      "";

    const tokenParam = this.continuationToken
      ? `&continuationToken=${encodeURIComponent(this.continuationToken)}`
      : "";

    const url = `${orgUrl}/${projectName}/_apis/distributedtask/variablegroups?api-version=7.0&$top=150${tokenParam}`;
    console.log("🔗 Fetching:", url);

    const res = await fetch(url, {
      headers: {
        Authorization: `Basic ${btoa(":" + pat)}`,
      },
    });

    if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);

    const data = await res.json();
    const newItems = data.value || [];

    // Captura o continuationToken do header
    this.continuationToken = res.headers.get("x-ms-continuationtoken") || undefined;

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




  private handleCreateLibrary = (): void => {
    alert("Criar nova Library (em breve)");
  };

  private handleExportAll = (): void => {
    alert("Exportar todas as Libraries (em breve)");
  };

  private handleImportLibrary = (): void => {
    alert("Importar arquivo .env (em breve)");
  };

  private handleRowAction = (lib: IVariableGroup, action: string): void => {
    alert(`${action} → ${lib.name}`);
  };

  public render(): JSX.Element {
    const { variableGroups, loading } = this.state;

    return (
      <Page className="envtools-page flex-grow">
        <Header
          title="Library .env Tools"
          commandBarItems={[
            {
              id: "create",
              text: "Nova Library",
              onActivate: this.handleCreateLibrary,
              iconProps: { iconName: "Add" },
            },
            {
              id: "import",
              text: "Importar .env",
              onActivate: this.handleImportLibrary,
              iconProps: { iconName: "Upload" },
            },
            {
              id: "export",
              text: "Exportar .env",
              onActivate: this.handleExportAll,
              iconProps: { iconName: "Download" },
            },
          ]}
        />

        <div className="page-content">
          <Card titleProps={{ text: "Libraries encontradas" }}>
            {loading ? (
              <div>Carregando...</div>
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
                                    this.handleRowAction(lib, "Editar"),
                                },
                                {
                                  id: "import",
                                  text: "Importar",
                                  onActivate: () =>
                                    this.handleRowAction(lib, "Importar"),
                                },
                                {
                                  id: "export",
                                  text: "Exportar",
                                  onActivate: () =>
                                    this.handleRowAction(lib, "Exportar"),
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
      </Page>
    );
  }
}

showRootComponent(<LibraryEnvTools />);
