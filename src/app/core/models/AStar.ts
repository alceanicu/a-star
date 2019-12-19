import { INode, FindNeighbours, IHeuristic, IPoint } from '../interfaces';
import { Diagonal, Euclidean, Manhattan } from './heuristic';
import { Map, UI } from './';

export class AStar {
  private $map: Map;
  private $ui: UI;
  private readonly $squeezing: boolean;
  private $findNeighbours: FindNeighbours;
  private $heuristic: IHeuristic;
  private $uiTimeOut: number;

  public constructor(map: Map, ui: UI, squeezing: boolean = false, uiTimeOut: number = 50) {
    this.$map = map;
    this.$ui = ui;
    this.$squeezing = squeezing;
    this.$uiTimeOut = uiTimeOut;
    this.setHeuristic(new Manhattan());
  }

  public setHeuristic(heuristic: IHeuristic): void {
    this.$heuristic = heuristic;
  }

  public async findPath(): Promise<Array<INode>> {
    // actually calculate the a-star path!
    // this returns an array of coordinates
    // that is empty if no path is possible
    // create Nodes from the Start and End x,y coordinates
    const startPoint = this.Node(null, {x: this.$map.startPoint.x, y: this.$map.startPoint.y});
    const endPoint = this.Node(null, {x: this.$map.endPoint.x, y: this.$map.endPoint.y});
    // create an array that will contain all world cells
    // tslint:disable-next-line:no-shadowed-variable
    let AStar = new Array(this.$map.mapSize);
    // list of currently open Nodes
    let Open = [startPoint];
    // list of closed Nodes
    let Closed = [];
    // list of the final output array
    const result = [];
    // reference to a Node (that is nearby)
    let currentNodeNeighbours;
    // reference to a Node (that we are considering now)
    let currentNode;
    // reference to a Node (that starts a path in question)
    let myPath;
    // temp integer variables used in the calculations
    let length;
    let max;
    let min;
    let i;
    let j;
    // iterate through the open list until none are left
    // tslint:disable-next-line:no-conditional-assignment
    while (length = Open.length) {
      max = this.$map.mapSize;
      min = -1;
      for (i = 0; i < length; i++) {
        if (Open[i].f < max) {
          max = Open[i].f;
          min = i;
        }
      }
      // grab the next node and remove it from Open array
      currentNode = Open.splice(min, 1)[0];

      // is it the destination node?
      if (currentNode.value === endPoint.value) {
        myPath = Closed[Closed.push(currentNode) - 1];
        do {
          result.push([myPath.x, myPath.y]);
        }
          // tslint:disable-next-line:no-conditional-assignment
        while (myPath = myPath.Parent);
        // clear the working arrays
        AStar = Closed = Open = [];
        // we want to return start to finish
        result.reverse();
      } else {
        // not the destination - find which nearby nodes are walkable
        currentNodeNeighbours = this.getNeighbours(currentNode.x, currentNode.y);
        // test each one that hasn't been tried already
        for (i = 0, j = currentNodeNeighbours.length; i < j; i++) {

          const promise = new Promise((resolve, reject) => {
            setTimeout(() => {
              resolve(this.Node(currentNode, currentNodeNeighbours[i]));
            }, this.$uiTimeOut);
          });

          // wait until the promise returns us a value
          myPath = await promise;
          // myPath = this.Node(currentNode, currentNodeNeighbours[i]);
          if (!AStar[myPath.value]) {
            // estimated cost of this particular route so far
            myPath.g = currentNode.g + this.$heuristic.compare(currentNodeNeighbours[i], currentNode);
            // estimated cost of entire guessed route to the destination
            myPath.f = myPath.g + this.$heuristic.compare(currentNodeNeighbours[i], endPoint);
            // remember this new path for testing above
            Open.push(myPath);
            // mark this node in the world graph as visited
            AStar[myPath.value] = true;

            // check if it is NOT start or end point
            if (this.$ui.compare(currentNodeNeighbours[i], this.$map.startPoint) ||
              this.$ui.compare(currentNodeNeighbours[i], this.$map.endPoint)) {
              // start || end
            } else {
              this.$ui.drawCell(currentNodeNeighbours[i], 'rgba(0, 255, 0, 0.3)');
            }
          }
        }
        // remember this route as having no more untested options
        Closed.push(currentNode);
        this.$ui.drawCell(currentNode, 'rgba(0, 155, 255, 0.3)');
      }
    } // keep iterating until the Open list is empty

    // return result;
    return new Promise((resolve, reject) => {
      resolve(result);
    });
  }

