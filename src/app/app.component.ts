import { Component, OnInit, ViewChild } from '@angular/core';
import { DataBindingDirective } from '@progress/kendo-angular-grid';
import { process, State } from '@progress/kendo-data-query';
import { employees } from './employees';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);

@Component({
  selector: 'my-app',
  template: `
        <kendo-grid
            [data]="gridView"
            kendoGridSelectBy="id"
            [(selectedKeys)]="mySelection"
            [pageSize]="20"
            [pageable]="true"
            [sortable]="true"
            [groupable]="true"
            [reorderable]="true"
            [resizable]="true"
            (dataStateChange)="handleDataStateChange($event)"
            [height]="400"
            [columnMenu]="{ filter: true }"
        >
        </kendo-grid>
    `,
  styles: [
    `
        .text-bold {
            font-weight: 600;
        }
  `,
  ],
})
export class AppComponent implements OnInit {
  @ViewChild(DataBindingDirective) dataBinding: DataBindingDirective;
  public gridData: any = employees;
  public gridView: any;
  public gridState: State = this.getIntialState();
  public mySelection: string[] = [];

  public ngOnInit(): void {
    this.gridView = this.gridData;
  }
  public getIntialState(): State {
    return {
      filter: {
        logic: 'and',
        filters: [],
      },
      skip: 0,
      take: 10,
      group: [],
      sort: [],
    };
  }

  handleDataStateChange(state: State) {
    this.gridState = state;
    this.gridView = this.customProcess(this.gridData, state);
  }

  public customProcess(data: any, state: State) {
    //converting Amount to float

    const correctedData = data.map((row: any) => {
      let modifiedRow = {
        ...row,
        amount: parseFloat(row.amount),
        date: dayjs(row.transDate, 'MM/DD/YYYY').toDate(),
      };
      return modifiedRow;
    });

    const processedData = process(correctedData, {
      ...state,
      group: [],
      take: correctedData.length,
    });

    let correctProcessedData = {
      ...processedData,
      data: processedData.data.map(
        (proRow: any) =>
          data.find((oriRow: any) => proRow.id === oriRow.id) || {}
      ),
    };

    // Process the grouping

    correctProcessedData = {
      ...correctProcessedData,
      data:
        process(correctProcessedData.data, {
          ...this.getIntialState(),

          group: state.group,

          take: state.take,
        })?.data ?? [],
    };

    return correctProcessedData;
  }
}
