import { IHeuristic, INode } from '../../interfaces';

export class Diagonal implements IHeuristic {
  compare(node: INode, goal: INode): number {
    return Math.max(Math.abs(node.x - goal.x), Math.abs(node.y - goal.y));
  }
}
