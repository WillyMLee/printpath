export type ProjectCheckpoint<T> = {
  id: string;
  projectId: string;
  version: number;
  reason: "created" | "step-complete" | "approved" | "handoff";
  createdAt: string;
  spec: T;
};

export type LocalProject<T> = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  status: "draft" | "approved" | "handed-off";
  draft: T;
  checkpoints: ProjectCheckpoint<T>[];
};

export type ProjectStoreSummary = {
  projectCount: number;
  versionCount: number;
  provider: "Local control tower";
  syncTarget: "Convex-ready";
  lastSavedAt?: string;
};

export interface ProjectStore<T> {
  load(projectId: string): Promise<LocalProject<T> | undefined>;
  saveDraft(projectId: string, title: string, spec: T): Promise<ProjectStoreSummary>;
  checkpoint(projectId: string, title: string, spec: T, reason: ProjectCheckpoint<T>["reason"]): Promise<ProjectStoreSummary>;
  summary(): Promise<ProjectStoreSummary>;
}

const DATABASE_NAME = "printpath-control-tower";
const DATABASE_VERSION = 1;
const PROJECTS_STORE = "projects";

function requestResult<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
  });
}

function transactionDone(transaction: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error("IndexedDB transaction failed."));
    transaction.onabort = () => reject(transaction.error ?? new Error("IndexedDB transaction was aborted."));
  });
}

async function openDatabase() {
  const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);
  request.onupgradeneeded = () => {
    const database = request.result;
    if (!database.objectStoreNames.contains(PROJECTS_STORE)) {
      database.createObjectStore(PROJECTS_STORE, { keyPath: "id" });
    }
  };
  return requestResult(request);
}

async function readAllProjects<T>(database: IDBDatabase) {
  const transaction = database.transaction(PROJECTS_STORE, "readonly");
  const projects = await requestResult(transaction.objectStore(PROJECTS_STORE).getAll()) as LocalProject<T>[];
  await transactionDone(transaction);
  return projects;
}

function makeSummary<T>(projects: LocalProject<T>[], lastSavedAt?: string): ProjectStoreSummary {
  return {
    projectCount: projects.length,
    versionCount: projects.reduce((total, project) => total + project.checkpoints.length, 0),
    provider: "Local control tower",
    syncTarget: "Convex-ready",
    lastSavedAt,
  };
}

class IndexedDbProjectStore<T> implements ProjectStore<T> {
  async load(projectId: string) {
    const database = await openDatabase();
    try {
      const transaction = database.transaction(PROJECTS_STORE, "readonly");
      const project = await requestResult(transaction.objectStore(PROJECTS_STORE).get(projectId)) as LocalProject<T> | undefined;
      await transactionDone(transaction);
      return project;
    } finally {
      database.close();
    }
  }

  async saveDraft(projectId: string, title: string, spec: T) {
    const database = await openDatabase();
    try {
      const existing = await this.readProject(database, projectId);
      const now = new Date().toISOString();
      const project: LocalProject<T> = existing ?? {
        id: projectId,
        title,
        createdAt: now,
        updatedAt: now,
        status: "draft",
        draft: spec,
        checkpoints: [],
      };
      project.title = title || "Untitled project";
      project.updatedAt = now;
      project.draft = spec;
      await this.writeProject(database, project);
      return makeSummary(await readAllProjects<T>(database), now);
    } finally {
      database.close();
    }
  }

  async checkpoint(projectId: string, title: string, spec: T, reason: ProjectCheckpoint<T>["reason"]) {
    const database = await openDatabase();
    try {
      const existing = await this.readProject(database, projectId);
      const now = new Date().toISOString();
      const project: LocalProject<T> = existing ?? {
        id: projectId,
        title,
        createdAt: now,
        updatedAt: now,
        status: "draft",
        draft: spec,
        checkpoints: [],
      };
      const previous = project.checkpoints.at(-1);
      const comparable = JSON.stringify(spec);
      if (!previous || JSON.stringify(previous.spec) !== comparable || previous.reason !== reason) {
        project.checkpoints.push({
          id: crypto.randomUUID(),
          projectId,
          version: project.checkpoints.length + 1,
          reason,
          createdAt: now,
          spec,
        });
      }
      project.title = title || "Untitled project";
      project.updatedAt = now;
      project.draft = spec;
      project.status = reason === "handoff" ? "handed-off" : reason === "approved" ? "approved" : project.status;
      await this.writeProject(database, project);
      return makeSummary(await readAllProjects<T>(database), now);
    } finally {
      database.close();
    }
  }

  async summary() {
    const database = await openDatabase();
    try {
      return makeSummary(await readAllProjects<T>(database));
    } finally {
      database.close();
    }
  }

  private async readProject(database: IDBDatabase, projectId: string) {
    const transaction = database.transaction(PROJECTS_STORE, "readonly");
    const project = await requestResult(transaction.objectStore(PROJECTS_STORE).get(projectId)) as LocalProject<T> | undefined;
    await transactionDone(transaction);
    return project;
  }

  private async writeProject(database: IDBDatabase, project: LocalProject<T>) {
    const transaction = database.transaction(PROJECTS_STORE, "readwrite");
    transaction.objectStore(PROJECTS_STORE).put(project);
    await transactionDone(transaction);
  }
}

export function createProjectStore<T>(): ProjectStore<T> {
  return new IndexedDbProjectStore<T>();
}
