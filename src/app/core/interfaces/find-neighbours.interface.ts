import { INode } from './node.interface';

export type FindNeighbours = (
    myN: boolean,
    myS: boolean,
    myE: boolean,
    myW: boolean,
    N: number,
    S: number,
    E: number,
    W: number,
    result: Array<INode>
  ) => Array<INode>;
