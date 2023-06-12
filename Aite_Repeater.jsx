
function main() {
    ///// info
    var scriptName = "inOuts by 大狸猫";
    var alertTitle = "大狸猫提示你：";
    this.scriptTitle = "inOuts by 大狸猫";

    this.buildUI = function (thisObj)
    {
        // dockable panel or palette
        var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", this.scriptTitle, undefined, {resizeable:true});
        
        // defult value
        var copiesNum = 5;
        var posXnum = 100;
        var posYnum = 0;
        var rotationNum = 0;
        var offsetBool = 0;
        // alignChildren:['left','top']
        // resource specifications
        var res =
        "group { orientation:'column', alignment:['fill','fill'], alignChildren:['left','top'], \
            gr1: Group { \
                xflipBtn: Button { text:'X <>',alignment:['left','top'], preferredSize:[40,20] } \
                yflipBtn: Button { text:'Y ↑↓',alignment:['left','top'], preferredSize:[40,20] } \
                xyflipBtn: Button { text:'XY ✕',alignment:['left','top'], preferredSize:[40,20] } \
                ringBtn: Button { text:'Ring ❋',alignment:['left','top'], preferredSize:[50,20] } \
                interposeBtn: Button { text:'Mid --¦--',alignment:['left','top'], preferredSize:[50,20] } \
            }, \
            gr2: Group { \
                rot90Btn: Button { text:'90 ↻',alignment:['left','top'], preferredSize:[40,20] } \
                rot180Btn: Button { text:'180 ↻',alignment:['left','top'], preferredSize:[40,20] } \
                defultBtn: Button { text:'-',alignment:['left','top'], preferredSize:[10,20] } \
                creatBoxBtn: Button { text:'Box □',alignment:['left','top'], preferredSize:[65,20] } \
                creatCircleBtn: Button { text:'Circle ○',alignment:['left','top'], preferredSize:[65,20] } \
            }, \
            gr3: Group { \
                copiesSt: StaticText { text:'Copies',alignment:['left','top'], preferredSize:[35,20] } \
                copiesSlider: Slider { alignment:['fill','top'], preferredSize:[20,17],minvalue:1 ,maxvalue:10,value:" + copiesNum + " } \
                copiesEt:EditText { text:'" + copiesNum + "',alignment:['right','top'] ,preferredSize:[25,20]} \
                posSt:StaticText { text:'Pos',alignment:['left','top'], preferredSize:[30,20] } \
                posXSt:StaticText { text:'X',alignment:['left','top'], preferredSize:[10,20] } \
                posXEt:EditText { text:'" + posXnum + "',alignment:['right','top'] ,preferredSize:[30,20]} \
                posYSt:StaticText { text:'Y',alignment:['left','top'], preferredSize:[10,20] } \
                posYEt:EditText { text:'" + posYnum + "',alignment:['right','top'] ,preferredSize:[30,20]} \
            }, \
            gr4: Group { \
                rotSt: StaticText { text:'Rot ↻',alignment:['left','top'], preferredSize:[35,20] } \
                rotSlider: Slider { alignment:['fill','top'], preferredSize:[20,17],minvalue:0 ,maxvalue:8,value:" + rotationNum + " } \
                rotEt:EditText { text:'" + rotationNum + "',alignment:['left','top'] ,preferredSize:[30,20]} \
                offsetBox: Checkbox { text:'Mid',preferredSize:[40,20],value:"+ offsetBool +"}    \
                applyBtn: Button { text:'Apply',alignment:['right','top'], preferredSize:[95,20] } \
            }, \
        }"; 
        
        pal.gr = pal.add(res);
        // UI path
            // Btn
        var defultBtn = pal.gr.gr2.defultBtn;
        var xflipBtn = pal.gr.gr1.xflipBtn;
        var yflipBtn = pal.gr.gr1.yflipBtn;
        var xyflipBtn = pal.gr.gr1.xyflipBtn;
        var ringBtn = pal.gr.gr1.ringBtn;
        var interposeBtn = pal.gr.gr1.interposeBtn;
        var rot90Btn = pal.gr.gr2.rot90Btn;
        var rot180Btn = pal.gr.gr2.rot180Btn;
        var creatBoxBtn = pal.gr.gr2.creatBoxBtn;
        var creatCircleBtn = pal.gr.gr2.creatCircleBtn;
        var applyBtn = pal.gr.gr4.applyBtn;
            // UI value
        var copiesSlider = pal.gr.gr3.copiesSlider;
        var copiesEt = pal.gr.gr3.copiesEt;
        var posXEt = pal.gr.gr3.posXEt;
        var posYEt = pal.gr.gr3.posYEt;
        var rotSlider = pal.gr.gr4.rotSlider;
        var rotEt = pal.gr.gr4.rotEt;
        var offsetBox = pal.gr.gr4.offsetBox;
                // UI event callbacks
                    
                    // Slider
        copiesSlider.onChange = copiesSlider.onChanging = function () 
        {
            this.value = Math.round(this.value);
            this.parent.copiesEt.text = this.value;
            copiesNum = this.value;
        };

        rotSlider.onChange = rotSlider.onChanging = function () 
        {
            this.value = Math.round(this.value);
            this.parent.rotEt.text = Math.round(this.value*45);
            rotationNum = Math.round(this.value*45);
        };
                    // Et
        copiesEt.onChange =  function () 
        {
            this.text = eval(this.text);
            if (isNaN(this.text))
            {
                this.text = 1;
            }
            this.parent.copiesSlider.value = parseInt(this.text);  
            copiesNum = parseInt(this.text);
        };

        posXEt.onChange =  function () 
        {
            this.text = eval(this.text);
            if (isNaN(this.text))
            {
                this.text = 1;
            } 
            posXnum = parseInt(this.text);
        };

        posYEt.onChange =  function () 
        {
            this.text = eval(this.text);
            if (isNaN(this.text))
            {
                this.text = 1;
            } 
            posYnum = parseInt(this.text);
        };

        rotEt.onChange =  function () 
        {
            this.text = eval(this.text);
            if (isNaN(this.text))
            {
                this.text = 1;
            } 
            rotationNum = parseInt(this.text);
        };
                    // box
        offsetBox.onClick = function () 
        {
            offsetBool = this.value;
        }
        // functions
        // defult
        function shape_defult(copies){
            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            var secP = thisComp.selectedProperties;
            for(var i=0;i<secP.length;i++)
            {
                // add repeater
                var secObj = secP[i];
                for(var i = 0;i<5;i++){
                    if(secObj.matchName == "ADBE Vector Group"){
                        var repeater = secObj.content.addProperty("ADBE Vector Filter - Repeater");
                        break;
                    }
                    else if(secObj.matchName == "ADBE Vector Layer"){break;}
                    else{secObj = secObj.propertyGroup(1);}
                }
                
                repeater.property("ADBE Vector Repeater Copies").setValue(copies);
            }
        }

        // X flip
        function shape_xflip(){
            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            var secP = thisComp.selectedProperties;
            for(var i=0;i<secP.length;i++)
            {
                // add repeater
                var secObj = secP[i];
                for(var i = 0;i<5;i++){
                    if(secObj.matchName == "ADBE Vector Group"){
                        var repeater = secObj.content.addProperty("ADBE Vector Filter - Repeater");
                        break;
                    }
                    else if(secObj.matchName == "ADBE Vector Layer"){break;}
                    else{secObj = secObj.propertyGroup(1);}
                }
                
                repeater.property("ADBE Vector Repeater Copies").setValue(2);
                repeater.property("ADBE Vector Repeater Transform").property("Scale").setValue([-100,100]);
                repeater.name = "X flip - Repeater";
            }
        }

        // Y flip
        function shape_yflip(){
        var thisComp = app.project.activeItem;
        var secL = thisComp.selectedLayers;
        var secP = thisComp.selectedProperties;
        for(var i=0;i<secP.length;i++)
            {
                // add repeater
                var secObj = secP[i];
                for(var i = 0;i<5;i++){
                    if(secObj.matchName == "ADBE Vector Group"){
                        var repeater = secObj.content.addProperty("ADBE Vector Filter - Repeater");
                        break;
                    }
                    else if(secObj.matchName == "ADBE Vector Layer"){break;}
                    else{secObj = secObj.propertyGroup(1);}
                }
                
                repeater.property("ADBE Vector Repeater Copies").setValue(2);
                repeater.property("ADBE Vector Repeater Transform").property("Scale").setValue([100,-100]);
                repeater.name = "Y flip - Repeater";
            }
        }

        // XY flip
        function shape_xyflip(){
            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            var secP = thisComp.selectedProperties;            
            for(var i=0;i<secP.length;i++)
                {
                    // add repeater
                    var secObj = secP[i];
                    for(var i = 0;i<5;i++){
                        if(secObj.matchName == "ADBE Vector Group"){
                            var repeater = secObj.content.addProperty("ADBE Vector Filter - Repeater");
                            break;
                        }
                        else if(secObj.matchName == "ADBE Vector Layer"){break;}
                        else{secObj = secObj.propertyGroup(1);}
                    }
                    
                    repeater.property("ADBE Vector Repeater Copies").setValue(2);
                    repeater.property("ADBE Vector Repeater Transform").property("Scale").setValue([-100,-100]);
                    repeater.name = "XY flip - Repeater";
                }
        }

        // 90 degree duplicate
        function shape_90_degree_duplicate(){
            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            var secP = thisComp.selectedProperties;
            for(var i=0;i<secP.length;i++)
            {
                // add repeater
                var secObj = secP[i];
                for(var i = 0;i<5;i++){
                    if(secObj.matchName == "ADBE Vector Group"){
                        var repeater = secObj.content.addProperty("ADBE Vector Filter - Repeater");
                        break;
                    }
                    else if(secObj.matchName == "ADBE Vector Layer"){break;}
                    else{secObj = secObj.propertyGroup(1);}
                }
                
                repeater.property("ADBE Vector Repeater Copies").setValue(2);
                repeater.property("ADBE Vector Repeater Transform").property("Rotation").setValue(90);
                repeater.name = "90 degree - Repeater";
            }
        }

        // 180 degree duplicate
        function shape_180_degree_duplicate(){
            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            var secP = thisComp.selectedProperties;
            for(var i=0;i<secP.length;i++)
            {
                // add repeater
                var secObj = secP[i];
                for(var i = 0;i<5;i++){
                    if(secObj.matchName == "ADBE Vector Group"){
                        var repeater = secObj.content.addProperty("ADBE Vector Filter - Repeater");
                        break;
                    }
                    else if(secObj.matchName == "ADBE Vector Layer"){break;}
                    else{secObj = secObj.propertyGroup(1);}
                }
                
                repeater.property("ADBE Vector Repeater Copies").setValue(2);
                repeater.property("ADBE Vector Repeater Transform").property("Rotation").setValue(180);
                repeater.name = "180 degree - Repeater";
            }
        }

        // Ring round duplicate
        function ring_round_duplicate(copies){
            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            var secP = thisComp.selectedProperties;
            for(var i=0;i<secP.length;i++)
            {
                // add repeater
                var secObj = secP[i];
                for(var i = 0;i<5;i++){
                    if(secObj.matchName == "ADBE Vector Group"){
                        var repeater = secObj.content.addProperty("ADBE Vector Filter - Repeater");
                        break;
                    }
                    else if(secObj.matchName == "ADBE Vector Layer"){break;}
                    else{secObj = secObj.propertyGroup(1);}
                }
                var depth_idx_str = repeater.propertyDepth + "_" + repeater.propertyIndex;
                var slider = secL[0].Effects.addProperty("ADBE Slider Control");
                slider.name = "Copies " + depth_idx_str;
                slider(1).setValue(copies);
                
                repeater.property("ADBE Vector Repeater Copies").expression = "effect(\"" + slider.name + "\")(\"Slider\")";
                repeater.property("ADBE Vector Repeater Transform").property("Rotation").expression = "thisProperty.propertyGroup(2).copies == 0?0:360/thisProperty.propertyGroup(2).copies;";
                repeater.name = "Ring - Repeater";
            }
        }
        // Interpose dulplicate repeater
        function interpose_duplicate(copies,pos){
            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            var secP = thisComp.selectedProperties;
            for(var i=0;i<secP.length;i++)
            {
                // add repeater
                var secObj = secP[i];
                for(var i = 0;i<5;i++){
                    if(secObj.matchName == "ADBE Vector Group"){
                        var repeater = secObj.content.addProperty("ADBE Vector Filter - Repeater");
                        break;
                    }
                    else if(secObj.matchName == "ADBE Vector Layer"){break;}
                    else{secObj = secObj.propertyGroup(1);}
                }
                
                var slider = secL[0].Effects.addProperty("ADBE Slider Control");
                var depth_idx_str = repeater.propertyDepth + "_" + repeater.propertyIndex;
                slider.name = "Copies " + depth_idx_str;
                slider(1).setValue(copies);
                repeater.property("ADBE Vector Repeater Copies").expression = "effect(\"" + slider.name + "\")(\"Slider\")";
                repeater.property("ADBE Vector Repeater Offset").expression = "(thisProperty.propertyGroup(1).copies-1) * -0.5";
                
                var position_slider = secL[0].Effects.addProperty("ADBE Point Control");
                position_slider.name = "Pos - Repeater " + depth_idx_str;
                position_slider(1).setValue(pos);
                repeater.property("ADBE Vector Repeater Transform").property("Position").expression = "effect(\"" + position_slider.name + "\")(\"Point\")";
                repeater.name = "Interpose - Repeater";
            }
        }

        // event callbacks
        pal.onResizing = pal.onResize = function () 
        {
            this.layout.resize();
        };

        defultBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            shape_defult();
            app.endUndoGroup;
        };

        xflipBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            shape_xflip();
            app.endUndoGroup;
        };

        yflipBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            shape_yflip();
            app.endUndoGroup;
        };

        xyflipBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            shape_xyflip();
            app.endUndoGroup;
        };

        ringBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            ring_round_duplicate(8);
            app.endUndoGroup;
        };

        interposeBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            interpose_duplicate(5,[100,0]);
            app.endUndoGroup;
        };

        rot90Btn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            shape_90_degree_duplicate();
            app.endUndoGroup;
        };
        
        rot180Btn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            shape_180_degree_duplicate();
            app.endUndoGroup;
        };

        creatBoxBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            var secP = thisComp.selectedProperties;
            // Add shape
            var shape = thisComp.layers.addShape();
            var sgroup1 = shape("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
            sgroup1.name = "Retangle 1";
            var sRetengle = sgroup1("ADBE Vectors Group").addProperty("ADBE Vector Shape - Rect");

            var depth_idx_str = sRetengle.propertyDepth + "_" + sRetengle.propertyIndex;
            var slider = shape.Effects.addProperty("ADBE Slider Control");
            slider.name = "Box Size " + depth_idx_str;
            slider(1).setValue(100);

            sRetengle.property("Size").expression = "size = effect(\"" + slider.name + "\")(\"Slider\");\n[size,size]"
            // Fill
            var sgroup1Stroke = sgroup1("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Stroke");
            sgroup1Stroke.enabled = 0;
            var sgroup1Fill = sgroup1("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
            sgroup1Fill("ADBE Vector Fill Color").setValue([1,1,1,1]);
            sgroup1Fill.enabled = 1;
            if(secL.length != 0){
                shape.moveBefore(secL[0]);
            }
            app.endUndoGroup;
        };

        creatCircleBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            var secP = thisComp.selectedProperties;
            // Add shape
            var shape = thisComp.layers.addShape();
            var sgroup1 = shape("ADBE Root Vectors Group").addProperty("ADBE Vector Group");
            sgroup1.name = "Ellipse 1";
            var sRetengle = sgroup1("ADBE Vectors Group").addProperty("ADBE Vector Shape - Ellipse");

            var depth_idx_str = sRetengle.propertyDepth + "_" + sRetengle.propertyIndex;
            var slider = shape.Effects.addProperty("ADBE Slider Control");
            slider.name = "Circle Size " + depth_idx_str;
            slider(1).setValue(100);

            sRetengle.property("Size").expression = "size = effect(\"" + slider.name + "\")(\"Slider\");\n[size,size]"
            // Fill
            var sgroup1Stroke = sgroup1("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Stroke");
            sgroup1Stroke.enabled = 0;
            var sgroup1Fill = sgroup1("ADBE Vectors Group").addProperty("ADBE Vector Graphic - Fill");
            sgroup1Fill("ADBE Vector Fill Color").setValue([1,1,1,1]);
            sgroup1Fill.enabled = 1;
            if(secL.length != 0){
                shape.moveBefore(secL[0]);
            }
            app.endUndoGroup;
        };

        applyBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            var secP = thisComp.selectedProperties;
            for(var i=0;i<secP.length;i++)
            {
                // add repeater
                var secObj = secP[i];
                for(var i = 0;i<5;i++){
                    if(secObj.matchName == "ADBE Vector Group"){
                        var repeater = secObj.content.addProperty("ADBE Vector Filter - Repeater");
                        break;
                    }
                    else if(secObj.matchName == "ADBE Vector Layer"){break;}
                    else{secObj = secObj.propertyGroup(1);}
                }
                
                repeater.property("ADBE Vector Repeater Copies").setValue(copiesNum);
                if(offsetBool == 1){
                    repeater.property("ADBE Vector Repeater Offset").expression = "(thisProperty.propertyGroup(1).copies-1) * -0.5";
                }
                repeater.property("ADBE Vector Repeater Transform").property("Position").setValue([posXnum,posYnum]);
                repeater.property("ADBE Vector Repeater Transform").property("Rotation").setValue(rotationNum);
            }
            app.endUndoGroup;
        };


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
