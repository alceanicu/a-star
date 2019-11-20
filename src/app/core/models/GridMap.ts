export class GridMap {
  private $map?: Array<Array<number>>;

  private readonly $mapWidth: number;
  private readonly $mapHeight: number;
  private readonly $mapSize: number;
  private readonly $wallsProcent: number;
  private readonly $cellWidth: number;
  private readonly $cellHeight: number;

  private $maxWalkableTileNum = 0;

  public $pathStart = [];
  public $pathEnd = [];
  public currentPath = [];

  public constructor(
    mapWidth: number = 16,
    mapHeight: number = 16,
    cellWidth: number = 40,
    cellHeight: number = 40,
    wallsProcent: number = 0.75
  ) {
    this.$mapWidth = mapWidth;
    this.$mapHeight = mapHeight;
    this.$mapSize = mapWidth * mapHeight;

    this.$cellWidth = cellWidth;
    this.$cellHeight = cellHeight;
    this.$wallsProcent = wallsProcent;

    this.generateMap();
  }

  public resetGrid(): void {
    this.$pathStart = [];
    this.$pathEnd = [];
    this.currentPath = [];
  }

  public setStartPoint(cell: Array<number>): void {
    if (this.$map[cell[0]][cell[1]] === 1) {
      throw new Error(`Invalid START point [${cell[0]} ,${cell[1]}]`);
    }
    this.$pathStart = cell;
  }

  public setEndPoint(cell: Array<number>): void {
    if (this.$map[cell[0]][cell[1]] === 1) {
      throw new Error(`Invalid END point [${cell[0]} ,${cell[1]}]`);
    }
    this.$pathEnd = cell;
  }

  public setPoints(pathStart, pathEnd): void {
    if (this.$map[pathStart[0]][pathStart[1]] === 1) {
      throw new Error(`START invalid [${pathStart[0]} ,${pathStart[1]}]`);
    }
    this.$pathStart = pathStart;

    if (this.$map[pathEnd[0]][pathEnd[1]] === 1) {
      throw new Error(`END invalid [${pathEnd[0]} ,${pathEnd[1]}]`);
    }
    this.$pathEnd = pathEnd;
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
