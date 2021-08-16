import Knex from 'knex';
import { ITree, INode, ITreeLv } from './interface';

interface KnexTreeOptions {
  db: Knex<any, unknown[]>;
  table: string;
  idColumn: string;
  parentIdColumn: string;
}

export class KnexTree<IdType, Model> implements ITree<IdType, Model> {
  private readonly options: KnexTreeOptions;
  constructor (options: KnexTreeOptions) {
    this.options = options;
  }

  node (id: IdType): INode<IdType, Model> {
    return new KnexNode<IdType, Model>(id, this.options);
  }

  async getAllData (): Promise<Model[]> {
    const result = await this.options.db(this.options.table).select('*');
    return result;
  }
}

export class KnexNode<IdType, Model> implements INode<IdType, Model> {
  public readonly id: IdType;
  private readonly options: KnexTreeOptions;
  constructor (id: IdType, options: KnexTreeOptions) {
    this.id = id;
    this.options = options;
  }

  private makeNode (id: IdType): KnexNode<IdType, Model> {
    return new KnexNode<IdType, Model>(id, this.options);
  }

  private getQuery () {
    const where: any = {};
    where[this.options.idColumn] = this.id;
    return this.options.db(this.options.table).where(where);
  }

  async isExist (): Promise<boolean> {
    const result = await this.getQuery().select(this.options.idColumn).first();
    return !!result;
  }

  async getData (): Promise<Model | null> {
    const result = await this.getQuery().first();
    return result || null;
  }

  async getParentData (): Promise<Model | null> {
    const where: any = {};
    where[`n.${this.options.idColumn}`] = this.id;
    const result = await this.options.db
      .select('p.*')
      .from(`${this.options.table} as p`)
      .join(`${this.options.table} as n`, `p.${this.options.idColumn}`, `n.${this.options.parentIdColumn}`)
      .where(where)
      .first();

    return result || null;
  }

  async getChildrenData (): Promise<Model[] | null> {
    const where: any = {};
    where[this.options.parentIdColumn] = this.id;
    const result = await this.options.db(this.options.table).where(where);
    if (result.length === 0)
      return null;
    return result;
  }

  async isRoot (): Promise<boolean> {
    const result = await this.getQuery()
      .select(this.options.parentIdColumn)
      .first();
    return (result && (result[this.options.parentIdColumn] === null || result[this.options.parentIdColumn] === this.id)) || false;
  }

  async getPath (): Promise<(Model & ITreeLv)[] | null> {
    const result = await this.options.db
      .withRecursive('pt', (qb) => {
        qb.select([ this.options.table + '.*', this.options.db.raw('0 as `TreeLv`') ])
          .from(this.options.table)
          .where(this.options.table + '.' + this.options.idColumn, this.id as unknown as string)
          .union((qb) => {
            qb.select([ 'p.*', this.options.db.raw('`TreeLv` + 1') ])
              .from(this.options.db.raw('`' + this.options.table + '` as `p`, `pt` as `n`'))
              .whereRaw('p.' + this.options.idColumn + ' = n.' + this.options.parentIdColumn)
              .andWhereRaw('p.' + this.options.idColumn + ' != n.' + this.options.idColumn);
          });
      })
      .select('*').from('pt');

    if (!result || result.length === 0)
      return null;
    return result.reverse();
  }

  async hasChild (id: IdType): Promise<Model | null> {
    if (id === this.id) return null;
    const where: any = {};
    where[this.options.idColumn] = id;
    where[this.options.parentIdColumn] = this.id;
    const result = await this.options.db(this.options.table).where(where).first();
    if (!result)
      return null;
    return result;
  }

  async hasParent (id: IdType): Promise<Model | null> {
    if (id === this.id) return null;
    const where: any = {};
    where[`n.${this.options.idColumn}`] = this.id;
    where[`p.${this.options.idColumn}`] = id;
    const result = await this.options.db
      .select('p.*')
      .from(`${this.options.table} as p`)
      .join(`${this.options.table} as n`, `p.${this.options.idColumn}`, `n.${this.options.parentIdColumn}`)
      .where(where)
      .first();

    return result || null;
  }

  async hasAncestor (id: IdType, maxLevel?: number): Promise<(Model & ITreeLv) | null> {
    if (id === this.id) return null;
    const result = await this.getPathUpTo(id, maxLevel);
    if (!result)
      return null;
    return result[result.length - 1];
  }

  async hasDescendant (id: IdType, maxLevel?: number): Promise<(Model & ITreeLv) | null> {
    if (id === this.id) return null;
    const node = this.makeNode(id);
    const result = await node.getPathUpTo(this.id, maxLevel);
    if (!result)
      return null;
    result[0].TreeLv = result[result.length - 1].TreeLv;
    return result[0];
  }

  async getPathUpTo (id: IdType, maxLevel?: number): Promise<(Model & ITreeLv)[] | null> {
    const result = await this.options.db
      .withRecursive('pt', (qb) => {
        qb.select([ this.options.table + '.*', this.options.db.raw('0 as `TreeLv`') ])
          .from(this.options.table)
          .where(this.options.table + '.' + this.options.idColumn, this.id as unknown as string)
          .union((qb) => {
            qb.select([ 'p.*', this.options.db.raw('`TreeLv` + 1') ])
              .from(this.options.db.raw('`' + this.options.table + '` as `p`, `pt` as `n`'))
              .whereRaw('p.' + this.options.idColumn + ' = n.' + this.options.parentIdColumn)
              .andWhereRaw('p.' + this.options.idColumn + ' != n.' + this.options.idColumn)
              .andWhereNot('n.' + this.options.idColumn, id as unknown as string);
            if (maxLevel)
              qb.andWhere('n.TreeLv', '<', maxLevel);
          });
      })
      .select('*').from('pt');

    if (!result || result.length === 0 || result[result.length - 1][this.options.idColumn] != id)
      return null;
    return result;
  }

  async getPathDownTo (id: IdType, maxLevel?: number): Promise<(Model & ITreeLv)[] | null> {
    const node = this.makeNode(id);
    const result = await node.getPathUpTo(this.id, maxLevel);
    if (!result)
      return null;
    let lv = result.length - 1;
    result.forEach((row) => {
      row.TreeLv = lv;
      lv -= 1;
    });
    return result.reverse();
  }

  async getDescendants (maxLevel?: number): Promise<(Model & ITreeLv)[] | null> {
    const result = await this.options.db
      .withRecursive('pt', (qb) => {
        qb.select([ this.options.table + '.*', this.options.db.raw('0 as `TreeLv`') ])
          .from(this.options.table)
          .where(this.options.table + '.' + this.options.idColumn, this.id as unknown as string)
          .union((qb) => {
            qb.select([ 'p.*', this.options.db.raw('`TreeLv` + 1') ])
              .from(this.options.db.raw('`' + this.options.table + '` as `p`, `pt` as `n`'))
              .whereRaw('p.' + this.options.parentIdColumn + ' = n.' + this.options.idColumn)
              .andWhereRaw('p.' + this.options.idColumn + ' != n.' + this.options.idColumn);
            if (maxLevel)
              qb.andWhere('n.TreeLv', '<', maxLevel);
          });
      })
      .select('*').from('pt');

    if (!result || result.length < 1)
      return null;
    result.shift();
    return result;
  }
}