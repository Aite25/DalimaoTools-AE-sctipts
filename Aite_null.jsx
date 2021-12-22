function main() {
    ///// info
    var scriptName = "Null by 大狸猫";
    var alertTitle = "大狸猫提示你：";
    this.scriptTitle = "Null by 大狸猫";

    var guideBox = 0;
    var eachBox = 0;
    var setParentBox = 0;

    function addSolidNull(){
        var thisComp = app.project.activeItem;
        // Add null
        var nullL = thisComp.layers.addNull();
        nullL.label = 9;
        return nullL;
    }

    function addShapeNull(){
        var thisComp = app.project.activeItem;
        // Add shape
        var shape = thisComp.layers.addShape();
        
        // var num = parseInt(shape.name[shape.name.length-1]);
        // shape.name = "S_NULL " + num;
        shape.label = 9;
        var sgroup1 = shape("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
        sgroup1.name = "Retangle 1";
        sgroup1("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");
        // Fill
        var sgroup1S = sgroup1("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Stroke");
        sgroup1S.enabled = 0;
        var sgroup1F = sgroup1("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
        sgroup1F("ADBE Vector Fill Color").setValue([1,1,1,1]);
        sgroup1F.enabled = 0;
        
        return shape;
    }

    function eachAdd(){
        for(var i=0;i<secL.length;i++)
        {
            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            var nullLayer;
            var nullarr = [];

            nullLayer = addSolidNull();
            nullLayer.moveBefore(secL[i]);
            nullLayer.position.setValue( secL[i].position.value );
            // set parent
            // secL[i].parent = nullLayer;
            nullarr.push(nullLayer);
        }

        for(var i=0;i<nullarr.length;i++)
        {
            nullarr[i].selected = 1;
        }
    }

    function addOne(){
        var thisComp = app.project.activeItem;
        var secL = thisComp.selectedLayers;
        var nullLayer;

        nullLayer = addSolidNull();
        var averagePos = [0,0,0];
        var minIndLayer = secL[0];
        for(var i=0;i<secL.length;i++)
        {
            if(minIndLayer.index > secL[i].index){minIndLayer = secL[i];}
            if(secL[i].parent != null){
                averagePos += secL[i].position.value;
            }else{
                continue;
            }
        }
        nullLayer.moveBefore(minIndLayer);
        averagePos = averagePos/secL.length;
        nullLayer.position.setValue(averagePos);
        // set parent
        for(var i=0;i<secL.length;i++)
        {
            if(secL[i].parent == null){
                secL[i].parent = nullLayer;
            }
        }
    }

    function parentChain(){
        var thisComp = app.project.activeItem;
        var secL = thisComp.selectedLayers;

        if(secL.length>1){
            for(var i=0;i<secL.length-1;i++)
            {
                secL[i].parent = secL[i+1];
            }
        }else{
            return;
        }
    }

    this.buildUI = function (thisObj)
    {
        // dockable panel or palette
        var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", this.scriptTitle, undefined, {resizeable:true});
        
        // resource specifications
        var res =
        "group { orientation:'column', alignment:['fill','fill'], alignChildren:['left','top'], \
            gr1: Group { \
                guideBox: Checkbox { text:'Guide',preferredSize:[60,17],value:"+guideBox+"}    \
                eachBox: Checkbox { text:'Each',preferredSize:[60,17],value:"+eachBox+"}    \
                setParentBox: Checkbox { text:'Parent',preferredSize:[60,17],value:"+setParentBox+"}    \
                resetBtn: Button { text:'Reset',alignment:['left','top'], preferredSize:[50,17] } \
            }, \
            gr3: Group { \
                solidNullBtn: Button { text:'Solid Null',alignment:['left','top'], preferredSize:[80,20] } \
                shapeNullBtn: Button { text:'Shape Null',alignment:['left','top'], preferredSize:[80,20] } \
                parentChainBtn: Button { text:'Parent Chain',alignment:['left','top'], preferredSize:[80,20] } \
            }, \
        }"; 
        pal.gr = pal.add(res);

        var guideBox_ = pal.gr.gr1.guideBox;
        var eachBox_ = pal.gr.gr1.eachBox;
        var setParentBox_ = pal.gr.gr1.setParentBox;
        var resetBtn = pal.gr.gr1.resetBtn;

        var solidNullBtn = pal.gr.gr3.solidNullBtn;
        var shapeNullBtn = pal.gr.gr3.shapeNullBtn;
        var parentChainBtn = pal.gr.gr3.parentChainBtn;
        
        // event callbacks
        pal.onResizing = pal.onResize = function () 
        {
            this.layout.resize();
        };

        solidNullBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            var nullL;
            var nullLarr = [];

            // none selected layers
            if(secL.length == 0){
                nullL = addSolidNull();
                nullLarr.push(nullL);
            }else if(secL.length == 1){
                // one selected layer
                nullL = addSolidNull();
                nullL.moveBefore(secL[0]);
                if(secL[0].parent == null){
                    nullL.position.setValue(secL[0].position.value);
                }
                if(setParentBox == 1){
                    if(secL[0].parent == null){
                        secL[0].parent = nullL;
                    }
                }
                nullLarr.push(nullL);
            }else{
                // multi-layers
                if(eachBox == 1){
                    // eachLayer creat one null
                    var secLc = [];
                    for(var i=0;i<secL.length;i++){
                        secLc.push(secL[i]);
                    }

                    if(setParentBox == 1){
                        for(var i=0;i<secLc.length;i++){
                            if(secLc[i].parent == null){
                                // creat null
                                nullL = addSolidNull();
                                // move null
                                nullL.moveBefore(secLc[i]);
                                // set null position
                                if(secLc[i].parent == null){
                                    nullL.position.setValue(secLc[i].position.value);
                                    secLc[i].parent = nullL;
                                }
                                // push null into arr
                                nullLarr.push(nullL);
                            }
                        }
                    }else{
                        for(var i=0;i<secLc.length;i++){
                            nullL = addSolidNull();
                            nullL.moveBefore(secLc[i]);
                            // set position
                            if(secLc[i].parent == null){
                                nullL.position.setValue(secLc[i].position.value);
                            }
                            nullLarr.push(nullL);
                        }
                    }
                }else{
                    // multiLayers creat one null
                    nullL = addSolidNull();
                    // move null layer
                    var minIndL = secL[0];
                    for(var i=1;i<secL.length;i++){
                        if(minIndL > secL[i].index){
                            minIndL = secL[i];
                        }
                    }
                    nullL.moveBefore(minIndL);
                    // null position
                    if(secL[0].parent == null){
                        nullL.position.setValue(secL[0].position.value);
                    }
                    // set parent
                    if(setParentBox == 1){
                        for(var i=0;i<secL.length;i++){
                            if(secL[i].parent == null){
                                secL[i].parent = nullL;
                            }
                        }
                    }
                    // push null into arr
                    nullLarr.push(nullL);
                }
            }

            
            // guide box & select the created null
            for(var i =0;i<nullLarr.length;i++){
                if(guideBox==1){
                    nullLarr[i].guideLayer = 1;
                }
                nullLarr[i].selected = 1;
            }
            app.endUndoGroup;
        };

        shapeNullBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            var nullL;
            var nullLarr = [];

            // none selected layers
            if(secL.length == 0){
                nullL = addShapeNull();
                var num = parseInt(nullL.name.slice(-1));
                nullL.name = "S_NULL " + num;
                nullLarr.push(nullL);
            }else if(secL.length == 1){
                // one selected layer
                nullL = addShapeNull();
                // var num = parseInt(nullL.name.slice(-1));
                // nullL.name = "S_NULL " + num;
                nullL.moveBefore(secL[0]);
                if(secL[0].parent == null){
                    nullL.position.setValue(secL[0].position.value);
                }
                if(setParentBox == 1){
                    if(secL[0].parent == null){
                        secL[0].parent = nullL;
                    }
                }
                nullLarr.push(nullL);
            }else{
                // multi-layers
                if(eachBox == 1){
                    // eachLayer creat one null
                    var secLc = [];
                    for(var i=0;i<secL.length;i++){
                        secLc.push(secL[i]);
                    }

                    if(setParentBox == 1){
                        for(var i=0;i<secLc.length;i++){
                            if(secLc[i].parent == null){
                                // creat null
                                nullL = addShapeNull();
                                // move null
                                nullL.moveBefore(secLc[i]);
                                // set null position
                                if(secLc[i].parent == null){
                                    nullL.position.setValue(secLc[i].position.value);
                                    secLc[i].parent = nullL;
                                }
                                // push null into arr
                                nullLarr.push(nullL);
                            }
                        }
                    }else{
                        for(var i=0;i<secLc.length;i++){
                            nullL = addShapeNull();
                            nullL.moveBefore(secLc[i]);
                            // set position
                            if(secLc[i].parent == null){
                                nullL.position.setValue(secLc[i].position.value);
                            }
                            nullLarr.push(nullL);
                        }
                    }
                }else{
                    // multiLayers creat one null
                    nullL = addShapeNull();
                    // move null layer
                    var minIndL = secL[0];
                    for(var i=1;i<secL.length;i++){
                        if(minIndL > secL[i].index){
                            minIndL = secL[i];
                        }
                    }
                    nullL.moveBefore(minIndL);
                    // null position
                    if(secL[0].parent == null){
                        nullL.position.setValue(secL[0].position.value);
                    }
                    // set parent
                    if(setParentBox == 1){
                        for(var i=0;i<secL.length;i++){
                            if(secL[i].parent == null){
                                secL[i].parent = nullL;
                            }
                        }
                    }
                    // push null into arr
                    nullLarr.push(nullL);
                }
            }

            // change the name & guide box & select the created null
            for(var i =0;i<nullLarr.length;i++){
                var nullnamenum = nullLarr[i].name.match(/\d+$/);
                nullLarr[i].name = 'S_NULL '+ nullnamenum.toString();
                if(guideBox==1){
                    nullLarr[i].guideLayer = 1;
                    nullLarr[i]("ADBE Root Vectors Group")("ADBE Vector Group")("ADBE Vectors Group")("ADBE Vector Graphic - Stroke").enabled = 1;
                    nullLarr[i]("ADBE Root Vectors Group")("ADBE Vector Group")("ADBE Vectors Group")("ADBE Vector Graphic - Stroke")("ADBE Vector Stroke Width").setValue(1);
                }
                nullLarr[i].selected = 1;
            }
            app.endUndoGroup;
        };

        parentChainBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            parentChain();
            app.endUndoGroup;
        };

        // box
        guideBox_.onClick = function () 
        {
            guideBox = this.value;
        }

        eachBox_.onClick = function () 
        {
            eachBox = this.value;
        }

        setParentBox_.onClick = function () 
        {
            setParentBox = this.value;
        }

        resetBtn.onClick = function () 
        {
            guideBox_.value = 0;
            eachBox_.value = 0;
            setParentBox_.value = 0;
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
