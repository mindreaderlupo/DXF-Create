import { Component } from '@angular/core';
import {
  DxfWriter,
  point3d,
  point2d,
  Units,
  Colors,
  LayerFlags,
  Image,
  DxfObject,
  TextHorizontalAlignment,
  TextVerticalAlignment,
} from '@tarikjabiri/dxf';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  dxfString = '';
  dxf = new DxfWriter();

  fieldWidth: number = 994;
  fieldDepth: number = 400;
  amountRows: number = 5;
  amountFields: number = 8;
  rotationAngle: number = 0;
  frameWidth: number = 31;
  aisleWidth: number = 1000;
  rowPattern: string = 'sdd';

  initializeDxf() {
    this.dxf.setUnits(Units.Millimeters);
    this.dxf.tables.addAppId('PE Configurator');
    this.dxf.addLayer('r3000', Colors.Green, 'Continuous');
  }

  createFieldBlock(width: number, depth: number, name: string) {
    const field = this.dxf.addBlock(name);
    const vertices = [
      {
        point: point2d(0, 0),
      },
      {
        point: point2d(width, 0),
      },
      {
        point: point2d(width, depth),
      },
      {
        point: point2d(0, depth),
      },
      {
        point: point2d(0, 0),
      },
    ];
    field.addLWPolyline(vertices);
    field.setLayerName('r3000');
    return field;
  }

  createRowBlock(amountFields: number, name: string) {
    const row = this.dxf.addBlock(name);
    row.addInsert('Rahmen', point3d(0, 0, 0));
    for (let i = 0; i < amountFields; i++) {
      row.addInsert(
        'A',
        point3d(this.frameWidth * (i + 1) + this.fieldWidth * i, 0, 0)
      );
      row.addInsert(
        'Rahmen',
        point3d(this.frameWidth * (i + 1) + this.fieldWidth * (i + 1), 0, 0)
      );
    }
    return row;
  }

  createSystemBlock(amountRows: number, aisleWidth: number, name: string) {
    const system = this.dxf.addBlock(name);
    let pattern = [];
    for (let i = 0; i < amountRows; i++) {
      if (this.rowPattern == 'sdds') {
        if (i == 0 || (i == amountRows - 1 && amountRows % 2 == 0)) {
          pattern.push('s');
        } else {
          pattern.push('d');
        }
      }
    }
    console.log(pattern);
    let yMeasure = 0;
    for (let i = 0; i < amountRows; i++) {
      system.addInsert('row', point3d(0, yMeasure, 0));
      yMeasure = yMeasure + this.fieldDepth;
      if (this.rowPattern == 's') {
        yMeasure = yMeasure + this.aisleWidth;
      }
      if (this.rowPattern[i] == 'd') {
        yMeasure = yMeasure + 6;
        system.addInsert('row', point3d(0, yMeasure, 0));
        yMeasure = yMeasure + this.fieldDepth;
      }
    }
  }

  generateDXF() {
    /*
    
    const myBlock2 = dxf.addBlock('myBlock2');
    myBlock2.setLayerName('r3000'); // Layer zuweisung
    myBlock2.addLine(point3d(-100, 10, 0), point3d(0, 20, 0));

    dxf.addInsert(myBlock2.name, point3d(0, 0, 0));
   // dxf.addInsert(fieldA.name, point3d(0, 0, 0));
   // dxf.addInsert(fieldA.name, point3d(0, -1000, 0));
    dxf.addInsert(row.name, point3d(0, 0, 0));
    dxf.addInsert(row.name, point3d(0, 1400, 0));
    dxf.addInsert(row.name, point3d(0, 1830, 0));
*/
    this.createFieldBlock(this.fieldWidth, this.fieldDepth, 'A');
    this.createFieldBlock(this.frameWidth, this.fieldDepth, 'Rahmen');
    this.createRowBlock(this.amountFields, 'row');
    this.createSystemBlock(this.amountRows, this.aisleWidth, 'system');

    this.dxf.addInsert('system', point3d(0, 0, 0), {
      rotationAngle: this.rotationAngle,
      layerName: 'r3000',
    });

    this.dxfString = this.dxf.stringify();
  }

  downloadDXF() {
    // Erstelle einen Blob aus dem DXF-String
    let dxfString = this.dxfString;
    const blob = new Blob([dxfString], { type: 'application/dxf' });

    // Erzeuge eine URL für den Blob
    const url = URL.createObjectURL(blob);

    // Erstelle einen versteckten Anker-Tag und löse den Download aus
    const a = document.createElement('a');
    a.href = url;
    a.download = 'file.dxf';
    document.body.appendChild(a);
    a.click();

    // Entferne den Anker-Tag und gib die URL frei
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
