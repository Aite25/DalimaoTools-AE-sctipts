
function main() {
    ///// info
    var scriptName = "大狸猫box";
    var alertTitle = "大狸猫提示你：";
    this.scriptTitle = "Position offset by 大狸猫";
    // var curComp = app.project.activeItem;
    // var time = app.project.activeItem.time;
    // var fps = 1/app.project.activeItem.frameDuration;
    // var selectedLayers = app.project.activeItem.selectedLayers;

    this.buildUI = function (thisObj)
    {
        // dockable panel or palette
        var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", this.scriptTitle, undefined, {resizeable:true});
        var angst = "→";
        // resource specifications
        var res =
        "group { orientation:'column', alignment:['left','top'], alignChildren:['left','center'], \
            gr1: Group { \
                angleSt: StaticText { text:'Angle' ,preferredSize:[35,17]}    \
                angSt:StaticText { text: '→' ,preferredSize:[15,17]}    \
                angleSlider: Slider { alignment:['left','center'], preferredSize:[90,17],minvalue:0 ,maxvalue:8,value:2 } \
                angleEt: EditText { text:'90',alignment:['left','center'], preferredSize:[40,17] } \
                applyBtn: Button { text:'Apply',alignment:['left','top'],preferredSize:[70,17] } \
                keyBox: Checkbox { text:'key',preferredSize:[60,17],value:1}    \
            }, \
            gr2: Group { \
                distanceSt: StaticText { text:'Distance',preferredSize:[50,17] }    \
                distanceSlider: Scrollbar { alignment:['left','center'], preferredSize:[100,17],minvalue:0 ,maxvalue:100,value:100 } \
                distanceEt: EditText { text:'100',alignment:['left','center'], preferredSize:[40,17] } \
                refreezeBtn: Button { text:'Refreeze',alignment:['left','top'],preferredSize:[70,17] } \
                opacityBox: Checkbox { text:'Opacity',preferredSize:[60,17],value:1}    \
            }, \
            gr3: Group { orientation:'row', alignment:['fill','fill'], \
                frameSt: StaticText { text:'Frames',preferredSize:[50,17] }    \
                frameSlider: Scrollbar { alignment:['left','center'], preferredSize:[100,17],minvalue:0 ,maxvalue:10,value:0,value: 10 } \
                frameEt: EditText { text:'10',alignment:['left','center'], preferredSize:[40,17] } \
                expressionBtn: Button { text:'Expression',alignment:['left','top'], preferredSize:[70,17] }    \
                directionBox: Checkbox { text:'→',preferredSize:[60,17],value:1}    \
            }, \
            gr4: Group { orientation:'row', alignment:['fill','fill'], \
                extractBtn: Button { text:'Extract',alignment:['left','top'], preferredSize:[210,20] }    \
                resetBtn: Button { text:'Reset',alignment:['left','top'], preferredSize:[130,20] }    \
            }, \
        }"; 
        pal.gr = pal.add(res);
        
        var angle = 90;
        var angleVector = [0,0];
        var distance = 100;
        var frames = 10;
        var keyB = 1;
        var opacityB = 1;
        var directionB = 1;

        function angstc(){
                angst = ["↑","↗","→","↘","↓","↙","←","↖"][Math.round((angle%360)/45)];
                pal.gr.gr1.angSt.text = angst;
        }

        // event callbacks
        pal.onResizing = pal.onResize = function () 
        {
            this.layout.resize();
        };
            //angle
        pal.gr.gr1.angleEt.onChange = function () 
        {
            this.text = eval(this.text);
            if (isNaN(this.text))
            {
                this.text = 0;
            }
            this.parent.angleSlider.value = Math.round(this.text%360)/45;
            angle = parseFloat(this.text);
            angstc();
        }
        pal.gr.gr1.angleSlider.onChange = pal.gr.gr1.angleSlider.onChanging = function () 
        {
            this.value = Math.round(this.value);
            this.parent.angleEt.text = this.value*45;
            angle = this.value*45;
            angstc();
        };
            // distance
        pal.gr.gr2.distanceEt.onChange = function () 
        {
            this.text = eval(this.text);
            if (isNaN(this.text))
            {
                this.text = 0;
            }
            this.parent.distanceSlider.value = Math.round(this.text);
            distance = parseFloat(this.text);
        }
        pal.gr.gr2.distanceSlider.onChange = pal.gr.gr2.distanceSlider.onChanging = function () 
        {
            this.value = Math.round(this.value);
            this.parent.distanceEt.text = this.value;  
            distance = this.value;
        };
            // exp
        pal.gr.gr3.expressionBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            var angle = parseFloat(pal.gr.gr1.angleEt.text);
            var distance = parseFloat(pal.gr.gr2.distanceEt.text);
            var selectedLayers = app.project.activeItem.selectedLayers
            var curComp = app.project.activeItem;
            var dire = directionB*2-1;
            var timeDelta = (frames*curComp.frameDuration)*dire;
            
            for(var i = 0;i<selectedLayers.length;i++){//
                if(selectedLayers[i].Effects.property("Angle") == null){
                    var anglesl = selectedLayers[i].Effects.addProperty("ADBE Angle Control");
                    anglesl.name = "Angle";
                }else{
                    var anglesl = selectedLayers[i].Effects.property("Angle");
                }
                selectedLayers[i].Effects.property("ADBE Angle Control").property(1).setValue(angle);
                if(selectedLayers[i].Effects.property("Distance") == null){
                    var dissl = selectedLayers[i].Effects.addProperty("ADBE Slider Control");
                    dissl.name = "Distance";
                }else{
                    dissl = selectedLayers[i].Effects.property("Distance");
                }
                // selectedLayers[i].Effects.property("ADBE Slider Control").property(1).setValue(distance);
                dissl(1).setValue(distance);
                
                if(keyB == 1){
                    var easeIn = new KeyframeEase(0, 100);
                    var easeOut = new KeyframeEase(0, 0.1);
                    dissl(1).setValuesAtTimes([curComp.time,curComp.time + timeDelta],[distance,0]);
                    dissl(1).setTemporalEaseAtKey(1,[easeIn],[easeOut]);
                    dissl(1).setTemporalEaseAtKey(2,[easeIn],[easeOut]);
                }

                selectedLayers[i].position.expression = 'angle = degreesToRadians(effect("Angle")(1)-90);\ndistance = effect("Distance")(1);\n[Math.cos(angle),Math.sin(angle)]*distance+value;';
            }
            app.endUndoGroup;
        };
            // frames

        pal.gr.gr3.frameEt.onChange =  function () 
        {
            this.text = eval(this.text);
            if (isNaN(this.text))
            {
                this.text = 0;
            }
            this.parent.frameSlider.value = parseFloat(this.text);  
            frames = parseFloat(this.text);
        };

        pal.gr.gr3.frameSlider.onChange = pal.gr.gr3.frameSlider.onChanging = function () 
        {
            this.value = Math.round(this.value);
            this.parent.frameEt.text = this.value;  
            frames = this.value;
        };

            // apply
        pal.gr.gr1.applyBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            
            var selectedLayers = app.project.activeItem.selectedLayers;
            var curComp = app.project.activeItem;
            var angR = (angle+90)*Math.PI/180;
            var offset = [Math.round(Math.cos(angR)*distance),Math.round(Math.sin(angR)*distance),0]
            
            for(var i = 0;i<selectedLayers.length;i++){
                if(selectedLayers[i].Effects.property("Original Position") == null){
                    selectedLayers[i].Effects.addProperty("ADBE Point3D Control");
                    selectedLayers[i].Effects.property("ADBE Point3D Control").name = "Original Position";
                    selectedLayers[i].Effects.property("Original Position").property(1).setValue(selectedLayers[i].position.value);
                }
                var origin = selectedLayers[i].position.value;
                if(keyB == 1){//.frameDuration
                    var dire = directionB*2-1;
                    var timeDelta = (frames*curComp.frameDuration)*dire;
                    var easeIn = new KeyframeEase(0, 100);
                    var easeOut = new KeyframeEase(0, 0.1);

                    var keyAI = selectedLayers[i].position.addKey(curComp.time);
                    selectedLayers[i].position.setTemporalEaseAtKey(keyAI,[easeIn],[easeOut]);

                    var keyBI = selectedLayers[i].position.addKey(curComp.time+timeDelta);
                    selectedLayers[i].position.setTemporalEaseAtKey(keyBI,[easeIn],[easeOut]);

                    selectedLayers[i].position.setValueAtTime(curComp.time+timeDelta*!directionB,[origin[0]+offset[0],origin[1]+offset[1],origin[2]+offset[2]]);
                    selectedLayers[i].position.setValueAtTime(curComp.time+timeDelta*directionB,origin);

                    if(opacityB == 1){
                        var keyAI = selectedLayers[i].opacity.addKey(curComp.time);
                        var keyBI = selectedLayers[i].opacity.addKey(curComp.time+timeDelta);
                        selectedLayers[i].opacity.setValueAtTime(curComp.time+(frames*curComp.frameDuration)*(-!directionB),0);
                    }
                }else{
                    selectedLayers[i].position.setValue([origin[0]+offset[0],origin[1]+offset[1],origin[2]+offset[2]])
                }
            }

            app.endUndoGroup;
        };
            // extract
        pal.gr.gr4.extractBtn.onClick = function () {
            app.beginUndoGroup(scriptName);
            var curComp = app.project.activeItem;
            var selectedLayers = app.project.activeItem.selectedLayers;

            var akeyv = selectedLayers[0].position.keyValue(selectedLayers[0].position.selectedKeys[0]);
            var bkeyv = selectedLayers[0].position.keyValue(selectedLayers[0].position.selectedKeys[1]);
            var subv = [akeyv[0]-bkeyv[0],akeyv[1]-bkeyv[1],akeyv[2]-bkeyv[2]];
            var angleS = (Math.atan2(subv[1],subv[0])*180/Math.PI)-90;
            var moveDistance = Math.sqrt(subv[0]*subv[0]+subv[1]*subv[1]);
            var fDuration = (selectedLayers[0].position.keyTime(selectedLayers[0].position.selectedKeys[1])-selectedLayers[0].position.keyTime(selectedLayers[0].position.selectedKeys[0]))*curComp.frameRate;
            if(angleS%1 == 0){
                pal.gr.gr1.angleEt.text = angleS;
                angstc();
            }else{
                pal.gr.gr1.angleEt.text = angleS.toFixed(1);
                angstc();
            }
            pal.gr.gr1.angleSlider.value = angleS;
            
            if(moveDistance%1 == 0){
                pal.gr.gr2.distanceEt.text = moveDistance;
            }else{
                pal.gr.gr2.distanceEt.text = moveDistance.toFixed(1);
                pal.gr.gr2.distanceSlider.value = moveDistance;
            }
            pal.gr.gr3.frameEt.text = parseInt(fDuration);
            pal.gr.gr3.frameSlider.value = parseInt(fDuration);
            app.endUndoGroup;
        }
            // reset
        pal.gr.gr4.resetBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            var selectedLayers = app.project.activeItem.selectedLayers;
            
            for(var i = 0;i<selectedLayers.length;i++){
                if(selectedLayers[i].Effects.property("Original Position") != null){
                    var numKeysSave = selectedLayers[i].position.numKeys;
                    for(var j = 1;j<numKeysSave+1;j++){
                        selectedLayers[i].position.removeKey(1);
                    }
                    selectedLayers[i].position.setValue(selectedLayers[i].Effects.property("Original Position").property(1).value);
                    var numKeysSave = selectedLayers[i].opacity.numKeys;
                    for(var j = 1;j<numKeysSave+1;j++){
                        selectedLayers[i].opacity.removeKey(1);
                    }
                    selectedLayers[i].opacity.setValue(100);
                }
            }
            app.endUndoGroup;
        };
            // refreeze
        pal.gr.gr2.refreezeBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            var selectedLayers = app.project.activeItem.selectedLayers;
            for(var i = 0;i<selectedLayers.length;i++){
                if(selectedLayers[i].Effects.property("Original Position") == null){
                    selectedLayers[i].Effects.addProperty("ADBE Point3D Control");
                    selectedLayers[i].Effects.property("ADBE Point3D Control").name = "Original Position";
                    selectedLayers[i].Effects.property("Original Position").property(1).setValue(selectedLayers[i].position.value);
                }else if(selectedLayers[i].Effects.property("Original Position") != null){
                    selectedLayers[i].Effects.property("Original Position").property(1).setValue(selectedLayers[i].position.value)
                }
            }
            app.endUndoGroup;
        };

            // keybox
        pal.gr.gr1.keyBox.onClick = function () 
        {
            keyB = this.value;
        }
            // opacitybox
        pal.gr.gr2.opacityBox.onClick = function () 
        {
            opacityB = this.value;
        }
            // directionbox
        pal.gr.gr3.directionBox.onClick = function () 
        {
            directionB = this.value;
        }

        // pal.gr.gr2.leftCutBtn.onClick = function () 
        // { 
        //     app.beginUndoGroup(scriptName);
        //     layerCut(0);
        //     app.endUndoGroup;
        // };
        // pal.gr.gr2.rightCutBtn.onClick = function () 
        // { 
        //     app.beginUndoGroup(scriptName);
        //     layerCut(1);
        //     app.endUndoGroup;
        // };

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
