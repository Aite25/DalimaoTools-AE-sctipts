var thisComp = app.project.activeItem;
var secP = thisComp.selectedProperties;
var secL = thisComp.selectedLayers;

var newlayer;
var columns = 8;
var column,row;
var gap = 150;
var count = 30;
var mode = 0;
var expbox = 1;

var indexContinuity = 1;

// check the continueity
if(expbox == 1){
    var idxsave = secL[0].index;
    for(var i = 1;i<secL.length;i++){
        if(Math.abs(idxsave - secL[i].index)>1){
            indexContinuity = 0;
            break;
        }
        idxsave = secL[i].index;
    }
}

app.beginUndoGroup("grid");

// add slider
if(expbox == 1){

    if(secL[secL.length-1].Effects.property("columns") == null){
        var colsl = secL[secL.length-1].Effects.addProperty("ADBE Slider Control");
        colsl.name = "columns";
    }else{
        var colsl = secL[secL.length-1].Effects.property("columns");
    }
    colsl(1).setValue(columns);

    if(secL[secL.length-1].Effects.property("gap") == null){
        var gapsl = secL[secL.length-1].Effects.addProperty("ADBE Slider Control");
        gapsl.name = "gap";
    }else{
        var gapsl = secL[secL.length-1].Effects.property("gap");
    }
    gapsl(1).setValue(gap);

}

// copy layers OR move selected layers to align
if(mode == 0){
    // copy first layer
    for(var i = 0;i<count;i++){
        var newlayer = secL[secL.length-1].duplicate();
        newlayer.moveAfter(thisComp.layer(secL[secL.length-1].index + i));
        column = (i+1)%columns;
        row = Math.floor((i+1)/columns);
        newlayer.position.setValue(secL[secL.length-1].position.value + [column,row] * gap);
        // set expression
        if(expbox == 1){
            var idsl = newlayer.Effects.addProperty("ADBE Slider Control");
            idsl.name = "ID";
            idsl(1).expression = "id = index - thisComp.layer(\"" + secL[secL.length-1].name + "\").index; \n //id = effect(\"ID\")(\"ADBE Slider Control-0001\");";
            newlayer.position.expression = "columns = thisComp.layer(\"" + secL[secL.length-1].name + "\").effect(\"columns\")(\"Slider\");\ngridgap = thisComp.layer(\"" + secL[secL.length-1].name + "\").effect(\"gap\")(\"Slider\");\nid = effect(\"ID\")(\"Slider\");\n\ncolumn = id%columns;\nrow = Math.floor(id/columns);\n\n[column,row] * gridgap + thisComp.layer(\"" + secL[secL.length-1].name + "\").position;";
        }
    }
}else{
    if(secL.length == 1){
        
    }
    for(var i = 0;i<secL.length-1;i++){
        // align layers
        column = (i+1)%columns;
        row = Math.floor((i+1)/columns);
        secL[i].position.setValue(secL[secL.length-1].position.value + [column,row] * gap);
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
            secL[i].position.expression = "columns = thisComp.layer(\"" + secL[secL.length-1].name + "\").effect(\"columns\")(\"Slider\");\ngridgap = thisComp.layer(\"" + secL[secL.length-1].name + "\").effect(\"gap\")(\"Slider\");\nid = effect(\"ID\")(\"Slider\");\n\ncolumn = id%columns;\nrow = Math.floor(id/columns);\n\n[column,row] * gridgap + thisComp.layer(\"" + secL[secL.length-1].name + "\").position;";

        }

    }
}

app.endUndoGroup;