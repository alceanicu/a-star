import { INode } from './node.interface';

export interface IHeuristic {
  compare(node: INode, goal: INode): number;
}
