import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IHeuristic, INode } from './core/interfaces';
import { AStar, UI, Map } from './core/models';
import { HeuristicType } from './core/models/heuristic';
import { HeuristicClass } from './core/models/heuristic/heuristicClass.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, AfterViewInit {
  @ViewChild('canvasEl', {static: false}) public canvasEl: ElementRef;
  public form: FormGroup;
  private $map: Map;
  private $ui: UI;

  public constructor(
    public formBuilder: FormBuilder
  ) {
  }

  public ngOnInit(): void {
    this.buildForm();
    this.$map = new Map();
  }

  public ngAfterViewInit(): void {
    this.$ui = new UI(this.$map, this.canvasEl, this.form);
    this.$ui.drawEmptyGrid();
  }

  get heuristicTypes() {
    return Object.values(HeuristicType);
  }

  get mapSizes() {
    return [16, 20, 30, 40, 50, 100];
  }

  public changeMapSize(): void {
    if (!this.$ui.isRunning) {
      this.$map = new Map(this.form.value.mapSize);
      this.$ui.drawEmptyGrid(this.$map);
    }
  }

  public solveIt(): void {
    if (this.$ui.isRunning ) {
      return;
    }
    this.$ui.isRunning = true;
    const aStar = new AStar(this.$map, this.$ui, this.form.value.squeezing === '0');
    aStar.setHeuristic(new HeuristicClass(this.form.value.heuristic) as IHeuristic);

    try {
      if ((this.$map.startPoint === null) || (this.$map.endPoint === null)) {
        this.$map.setPoints(
          {x: Number(this.form.value.startX), y: Number(this.form.value.startY)} as INode,
          {x: Number(this.form.value.endX), y: Number(this.form.value.endY)} as INode
        );
      }

      aStar.findPath()
        .then(path => {
          this.$map.currentPath = path;
          this.$ui.drawCurrentPath();
        })
        .finally(() => this.$ui.isRunning = false);
    } catch (e) {
      alert(e);
      console.error(e);
      return;
    }
  }

  public clearMap(): void {
    if (this.$ui.isRunning) {
      return;
    }
    this.resetFormPoints();
    this.$map.resetGrid();
    this.$ui.drawEmptyGrid();
  }

  public resetGrid(): void {
    if (this.$ui.isRunning) {
      return;
    }
    this.resetForm();
    this.$map = new Map();
    this.$ui.drawEmptyGrid(this.$map);
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
