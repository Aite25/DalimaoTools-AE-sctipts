function main() {
    ///// info
    var scriptName = "大狸猫box";
    var alertTitle = "大狸猫提示你：";
    this.scriptTitle = "grid by 大狸猫";
    // var curComp = app.project.activeItem;
    // var time = app.project.activeItem.time;
    // var fps = 1/app.project.activeItem.frameDuration;
    // var selectedLayers = app.project.activeItem.selectedLayers;

    this.buildUI = function (thisObj)
    {
        // dockable panel or palette
        var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", this.scriptTitle, undefined, {resizeable:true});
        var columns = 5;
        var column,row;
        var gap = [150,150]
        var gapX = gap[0];
        var gapY = gap[1];
        var count = 10;
        var expbox = 1;

        
        // resource specifications
        var res =
        "group { orientation:'column', alignment:['left','top'], alignChildren:['left','center'], \
            gr1: Group { \
                countSt: StaticText { text:'Counts' ,preferredSize:[50,17]}    \
                countSlider: Slider { alignment:['left','center'], preferredSize:[100,17],minvalue:0 ,maxvalue:100,value:" + columns + " } \
                countEt: EditText { text:" + count + ",alignment:['left','center'], preferredSize:[40,17] } \
                copyBtn: Button { text:'Copy',alignment:['left','top'],preferredSize:[70,17] } \
                expBox: Checkbox { text:'Exp',preferredSize:[60,17],value:1}    \
            }, \
            gr2: Group { \
                columnsSt: StaticText { text:'Columns' ,preferredSize:[50,17]}    \
                columnsSlider: Slider { alignment:['left','center'], preferredSize:[100,17],minvalue:0 ,maxvalue:20,value:" + columns + " } \
                columnsEt: EditText { text:" + columns + ",alignment:['left','center'], preferredSize:[40,17] } \
                alignBtn: Button { text:'Align',alignment:['left','top'],preferredSize:[70,17] } \
            }, \
            gr3: Group { orientation:'row', alignment:['fill','fill'], \
                gapXSt: StaticText { text:'GapX',preferredSize:[50,17] }    \
                gapXSlider: Slider { alignment:['left','center'], preferredSize:[60,17],minvalue:0 ,maxvalue:200,value:" + gapX + " } \
                gapXEt: EditText { text:" + gapX + ",alignment:['left','center'], preferredSize:[40,17] } \
                gapYSt: StaticText { text:'GapY',preferredSize:[50,17] }    \
                gapYSlider: Slider { alignment:['left','center'], preferredSize:[60,17],minvalue:0 ,maxvalue:200,value:" + gapY + " } \
                gapYEt: EditText { text:" + gapY + ",alignment:['left','center'], preferredSize:[40,17] } \
            }, \
        }"; 

        pal.gr = pal.add(res);

        var countSlider = pal.gr.gr1.countSlider;
        var countEt = pal.gr.gr1.countEt;
        var columnsSlider = pal.gr.gr2.columnsSlider;
        var columnsEt = pal.gr.gr2.columnsEt;
        var copyBtn = pal.gr.gr1.copyBtn;
        var gapXSlider = pal.gr.gr3.gapXSlider;
        var gapXEt = pal.gr.gr3.gapXEt;
        var alignBtn = pal.gr.gr2.alignBtn;
        var gapYSlider = pal.gr.gr3.gapYSlider;
        var gapYEt = pal.gr.gr3.gapYEt;
        var expBoxUI = pal.gr.gr1.expBox;

        function align(){
            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            if(secL.length == 1){
                return;
            }
            var indexContinuity = 1;

            // check the continueity
            if(expbox == 1){
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

            // add slider
            if(expbox == 1){

                if(secL[secL.length-1].Effects.property("columns") == null){
                    var colsl = secL[secL.length-1].Effects.addProperty("ADBE Slider Control");
                    colsl.name = "columns";
                }else{
                    var colsl = secL[secL.length-1].Effects.property("columns");
                }
                colsl(1).setValue(columns);

                if(secL[secL.length-1].Effects.property("gapX") == null){
                    var gapslX = secL[secL.length-1].Effects.addProperty("ADBE Slider Control");
                    gapslX.name = "gapX";
                }else{
                    var gapslX = secL[secL.length-1].Effects.property("gapX");
                }
                gapslX(1).setValue(gapX);

                if(secL[secL.length-1].Effects.property("gapY") == null){
                    var gapslY = secL[secL.length-1].Effects.addProperty("ADBE Slider Control");
                    gapslY.name = "gapY";
                }else{
                    var gapslY = secL[secL.length-1].Effects.property("gapY");
                }
                gapslY(1).setValue(gapY);
                gapslY(1).expression = "if(thisProperty.propertyGroup(1).enabled == 1){value;}\nelse{effect(\"gapX\")(\"Slider\");}";

            }

            // align layers
            for(var i = 0;i<secL.length-1;i++){
                // align layers
                column = (i+1)%columns;
                row = Math.floor((i+1)/columns);
                secL[i].position.setValue(secL[secL.length-1].position.value + [column * gap[0],row * gap[1]] );
                if(expbox == 1){
                    
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

        // event callbacks
        pal.onResizing = pal.onResize = function () 
        {
            this.layout.resize();
        }

        // countEt
        countEt.onChange = function () 
        {
            this.text = parseInt(eval(this.text));
            if (isNaN(this.text))
            {
                this.text = 0;
            }
            this.parent.countSlider.value = parseInt(this.text);
            count = parseInt(this.text);
        }

        countSlider.onChange = countSlider.onChanging = function () 
        {
            this.value = Math.round(this.value);
            this.parent.countEt.text = this.value;
            count = Math.round(this.value);
        }

            // columnsEt
        columnsEt.onChange = function () 
        {
            this.text = parseInt(eval(this.text));
            if (isNaN(this.text))
            {
                this.text = 0;
            }
            this.parent.columnsSlider.value = parseInt(this.text);
            columns = parseInt(this.text);
            
            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            if(secL.length>1){
                align();
            }
        }

        columnsSlider.onChange = columnsSlider.onChanging = function () 
        {
            this.value = Math.round(this.value);
            this.parent.columnsEt.text = this.value;
            columns = Math.round(this.value);

            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            if(secL.length>1){
                align();
            }
        }

            // gapX
        gapXEt.onChange = function () 
        {
            this.text = eval(this.text);
            if (isNaN(this.text))
            {
                this.text = 0;
            }
            this.parent.gapXSlider.value = Math.round(this.text);
            gap[0] = parseFloat(this.text);
            gapX = parseFloat(this.text);

            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            if(secL.length>1){
                align();
            }
        }

        gapXSlider.onChange = gapXSlider.onChanging = function () 
        {
            this.value = Math.round(this.value);
            this.parent.gapXEt.text = this.value;  
            gap[0] = this.value;
            gapX = this.value;

            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            if(secL.length>1){
                align();
            }
        }

            // gapY
        gapYEt.onChange = function () 
        {
            this.text = eval(this.text);
            if (isNaN(this.text))
            {
                this.text = 0;
            }
            this.parent.gapYSlider.value = Math.round(this.text);
            gap[1] = parseFloat(this.text);
            gapY = parseFloat(this.text);

            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            if(secL.length>1){
                align();
            }
        }

        gapYSlider.onChange = gapYSlider.onChanging = function () 
        {
            this.value = Math.round(this.value);
            this.parent.gapYEt.text = this.value;  
            gap[1] = this.value;
            gapY = this.value;

            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            if(secL.length>1){
                align();
            }
        }

            // expBoxUI
        expBoxUI.onClick = function () 
        {
            expbox = this.value;
        }

            // copyBtn
        copyBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;

            // add slider
            if(expbox == 1){

                if(secL[secL.length-1].Effects.property("columns") == null){
                    var colsl = secL[secL.length-1].Effects.addProperty("ADBE Slider Control");
                    colsl.name = "columns";
                }else{
                    var colsl = secL[secL.length-1].Effects.property("columns");
                }
                colsl(1).setValue(columns);

                if(secL[secL.length-1].Effects.property("gapX") == null){
                    var gapslX = secL[secL.length-1].Effects.addProperty("ADBE Slider Control");
                    gapslX.name = "gapX";
                }else{
                    var gapslX = secL[secL.length-1].Effects.property("gapX");
                }
                gapslX(1).setValue(gapX);

                if(secL[secL.length-1].Effects.property("gapY") == null){
                    var gapslY = secL[secL.length-1].Effects.addProperty("ADBE Slider Control");
                    gapslY.name = "gapY";
                }else{
                    var gapslY = secL[secL.length-1].Effects.property("gapY");
                }
                gapslY(1).setValue(gapY);
                gapslY(1).expression = "if(thisProperty.propertyGroup(1).enabled == 1){value;}\nelse{effect(\"gapX\")(\"Slider\");}";

            }

            // copy layers
            for(var i = 0;i<count-1;i++){
                var newlayer = secL[secL.length-1].duplicate();
                if(newlayer.Effects.property("columns") != null){
                    newlayer.Effects.property("columns").remove();
                }
                if(newlayer.Effects.property("gapX") != null){
                    newlayer.Effects.property("gapX").remove();
                }
                if(newlayer.Effects.property("gapY") != null){
                    newlayer.Effects.property("gapY").remove();
                }
                newlayer.moveAfter(thisComp.layer(secL[secL.length-1].index + i));
                column = (i+1)%columns;
                row = Math.floor((i+1)/columns);
                newlayer.position.setValue(secL[secL.length-1].position.value + [column * gap[0],row * gap[1]]);
                // set expression
                if(expbox == 1){
                    var idsl = newlayer.Effects.addProperty("ADBE Slider Control");
                    idsl.name = "ID";
                    idsl(1).expression = "id = index - thisComp.layer(\"" + secL[secL.length-1].name + "\").index; \n //id = effect(\"ID\")(\"ADBE Slider Control-0001\");";
                    
                    var colsl = newlayer.Effects.addProperty("ADBE Slider Control");
                    colsl.name = "column";
                    colsl(1).setValue(column);

                    var rowsl = newlayer.Effects.addProperty("ADBE Slider Control");
                    rowsl.name = "row";
                    rowsl(1).setValue(row);
                    newlayer.position.expression = "id = effect(\"ID\")(\"Slider\");\ncolumns = thisComp.layer(\"" + secL[secL.length-1].name + "\").effect(\"columns\")(\"Slider\");\ngapX = thisComp.layer(\"" + secL[secL.length-1].name + "\").effect(\"gapX\")(\"Slider\");\ngapY = thisComp.layer(\"" + secL[secL.length-1].name + "\").effect(\"gapY\")(\"Slider\");\n\ncolumn = id%columns;\nrow = Math.floor(id/columns);\n\n[column * gapX,row * gapY] + thisComp.layer(\"" + secL[secL.length-1].name + "\").position;";
                }
            }
            app.endUndoGroup;
        
        }

        alignBtn.onClick = function () 
        {

            app.beginUndoGroup(scriptName);
            align();
            app.endUndoGroup;
        
        }

        // show user interface
        if (pal instanceof Window)
        {
            pal.center();
            pal.show();
        }
        else
        {
            pal.layout.layout(true);
        }       
    };
    this.run = function (thisObj) 
    {
            this.buildUI(thisObj);
    };
}
new main().run(this)