  /**
   * Node function, returns a new object with Node properties used in the calculatePath public to store route costs, etc.
   */
  private Node(Parent?: IPoint, Point?: INode): IPoint {
    return {
      // pointer to another Node object
      Parent,
      // array index of this Node in the world linear array
      value: Point.x + (Point.y * this.$map.mapWidth),
      // the location coordinates of this Node
      x: Point.x,
      y: Point.y,
      // the heuristic estimated cost of an entire path using this node
      f: 0,
      // the distanceFunction cost to get from the starting point to this node
      g: 0
    };
  }


  /**
   * Neighbours functions, used by findNeighbours public to locate adjacent available cells that aren't blocked
   * Returns every available North, South, East or West cell that is empty.
   * No diagonals, unless distanceFunction function is not Manhattan
   */
  private getNeighbours(x, y): Array<IPoint> {
    const N = y - 1;
    const S = y + 1;
    const E = x + 1;
    const W = x - 1;
    const myN = N > -1 && this.canWalkHere(x, N);
    const myS = S < this.$map.mapHeight && this.canWalkHere(x, S);
    const myE = E < this.$map.mapWidth && this.canWalkHere(E, y);
    const myW = W > -1 && this.canWalkHere(W, y);
    let result = [];

    if (myN) {
      result.push({x, y: N});
    }
    if (myE) {
      result.push({x: E, y});
    }
    if (myS) {
      result.push({x, y: S});
    }
    if (myW) {
      result.push({x: W, y});
    }

    // new
    switch (true) {
      case this.$heuristic instanceof Manhattan:
        // dummy
        this.$findNeighbours = this.DiagonalNeighboursDummy;
        break;
      case this.$heuristic instanceof Diagonal:
        if (this.$squeezing) {
          // diagonals allowed but no $squeezing  through cracks:
          this.$findNeighbours = this.DiagonalNeighbours;
        } else {
          // diagonals and $squeezing through cracks allowed:
          this.$findNeighbours = this.DiagonalNeighboursFree;
        }
        break;
      case this.$heuristic instanceof Euclidean:
        if (this.$squeezing) {
          // euclidean but no $squeezing through cracks:
          this.$findNeighbours = this.DiagonalNeighbours;
        } else {
          // euclidean and $squeezing through cracks allowed:
          this.$findNeighbours = this.DiagonalNeighboursFree;
        }
        break;
      default:
        // dummy
        // this.$findNeighbours = this.DiagonalNeighboursDummy;
        break;
    }

    result = this.$findNeighbours(myN, myS, myE, myW, N, S, E, W, result);
    // new

    return result;
  }

  private DiagonalNeighboursDummy(
    myN: boolean,
    myS: boolean,
    myE: boolean,
    myW: boolean,
    N: number,
    S: number,
    E: number,
    W: number,
    result: Array<INode>
  ): Array<INode> {
    // empty
    return result;
  }

  /**
   * returns every available North East, South East, South West or North West cell including the times that
   * you would be $squeezing through a "crack"
   */
  private DiagonalNeighboursFree(
    myN: boolean,
    myS: boolean,
    myE: boolean,
    myW: boolean,
    N: number,
    S: number,
    E: number,
    W: number,
    result: Array<INode>
  ): Array<INode> {
    myN = N > -1;
    myS = S < this.$map.mapHeight;
    myE = E < this.$map.mapWidth;
    myW = W > -1;
    if (myE) {
      if (myN && this.canWalkHere(E, N)) {
        result.push({x: E, y: N});
      }
      if (myS && this.canWalkHere(E, S)) {
        result.push({x: E, y: S});
      }
    }
    if (myW) {
      if (myN && this.canWalkHere(W, N)) {
        result.push({x: W, y: N});
      }
      if (myS && this.canWalkHere(W, S)) {
        result.push({x: W, y: S});
      }
    }

    return result;
  }

  /**
   * Returns every available North East, South East, South West or North West cell
   * no $squeezing through "cracks" between two diagonals
   */
  private DiagonalNeighbours(
    myN: boolean,
    myS: boolean,
    myE: boolean,
    myW: boolean,
    N: number,
    S: number,
    E: number,
    W: number,
    result: Array<INode>
  ): Array<INode> {
    if (myN) {
      if (myE && this.canWalkHere(E, N)) {
        result.push({x: E, y: N});
      }
      if (myW && this.canWalkHere(W, N)) {
        result.push({x: W, y: N});
      }
    }
    if (myS) {
      if (myE && this.canWalkHere(E, S)) {
        result.push({x: E, y: S});
      }
      if (myW && this.canWalkHere(W, S)) {
        result.push({x: W, y: S});
      }
    }

    return result;
  }

  /**
   * returns boolean value (world cell is available and open)
   */
  private canWalkHere(x, y): boolean {
    return ((this.$map.map[x] != null)
      && (this.$map.map[x][y] != null)
      && (this.$map.map[x][y] <= this.$map.maxWalkableTileNum));
  }
}
