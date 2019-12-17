import { IHeuristic, INode } from '../../interfaces';

export class Manhattan implements IHeuristic {
  compare(node: INode, goal: INode): number {
    return Math.abs(node.x - goal.x) + Math.abs(node.y - goal.y);
  }
}
