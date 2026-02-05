/*
 * Grid - 网格布局工具
 * 可单独运行，也可被 DalimaoTools 调用
 * Author: 大狸猫
 */

var GridModule = (function() {
    
    var scriptName = "Grid";
    var grid_columns = 5;
    var grid_column, grid_row;
    var grid_gap = [150,150];
    var grid_gapX = grid_gap[0];
    var grid_gapY = grid_gap[1];
    var grid_count = 10;
    var grid_expbox = 1;
    
    function align(){
        var thisComp = app.project.activeItem;
        if(!thisComp) {
            alert("请先选择一个合成！");
            return;
        }
        
        var secL = thisComp.selectedLayers;
        if(secL.length <= 1) return;
        
        var indexContinuity = 1;

        if(grid_expbox == 1){
            var idxarr = [];
            for(var i = 0;i<secL.length;i++){
                idxarr.push(secL[i].index);
            }
            idxarr.sort(function(a, b){return a-b});

            var idxsave = idxarr[0];
            for(var i = 1;i<secL.length;i++){
                if(Math.abs(idxsave - idxarr[i])>1){
                    indexContinuity = 0;
                    break;
                }
                idxsave = idxarr[i];
            }
        }

        if(grid_expbox == 1){
            if(secL[secL.length-1].Effects.property("columns") == null){
                var colsl = secL[secL.length-1].Effects.addProperty("ADBE Slider Control");
                colsl.name = "columns";
            }else{
                var colsl = secL[secL.length-1].Effects.property("columns");
            }
            colsl(1).setValue(grid_columns);

            if(secL[secL.length-1].Effects.property("gapX") == null){
                var gapslX = secL[secL.length-1].Effects.addProperty("ADBE Slider Control");
                gapslX.name = "gapX";
            }else{
                var gapslX = secL[secL.length-1].Effects.property("gapX");
            }
            gapslX(1).setValue(grid_gapX);

            if(secL[secL.length-1].Effects.property("gapY") == null){
                var gapslY = secL[secL.length-1].Effects.addProperty("ADBE Slider Control");
                gapslY.name = "gapY";
            }else{
                var gapslY = secL[secL.length-1].Effects.property("gapY");
            }
            gapslY(1).setValue(grid_gapY);
            gapslY(1).expression = "if(thisProperty.propertyGroup(1).enabled == 1){value;}\nelse{effect(\"gapX\")(\"Slider\");}";
        }

        for(var i = 0;i<secL.length-1;i++){
            grid_column = (i+1)%grid_columns;
            grid_row = Math.floor((i+1)/grid_columns);
            secL[i].position.setValue(secL[secL.length-1].position.value + [grid_column * grid_gap[0],grid_row * grid_gap[1]] );
            
            if(grid_expbox == 1){
                if(secL[i].Effects.property("ID") == null){
                    var idsl = secL[i].Effects.addProperty("ADBE Slider Control");
                    idsl.name = "ID";
                }else{
                    var idsl = secL[i].Effects.property("ID");
                }
                
                if(indexContinuity == 1){
                    idsl(1).expression = "id = Math.abs(index - thisComp.layer(\"" + secL[secL.length-1].name + "\").index); \n //id = effect(\"ID\")(\"ADBE Slider Control-0001\");";
                }else{
                    idsl(1).setValue(i+1);
                }
                secL[i].position.expression = "id = effect(\"ID\")(\"Slider\");\ncolumns = thisComp.layer(\"" + secL[secL.length-1].name + "\").effect(\"columns\")(\"Slider\");\ngapX = thisComp.layer(\"" + secL[secL.length-1].name + "\").effect(\"gapX\")(\"Slider\");\ngapY = thisComp.layer(\"" + secL[secL.length-1].name + "\").effect(\"gapY\")(\"Slider\");\n\ncolumn = id%columns;\nrow = Math.floor(id/columns);\n\n[column * gapX,row * gapY] + thisComp.layer(\"" + secL[secL.length-1].name + "\").position;";
            }
        }
    }
    
    function buildUI(container) {
        var grid_res =
        "group { orientation:'column', alignment:['left','top'], alignChildren:['left','center'], \
            gr1: Group { \
                countSt: StaticText { text:'Counts' ,preferredSize:[50,17]}    \
                countSlider: Slider { alignment:['left','center'], preferredSize:[100,17],minvalue:0 ,maxvalue:100,value:" + grid_count + " } \
                countEt: EditText { text:'" + grid_count + "',alignment:['left','center'], preferredSize:[40,17] } \
                copyBtn: Button { text:'Copy',alignment:['left','top'],preferredSize:[70,17] } \
                expBox: Checkbox { text:'Exp',preferredSize:[60,17],value:1}    \
            }, \
            gr2: Group { \
                columnsSt: StaticText { text:'Columns' ,preferredSize:[50,17]}    \
                columnsSlider: Slider { alignment:['left','center'], preferredSize:[100,17],minvalue:0 ,maxvalue:20,value:" + grid_columns + " } \
                columnsEt: EditText { text:'" + grid_columns + "',alignment:['left','center'], preferredSize:[40,17] } \
                alignBtn: Button { text:'Align',alignment:['left','top'],preferredSize:[70,17] } \
            }, \
            gr3: Group { orientation:'row', alignment:['fill','fill'], \
                gapXSt: StaticText { text:'GapX',preferredSize:[50,17] }    \
                gapXSlider: Slider { alignment:['left','center'], preferredSize:[60,17],minvalue:0 ,maxvalue:200,value:" + grid_gapX + " } \
                gapXEt: EditText { text:'" + grid_gapX + "',alignment:['left','center'], preferredSize:[40,17] } \
                gapYSt: StaticText { text:'GapY',preferredSize:[50,17] }    \
                gapYSlider: Slider { alignment:['left','center'], preferredSize:[60,17],minvalue:0 ,maxvalue:200,value:" + grid_gapY + " } \
                gapYEt: EditText { text:'" + grid_gapY + "',alignment:['left','center'], preferredSize:[40,17] } \
            }, \
        }"; 

        var gr = container.add(grid_res);
        
        gr.gr1.countEt.onChange = function () {
            this.text = parseInt(eval(this.text));
            if (isNaN(this.text)) this.text = 0;
            this.parent.countSlider.value = parseInt(this.text);
            grid_count = parseInt(this.text);
        }

        gr.gr1.countSlider.onChange = gr.gr1.countSlider.onChanging = function () {
            this.value = Math.round(this.value);
            this.parent.countEt.text = this.value;
            grid_count = Math.round(this.value);
        }

        gr.gr2.columnsEt.onChange = function () {
            this.text = parseInt(eval(this.text));
            if (isNaN(this.text)) this.text = 0;
            this.parent.columnsSlider.value = parseInt(this.text);
            grid_columns = parseInt(this.text);
            
            var thisComp = app.project.activeItem;
            if(thisComp){
                var secL = thisComp.selectedLayers;
                if(secL.length>1) align();
            }
        }

        gr.gr2.columnsSlider.onChange = gr.gr2.columnsSlider.onChanging = function () {
            this.value = Math.round(this.value);
            this.parent.columnsEt.text = this.value;
            grid_columns = Math.round(this.value);

            var thisComp = app.project.activeItem;
            if(thisComp){
                var secL = thisComp.selectedLayers;
                if(secL.length>1) align();
            }
        }

        gr.gr3.gapXEt.onChange = function () {
            this.text = eval(this.text);
            if (isNaN(this.text)) this.text = 0;
            this.parent.gapXSlider.value = Math.round(this.text);
            grid_gap[0] = parseFloat(this.text);
            grid_gapX = parseFloat(this.text);

            var thisComp = app.project.activeItem;
            if(thisComp){
                var secL = thisComp.selectedLayers;
                if(secL.length>1) align();
            }
        }

        gr.gr3.gapXSlider.onChange = gr.gr3.gapXSlider.onChanging = function () {
            this.value = Math.round(this.value);
            this.parent.gapXEt.text = this.value;  
            grid_gap[0] = this.value;
            grid_gapX = this.value;

            var thisComp = app.project.activeItem;
            if(thisComp){
                var secL = thisComp.selectedLayers;
                if(secL.length>1) align();
            }
        }

        gr.gr3.gapYEt.onChange = function () {
            this.text = eval(this.text);
            if (isNaN(this.text)) this.text = 0;
            this.parent.gapYSlider.value = Math.round(this.text);
            grid_gap[1] = parseFloat(this.text);
            grid_gapY = parseFloat(this.text);

            var thisComp = app.project.activeItem;
            if(thisComp){
                var secL = thisComp.selectedLayers;
                if(secL.length>1) align();
            }
        }

        gr.gr3.gapYSlider.onChange = gr.gr3.gapYSlider.onChanging = function () {
            this.value = Math.round(this.value);
            this.parent.gapYEt.text = this.value;  
            grid_gap[1] = this.value;
            grid_gapY = this.value;

            var thisComp = app.project.activeItem;
            if(thisComp){
                var secL = thisComp.selectedLayers;
                if(secL.length>1) align();
            }
        }

        gr.gr1.expBox.onClick = function () {
            grid_expbox = this.value;
        }

        gr.gr1.copyBtn.onClick = function () {
            app.beginUndoGroup(scriptName);
            var thisComp = app.project.activeItem;
            if(!thisComp){
                alert("请先选择一个合成！");
                app.endUndoGroup();
                return;
            }
            var secL = thisComp.selectedLayers;
            if(secL.length == 0){
                alert("请先选择图层！");
                app.endUndoGroup();
                return;
            }

            if(grid_expbox == 1){
                if(secL[secL.length-1].Effects.property("columns") == null){
                    var colsl = secL[secL.length-1].Effects.addProperty("ADBE Slider Control");
                    colsl.name = "columns";
                }else{
                    var colsl = secL[secL.length-1].Effects.property("columns");
                }
                colsl(1).setValue(grid_columns);

                if(secL[secL.length-1].Effects.property("gapX") == null){
                    var gapslX = secL[secL.length-1].Effects.addProperty("ADBE Slider Control");
                    gapslX.name = "gapX";
                }else{
                    var gapslX = secL[secL.length-1].Effects.property("gapX");
                }
                gapslX(1).setValue(grid_gapX);

                if(secL[secL.length-1].Effects.property("gapY") == null){
                    var gapslY = secL[secL.length-1].Effects.addProperty("ADBE Slider Control");
                    gapslY.name = "gapY";
                }else{
                    var gapslY = secL[secL.length-1].Effects.property("gapY");
                }
                gapslY(1).setValue(grid_gapY);
                gapslY(1).expression = "if(thisProperty.propertyGroup(1).enabled == 1){value;}\nelse{effect(\"gapX\")(\"Slider\");}";
            }

            for(var i = 0;i<grid_count-1;i++){
                var newlayer = secL[secL.length-1].duplicate();
                if(newlayer.Effects.property("columns") != null) newlayer.Effects.property("columns").remove();
                if(newlayer.Effects.property("gapX") != null) newlayer.Effects.property("gapX").remove();
                if(newlayer.Effects.property("gapY") != null) newlayer.Effects.property("gapY").remove();
                
                newlayer.moveAfter(thisComp.layer(secL[secL.length-1].index + i));
                grid_column = (i+1)%grid_columns;
                grid_row = Math.floor((i+1)/grid_columns);
                newlayer.position.setValue(secL[secL.length-1].position.value + [grid_column * grid_gap[0],grid_row * grid_gap[1]]);
                
                if(grid_expbox == 1){
                    var idsl = newlayer.Effects.addProperty("ADBE Slider Control");
                    idsl.name = "ID";
                    idsl(1).expression = "id = index - thisComp.layer(\"" + secL[secL.length-1].name + "\").index; \n //id = effect(\"ID\")(\"ADBE Slider Control-0001\");";
                    
                    var colsl = newlayer.Effects.addProperty("ADBE Slider Control");
                    colsl.name = "column";
                    colsl(1).setValue(grid_column);

                    var rowsl = newlayer.Effects.addProperty("ADBE Slider Control");
                    rowsl.name = "row";
                    rowsl(1).setValue(grid_row);
                    
                    newlayer.position.expression = "id = effect(\"ID\")(\"Slider\");\ncolumns = thisComp.layer(\"" + secL[secL.length-1].name + "\").effect(\"columns\")(\"Slider\");\ngapX = thisComp.layer(\"" + secL[secL.length-1].name + "\").effect(\"gapX\")(\"Slider\");\ngapY = thisComp.layer(\"" + secL[secL.length-1].name + "\").effect(\"gapY\")(\"Slider\");\n\ncolumn = id%columns;\nrow = Math.floor(id/columns);\n\n[column * gapX,row * gapY] + thisComp.layer(\"" + secL[secL.length-1].name + "\").position;";
                }
            }
            app.endUndoGroup();
        }

        gr.gr2.alignBtn.onClick = function () {
            app.beginUndoGroup(scriptName);
            align();
            app.endUndoGroup();
        }
        
        return gr;
    }
    
    return {
        name: "Grid",
        displayName: "Grid",
        version: "1.0",
        buildUI: buildUI
    };
})();

// 独立运行模式 - 只在非启动器加载时运行
if (!$.global.DALIMAO_LOADER_ACTIVE) {
    // 确保在独立运行时清除标志（防止残留）
    $.global.DALIMAO_LOADER_ACTIVE = undefined;
    
    (function() {
        var win = new Window("palette", "Grid by 大狸猫", undefined, {resizeable:true});
        win.alignChildren = ["fill","top"];
        win.spacing = 10;
        win.margins = 10;
        
        GridModule.buildUI(win);
        
        win.layout.layout(true);
        win.layout.resize();
        win.onResizing = win.onResize = function () { this.layout.resize(); }
        
        if (win instanceof Window) {
            win.center();
            win.show();
        }
    })();
}
