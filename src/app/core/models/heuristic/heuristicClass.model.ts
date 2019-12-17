import { Diagonal, Euclidean, Manhattan } from './';

/**
 * Use ES6 Object Literal Property Value Shorthand to maintain a map
 * where the keys share the same names as the classes themselves
 */
const heuristic = {
  Diagonal,
  Euclidean,
  Manhattan
};

export class HeuristicClass {
    constructor(className: string) {
        return (heuristic[className] !== undefined) ? new heuristic[className]() : new Manhattan();
    }
}
