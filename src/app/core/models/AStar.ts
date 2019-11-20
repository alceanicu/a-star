import { FindNeighbours } from '../../core/interfaces/find-neighbours.interface';
import { IHeuristic } from '../../core/interfaces/heuristic.interface';
import { Manhattan } from '../../core/models/heuristic/manhattan.model';
import { INode } from '../../core/interfaces/node.interface';
import { IPoint } from '../../core/interfaces/point.interface';
import { Diagonal } from '../../core/models/heuristic/diagonal.model';
import { Euclidean } from '../../core/models/heuristic/euclidean.model';
import { GridMap } from './new.component';

export class AStar {
  private $gridMap: GridMap;
  private $findNeighbours: FindNeighbours;
  private $heuristic: IHeuristic;
  private $squeezing = false;
  pathStart = [];
  pathEnd = [];

  public constructor(gridMap: GridMap) {
    this.$gridMap = gridMap;
    if (!this.$heuristic) {
      this.setHeuristic(new Manhattan());
    }
  }

  public setHeuristic(heuristic: IHeuristic): void {
    this.$heuristic = heuristic;
  }

  public search($startPosition, $endPosition) {
    return;
  }

  private findPath(): Array<INode> {
    // actually calculate the a-star path!
    // this returns an array of coordinates
    // that is empty if no path is possible
    // create Nodes from the Start and End x,y coordinates
    const myPathStart = this.Node(null, {x: this.pathStart[0], y: this.pathStart[1]});
    const myPathEnd = this.Node(null, {x: this.pathEnd[0], y: this.pathEnd[1]});
    // create an array that will contain all world cells
    // tslint:disable-next-line:no-shadowed-variable
    let AStar = new Array(this.$gridMap.mapSize);
    // list of currently open Nodes
    let Open = [myPathStart];
    // list of closed Nodes
    let Closed = [];
    // list of the final output array
    const result = [];
    // reference to a Node (that is nearby)
    let myNeighbours;
    // reference to a Node (that we are considering now)
    let myNode;
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
      max = this.$gridMap.mapSize;
      min = -1;
      for (i = 0; i < length; i++) {
        if (Open[i].f < max) {
          max = Open[i].f;
          min = i;
        }
      }
      // grab the next node and remove it from Open array
      myNode = Open.splice(min, 1)[0];

      // is it the destination node?
      if (myNode.value === myPathEnd.value) {
        myPath = Closed[Closed.push(myNode) - 1];
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
        myNeighbours = this.Neighbours(myNode.x, myNode.y);
        // test each one that hasn't been tried already
        for (i = 0, j = myNeighbours.length; i < j; i++) {
          myPath = this.Node(myNode, myNeighbours[i]);
          if (!AStar[myPath.value]) {
            // estimated cost of this particular route so far
            // OLD
            // myPath.g = myNode.g + this.distanceFunction(myNeighbours[i], myNode);
            myPath.g = myNode.g + this.$heuristic.compare(myNeighbours[i], myNode);
            // NEW
            // estimated cost of entire guessed route to the destination
            // OLD
            // myPath.f = myPath.g + this.distanceFunction(myNeighbours[i], myPathEnd);
            myPath.f = myPath.g + this.$heuristic.compare(myNeighbours[i], myPathEnd);
            // NEW
            // remember this new path for testing above
            Open.push(myPath);
            // mark this node in the world graph as visited
            AStar[myPath.value] = true;
          }
        }
        // remember this route as having no more untested options
        Closed.push(myNode);
      }
    } // keep iterating until the Open list is empty

    return result;
  }

  /**
   * Node function, returns a new object with Node properties used in the calculatePath public to store route costs, etc.
   */
  private Node(Parent?: IPoint, Point?: INode): IPoint {
    return {
      // pointer to another Node object
      Parent,
      // array index of this Node in the world linear array
      value: Point.x + (Point.y * this.$gridMap.mapWidth),
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
  private Neighbours(x, y): Array<IPoint> {
    const N = y - 1;
    const S = y + 1;
    const E = x + 1;
    const W = x - 1;
    const myN = N > -1 && this.canWalkHere(x, N);
    const myS = S < this.$gridMap.mapHeight && this.canWalkHere(x, S);
    const myE = E < this.$gridMap.mapWidth && this.canWalkHere(E, y);
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

    console.log(`this.heuristic ${this.$heuristic.constructor.name} ... ${this.$squeezing}`);

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
        //
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
    myS = S < this.$gridMap.mapHeight;
    myE = E < this.$gridMap.mapWidth;
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
    return ((this.$gridMap.map[x] != null)
      && (this.$gridMap.map[x][y] != null)
      && (this.$gridMap.map[x][y] <= this.$gridMap.maxWalkableTileNum));
  }
}
