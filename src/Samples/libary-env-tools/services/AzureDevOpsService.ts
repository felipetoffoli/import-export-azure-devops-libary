import * as SDK from "azure-devops-extension-sdk";
import {
  CommonServiceIds,
  IProjectPageService,
  IExtensionDataService,
  IExtensionDataManager,
} from "azure-devops-extension-api";

export interface VariableGroup {
  id: number;
  name: string;
  description?: string;
  modifiedOn?: string;
  modifiedBy?: {
    displayName?: string;
    uniqueName?: string;
  };
}

export class AzureDevOpsService {
  private dataMgr?: IExtensionDataManager;

  public async init(): Promise<void> {
    SDK.init();
    await SDK.ready();

    const dataService = await SDK.getService<IExtensionDataService>(
      CommonServiceIds.ExtensionDataService
    );
    const extContext = SDK.getExtensionContext();
    const accessToken = await SDK.getAccessToken();

    this.dataMgr = await dataService.getExtensionDataManager(
      `${extContext.publisherId}.${extContext.extensionId}`,
      accessToken
    );
  }

  public async getProject(): Promise<any> {
    const projectService = await SDK.getService<IProjectPageService>(
      CommonServiceIds.ProjectPageService
    );
    return await projectService.getProject();
  }

  async getUserPat(projectName: string): Promise<string | null> {
    if (!this.dataMgr) throw new Error("EDS não inicializado");

    const user = SDK.getUser();
    const key = `${projectName}.${user.id}.library.env.tools`;

    try {
      const pat = await this.dataMgr.getValue<string>(key);
      return pat ?? null;
    } catch (err: any) {
      if (err?.status === 404) {
        console.warn("🔐 Nenhum PAT encontrado no EDS");
        return null;
      }
      console.error("❌ Erro ao buscar PAT:", err);
      return null;
    }
  }

  public async saveUserPat(projectName: string, pat: string): Promise<void> {
    if (!this.dataMgr) return;
    const user = SDK.getUser();
    const key = `${projectName}.${user.id}.library.env.tools`;
    await this.dataMgr.setValue(key, pat);
  }

  public async removeUserPat(projectName: string): Promise<void> {
    if (!this.dataMgr) return;
    const user = SDK.getUser();
    const key = `${projectName}.${user.id}.library.env.tools`;
    await this.dataMgr.setValue(key, undefined);
  }

  public async getVariableGroups(
    projectName: string,
    pat: string
  ): Promise<VariableGroup[]> {
    const config = SDK.getConfiguration() as any;
    let orgUrl = "https://dev.azure.com/dr34mt34m";
    if (config?.host?.baseUri) {
      orgUrl = config.host.baseUri.replace(/\/$/, "");
    }

    const url = `${orgUrl}/${projectName}/_apis/distributedtask/variablegroups?api-version=7.0&$top=150`;
    const res = await fetch(url, {
      headers: { Authorization: `Basic ${btoa(":" + pat)}` },
    });

    if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);

    const data = await res.json();
    return data.value || [];
  }
  


  
}



