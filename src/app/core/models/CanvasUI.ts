import { GridMap } from './GridMap';
import { ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

export class CanvasUI {
  private map: GridMap;
  private canvasEl: ElementRef;
  private readonly form?: FormGroup;
  private readonly canvas?: HTMLCanvasElement;
  private context?: CanvasRenderingContext2D;

  public constructor(map: GridMap, canvasEl: ElementRef, form: FormGroup = null) {
    this.map = map;
    this.canvasEl = canvasEl;
    this.form = form;
    this.canvas = this.canvasEl.nativeElement as HTMLCanvasElement;
    this.init();
  }

  public drawEmptyGrid(map: GridMap = null): void {
    console.log('drawEmptyGrid...');

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
        this.context.fillStyle = (this.map.map[x][y] === 1) ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.9)';
        this.context.fillRect(
          x * this.map.cellWidth,
          y * this.map.cellHeight,
          this.map.cellWidth - 1,
          this.map.cellHeight - 1
        );
      }
    }
  }

  public drawStartPoint(): void {
    this.context.font = 'bold 10px Arial';
    this.context.textAlign = 'center';
    this.context.fillStyle = '#F00';
    this.context.fillText(
      'START',
      (this.map.$pathStart[0] * this.map.cellWidth) + (this.map.cellWidth / 2),
      this.map.$pathStart[1] * this.map.cellHeight + ((this.map.cellHeight / 2) + (10 / 2))
    );
  }

  public drawEndPoint(): void {
    this.context.font = 'bold 10px Arial';
    this.context.fillStyle = '#000';
    this.context.fillText(
      'END',
      (this.map.$pathEnd[0] * this.map.cellWidth) + (this.map.cellWidth / 2),
      this.map.$pathEnd[1] * this.map.cellHeight + ((this.map.cellHeight / 2) + (10 / 2))
    );
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
      const cell = [Math.floor(x / this.map.cellWidth), Math.floor(y / this.map.cellHeight)];

      // now we know while tile we clicked
      console.log(`We clicked ON [x=${cell[0]} y=${cell[1]}]`);
      if (this.form !== null) {
        try {
          if (this.map.$pathStart.length === 0) {
            this.map.setStartPoint(cell);
            this.form.controls.startX.setValue(cell[0]);
            this.form.controls.startY.setValue(cell[1]);
            this.drawStartPoint();
          } else if (this.map.$pathEnd.length === 0) {
            this.map.setEndPoint(cell);
            this.form.controls.endX.setValue(cell[0]);
            this.form.controls.endY.setValue(cell[1]);
            this.drawEndPoint();
          }
        } catch (e) {
          alert(e);
        }

        console.log(this.map.$pathStart);
        console.log(this.map.$pathEnd);
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
}
