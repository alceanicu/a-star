import { ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Map } from './Map';
import { INode } from '../interfaces';

export class UI {
  private map: Map;
  private canvasEl: ElementRef;
  private readonly form?: FormGroup;
  private readonly canvas?: HTMLCanvasElement;
  private context?: CanvasRenderingContext2D;
  public isRunning = false;

  public constructor(map: Map, canvasEl: ElementRef, form: FormGroup = null) {
    this.map = map;
    this.canvasEl = canvasEl;
    this.form = form;
    this.canvas = this.canvasEl.nativeElement as HTMLCanvasElement;
    this.init();
  }

  public drawEmptyGrid(map: Map = null): void {
    if (map !== null) {
      this.map = map;
      this.canvas.width = this.map.mapWidth * this.map.cellWidth;
      this.canvas.height = this.map.mapHeight * this.map.cellHeight;
    }

    // clear the screen
    this.context.fillStyle = '#000';
    this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

    for (let x = 0; x < this.map.mapWidth; x++) {
      for (let y = 0; y < this.map.mapHeight; y++) {
        const color = (this.map.map[x][y] === 1) ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)';
        this.drawCell({x, y} as INode, color);
      }
    }
  }

  public drawCell(node: INode, color: string = 'rgba(0, 0, 0, 0.9)'): void {
    this.context.fillStyle = color;
    this.context.fillRect(
      node.x * this.map.cellWidth,
      node.y * this.map.cellHeight,
      this.map.cellWidth - 1,
      this.map.cellHeight - 1
    );
  }

  private drawPoint(
    cell: INode,
    text: string,
    fillStyle: string = '#F00',
    font: string = 'bold 10px Arial',
    textAlign: CanvasTextAlign = 'center'
  ): void {
    this.context.font = font;
    this.context.textAlign = textAlign;
    this.context.fillStyle = fillStyle;
    this.context.fillText(
      text,
      (cell.x * this.map.cellWidth) + (this.map.cellWidth / 2),
      (cell.y * this.map.cellHeight) + ((this.map.cellHeight / 2) + (10 / 2))
    );
  }

  public drawStartPoint(): void {
    this.drawPoint(this.map.startPoint, 'START');
  }

  public drawEndPoint(): void {
    this.drawPoint(this.map.endPoint, 'END', '#000');
  }

  public drawCurrentPath(): void {
    for (let point = 0; point < this.map.currentPath.length; point++) {
      switch (point) {
        case 0: // START Point
          this.drawStartPoint();
          break;
        case this.map.currentPath.length - 1: // END Point
          this.drawEndPoint();
          break;
        default: // PATH NODE
          this.context.beginPath();
          this.context.arc(
            (this.map.currentPath[point][0] * this.map.cellWidth) + (this.map.cellWidth / 2),
            (this.map.currentPath[point][1] * this.map.cellHeight) + ((this.map.cellHeight / 2)),
            5, 0, 2 * Math.PI, false);
          this.context.fillStyle = '#F00';
          this.context.fill();
          break;
      }
    }
  }

  private init(): void {
    this.canvas.width = this.map.mapWidth * this.map.cellWidth;
    this.canvas.height = this.map.mapHeight * this.map.cellHeight;

    this.canvas.addEventListener('click', (e) => {
      if (this.isRunning) {
        return;
      }
      let x;
      let y;
      // grab html page coords
      if (e.pageX !== undefined && e.pageY !== undefined) {
        x = e.pageX;
        y = e.pageY;
      } else {
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
      }

      // make them relative to the canvas only
      x -= this.canvas.offsetLeft;
      y -= this.canvas.offsetTop;

      // return cell [x, y] that we clicked
      const cell = {x: Math.floor(x / this.map.cellWidth), y: Math.floor(y / this.map.cellHeight)} as INode;

      if (this.form !== null) {
        try {
          if (this.map.startPoint === null) {
            this.map.setStartPoint(cell);
            this.form.controls.startX.setValue(cell.x);
            this.form.controls.startY.setValue(cell.y);
            this.drawStartPoint();
          } else if (this.map.endPoint === null) {
            if (this.compare(this.map.startPoint, cell)) {
            // if ((this.map.startPoint.x === cell.x) && (this.map.startPoint.y === cell.y)) {
              throw new Error('Chose a different point for end');
            } else {
              this.map.setEndPoint(cell);
              this.form.controls.endX.setValue(cell.x);
              this.form.controls.endY.setValue(cell.y);
              this.drawEndPoint();
            }
          } else { // change with a new end point
            this.drawEmptyGrid();
            this.map.setStartPoint(this.map.endPoint);
            this.form.controls.startX.setValue(this.map.endPoint.x);
            this.form.controls.startY.setValue(this.map.endPoint.y);
            this.drawStartPoint();

            this.map.setEndPoint(cell);
            this.form.controls.endX.setValue(cell.x);
            this.form.controls.endY.setValue(cell.y);
            this.drawEndPoint();
          }
        } catch (e) {
          console.error(e);
          alert(e);
        }
      }
    }, false);

    if (!this.canvas) {
      throw new Error(`Your browser don't support Canvas!`);
    }

    this.context = this.canvas.getContext('2d');
    if (!this.context) {
      throw new Error(`Your browser don't support Canvas context!`);
    }
  }

  public compare(node: INode, xNode: INode): boolean {
    return (node.x === xNode.x) && (node.y === xNode.y);
  }
}
