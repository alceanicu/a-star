import { IHeuristic } from '../../interfaces/heuristic.interface';
import { INode } from '../../interfaces/node.interface';

export class Diagonal implements IHeuristic {
  compare(node: INode, goal: INode): number {
    return Math.max(Math.abs(node.x - goal.x), Math.abs(node.y - goal.y));
  }
}
