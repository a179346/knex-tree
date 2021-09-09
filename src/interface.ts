import { PassThrough } from 'stream';

export interface ITreeLv {
  TreeLv: number;
}

export interface INode<IdType, Model> {
  readonly id: IdType;
  isExist(): Promise<boolean>;
  getData(): Promise<Model | null>;
  getParentData(): Promise<Model | null>;
  getChildrenData(where?: any): Promise<Model[]>;

  isRoot(): Promise<boolean>;
  getPath(): Promise<(Model & ITreeLv)[] | null>;

  hasChild(id: IdType): Promise<Model | null>;
  hasParent(id: IdType): Promise<Model | null>;
  hasAncestor (id: IdType, maxLevel?: number): Promise<(Model & ITreeLv) | null>;
  hasDescendant (id: IdType, maxLevel?: number): Promise<(Model & ITreeLv) | null>;

  getPathUpTo(id: IdType, maxLevel?: number): Promise<(Model & ITreeLv)[] | null>;
  getPathDownTo(id: IdType, maxLevel?: number): Promise<(Model & ITreeLv)[] | null>;

  getDescendants(maxLevel?: number | null, where?: any): Promise<(Model & ITreeLv)[]>;
  getDescendantsInStream(maxLevel?: number | null, where?: any): PassThrough;
}

export interface ITree<IdType, Model> {
  node(id: IdType): INode<IdType, Model>;
  getAllData(): Promise<Model[]>;
}