import {INode} from '../interfaces';

export class Map {
  private $map?: Array<Array<number>>;
  private readonly $mapWidth: number;
  private readonly $mapHeight: number;
  private readonly $mapSize: number;
  private readonly $cellWidth: number;
  private readonly $cellHeight: number;
  private readonly $wallsProcent: number;
  private $maxWalkableTileNum = 0;
  private $startPoint?: INode = null;
  private $endPoint?: INode = null;
  private $currentPath = [];

  public constructor(
    cellNumber: number = 16,
    cellSize: number = 40,
    wallsProcent: number = 0.75
  ) {
    this.$mapWidth = cellNumber;
    this.$mapHeight = cellNumber;
    this.$mapSize = cellNumber * cellNumber;

    this.$cellWidth = cellSize;
    this.$cellHeight = cellSize;
    this.$wallsProcent = wallsProcent;

    this.generateMap();
  }

  public resetGrid(): void {
    this.$startPoint = null;
    this.$endPoint = null;
    this.$currentPath = [];
  }

  public setStartPoint(node: INode): void {
    if (this.$map[node.x][node.y] === 1) {
      throw new Error(`Invalid START point [${node.x} ,${node.y}]`);
    }
    this.$startPoint = node;
  }

  public setEndPoint(node: INode): void {
    if (this.$map[node.x][node.y] === 1) {
      throw new Error(`Invalid END point [${node.x} ,${node.y}]`);
    }
    this.$endPoint = node;
  }

  public get startPoint(): INode | null {
    return this.$startPoint;
  }

  public get endPoint(): INode | null {
    return this.$endPoint;
  }

  public setPoints(startNode: INode, endNode: INode): void {
    try {
      this.setStartPoint(startNode);
      this.setEndPoint(endNode);
    } catch (e) {
      throw new Error(e);
    }
  }

  public get map(): Array<Array<number>> {
    return this.$map;
  }

  public get maxWalkableTileNum(): number {
    return this.$maxWalkableTileNum;
  }

  public get mapWidth(): number {
    return this.$mapWidth;
  }

  public get mapHeight(): number {
    return this.$mapHeight;
  }

  public get mapSize(): number {
    return this.$mapSize;
  }

  public get cellWidth(): number {
    return this.$cellWidth;
  }

  public get cellHeight(): number {
    return this.$cellHeight;
  }

  public get currentPath(): Array<any> {
    return this.$currentPath;
  }

  public set currentPath(val: Array<any>) {
    this.$currentPath = val;
  }

  private generateMap() {
    this.$map = [[]];
    for (let x = 0; x < this.$mapWidth; x++) {
      this.$map[x] = [];
      for (let y = 0; y < this.$mapHeight; y++) {
        // generate some walls
        this.$map[x][y] = (Math.random() > this.$wallsProcent) ? 1 : 0;
      }
    }
  }
}
