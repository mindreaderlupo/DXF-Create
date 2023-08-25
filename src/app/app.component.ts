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
  dxf:DxfWriter;

  fieldWidth: number = 994;
  fieldDepth: number = 400;
  amountRows: number = 5;
  amountFields: number = 8;
  rotationAngle: number = 0;
  frameWidth: number = 31;
  aisleWidth: number = 1000;
  rowPattern: string = 'sdds';
  rowDistance: number = 6;

 

  debug(){
    this.initializeDxf();
    this.generateDXF();
  }

  runAndDownload(){
    this.initializeDxf();
    this.generateDXF();
    this.downloadDXF();
  }

  initializeDxf() {
    this.dxfString = '';
    this.dxf = new DxfWriter();
    this.dxf.setUnits(Units.Millimeters);
    //this.dxf.tables.addAppId('PE Configurator');
    this.dxf.addLayer('r3000', Colors.Green, 'Continuous');
  }

  createFootplateBlock(name:string){
    const footplate = this.dxf.addBlock(name)
   
    footplate.addArc(point3d(5,5,0),5,180,270);
    footplate.addArc(point3d(5,58,0),5,90,180);
    footplate.addArc(point3d(125,5,0),5,270,0);
    footplate.addArc(point3d(125,58,0),5,0,90);
    
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
    let doubleRowCount = 1;
    let yMeasure = 0;
    for (let i = 0; i < amountRows; i++) {
      system.addInsert('row', point3d(0, yMeasure, 0));
      yMeasure = yMeasure + this.fieldDepth;
      if (this.rowPattern == 'sdds') {
        if (i == 0 || (i == amountRows - 1 && amountRows % 2 == 0)) {
          pattern.push('single');
          pattern.push('aisle');
          yMeasure = yMeasure + this.aisleWidth;
        } else {
          if(doubleRowCount==1){
            pattern.push('doubleR');
            pattern.push('distance');
            yMeasure = yMeasure + this.rowDistance;
            doubleRowCount++
          } else {
            pattern.push('doubleL');
            pattern.push('aisle');
            yMeasure = yMeasure + this.aisleWidth;
            doubleRowCount = 1;
          }
        }
      }
    }
    console.log(pattern);
    
  }

  generateDXF() {
   
    this.createFieldBlock(this.fieldWidth, this.fieldDepth, 'A');
    this.createFieldBlock(this.frameWidth, this.fieldDepth, 'Rahmen');
    this.createRowBlock(this.amountFields, 'row');
    this.createSystemBlock(this.amountRows, this.aisleWidth, 'system');
    this.createFootplateBlock('footplate');

    this.dxf.addInsert('system', point3d(0, 0, 0), {
      rotationAngle: this.rotationAngle,
      layerName: 'r3000',
    });
    this.dxf.addInsert('footplate', point3d(0, 0, 0))

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
