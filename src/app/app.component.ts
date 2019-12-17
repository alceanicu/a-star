import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AStar, CanvasUI, GridMap } from './core/models';
import { HeuristicType } from './core/models/heuristic';
import { HeuristicClass } from './core/models/heuristic/heuristicClass.model';
import { IHeuristic } from './core/interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('canvasEl', {static: false}) public canvasEl: ElementRef;
  public form: FormGroup;
  private map: GridMap;
  private ui: CanvasUI;

  public constructor(
    public formBuilder: FormBuilder,
  ) {
  }

  public ngOnInit(): void {
    console.log('on ngOnInit');
    this.buildForm();
    this.map = new GridMap();
  }

  public ngAfterViewInit(): void {
    console.log('on ngAfterViewInit');
    this.ui = new CanvasUI(this.map, this.canvasEl, this.form);
    this.ui.drawEmptyGrid();
  }

  get heuristicTypes() {
    return Object.values(HeuristicType);
  }

  get mapSizes() {
    return [16, 20, 30, 40, 50, 100];
  }

  public changeMapSize(): void {
    console.log('on changeMapSize');
    console.log(this.form.value.mapSize);
    this.map = new GridMap(this.form.value.mapSize, this.form.value.mapSize);
    this.ui.drawEmptyGrid(this.map);
  }

  public solveIt(): void {
    console.log('on solveIt');
    const aStar = new AStar(this.map, this.form.value.squeezing === '0');
    aStar.setHeuristic(new HeuristicClass(this.form.value.heuristic) as IHeuristic);

    this.ui.drawEmptyGrid();

    try {
      this.map.setPoints(
        [Number(this.form.value.startX), Number(this.form.value.startY)],
        [Number(this.form.value.endX), Number(this.form.value.endY)]
      );
    } catch (e) {
      alert(e);
      return;
    }

    this.map.currentPath = aStar.findPath();
    console.log(this.map.currentPath);

    this.ui.drawCurrentPath();
  }

  public clearMap(): void {
    this.resetFormPoints();
    this.map.resetGrid();
    this.ui.drawEmptyGrid();
  }

  public resetGrid(): void {
    this.resetForm();
    this.map = new GridMap();
    this.ui.drawEmptyGrid(this.map);
  }

  private resetForm(): void {
    this.form.controls.heuristic.setValue(HeuristicType.MANHATTAN);
    this.form.controls.squeezing.setValue('0');
    this.form.controls.mapSize.setValue(16);
    this.resetFormPoints();
  }

  private resetFormPoints(): void {
    this.form.controls.startX.setValue('');
    this.form.controls.startY.setValue('');
    this.form.controls.endX.setValue('');
    this.form.controls.endY.setValue('');
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      heuristic: [HeuristicType.MANHATTAN, Validators.required],
      squeezing: ['0', Validators.required],
      mapSize: [16, Validators.required],
      startX: ['', Validators.required],
      startY: ['', Validators.required],
      endX: ['', Validators.required],
      endY: ['', Validators.required]
    });
  }
}
