import { INode } from './node.interface';

export interface IPoint extends INode {
  Parent?: IPoint;
  f: number;
  g: number;
  value: number;
  x: number;
  y: number;
}
