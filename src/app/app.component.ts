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
  doors: boolean = false;
  height: number = 2278;

 

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
    this.dxf.addLayer('SSI_Sysreg-AM_0', 82, 'Continuous');
    this.dxf.addLayer('SSI_Sysreg-AM_1', 83, 'Continuous');
    this.dxf.addLayer('SSI_Sysreg-AM_2', 80, 'Continuous');
    this.dxf.addLayer('SSI_Extras-AM_1', 222, 'Continuous');
    this.dxf.addLayer('whitelines', 7, 'Continuous');
  }

  createFootplateBlock(name:string){
    const footplate = this.dxf.addBlock(name)
    footplate.addArc(point3d(5,5,0),5,180,270);
    footplate.addArc(point3d(5,58,0),5,90,180);
    footplate.addArc(point3d(125,5,0),5,270,0);
    footplate.addArc(point3d(125,58,0),5,0,90);
    footplate.addLine(point3d(0,5,0),point3d(0,58,0));
    footplate.addLine(point3d(5,0,0),point3d(125,0,0));
    footplate.addLine(point3d(130,5,0),point3d(130,58,0));
    footplate.addLine(point3d(5,63,0),point3d(125,63,0));
    footplate.addCircle(point3d(15,31.5,0), 4.5);
    footplate.addLine(point3d(5.75,31.5,0),point3d(24.25,31.5,0));
    footplate.addLine(point3d(15,22.25,0),point3d(15,40.75,0));
    footplate.addCircle(point3d(115,31.5,0), 4.5);
    footplate.addLine(point3d(105.75,31.5,0),point3d(124.25,31.5,0));
    footplate.addLine(point3d(115,22.25,0),point3d(115,40.75,0));
    footplate.addLine(point3d(65,-2,0),point3d(65,65,0));
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
    if(this.doors){
      field.addInsert('accessoriesUp', point3d(0,0,0),{layerName: 'SSI_Extras-AM_1'});
    }  
  }

  createR3kFrameBlock(width: number, depth: number, name: string) {
    const frame = this.dxf.addBlock(name);
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
    frame.addLWPolyline(vertices);
    frame.addLine(point3d(0,60,0),point3d(width,60,0));
    frame.addLine(point3d(0,depth-60,0),point3d(width,depth-60,0));
    frame.addLine(point3d(width/2,-6,0),point3d(width/2,6,0));
    frame.addLine(point3d(width/2,depth-6,0),point3d(width/2,depth+6,0));
    frame.addLine(point3d(-6,41,0),point3d(6,41,0));
    frame.addLine(point3d(width-6,41,0),point3d(width+6,41,0));
    frame.addLine(point3d(-6,depth-41,0),point3d(6,depth-41,0));
    frame.addLine(point3d(width-6,depth-41,0),point3d(width+6,depth-41,0));
    frame.addLine(point3d(-2,0,0),point3d(-2,depth,0),{layerName: 'whitelines'});
    frame.addLine(point3d(width+2,0,0),point3d(width+2,depth,0),{layerName: 'whitelines'});
    frame.addInsert('footplate', point3d(-49.5,-1.5),{layerName: 'SSI_Sysreg-AM_2'});
    frame.addInsert('footplate', point3d(-49.5,depth-61.5),{layerName: 'SSI_Sysreg-AM_2'});
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

  createDoorsBlock(orientation: string, width: number, depth:number, name: string){
    const doors = this.dxf.addBlock(name);
    if(orientation == "down"){
      doors.addLine(point3d(0,0,0),point3d(0,-(width/2),0));
      doors.addLine(point3d(width,0,0),point3d(width,-(width/2),0));
      doors.addArc(point3d(0,0,0),width/2,270,360);
      doors.addArc(point3d(width,0,0),width/2,180,270);
    }
    if(orientation == "up"){
      doors.addLine(point3d(0,depth,0),point3d(0,depth+(width/2),0));
      doors.addLine(point3d(width,depth,0),point3d(width,depth+(width/2),0));
      doors.addArc(point3d(0,depth,0),width/2,0,90);
      doors.addArc(point3d(width,depth,0),width/2,90,180);
    }
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

  createUprightBlock(height:number, name: string){
    const upright = this.dxf.addBlock(name);
    upright.addLine(point3d(0,2,0),point3d(0,height,0));
    upright.addLine(point3d(11,2,0),point3d(11,height,0));
    upright.addLine(point3d(20,2,0),point3d(20,height,0));
    upright.addLine(point3d(31,2,0),point3d(31,height,0));
    upright.addLine(point3d(-17,2,0),point3d(48,2,0));
    upright.addLine(point3d(-17,2,0),point3d(-17,0,0));
    upright.addLine(point3d(48,2,0),point3d(48,0,0));
    upright.addLine(point3d(0,height,0),point3d(11,height,0));
    upright.addLine(point3d(20,height,0),point3d(31,height,0));
    let heightIterator = 9;
    for(let i=0; i<=(height/53); i++){
      upright.addLine(point3d(11,heightIterator,0),point3d(20,heightIterator,0));
      upright.addLine(point3d(11,heightIterator+32,0),point3d(20,heightIterator+32,0));
      upright.addCircle(point3d(15.5,heightIterator+16,0), 4.5);

      upright.addLine(point3d(-1,heightIterator+14,0),point3d(0,heightIterator+14,0));
      upright.addArc(point3d(-1,heightIterator+16,0),2,120,270);
      upright.addLine(point3d(31,heightIterator+14,0),point3d(32,heightIterator+14,0));
      upright.addArc(point3d(32,heightIterator+16,0),2,270,60);

      upright.addLine(point3d(-1,heightIterator+15,0),point3d(0,heightIterator+15,0));
      upright.addArc(point3d(-1,heightIterator+16,0),1,180,270);
      upright.addLine(point3d(-2,heightIterator+16,0),point3d(-2,heightIterator+26,0));
      
      upright.addLine(point3d(31,heightIterator+15,0),point3d(32,heightIterator+15,0));
      upright.addArc(point3d(32,heightIterator+16,0),1,270,360);
      upright.addLine(point3d(33,heightIterator+16,0),point3d(33,heightIterator+26,0));
      
      upright.addLine(point3d(-0.5,heightIterator+16,0),point3d(0,heightIterator+16,0));
      upright.addArc(point3d(-0.5,heightIterator+16.5,0),0.5,180,270);
      upright.addLine(point3d(-1,heightIterator+16.5,0),point3d(-1,heightIterator+26,0));

      upright.addLine(point3d(31,heightIterator+16,0),point3d(31.5,heightIterator+16,0));
      upright.addArc(point3d(31.5,heightIterator+16.5,0),0.5,270,360);
      upright.addLine(point3d(32,heightIterator+16.5,0),point3d(32,heightIterator+26,0));
      
      heightIterator = heightIterator + 53;
    }
  }

  generateDXF() {
   
    this.createFieldBlock(this.fieldWidth, this.fieldDepth, 'A');
    this.createR3kFrameBlock(this.frameWidth, this.fieldDepth, 'Rahmen');
    this.createRowBlock(this.amountFields, 'row');
    this.createSystemBlock(this.amountRows, this.aisleWidth, 'system');
    this.createFootplateBlock('footplate');
    this.createDoorsBlock('down',this.fieldWidth, this.fieldDepth,'accessoriesDown');
    this.createDoorsBlock('up',this.fieldWidth, this.fieldDepth,'accessoriesUp');
    this.createUprightBlock(this.height,'upright');

    this.dxf.addInsert('system', point3d(0, 0, 0), {
      rotationAngle: this.rotationAngle,
      layerName: 'SSI_Sysreg-AM_0',
    });

    this.dxf.addInsert('upright', point3d(-2000, 0, 0), {
      layerName: 'SSI_Sysreg-AM_1',
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
