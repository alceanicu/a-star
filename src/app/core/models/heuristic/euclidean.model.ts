import { IHeuristic } from '../../interfaces/heuristic.interface';
import { INode } from '../../interfaces/node.interface';

export class Euclidean implements IHeuristic {
  compare(node: INode, goal: INode): number {
    return Math.sqrt(Math.pow(node.x - goal.x, 2) + Math.pow(node.y - goal.y, 2));
  }
}


