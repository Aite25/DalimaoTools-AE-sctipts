
/*
Code for Import https://scriptui.joonas.me — (Triple click to select): 
*/ 
function objprint (obj){
    var _str = '';
    var _count = 0;
    var _n = ';\n';
    for(var i in obj){
        _str += _count + ' ';
        _str += i + '\t';
        try{_str += obj[i] + _n;}catch(e){
            try{_str += '*' +  typeof obj[i] + '*'+ _n;}catch(e){_str += _n;}
        }
        _count += 1;
    }
    alert(_str);
}

var panelGlobal = this;
var pal = (function () {
    var scriptName = "整装大狸猫 by 大狸猫";
    var alertTitle = "大狸猫提示你：";
    this.scriptTitle = "整装大狸猫 by 大狸猫";
    var pal = (panelGlobal instanceof Panel) ? panelGlobal : new Window("palette", this.scriptTitle, undefined, {resizeable:true});
    if ( !(panelGlobal instanceof Panel) ) pal.text = "Dalimao_Tools by 大狸猫"; 
    pal.alignChildren = ["left","top"]; 
    // build UI

    var slider_gr = pal.add("group", undefined, {name: "slider_gr"}); 
    slider_gr.orientation = "row"; 
    slider_gr.alignChildren = ["left","center"]; 
    slider_gr.spacing = 10; 
    slider_gr.margins = 0; 
    slider_gr.alignment = ["fill","top"]; 

    var dalimao_st = slider_gr.add("statictext", undefined, undefined, {name: "dalimao_st"}); 
    dalimao_st.text = "整装大狸猫"; 

    var dalimao_index_st = slider_gr.add("statictext", undefined, undefined, {name: "dalimao_index_st"}); 
    dalimao_index_st.text = "0"; 

    var panel_slider = slider_gr.add("slider", undefined, undefined, undefined, undefined, {name: "panel_slider1"}); 
    panel_slider.minvalue = 0; 
    panel_slider.maxvalue = 7; 
    panel_slider.value = 0; 
    // panel_slider.preferredSize.width = 50; 
    panel_slider.alignment = ["fill","center"]; 

    var dalimao_st2 = slider_gr.add("statictext", undefined, undefined, {name: "dalimao_st2"}); 
    dalimao_st2.text = "KeyframeEase"; 

    // TPANEL1
    // =======
    var tpanel1 = pal.add("tabbedpanel", undefined, undefined, {name: "tpanel1"}); 
        tpanel1.alignChildren = "fill"; 
        tpanel1.orientation = "column"; 
        tpanel1.alignment = ["fill","fill"];
        // tpanel1.preferredSize.width = 800; 
        tpanel1.margins = 10; 
    
    var tpanel1_tab_array = [];

    // Tab1 keyframeEase
    // ====
    var keyframeEase_tab = tpanel1.add("tab", undefined, undefined, {name: "keyframeEase_tab"}); 
        keyframeEase_tab.text = "KeyframesEase"; 
        keyframeEase_tab.orientation = "column";
        keyframeEase_tab.alignChildren = ["left","top"]; 
        keyframeEase_tab.spacing = 10;
        tpanel1_tab_array.push(keyframeEase_tab);
        // keyframeEase_tab.margins = 10; 
        function clamp(a,b,c){
            if(a>c){a = c};
            if(a<b){a = b};
            return a;
        }
        function reverseSeclect(){
            var tcomp = app.project.activeItem;
            var secL = tcomp.selectedLayers;
            for(var i=0;i<secL.length;i++)
            {
                secL[i].selected = 0;
            }
            
            for(var i=0;i<secL.length;i++)
            {
                secL[secL.length-1-i].selected = 1;
            }
        }
    
        function idcreat(){ 
            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
        
            for(var i = 0;i<secL.length-1;i++){
                var slider = secL[i].effect.addProperty('ADBE Slider Control');
                slider.name = "ID";
                if(secL[i].index > secL[secL.length-1].index){
                    slider(1).expression = 'id = index - thisComp.layer("' + secL[secL.length-1].name + '").index;\n\//id = effect(\"ID\")(\"ADBE Slider Control-0001\");';
                }else{
                    slider(1).expression = 'id = thisComp.layer("' + secL[secL.length-1].name + '").index - index;\n\//id = effect(\"ID\")(\"ADBE Slider Control-0001\");';
                }
            }
        }
    
        var framenum = 0;
        var snapBox = 1;
    
        function layerOffset(){
            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers; // 选择层
            var fdr = thisComp.frameDuration;
            var firstINP = secL[0].inPoint;
            var timeDif = 0;
            for(var i=0;i<secL.length;i++){
                if(i == 0 && snapBox == 1){
                    secL[i].startTime += thisComp.time - secL[i].inPoint;
                }
                if(i!=0){
                    timeDif = secL[i].inPoint - secL[i].startTime;
                    secL[i].startTime = firstINP + framenum*fdr*i - timeDif;
                }
            }
        }

        var influence = 0;
        var space = 100;

        // resource specifications
        var keyframeEase_res =
        "group { orientation:'column', alignment:['left','top'], alignChildren:['left','center'], \
            gr1: Group { \
                influenceSt: StaticText { text:'Influence' ,preferredSize:[50,17]}    \
                influenceSlider: Slider { alignment:['left','center'], preferredSize:[100,17],minvalue:0 ,maxvalue:10,value:0 } \
                influenceEt: EditText { text:'0',alignment:['left','center'], preferredSize:[45,17] } \
                applyBtn: Button { text:'Apply',alignment:['left','top'],preferredSize:[70,17] } \
            }, \
            gr2: Group { \
                spaceSt: StaticText { text:'Space',preferredSize:[50,17] }    \
                spaceSlider: Slider { alignment:['left','center'], preferredSize:[100,17],minvalue:0 ,maxvalue:20,value:10 } \
                spaceEt: EditText { text:'100',alignment:['left','center'], preferredSize:[45,17] } \
                extractBtn: Button { text:'Extract',alignment:['left','top'],preferredSize:[70,17] } \
            }, \
            gr3: Group { orientation:'row', alignment:['left','top'],\
                frameSt: StaticText { text:'Frame' ,preferredSize:[50,17]}    \
                minEt: EditText { text:'0',alignment:['left','center'], preferredSize:[23,17] } \
                frameSlider: Slider { alignment:['left','center'], preferredSize:[41,17],minvalue:0 ,maxvalue:30,value:0 } \
                maxEt: EditText { text:'30',alignment:['left','center'], preferredSize:[23,17] } \
                frameEt: EditText { text:" + framenum + ",alignment:['left','center'], preferredSize:[39,17] } \
                snapBox: Checkbox { text:'[',value: "+ snapBox +",alignment:['left','top']}    \
                frameBtn: Button { text:'√' ,preferredSize:[36,17]}    \
            }, \
            gr4: Group { orientation:'row', alignment:['left','top'],\
                bakeBtn: Button { text:'Bake',alignment:['left','top'],preferredSize:[76,17] } \
                revSecLBtn: Button { text:'revSecL',alignment:['left','top'],preferredSize:[100,17] } \
                idCreatBtn: Button { text:'ID Create',alignment:['left','top'],preferredSize:[100,17] } \
        }, \
        }";
        keyframeEase_tab.gr = keyframeEase_tab.add(keyframeEase_res);

        var keyframeEase_influenceSt = keyframeEase_tab.gr.gr1.influenceSt;
        var keyframeEase_influenceSlider = keyframeEase_tab.gr.gr1.influenceSlider;
        var keyframeEase_influenceEt = keyframeEase_tab.gr.gr1.influenceEt;
        var keyframeEase_applyBtn = keyframeEase_tab.gr.gr1.applyBtn;

        var keyframeEase_spaceSt = keyframeEase_tab.gr.gr2.spaceSt;
        var keyframeEase_spaceSlider = keyframeEase_tab.gr.gr2.spaceSlider;
        var keyframeEase_spaceEt = keyframeEase_tab.gr.gr2.spaceEt;
        var keyframeEase_extractBtn = keyframeEase_tab.gr.gr2.extractBtn;

        var keyframeEase_frameSt = keyframeEase_tab.gr.gr3.frameSt;
        var keyframeEase_minEt = keyframeEase_tab.gr.gr3.minEt;
        var keyframeEase_frameSlider = keyframeEase_tab.gr.gr3.frameSlider;
        var keyframeEase_maxEt = keyframeEase_tab.gr.gr3.maxEt;
        var keyframeEase_frameEt = keyframeEase_tab.gr.gr3.frameEt;
        var keyframeEase_snapBox_ = keyframeEase_tab.gr.gr3.snapBox;
        var keyframeEase_frameBtn = keyframeEase_tab.gr.gr3.frameBtn;

        var keyframeEase_bakeBtn = keyframeEase_tab.gr.gr4.bakeBtn;
        var keyframeEase_revSecLBtn = keyframeEase_tab.gr.gr4.revSecLBtn;
        var keyframeEase_idCreatBtn = keyframeEase_tab.gr.gr4.idCreatBtn;

        //influence
        keyframeEase_influenceEt.onChange = function () 
        {
            this.text = eval(this.text);
            if (isNaN(this.text))
            {
                this.text = 0;
            }
            this.parent.influenceSlider.value = Math.round(this.text%100)/10;
            influence = clamp(0,100);
            influence = parseFloat(this.text);
        }
        keyframeEase_influenceSlider.onChange = keyframeEase_influenceSlider.onChanging = function () 
        {
            this.value = Math.round(this.value);
            this.parent.influenceEt.text = this.value*10;
            influence = this.value*10;
            if(app.project.activeItem.selectedProperties.length != 0){
                keyframeEase_applyBtn.onClick();
            }
        };
            // space
        keyframeEase_spaceEt.onChange = function () 
        {
            this.text = eval(this.text);
            if (isNaN(this.text))
            {
                this.text = 0;
            }
            this.parent.spaceSlider.value = Math.round(this.text)/10;
            space = clamp(0,200);
            space = parseFloat(this.text);
        }
        keyframeEase_spaceSlider.onChange = keyframeEase_spaceSlider.onChanging = function () 
        {
            this.value = Math.round(this.value);
            this.parent.spaceEt.text = this.value*10;  
            space = this.value*10;
            if(app.project.activeItem.selectedProperties.length != 0){
                keyframeEase_applyBtn.onClick();
            }
        };
            // apply
        keyframeEase_applyBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            
            // var influence2 = linear(influence,0,100,50,150);
            // if(influence2<100){
            //     var infOut = clamp(influence2-space*0.5,0.1,100);
            //     var infIn = clamp(200-infOut,0.1,100);
            // }else{
            //     var infIn = clamp(200-influence2-space*0.5,0.1,100);
            //     var infOut = clamp(200-infIn,0.1,100);
            // }

            var infOut = clamp(influence,0.1,100);
            var infIn = clamp(200-space-influence,0.1,100);

            var selectedLayers = app.project.activeItem.selectedLayers;
            var curComp = app.project.activeItem;

            var easeOut = new KeyframeEase(0, infOut);
            var easeIn = new KeyframeEase(0, infIn);
            
            for(var i = 0;i<selectedLayers.length;i++){
                for(var j = 0;j<selectedLayers[i].selectedProperties.length;j++){
                    if(selectedLayers[i].selectedProperties[j].canSetExpression){

                        var easeOutAll = [];
                        var easeInAll = [];
                        var prop = selectedLayers[i].selectedProperties[j];

                        if ( !prop.isSpatial && prop.value.length == 3 ) {
                            easeOutAll = [easeOut,easeOut,easeOut];
                            easeInAll = [easeIn,easeIn,easeIn];
                        } else if ( !prop.isSpatial && prop.value.length == 2 ) {
                            easeOutAll = [easeOut,easeOut];
                            easeInAll = [easeIn,easeIn];
                        } else {
                            easeOutAll = [easeOut];
                            easeInAll = [easeIn];
                        }
                        
                        for(var k = 0;k< prop.selectedKeys.length;k++){
                            var curKeys = prop.selectedKeys;
                            prop.setTemporalContinuousAtKey(curKeys[k], 1);
                            prop.setTemporalEaseAtKey(curKeys[k],easeInAll,easeOutAll);
                        }
                    }
                }
            }

            app.endUndoGroup;
        };
            // extract
        keyframeEase_extractBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            var selectedLayers = app.project.activeItem.selectedLayers;
            for(var j = 0;j<selectedLayers[0].selectedProperties.length;j++){
                if(selectedLayers[0].selectedProperties[j].canSetExpression){
                    var curProperties = selectedLayers[0].selectedProperties[j];
                    var curKeys = selectedLayers[0].selectedProperties[j].selectedKeys;
                    var influenceA = curProperties.keyOutTemporalEase(curKeys[0])[0].influence;
                    var influenceB = curProperties.keyInTemporalEase(curKeys[1])[0].influence;
                    
                    if(influenceA <= 0.1){
                        keyframeEase_influenceSlider.value = 0;
                        keyframeEase_influenceEt.text = 0;
                    }else{
                        keyframeEase_influenceSlider.value = influenceA/10;
                        keyframeEase_influenceEt.text = influenceA;
                    }

                    if(influenceB <= 0.1){
                        keyframeEase_influenceSlider.value = (200 - influenceA)/10;
                        space = 200 - influenceA;
                    }else{
                        keyframeEase_spaceSlider.value = (200 - influenceB - influenceA)/10;
                        space = 200 - influenceB - influenceA;
                    }
                    keyframeEase_spaceEt.text = space;

                    influence = influenceA;
                    

                }
                selectedLayers[i].selectedProperties[j].expressionEnabled = 0;
            }
            app.endUndoGroup;
        }

            //frame
        keyframeEase_frameBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            if(app.project.activeItem.selectedLayers.length > 1){
                layerOffset();
            }
            app.endUndoGroup;
        };

        keyframeEase_frameEt.onChange = function () 
        {
            this.text = eval(this.text);
            if (isNaN(this.text))
            {
                this.text = 0;
            }
            this.parent.frameSlider.value = Math.round(this.text);
            framenum = parseInt(this.text);
            if(app.project.activeItem.selectedLayers.length > 1){
                layerOffset();
            }
        }
    
            // frameSlider min
        keyframeEase_minEt.onChange = function () 
        {
            this.text = eval(this.text);
            if (isNaN(this.text))
            {
                this.text = 0;
            }
            this.parent.frameSlider.minvalue = Math.round(this.text);
        }
    
            // frameSlider max
        keyframeEase_maxEt.onChange = function () 
        {
            this.text = eval(this.text);
            if (isNaN(this.text))
            {
                this.text = 0;
            }
            this.parent.frameSlider.maxvalue = Math.round(this.text);
        }
    

        keyframeEase_frameSlider.onChange = keyframeEase_frameSlider.onChanging = function () 
        {
            app.beginUndoGroup(scriptName);
            this.value = Math.round(this.value);
            this.parent.frameEt.text = this.value;
            framenum = this.value;
            if(app.project.activeItem.selectedLayers.length > 1){
                layerOffset();
            }
            app.endUndoGroup;
        };
    
        keyframeEase_snapBox_.onClick = function () 
        {
            snapBox = this.value;
        }

            // bake
        keyframeEase_bakeBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            var selectedLayers = app.project.activeItem.selectedLayers;
            for(var i = 0;i<selectedLayers.length;i++){
                for(var j = 0;j<selectedLayers[i].selectedProperties.length;j++){
                    if(selectedLayers[i].selectedProperties[j].canSetExpression){
                        if(selectedLayers[i].selectedProperties[j].expression != "" && selectedLayers[i].selectedProperties[j].expressionEnabled == 1){
                            for(var k = 0;k<selectedLayers[i].selectedProperties[j].selectedKeys.length;k++){
                                var curProperties = selectedLayers[i].selectedProperties[j];
                                var curKeys = selectedLayers[i].selectedProperties[j].selectedKeys;
                                var newValue = selectedLayers[i].selectedProperties[j].valueAtTime(curProperties.keyTime(curKeys[k]),0);
                                selectedLayers[i].selectedProperties[j].setValueAtKey(curKeys[k],newValue);
                            }
                        }
                    }
                    selectedLayers[i].selectedProperties[j].expressionEnabled = 0;
                }
            }
            app.endUndoGroup;
        }
            // reverseSelect
        keyframeEase_revSecLBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            reverseSeclect();
            app.endUndoGroup;
        }
            // ID Create
        keyframeEase_idCreatBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            idcreat();
            app.endUndoGroup;
        }

    // var button1 = keyframeEase_tab.add("button", undefined, undefined, {name: "button1"}); 
    //     button1.text = "Button"; 

    // Tab2 position offset
    // ====
    var pos_offset_tab = tpanel1.add("tab", undefined, undefined, {name: "pos_offset_tab"}); 
        pos_offset_tab.text = "Position_offset"; 
        pos_offset_tab.orientation = "column";
        pos_offset_tab.alignChildren = ["left","top"]; 
        pos_offset_tab.spacing = 10;
        pos_offset_tab.margins = 10;
        tpanel1_tab_array.push(pos_offset_tab);

        var angst = "→";
        // resource specifications
        var pos_offset_res =
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
                extractBtn: Button { text:'Extract',alignment:['left','top'], preferredSize:[210,17] }    \
                transformBtn: Button { text:'Effect',alignment:['left','top'], preferredSize:[70,17] }    \
                resetBtn: Button { text:'Reset',alignment:['left','top'], preferredSize:[50,17] }    \
            }, \
        }"; 
        pos_offset_tab.gr = pos_offset_tab.add(pos_offset_res);

        var pos_offset_angleEt = pos_offset_tab.gr.gr1.angleEt;
        var pos_offset_angleSt = pos_offset_tab.gr.gr1.angleSt;
        var pos_offset_angSt = pos_offset_tab.gr.gr1.angSt;
        var pos_offset_angleSlider = pos_offset_tab.gr.gr1.angleSlider;
        var pos_offset_applyBtn = pos_offset_tab.gr.gr1.applyBtn;
        var pos_offset_keyBox = pos_offset_tab.gr.gr1.keyBox;

        var pos_offset_distanceSt = pos_offset_tab.gr.gr2.distanceSt;
        var pos_offset_distanceSlider = pos_offset_tab.gr.gr2.distanceSlider;
        var pos_offset_distanceEt = pos_offset_tab.gr.gr2.distanceEt;
        var pos_offset_refreezeBtn = pos_offset_tab.gr.gr2.refreezeBtn;
        var pos_offset_opacityBox = pos_offset_tab.gr.gr2.opacityBox;

        var pos_offset_frameSt = pos_offset_tab.gr.gr3.frameSt;
        var pos_offset_frameSlider = pos_offset_tab.gr.gr3.frameSlider;
        var pos_offset_frameEt = pos_offset_tab.gr.gr3.frameEt;
        var pos_offset_expressionBtn = pos_offset_tab.gr.gr3.expressionBtn;
        var pos_offset_directionBox = pos_offset_tab.gr.gr3.directionBox;

        var pos_offset_extractBtn = pos_offset_tab.gr.gr4.extractBtn;
        var pos_offset_transformBtn = pos_offset_tab.gr.gr4.transformBtn;
        var pos_offset_resetBtn = pos_offset_tab.gr.gr4.resetBtn;

        var angle = 90;
        var angleVector = [0,0];
        var distance = 100;
        var frames = 10;
        var keyB = 1;
        var opacityB = 1;
        var directionB = 1;

        function angstc(){
            angst = ["↑","↗","→","↘","↓","↙","←","↖"][Math.round((angle%360)/45)];
            pos_offset_angSt.text = angst;
        }
        //angle
        pos_offset_angleEt.onChange = function () 
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
        pos_offset_angleSlider.onChange = pos_offset_angleSlider.onChanging = function () 
        {
            this.value = Math.round(this.value);
            this.parent.angleEt.text = this.value*45;
            angle = this.value*45;
            angstc();
        };
            // distance
        pos_offset_distanceEt.onChange = function () 
        {
            this.text = eval(this.text);
            if (isNaN(this.text))
            {
                this.text = 0;
            }
            this.parent.distanceSlider.value = Math.round(this.text);
            distance = parseFloat(this.text);
        }
        pos_offset_distanceSlider.onChange = pos_offset_distanceSlider.onChanging = function () 
        {
            this.value = Math.round(this.value);
            this.parent.distanceEt.text = this.value;  
            distance = this.value;
        };
            // expression
        pos_offset_expressionBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            var angle = parseFloat(pos_offset_angleEt.text);
            var distance = parseFloat(pos_offset_distanceEt.text);
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

        pos_offset_frameEt.onChange =  function () 
        {
            this.text = eval(this.text);
            if (isNaN(this.text))
            {
                this.text = 0;
            }
            this.parent.frameSlider.value = parseFloat(this.text);  
            frames = parseFloat(this.text);
        };

        pos_offset_frameSlider.onChange = pos_offset_frameSlider.onChanging = function () 
        {
            this.value = Math.round(this.value);
            this.parent.frameEt.text = this.value;  
            frames = this.value;
        };

            // apply
        pos_offset_applyBtn.onClick = function () 
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
        pos_offset_extractBtn.onClick = function () {
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
                pos_offset_angleEt.text = angleS;
                angstc();
            }else{
                pos_offset_angleEt.text = angleS.toFixed(1);
                angstc();
            }
            pos_offset_angleSlider.value = angleS;
            
            if(moveDistance%1 == 0){
                pos_offset_distanceEt.text = moveDistance;
            }else{
                pos_offset_distanceEt.text = moveDistance.toFixed(1);
                pos_offset_distanceSlider.value = moveDistance;
            }
            pos_offset_frameEt.text = parseInt(fDuration);
            pos_offset_frameSlider.value = parseInt(fDuration);
            app.endUndoGroup;
        }

            // transformEff
        pos_offset_transformBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            
            var selectedLayers = app.project.activeItem.selectedLayers;
            var curComp = app.project.activeItem;
            var angR = (angle+90)*Math.PI/180;
            var offset = [Math.round(Math.cos(angR)*distance),Math.round(Math.sin(angR)*distance),0]
            var transeff;
            for(var i = 0;i<selectedLayers.length;i++){
                if(selectedLayers[i].Effects.property("Transform") == null){
                    transeff = selectedLayers[i].Effects.addProperty("ADBE Geometry2");
                    transeff.property(1).setValue([0,0]);
                    transeff.property(2).setValue([0,0]);
                }else{
                    transeff = selectedLayers[i].Effects.property("Transform");
                }
                var origin = [0,0];
                if(keyB == 1){//.frameDuration
                    var dire = directionB*2-1;
                    var timeDelta = (frames*curComp.frameDuration)*dire;
                    var easeIn = new KeyframeEase(0, 100);
                    var easeOut = new KeyframeEase(0, 0.1);

                    var keyAI = transeff.property(2).addKey(curComp.time);
                    transeff.property(2).setTemporalEaseAtKey(keyAI,[easeIn],[easeOut]);

                    var keyBI = transeff.property(2).addKey(curComp.time+timeDelta);
                    transeff.property(2).setTemporalEaseAtKey(keyBI,[easeIn],[easeOut]);

                    transeff.property(2).setValueAtTime(curComp.time+timeDelta*!directionB,[offset[0],offset[1]]);
                    transeff.property(2).setValueAtTime(curComp.time+timeDelta*directionB,[0,0]);

                    if(opacityB == 1){
                        var keyAI = transeff.property(9).addKey(curComp.time);
                        var keyBI = transeff.property(9).addKey(curComp.time+timeDelta);
                        transeff.property(9).setValueAtTime(curComp.time+(frames*curComp.frameDuration)*(-!directionB),0);
                    }
                }else{
                    transeff.property(2).setValue([offset[0],offset[1]]);
                }
            }

            app.endUndoGroup;
        };


            // reset
        pos_offset_resetBtn.onClick = function () 
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
        pos_offset_refreezeBtn.onClick = function () 
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
        pos_offset_keyBox.onClick = function () 
        {
            keyB = this.value;
        }
            // opacitybox
        pos_offset_opacityBox.onClick = function () 
        {
            opacityB = this.value;
        }
            // directionbox
        pos_offset_directionBox.onClick = function () 
        {
            directionB = this.value;
        }

    // Tab3 null
    var null_tab = tpanel1.add("tab", undefined, undefined, {name: "null_tab"}); 
    null_tab.text = "Null"; 
    null_tab.orientation = "column";
    null_tab.alignChildren = ["left","top"]; 
    null_tab.spacing = 10;
    tpanel1_tab_array.push(null_tab);

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

    // resource specifications
    var null_res =
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
    null_tab.gr = null_tab.add(null_res);

    var null_guideBox_ = null_tab.gr.gr1.guideBox;
    var null_eachBox_ = null_tab.gr.gr1.eachBox;
    var null_setParentBox_ = null_tab.gr.gr1.setParentBox;
    var null_resetBtn = null_tab.gr.gr1.resetBtn;

    var null_solidNullBtn = null_tab.gr.gr3.solidNullBtn;
    var null_shapeNullBtn = null_tab.gr.gr3.shapeNullBtn;
    var null_parentChainBtn = null_tab.gr.gr3.parentChainBtn;

    null_solidNullBtn.onClick = function () 
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

    null_shapeNullBtn.onClick = function () 
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

    null_parentChainBtn.onClick = function () 
    {
        app.beginUndoGroup(scriptName);
        parentChain();
        app.endUndoGroup;
    };

    // box
    null_guideBox_.onClick = function () 
    {
        guideBox = this.value;
    }

    null_eachBox_.onClick = function () 
    {
        eachBox = this.value;
    }

    null_setParentBox_.onClick = function () 
    {
        setParentBox = this.value;
    }

    null_resetBtn.onClick = function () 
    {
        guideBox_.value = 0;
        eachBox_.value = 0;
        setParentBox_.value = 0;
    }

    // Tab4 renamer 
    var renamer_tab = tpanel1.add("tab", undefined, undefined, {name: "renamer_tab"}); 
    renamer_tab.text = "Renamer"; 
    renamer_tab.orientation = "column";
    renamer_tab.alignChildren = ["left","top"]; 
    renamer_tab.spacing = 10;
    tpanel1_tab_array.push(renamer_tab);

    var na = "大狸猫图层";
    var la = 1;
    var labelbox = 1;
    var regexp = 0;
    var zeroBox = 0;
    var startnum = 0;
    var revBox = 0;

    function rename()
    {
        var lays = app.project.activeItem.selectedLayers;
        for(var i = 0;i<lays.length;i++){
            if(!zeroBox){
                lays[i].name = na + " " + (i+1).toString();
            }else{
                lays[i].name = na + " " + (i+startnum).toString();
            }

            if(labelbox == 1){
                lays[i].label = la;
            }
        }
    }

    var renamer_res =
    "group { orientation:'column', alignment:['fill','fill'], alignChildren:['left','top'], \
        gr1: Group { \
            nameEt: EditText { text:'"+na+"',alignment:['left','center'], preferredSize:[195,20] } \
            zeroBox: Checkbox { text:'',preferredSize:[15,17],value:"+zeroBox+"}    \
            startnumEt: EditText { text:'"+startnum+"',alignment:['left','center'], preferredSize:[20,20] } \
            RegExpBox: Checkbox { text:'RegExp',preferredSize:[60,17],value:"+regexp+"}    \
        }, \
        gr2: Group { \
            labelSlider: Slider { alignment:['left','center'], preferredSize:[160,20],minvalue:0 ,maxvalue:16,value:"+la+" } \
            labelEt: EditText { text:"+la+",preferredSize:[25,20] }    \
            labelBox: Checkbox { text:'Label',preferredSize:[60,17],value:"+labelbox+"}    \
        }, \
        gr3: Group { \
            ApplyBtn: Button { text:'Apply',alignment:['left','top'], preferredSize:[80,20] } \
            SelectBtn: Button { text:'Select',alignment:['left','top'], preferredSize:[40,20] } \
            revSelectBtn: Button { text:'revSel',alignment:['left','top'], preferredSize:[40,20] } \
            ExtractNameBtn: Button { text:'Extract',alignment:['left','top'], preferredSize:[80,20] } \
        }, \
        gr4: Group { \
            ApplyPropBtn: Button { text:'P_Apply',alignment:['left','top'], preferredSize:[80,20] } \
            SelectPropBtn: Button { text:'P_Sel',alignment:['left','top'], preferredSize:[40,20] } \
            revBox: Checkbox { text:'reP',preferredSize:[40,17],value:"+revBox+"}    \
            ExtractPropNameBtn: Button { text:'P_Extract',alignment:['left','top'], preferredSize:[80,20] } \
        }, \
    }"; 
    renamer_tab.gr = renamer_tab.add(renamer_res);
    
    var renamer_nameEt = renamer_tab.gr.gr1.nameEt;
    var renamer_zeroBox_ = renamer_tab.gr.gr1.zeroBox;
    var renamer_startnumEt = renamer_tab.gr.gr1.startnumEt;
    var renamer_RegExpBox_ = renamer_tab.gr.gr1.RegExpBox;

    var renamer_labelSlider = renamer_tab.gr.gr2.labelSlider;
    var renamer_labelEt = renamer_tab.gr.gr2.labelEt;
    var renamer_labelBox_ = renamer_tab.gr.gr2.labelBox;

    var renamer_ApplyBtn = renamer_tab.gr.gr3.ApplyBtn;
    var renamer_SelectBtn = renamer_tab.gr.gr3.SelectBtn;
    var renamer_revSelectBtn = renamer_tab.gr.gr3.revSelectBtn;
    var renamer_ExtractNameBtn = renamer_tab.gr.gr3.ExtractNameBtn;
    
    var renamer_ApplyPropBtn = renamer_tab.gr.gr4.ApplyPropBtn;
    var renamer_SelectPropBtn = renamer_tab.gr.gr4.SelectPropBtn;
    // var renamer_revPropSelectBtn = renamer_tab.gr.gr4.revPropSelectBtn;
    var renamer_ExtractPropNameBtn = renamer_tab.gr.gr4.ExtractPropNameBtn;
    var renamer_revBox_ = renamer_tab.gr.gr4.revBox;

    // Apply
    renamer_ApplyBtn.onClick = function () 
    {
        app.beginUndoGroup(scriptName);
        rename();
        app.endUndoGroup;
    };

    // Select
    renamer_SelectBtn.onClick = function () 
    {
        app.beginUndoGroup(scriptName);
        var tcomp = app.project.activeItem;
        
        for(var i = 1;i<=tcomp.layers.length;i++){
            var curLayer = tcomp.layers[i];
            if(regexp != 1){
                if(curLayer.name.indexOf(na) != -1){
                    curLayer.selected = 1;
                }
                // var reg = new RegExp("^"+na+".*(\d+)*$","g");
            }else if(regexp == 1){
                var reg = new RegExp(na,"g");
                curLayer.selected = reg.test(curLayer.name);
            }
        }
        app.endUndoGroup;
    };

    // reverse Select
    renamer_revSelectBtn.onClick = function () 
    {
        app.beginUndoGroup(scriptName);
        var tcomp = app.project.activeItem;
        var secL = tcomp.selectedLayers;
        for(var i=0;i<secL.length;i++)
        {
            secL[i].selected = 0;
        }
        
        for(var i=0;i<secL.length;i++)
        {
            secL[secL.length-1-i].selected = 1;
        }
        app.endUndoGroup;
    };

    // Extract
    renamer_ExtractNameBtn.onClick = function () 
    {
        app.beginUndoGroup(scriptName);
        var lays = app.project.activeItem.selectedLayers;
        na = lays[0].name.replace(/(\s*\d+)$/,"");
        la = lays[0].label;
        renamer_nameEt.text = na;
        renamer_labelEt.text = la;
        renamer_labelSlider.value = la;

        app.endUndoGroup;
    };

    //Porp apply
    renamer_ApplyPropBtn.onClick = function () 
    {
        app.beginUndoGroup(scriptName);
        var thisComp = app.project.activeItem;
        var secP = thisComp.selectedProperties;


        for(var i=0;i<secP.length;i++)
        {
            if(!zeroBox){
                try{
                    if(revBox == 0){
                        secP[i].name = renamer_nameEt.text + " " + (i+1).toString();
                    }else{
                        secP[i].name = renamer_nameEt.text + " " + (secP.length-i).toString();
                    }
                }catch(e){continue;}
            }else{
                try{
                    if(revBox == 0){
                        secP[i].name = renamer_nameEt.text + " " + (i+startnum).toString();
                    }else{
                        secP[i].name = renamer_nameEt.text + " " + (secP.length-i+startnum-1).toString();
                    }
                }catch(e){continue;}
            }

        }

        app.endUndoGroup;
    };

    //Prop_selctect
    renamer_SelectPropBtn.onClick = function () 
    {
        app.beginUndoGroup(scriptName);
        var thisComp = app.project.activeItem;
        var secP = thisComp.selectedProperties;
        for(var i = 0;i<=secP.length;i++){
            var curP = secP[i];
            if(regexp != 1){
                if(curP.name.indexOf(na) == -1){
                    curP.selected = 0;
                }
                // var reg = new RegExp("^"+na+".*(\d+)*$","g");
            }else if(regexp == 1){
                var reg = new RegExp(na,"g");
                curP.selected = !(reg.test(curP.name));
            }
        }

        app.endUndoGroup;
    };

    // PropExtract
    renamer_ExtractPropNameBtn.onClick = function () 
    {
        app.beginUndoGroup(scriptName);
        var thisComp = app.project.activeItem;
        var secP = thisComp.selectedProperties;
        na = secP[0].name.replace(/(\s*\d+)$/,"");
        renamer_nameEt.text = na;

        app.endUndoGroup;
    };

    // edit text
    renamer_nameEt.onChange = function () 
    {
        na = this.text;
    }

    renamer_labelEt.onChange = function () 
    {
        this.text = eval(this.text);
        if (isNaN(this.text))
        {
            this.text = 0;
        }
        this.parent.labelSlider.value = Math.round(this.text);
        la = clamp(0,16);
        la = parseInt(this.text);
    }

    renamer_startnumEt.onChange = function () 
    {
        this.text = eval(this.text);
        if (isNaN(this.text))
        {
            this.text = 0;
        }
        startnum = parseInt(this.text);
    }

    // slider
    renamer_labelSlider.onChange = renamer_labelSlider.onChanging = function () 
    {
        this.value = Math.round(this.value);
        this.parent.labelEt.text = this.value;
        la = this.value;
    };

    // box
    renamer_zeroBox_.onClick = function () 
    {
        zeroBox = this.value;
    }

    renamer_RegExpBox_.onClick = function () 
    {
        if(this.value == 1){
            renamer_nameEt.text = '^'+renamer_nameEt.text+'.*(\\d+)*$';
        }else if(this.value == 0){
            renamer_nameEt.text = renamer_nameEt.text.replace(".*(\\d+)*$","");
            renamer_nameEt.text = renamer_nameEt.text.replace("^","");
        }
        na = renamer_nameEt.text;
        regexp = this.value;
    }

    renamer_revBox_.onClick = function () 
    {
        revBox = this.value;
    }

    renamer_labelBox_.onClick = function () 
    {
        labelbox = this.value;
    }

    // Tab5 repeater
    // ====
    var repeater_tab = tpanel1.add("tab", undefined, undefined, {name: "repeater_tab"}); 
        repeater_tab.text = "Repeater"; 
        repeater_tab.orientation = "column";
        repeater_tab.alignChildren = ["left","top"]; 
        repeater_tab.spacing = 10;
        tpanel1_tab_array.push(repeater_tab);

    // defult value
    var copiesNum = 5;
    var posXnum = 100;
    var posYnum = 0;
    var rotationNum = 0;
    var offsetBool = 0;

    var repeater_res =
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
        
        repeater_tab.gr = repeater_tab.add(repeater_res);
        // UI path
            // Btn
        var repeater_defultBtn = repeater_tab.gr.gr2.defultBtn;
        var repeater_xflipBtn = repeater_tab.gr.gr1.xflipBtn;
        var repeater_yflipBtn = repeater_tab.gr.gr1.yflipBtn;
        var repeater_xyflipBtn = repeater_tab.gr.gr1.xyflipBtn;
        var repeater_ringBtn = repeater_tab.gr.gr1.ringBtn;
        var repeater_interposeBtn = repeater_tab.gr.gr1.interposeBtn;
        var repeater_rot90Btn = repeater_tab.gr.gr2.rot90Btn;
        var repeater_rot180Btn = repeater_tab.gr.gr2.rot180Btn;
        var repeater_creatBoxBtn = repeater_tab.gr.gr2.creatBoxBtn;
        var repeater_creatCircleBtn = repeater_tab.gr.gr2.creatCircleBtn;
        var repeater_applyBtn = repeater_tab.gr.gr4.applyBtn;
            // UI value
        var repeater_copiesSlider = repeater_tab.gr.gr3.copiesSlider;
        var repeater_copiesEt = repeater_tab.gr.gr3.copiesEt;
        var repeater_posXEt = repeater_tab.gr.gr3.posXEt;
        var repeater_posYEt = repeater_tab.gr.gr3.posYEt;
        var repeater_rotSlider = repeater_tab.gr.gr4.rotSlider;
        var repeater_rotEt = repeater_tab.gr.gr4.rotEt;
        var repeater_offsetBox = repeater_tab.gr.gr4.offsetBox;

        // Slider
        repeater_copiesSlider.onChange = repeater_copiesSlider.onChanging = function () 
        {
            this.value = Math.round(this.value);
            this.parent.copiesEt.text = this.value;
            copiesNum = this.value;
        };

        repeater_rotSlider.onChange = repeater_rotSlider.onChanging = function () 
        {
            this.value = Math.round(this.value);
            this.parent.rotEt.text = Math.round(this.value*45);
            rotationNum = Math.round(this.value*45);
        };
                    // Et
        repeater_copiesEt.onChange =  function () 
        {
            this.text = eval(this.text);
            if (isNaN(this.text))
            {
                this.text = 1;
            }
            this.parent.copiesSlider.value = parseInt(this.text);  
            copiesNum = parseInt(this.text);
        };

        repeater_posXEt.onChange =  function () 
        {
            this.text = eval(this.text);
            if (isNaN(this.text))
            {
                this.text = 1;
            } 
            posXnum = parseInt(this.text);
        };

        repeater_posYEt.onChange =  function () 
        {
            this.text = eval(this.text);
            if (isNaN(this.text))
            {
                this.text = 1;
            } 
            posYnum = parseInt(this.text);
        };

        repeater_rotEt.onChange =  function () 
        {
            this.text = eval(this.text);
            if (isNaN(this.text))
            {
                this.text = 1;
            } 
            rotationNum = parseInt(this.text);
        };
                    // box
        repeater_offsetBox.onClick = function () 
        {
            offsetBool = this.value;
        }
        // functions

        // var repeaterArr = [];
        // var rep_layerArr = [];
        function add_repeater(){
            var thisComp = app.project.activeItem;
            var secP = thisComp.selectedProperties;
            var secL = thisComp.selectedLayers;
            var repeaterArr = [];
            var rep_layerArr = [];
            var rep_lay = [];
            if(secP.length == 0 && secL.length != 0){
                for(var i = 0;i<secL.length;i++){
                    if(secL[i].matchName == "ADBE Vector Layer"){
                        var repeater = secL[i]("Contents").addProperty("ADBE Vector Filter - Repeater");
                        repeaterArr.push(repeater);
                        rep_layerArr.push(secL[i]);
                    }
                }
            }else if(secP.length != 0){
                for(var i = 0;i<secP.length;i++){
                    var secObj = secP[i];
                    for(var j = 0;j<5;j++){
                        if(secObj.matchName == "ADBE Vector Group"){
                            var repeater = secObj.content.addProperty("ADBE Vector Filter - Repeater");
                            repeaterArr.push(repeater);
                            var current_layer = repeater.propertyGroup(repeater.propertyDepth);
                            rep_layerArr.push(current_layer);
                            break;
                        }
                        else if(secObj.matchName == "ADBE Vector Layer"){break;}
                        else{secObj = secObj.propertyGroup(1);}
                    }
                }
            }
            rep_lay.push(repeaterArr,rep_layerArr);
            return rep_lay;
            // var arrstr = "";
            // for(var element in rep_layerArr){
            //     arrstr += element + "\n";
            // }
            // alert(arrstr);
        }

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

            // add repeater
            var repeaterArr = [];
            var rep_layerArr = [];
            var patharr = add_repeater();
            repeaterArr = patharr[0];
            rep_layerArr = patharr[1];
            
            for(var i = 0;i<repeaterArr.length;i++){
                repeaterArr[i].property("ADBE Vector Repeater Copies").setValue(2);
                repeaterArr[i].property("ADBE Vector Repeater Transform").property("Scale").setValue([-100,100]);
                repeaterArr[i].name = "X flip - Repeater";
            }

        }

        // Y flip
        function shape_yflip(){
            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            var secP = thisComp.selectedProperties;
            // add repeater
            var repeaterArr = [];
            var rep_layerArr = [];
            var patharr = add_repeater();
            repeaterArr = patharr[0];
            rep_layerArr = patharr[1];
            
            for(var i = 0;i<repeaterArr.length;i++){
                
                repeaterArr[i].property("ADBE Vector Repeater Copies").setValue(2);
                repeaterArr[i].property("ADBE Vector Repeater Transform").property("Scale").setValue([100,-100]);
                repeaterArr[i].name = "Y flip - Repeater";
            }
        }

        // XY flip
        function shape_xyflip(){
            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            var secP = thisComp.selectedProperties;
            // add repeater
            var repeaterArr = [];
            var rep_layerArr = [];
            var patharr = add_repeater();
            repeaterArr = patharr[0];
            rep_layerArr = patharr[1];
            
            for(var i = 0;i<repeaterArr.length;i++){
                repeaterArr[i].property("ADBE Vector Repeater Copies").setValue(2);
                repeaterArr[i].property("ADBE Vector Repeater Transform").property("Scale").setValue([-100,-100]);
                repeaterArr[i].name = "XY flip - Repeater";
            }
        }

        // 90 degree duplicate
        function shape_90_degree_duplicate(){
            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            var secP = thisComp.selectedProperties;
            // add repeater
            var repeaterArr = [];
            var rep_layerArr = [];
            var patharr = add_repeater();
            repeaterArr = patharr[0];
            rep_layerArr = patharr[1];
            
            for(var i = 0;i<repeaterArr.length;i++){
                
                repeaterArr[i].property("ADBE Vector Repeater Copies").setValue(2);
                repeaterArr[i].property("ADBE Vector Repeater Transform").property("Rotation").setValue(90);
                repeaterArr[i].name = "90 degree - Repeater";
            }
        }

        // 180 degree duplicate
        function shape_180_degree_duplicate(){
            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            var secP = thisComp.selectedProperties;

            // add repeater
            var repeaterArr = [];
            var rep_layerArr = [];
            var patharr = add_repeater();
            repeaterArr = patharr[0];
            rep_layerArr = patharr[1];
            
            for(var i = 0;i<repeaterArr.length;i++){
                
                repeaterArr[i].property("ADBE Vector Repeater Copies").setValue(2);
                repeaterArr[i].property("ADBE Vector Repeater Transform").property("Rotation").setValue(180);
                repeaterArr[i].name = "180 degree - Repeater";
            }
        }

        // Ring round duplicate
        function ring_round_duplicate(copies){
            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            var secP = thisComp.selectedProperties;

            // add repeater
            var repeaterArr = [];
            var rep_layerArr = [];
            var patharr = add_repeater();
            repeaterArr = patharr[0];
            rep_layerArr = patharr[1];

            for(var i = 0;i<repeaterArr.length;i++){
                var depth_idx_str = repeaterArr[i].propertyDepth + "_" + repeaterArr[i].propertyIndex;
                var slider = rep_layerArr[i].Effects.addProperty("ADBE Slider Control");
                slider.name = "Copies " + depth_idx_str;
                slider(1).setValue(copies);
                repeaterArr[i].property("ADBE Vector Repeater Copies").expression = "effect(\"" + slider.name + "\")(\"Slider\")";
                repeaterArr[i].name = "Ring - Repeater " + depth_idx_str;
                repeaterArr[i].property("ADBE Vector Repeater Transform").property("Rotation").expression = "thisProperty.propertyGroup(2).copies == 0?0:360/thisProperty.propertyGroup(2).copies;";
            }
        }
        // Interpose dulplicate repeater
        function interpose_duplicate(copies,pos){
            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            var secP = thisComp.selectedProperties;

            // add repeater
            var repeaterArr = [];
            var rep_layerArr = [];
            var patharr = add_repeater();
            repeaterArr = patharr[0];
            rep_layerArr = patharr[1];
                
            for(var i = 0;i<repeaterArr.length;i++){
                var slider = rep_layerArr[i].Effects.addProperty("ADBE Slider Control");
                var depth_idx_str = repeaterArr[i].propertyDepth + "_" + repeaterArr[i].propertyIndex;
                slider.name = "Copies " + depth_idx_str;
                slider(1).setValue(copies);
                repeaterArr[i].property("ADBE Vector Repeater Copies").expression = "effect(\"" + slider.name + "\")(\"Slider\")";
                repeaterArr[i].property("ADBE Vector Repeater Offset").expression = "(thisProperty.propertyGroup(1).copies-1) * -0.5";
                
                var position_slider = rep_layerArr[i].Effects.addProperty("ADBE Point Control");
                position_slider.name = "Pos - Repeater " + depth_idx_str;
                position_slider(1).setValue(pos);
                repeaterArr[i].property("ADBE Vector Repeater Transform").property("Position").expression = "effect(\"" + position_slider.name + "\")(\"Point\")";
                repeaterArr[i].name = "Interpose - Repeater " + depth_idx_str;
            }
            
        }

        // event callbacks
        repeater_defultBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            shape_defult();
            app.endUndoGroup;
        };

        repeater_xflipBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            shape_xflip();
            app.endUndoGroup;
        };

        repeater_yflipBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            shape_yflip();
            app.endUndoGroup;
        };

        repeater_xyflipBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            shape_xyflip();
            app.endUndoGroup;
        };

        repeater_ringBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            ring_round_duplicate(8);
            app.endUndoGroup;
        };

        repeater_interposeBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            interpose_duplicate(5,[100,0]);
            app.endUndoGroup;
        };

        repeater_rot90Btn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            shape_90_degree_duplicate();
            app.endUndoGroup;
        };
        
        repeater_rot180Btn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            shape_180_degree_duplicate();
            app.endUndoGroup;
        };

        repeater_creatBoxBtn.onClick = function () 
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

        repeater_creatCircleBtn.onClick = function () 
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

        repeater_applyBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            var secP = thisComp.selectedProperties;
            // add repeater
            var repeaterArr = [];
            var rep_layerArr = [];
            var patharr = add_repeater();
            repeaterArr = patharr[0];
            rep_layerArr = patharr[1];

            for(var i = 0;i<repeaterArr.length;i++){
                
                repeaterArr[i].property("ADBE Vector Repeater Copies").setValue(copiesNum);
                if(offsetBool == 1){
                    repeaterArr[i].property("ADBE Vector Repeater Offset").expression = "(thisProperty.propertyGroup(1).copies-1) * -0.5";
                }
                repeaterArr[i].property("ADBE Vector Repeater Transform").property("Position").setValue([posXnum,posYnum]);
                repeaterArr[i].property("ADBE Vector Repeater Transform").property("Rotation").setValue(rotationNum);
            }
            app.endUndoGroup;
        };

    // Tab6 Property Tracer 
    
    var propertyTracer_tab = tpanel1.add("tab", undefined, undefined, {name: "propertyTracer_tab"}); 
    propertyTracer_tab.text = "PropertyTracer"; 
    propertyTracer_tab.orientation = "column";
    propertyTracer_tab.alignChildren = ["left","top"]; 
    propertyTracer_tab.spacing = 10;
    tpanel1_tab_array.push(propertyTracer_tab);

    var propPath = '("Transform")("Opacity")';
    var property_value = 0;
    var pt_exp = "'value'";
    var pt_expBox = 1;
    var changeValueBox = 1;
    var matchBox = 0;

    var lastExp = '';
    var expReverseInvert = 0;

    function expslice(pt_exp,cutpointword){
        return pt_exp.slice(0,pt_exp.search(cutpointword)+1);
    }
    function relaPathExp(bool,cover){
        var thisComp = app.project.activeItem;
        var secP = thisComp.selectedProperties;
    
        var propPathArr0 = [];
        var propPathArr1 = [];

        var curP0;
        var curP1;

        // 排除选到组
        for(var i = 0;i<secP.length;i++){
            if(secP[i].canSetExpression == 0){continue;}
            if(secP[i].canSetExpression && (curP0 == undefined)){
                curP0 = secP[i];
                continue;
            }
            if(secP[i].canSetExpression && (curP1 == undefined) && (curP0 != undefined)){
                curP1 = secP[i];
                break;
            }
        }
        // alert(curP0.name + '\n' + curP1.name);
        if(curP0 == undefined || curP1 == undefined){return;}

        var booleanbox = 0^expReverseInvert;

        if(booleanbox == 0){
            if(curP0.expression != ""){
                curP0.expression = expslice(curP0.expression,lastExp);
            }
        }else{
            if(curP1.expression != ""){
                curP1.expression = expslice(curP1.expression,lastExp);
            }
        }

        var curPs;
        if(bool){
            curPs = curP0;
            curP0 = curP1;
            curP1 = curPs;
        }
        var curP0c = curP0;
        var curP1c = curP1;
        var depth0 = curP0.propertyDepth;
        var depth1 = curP1.propertyDepth;
    
        function nametrans(namestr){
            namestr = namestr.toLowerCase();
            var outputStr = '';
            var last_is_Space = 0;
            for(var i = 0;i<namestr.length;i++){
                if(namestr[i] == ' '){last_is_Space = 1;continue;}
                if(last_is_Space == 1){
                    last_is_Space = 0;
                    outputStr += namestr[i].toUpperCase();
                }else{
                    outputStr += namestr[i];
                }
            }
            return outputStr;
        }
    
        // 提取路径数组
        for(var i = 0;i<depth0;i++){
            propPathArr0.push(curP0);
            curP0 = curP0.propertyGroup(1);
        }
        propPathArr0.reverse();
    
        for(var i = 0;i<depth1;i++){
            propPathArr1.push(curP1);
            curP1 = curP1.propertyGroup(1);
        }
        propPathArr1.reverse();
    
        // 比较数组，删除相同部分
        var minlength = propPathArr0.length > propPathArr1.length ? propPathArr1.length:propPathArr0.length;
    
        // 删除的时候数组有变化，需要一起删，新建变量存删除的长度
        var deleteNum = 0;
    
        var last_is_Contents = 0;

        for(var i = 0;i<minlength;i++){
            if(propPathArr0[i] == propPathArr1[i]){
                if((propPathArr0[i].name == "Contents" || propPathArr0[i].name == "内容" ) && (propPathArr1[i].name == "Contents" || propPathArr1[i].name == "内容" )){
                    last_is_Contents = 1;
                }else{
                    last_is_Contents = 0;
                }
                continue;
            }else{
                if(last_is_Contents == 1){
                    deletenum = i-1;
                }else{deletenum = i;}
                break;
            }
        }
    
        var propPathArr0 = propPathArr0.slice(deletenum);
        var propPathArr1 = propPathArr1.slice(deletenum);
    
        // 同组内tranform情况下换位
        // var propPathArrSave = [];
        // var trans = 0;
        // if(propPathArr0[0].name == "Transform"){
        //     trans = 1;
        //     propPathArrSave = propPathArr1;
        //     propPathArr1 = propPathArr0;
        //     propPathArr0 = propPathArrSave;
        // }
    
        // 检测器
    
        // var alstr = "";
        // for(var i = 0;i<propPathArr1.length;i++){
        //     alstr += propPathArr1[i].name;
        // }
        // alert(alstr);
        // 表达式字符串生成
        var pgroup = propPathArr0.length;
        var expstr = "thisProperty.propertyGroup(" + pgroup + ").";
        last_is_Contents = 0;

        for(var i = 0;i<propPathArr1.length;i++){
            if(propPathArr1[i].name == "Contents" || propPathArr1[i].name == "内容"){
                expstr += "content(\"";
                last_is_Contents = 1;
                continue;
            }
            if(last_is_Contents == 1){
                expstr += propPathArr1[i].name;
                expstr += "\").";
                last_is_Contents = 0;
                continue;
            }
            if(i != propPathArr1.length-1){expstr += nametrans(propPathArr1[i].name)+'.';}
            else{expstr += nametrans(propPathArr1[i].name);}
        }
        var finProp;
        
        finProp = curP0c;
        
        if(cover){
            finProp.expression = expstr;
        }else{
            finProp.expression += expstr;
        }
        lastExp = expstr;
        pt_exp = lastExp;
    }

    // resource specifications
    var propertyTracer_res =
    "group { orientation:'column', alignment:['fill','fill'], alignChildren:['left','top'], \
        gr1: Group { alignment:['fill','top'],\
            matchBox: Checkbox { text:'Match',preferredSize:[59,17],value:"+matchBox+" }, \
            pathEt: EditText { text:'"+propPath+"',alignment:['fill','fill'], preferredSize:[190,20],properties: { multiline: true } } \
        }, \
        gr2: Group { alignment:['fill','top'], \
            changeValueBox: Checkbox { text:'Value', value:"+changeValueBox+" , preferredSize:[59,17] }, \
            valueEt: EditText { text:'"+property_value+"',alignment:['left','center'], preferredSize:[190,20],alignment:['fill','fill'] } \
        }, \
        gr3: Group { alignment:['fill','top'], \
            shapeExpBtn: Button { text:'ShapeRelaExp ↑↓', preferredSize:[120,20],alignment:['right','top'] } \
            ApplyBtn: Button { text:'Apply', preferredSize:[60,20],alignment:['right','top'] } \
            SelectBtn: Button { text:'Select', preferredSize:[60,20],alignment:['right','top'] } \
            ExtractBtn: Button { text:'Extract', preferredSize:[60,20],alignment:['right','top'] } \
        }, \
        gr4: Group { orientation:'row', alignment:['fill','top'], \
            pt_expBox: Checkbox { text:'Expression',value:"+pt_expBox+",alignment:['left','top']}    \
            propApplyBtn: Button { text:'P_Apply', preferredSize:[60,20],alignment:['right','top'] } \
            propSelectBtn: Button { text:'P_Select', preferredSize:[60,20],alignment:['right','top'] } \
            propAddBtn: Button { text:'P_Add', preferredSize:[60,20],alignment:['right','top'] } \
        }, \
        gr5: Group { orientation:'row', alignment:['fill','fill'], \
            expEt: EditText { text:'value',alignment:['fill','fill'] ,preferredSize:[300,300] ,properties: { multiline: true }} \
        }, \
    }"; 
    propertyTracer_tab.gr = propertyTracer_tab.add(propertyTracer_res);

    var propertyTracer_matchBox = propertyTracer_tab.gr.gr1.matchBox;
    var propertyTracer_pathEt = propertyTracer_tab.gr.gr1.pathEt;

    var propertyTracer_changeValueBox = propertyTracer_tab.gr.gr2.changeValueBox;
    var propertyTracer_valueEt = propertyTracer_tab.gr.gr2.valueEt;

    var propertyTracer_shapeExpBtn = propertyTracer_tab.gr.gr3.shapeExpBtn;
    var propertyTracer_ApplyBtn = propertyTracer_tab.gr.gr3.ApplyBtn;
    var propertyTracer_SelectBtn = propertyTracer_tab.gr.gr3.SelectBtn;
    var propertyTracer_ExtractBtn = propertyTracer_tab.gr.gr3.ExtractBtn;

    var propertyTracer_pt_expBox = propertyTracer_tab.gr.gr4.pt_expBox;
    var propertyTracer_propApplyBtn = propertyTracer_tab.gr.gr4.propApplyBtn;
    var propertyTracer_propSelectBtn = propertyTracer_tab.gr.gr4.propSelectBtn;
    var propertyTracer_propAddBtn = propertyTracer_tab.gr.gr4.propAddBtn;

    var propertyTracer_expEt = propertyTracer_tab.gr.gr5.expEt;

    // Apply
    propertyTracer_ApplyBtn.onClick = function () 
    {
        app.beginUndoGroup(scriptName);
        var slayers = app.project.activeItem.selectedLayers;
        var cut = app.project.activeItem.time;
        if(property_value instanceof Array){
            var nval = "[" + property_value.toString() + "]";  
        }else{var nval = property_value ;}
        // change the value
        if(changeValueBox == 1){
            eval(
                "\
                for(var i = 0;i<slayers.length;i++){ \
                    try{\
                        if(slayers[i] " + propPath + ".canSetExpression){ \
                            if(slayers[i]  " + propPath + ".numKeys == 0){ \
                                slayers[i]  " + propPath + " .setValue(  " + nval + "  ) ; \
                            }else{\
                                slayers[i]  " + propPath + " .setValueAtTime( " + cut + " ," + nval + "  ) ;\
                            } \
                        } \
                    }catch(e){continue;}\
                }"
            );
        }
        // expression
        if(pt_expBox == 1){
            eval("\
                for(var i = 0;i<slayers.length;i++){ \
                    try{\
                        slayers[i] " + propPath + " .expression = \'" + pt_exp.toString() + "\'; \
                    }catch(e){continue;}\
                } \
            ")
        }
        app.endUndoGroup;
    };
    // Select
    propertyTracer_SelectBtn.onClick = function () 
    {
        app.beginUndoGroup(scriptName);
        var thisComp = app.project.activeItem;
        var secL = thisComp.selectedLayers;
        var secP = thisComp.selectedProperties;
        if(secP.length!=0){
            for(var i = 0;i<secP.length;i++){
                secP[i].selected = 0;
            }
        }
        eval(
            "for(var i = 0;i<secL.length;i++){ \
            try{\
                secL[i]" + propPath + ".selected = 1; \
                }catch(e){continue;}\
            }"
        );
        app.endUndoGroup;
    };

    // Extract
    propertyTracer_ExtractBtn.onClick = function () 
    {
        app.beginUndoGroup(scriptName);
        var thisComp = app.project.activeItem;
        var secP = thisComp.selectedProperties;
        var secL = thisComp.selectedLayers;
        var pathstr = "";
        var thisP;
        // 找到可以打表达式的属性
        for(var i=0;i<secP.length;i++)
        {
            if(secP[i].canSetExpression){thisP = secP[i];break}
            if(i == secP.length-1){thisP = secP[i];}
        }
        if(thisP == undefined){thisP = secP[0];}
        if(thisP.value != undefined){
            property_value = thisP.value;
        }else{
            property_value = thisP.matchName;
        }
        var depth = thisP.propertyDepth;
        var curP = thisP;
        
        // 生成路径str;
        for(var i = 0;i<depth;i++){
            if(matchBox == 1){
                pathstr = "(\"" + curP.matchName + "\")" + pathstr;
            }else{
                pathstr = "(\"" + curP.name + "\")" + pathstr;
            }
            curP = curP.propertyGroup(1);
        }
        // pathstr = pathstr.toLowerCase();//转小写
        propPath = pathstr;
        
        var cut = app.project.activeItem.time;
        propertyTracer_pathEt.text = pathstr;
        propertyTracer_valueEt.text = property_value;
        propertyTracer_expEt.text = thisP.expression;
        pt_exp = "'" + thisP.expression + "'";
        app.endUndoGroup;
    };
    // Shape pt_exp
    propertyTracer_shapeExpBtn.onClick = function () 
    {
        app.beginUndoGroup(scriptName);
        relaPathExp(1^expReverseInvert,0);
        propertyTracer_expEt.text = pt_exp;
        expReverseInvert = !expReverseInvert;
        app.endUndoGroup;
    }

    // propApply
    propertyTracer_propApplyBtn.onClick = function () 
    {
        app.beginUndoGroup(scriptName);
        var secP = app.project.activeItem.selectedProperties;
        var cut = app.project.activeItem.time;
        if(property_value instanceof Array){
            var nval = "[" + property_value.toString() + "]";  
        }else{var nval = property_value ;}
        // change the value
        if(changeValueBox == 1){
            eval(
                "for(var i = 0;i<secP.length;i++){ \
                    try{ \
                        if(secP[i] " + propPath + ".canSetExpression){ \
                            if(secP[i]  " + propPath + ".numKeys == 0){ \
                                secP[i]  " + propPath + " .setValue(  " + nval + "  ) ; \
                            }else{\
                                secP[i]  " + propPath + " .setValueAtTime( " + cut + " ," + nval + "  ) ;\
                            } \
                        } \
                    }catch(e){continue;}\
                }"
            );
        }
        // expression
        if(pt_expBox == 1){
            eval("\
                for(var i = 0;i<secP.length;i++){ \
                    try{ \
                        secP[i] " + propPath + " .expression = \'" + pt_exp.toString() + "\'; \
                    }catch(e){continue;}\
                }\
            ");
        }

    };
    // propSelect
    propertyTracer_propSelectBtn.onClick = function () 
    {
        app.beginUndoGroup(scriptName);
        var thisComp = app.project.activeItem;
        var secL = thisComp.selectedLayers;
        var secP = thisComp.selectedProperties;
        eval(
            "var secPc = [];\
            for(var i = 0;i<secP.length;i++){ \
                secPc.push(secP[i])\
                secP[i].selected = 0;\
            }\
            for(var i = 0;i<secPc.length;i++){ \
                try{\
                    secPc[i]" + propPath + ".selected = 1; \
                }catch(e){continue;}\
            }"
        );
        app.endUndoGroup;
    };

    // propAdd
    propertyTracer_propAddBtn.onClick = function () 
    {
        app.beginUndoGroup(scriptName);
        var thisComp = app.project.activeItem;
        var secP = thisComp.selectedProperties;
        eval(
            "for(var i = 0;i<secP.length;i++){ \
                try{\
                    secP[i]" + propPath + ".addProperty(\"" + property_value + "\"); \
                }catch(e){continue;}\
            }"
        );
        app.endUndoGroup;
    };

    // pathEt
    propertyTracer_pathEt.onChange = function () 
    {
        propPath = this.text;
    }
    // valueEt
    propertyTracer_valueEt.onChange = function () 
    {
        if(/,/.test(this.text))
        {
            property_value = this.text.split(",");

        }else{
            this.text = eval(this.text);
            property_value = parseFloat(this.text);
        }
    }
    propertyTracer_expEt.onChange = function () 
    {
        pt_exp = this.text;
    }
    // propertyTracer_labelSlider.onChange = propertyTracer_labelSlider.onChanging = function () 
    // {
    //     this.value = Math.round(this.value);
    //     this.parent.labelEt.text = this.value;
    //     la = this.value;
    // };

    // box
    propertyTracer_matchBox.onClick = function () 
    {
        matchBox = this.value;
    }
    propertyTracer_changeValueBox.onClick = function () 
    {
        changeValueBox = this.value;
    }
    propertyTracer_pt_expBox.onClick = function () 
    {
        pt_expBox = this.value;
    }
    
    // Tab6 Property Tracer 

    var slider_creator_tab = tpanel1.add("tab", undefined, undefined, {name: "slider_creator_tab"}); 
        slider_creator_tab.text = "Slider Creator"; 
        slider_creator_tab.orientation = "column";
        slider_creator_tab.alignChildren = ["left","top"]; 
        slider_creator_tab.spacing = 10;
        tpanel1_tab_array.push(slider_creator_tab);

    var sc_sliderCount = 1;
    var sc_oneBox = 0;
    var sc_allBox = 1;
    var sc_nameBox = 0;
    var sc_slidertype = 0;
    var sc_sliderName = 'Dalimao';
    var sc_typeArr = ["ADBE Slider Control","ADBE Point Control","ADBE Point3D Control","ADBE Color Control","ADBE Angle Control","ADBE Checkbox Control","ADBE Layer Control"];

    Property.prototype.contaningLayer = function(){
        return this.propertyGroup(this.propertyDepth);
    }
    function findPropertyLayer (prop){
        return prop.propertyGroup(prop.propertyDepth);
    }

    // resource specifications
    var slider_creator_res =
    "group { orientation:'column', alignment:['fill','fill'], alignChildren:['left','top'], \
        gr1: Group { \
            sc_createBtn: Button { text:'Create & Exp',alignment:['left','top'], preferredSize:[80,20] } \
            sc_oneBox: Checkbox { text:'1 width',preferredSize:[60,17],value:"+sc_oneBox+"}    \
            sc_allBox: Checkbox { text:'x y z = a',preferredSize:[80,17],value:"+sc_allBox+"}    \
            sc_addaptBtn: Button { text:'Adapt Exp',alignment:['left','top'], preferredSize:[80,20] } \
        }, \
        gr2: Group {  alignment:['fill','top'],\
            onlysc_createBtn: Button { text:'Only Create',alignment:['left','top'], preferredSize:[80,20] } \
            sc_typeSlider: Slider { alignment:['fill','center'], preferredSize:[20,17],minvalue:0 ,maxvalue:6,value:" + sc_slidertype + " } \
            sc_typeEt:EditText { text:'" + parseInt(sc_slidertype+1) + "',alignment:['right','top'] ,preferredSize:[25,20]} \
            sc_typeSt: StaticText { text:'" + sc_typeArr[0].toString().slice(5) + "',alignment:['left','top'], preferredSize:[95,17] } \
            crossSt: StaticText { text:'×',alignment:['left','top'], preferredSize:[17,17] } \
            sc_countSlider: Slider { alignment:['fill','top'], preferredSize:[20,17],minvalue:1 ,maxvalue:10,value:" + sc_sliderCount + " } \
            sc_countEt:EditText { text:'" + sc_sliderCount + "',alignment:['right','top'] ,preferredSize:[25,20]} \
        }, \
        gr3: Group { orientation:'row', alignment:['fill','top'], \
            sc_nameBox: Checkbox { text:'Rename',preferredSize:[70,17],value:"+ sc_nameBox +"}    \
            sc_sliderNameEt: EditText { text:'" + sc_sliderName + "',alignment:['fill','center'] ,preferredSize:[300,20] ,properties: { multiline: false }} \
        }, \
        gr4: Group { orientation:'row', alignment:['fill','fill'], \
            thisLayerSt: StaticText { text:'thisLayer',alignment:['left','top'],preferredSize:[70,20] }    \
            thisLayerEt: EditText { text:'effect',alignment:['fill','fill'] ,preferredSize:[300,20] ,properties: { multiline: true }} \
        }, \
        gr5: Group { orientation:'row', alignment:['fill','fill'], \
            otherLayerSt: StaticText { text:'otherLayer',alignment:['left','top'],preferredSize:[70,20] }    \
            otherLayerEt: EditText { text:'thisComp.layer',alignment:['fill','fill'] ,preferredSize:[300,20] ,properties: { multiline: true }} \
        }, \
    }"; 
    slider_creator_tab.gr = slider_creator_tab.add(slider_creator_res);

    //gr1
    var sc_createBtn = slider_creator_tab.gr.gr1.sc_createBtn;
    var sc_oneBox_ = slider_creator_tab.gr.gr1.sc_oneBox;
    var sc_allBox_ = slider_creator_tab.gr.gr1.sc_allBox;
    var sc_addaptBtn = slider_creator_tab.gr.gr1.sc_addaptBtn;
    //gr2
    var sc_typeSlider = slider_creator_tab.gr.gr2.sc_typeSlider;
    var onlysc_createBtn = slider_creator_tab.gr.gr2.onlysc_createBtn;
    var sc_typeEt = slider_creator_tab.gr.gr2.sc_typeEt;
    var sc_typeSt = slider_creator_tab.gr.gr2.sc_typeSt;
    var sc_countSlider = slider_creator_tab.gr.gr2.sc_countSlider;
    var sc_countEt = slider_creator_tab.gr.gr2.sc_countEt;
    //gr3
    var sc_nameBox_ = slider_creator_tab.gr.gr3.sc_nameBox;
    var sc_sliderNameEt = slider_creator_tab.gr.gr3.sc_sliderNameEt;
    //gr4&5
    var thisLayerEt = slider_creator_tab.gr.gr4.thisLayerEt;
    var otherLayerEt = slider_creator_tab.gr.gr5.otherLayerEt;
    
    // event callbacks
    sc_createBtn.onClick = function () 
    {
        app.beginUndoGroup(scriptName);
        var thisComp = app.project.activeItem;
        var secP = thisComp.selectedProperties;
        var secL = thisComp.selectedLayers;
        var cursecL = secL[0];

        thisLayerEt.text ='';
        otherLayerEt.text ='';


        if(secP.length == 0){//不选属性只选图层
            for(var i=0;i<secL.length;i++)
            {
                var eff = secL[i].Effects.addProperty(sc_typeArr[0]);
                thisLayerEt.text += 'effect("' + eff.name + '")("' + eff(1).name + '");\n';
                otherLayerEt.text += 'thisComp.layer("' + secL[i].name + '").effect("' + eff.name + '")("' + eff(1).name + '");\n';
            }
        }else{//有选中属性
            for(var j=0;j<secP.length;j++)
            {
                cursecL = findPropertyLayer(secP[j]);
                if(secP[j].canSetExpression){
                    var eff;
                    var valuewidth = 1;
                    if(secP[j].value.length!=undefined){
                        valuewidth = secP[j].value.length;
                    }

                    if(sc_oneBox == 1){//只加一个滑块
                        eff = cursecL.Effects.addProperty(sc_typeArr[0]);
                        try{
                            if(sc_nameBox == 0){
                                // 获得深度序号
                                var depth_idx_str = " " + secP[j].propertyDepth + "_" + secP[j].propertyIndex;
                                eff.name = secP[j].name + depth_idx_str;//改名
                            }else{eff.name = sc_sliderName;}
                        }catch(e){}
                        eff(1).setValue(secP[j].value[0]);
                        secP[j].expression = 'sld = effect("' + eff.name + '")("' + eff(1).name + '");';
                        if(sc_allBox == 0){
                            if(valuewidth == 1){
                                secP[j].expression += '';
                            }else if(valuewidth == 2){
                                secP[j].expression += '\nx = sld;\ny = 0;\n[x,y]';
                            }else if(valuewidth == 3){
                                secP[j].expression += '\nx = sld;\ny = 0;z = 0;\n[x,y,z]';
                            }else if(valuewidth == 4){
                                secP[j].expression += '\nx = sld;\nyg = 0;b = 0;\na = 1;\n[r,g,b,a]';
                            }
                        }else{
                            if(valuewidth == 1){
                                secP[j].expression += '';
                            }else if(valuewidth == 2){
                                secP[j].expression += '\nx = sld;\ny = sld;\n[x,y]';
                            }else if(valuewidth == 3){
                                secP[j].expression += '\nx = sld;\ny = sld;z = sld;\n[x,y,z]';
                            }else if(valuewidth == 4){
                                secP[j].expression += '\nx = sld;\nyg = sld;b = sld;\na = 1;\n[r,g,b,a]';
                            }
                        }
                        thisLayerEt.text += 'effect("' + eff.name + '")("' + eff(1).name + '");\n';
                        otherLayerEt.text += 'thisComp.layer("' + cursecL.name + '").effect("' + eff.name + '")("' + eff(1).name + '");\n';
                    }else{
                        eff = cursecL.Effects.addProperty(sc_typeArr[valuewidth-1]);
                        try{
                            // 获得深度序号
                            var depth_idx_str = " " + secP[j].propertyDepth + "_" + secP[j].propertyIndex;
                            if(sc_nameBox == 0){
                                eff.name = secP[j].name + depth_idx_str;//改名
                            }else{eff.name = sc_sliderName;}
                        }catch(e){}
                        
                        //Et表达式中新加滑块的路径
                        thisLayerEt.text += 'effect("' + eff.name + '")("' + eff(1).name + '");\n';
                        otherLayerEt.text += 'thisComp.layer("' + cursecL.name + '").effect("' + eff.name + '")("' + eff(1).name + '");\n';
                        try{
                            eff(1).setValue(secP[j].value);//给滑块赋值
                            secP[j].expression = 'sld = effect("' + eff.name + '")("' + eff(1).name + '");';//绑上滑块
                        }catch(e){}
                    }
                }
            }
        }
        thisLayerEt.text = thisLayerEt.text.slice(0,-1);
        otherLayerEt.text = otherLayerEt.text.slice(0,-1);

        app.endUndoGroup;
    };

    sc_addaptBtn.onClick = function ()
    {
        app.beginUndoGroup(scriptName);
        var thisComp = app.project.activeItem;
        var secP = thisComp.selectedProperties;
        var secL = thisComp.selectedLayers;
        for(var i=0;i<secP.length;i++)
        {
            if(secP[i].canSetExpression){
                if(secP[i].expressionError != ""){
                    var experr = secP[i].expressionError;
                    var exp = secP[i].expression;
                    var exp_search = 0;
                    var slider_re_exp = /(?!\.)effect\(\"(.*)\"\)\(\"(.*)\"\)/;
                    var gr_arr = [];
                    while(exp_search!=-1){
                        exp_search = exp.search(slider_re_exp);
                        if(exp_search == -1){
                            break;
                        }
                        exp_match = exp.match(slider_re_exp);
                        gr_arr.push(exp_match);
                        exp = exp.replace(exp_match[0],"eff#$1##$2");
                    }
                    function same_name_detect(eff_name){
                        var name_is_same = 0;
                        if(secL[0].Effects.property(eff_name) != null){
                            name_is_same = 1;
                        };
                        return name_is_same;
                    }
                    function add_slider(type_str, slider_name){
                        if(same_name_detect(slider_name)==1){
                            return;
                        }
                        if(type_str == "Slider"||"滑块"||"ADBE Slider Control"){
                            eff = secL[0].Effects.addProperty("ADBE Slider Control");
                            eff.name = slider_name;
                        }else if(type_str == "Point"||"点"||"ADBE Point Control"){
                            eff = secL[0].Effects.addProperty("ADBE Point Control");
                            eff.name = slider_name;
                        }else if(type_str == "3D Point"||"3D点"||"ADBE Point3D Control"){
                            eff = secL[0].Effects.addProperty("ADBE Point3D Control");
                            eff.name = slider_name;
                        }else if(type_str == "Angle"||"角度"||"ADBE Angle Control"){
                            eff = secL[0].Effects.addProperty("ADBE Angle Control");
                            eff.name = slider_name;
                        }else if(type_str == "Checkbox"||"复选框"||"ADBE Checkbox Control"){
                            eff = secL[0].Effects.addProperty("ADBE Checkbox Control");
                            eff.name = slider_name;
                        }else if(type_str == "Color"||"颜色"||"ADBE Color Control"){
                            eff = secL[0].Effects.addProperty("ADBE Color Control");
                            eff.name = slider_name;
                        }
                    }
        
                    for(var i = 0;i<gr_arr.length;i++){
                        add_slider(gr_arr[i][2],gr_arr[i][1]);
                    }
                }
            }
        }
        // version befor 2023
        // var thisComp = app.project.activeItem;
        // var secP = thisComp.selectedProperties;
        // var secL = thisComp.selectedLayers;
        // for(var i=0;i<secP.length;i++)
        // {
        //     if(secP[i].canSetExpression){
        //         if(secP[i].expressionError != ""){
        //             var experr = secP[i].expressionError;
        //             var exp = secP[i].expression;
        //             var line_re_exp = /Error at line (\d+)/;
        //             var exparr = exp.split("\n");
        //             var experr_line = experr.match(line_re_exp)[1];
                    
        //             var slider_name_re_exp = /effect named ‘(.*)’ is missing/;
        //             var slider_name = experr.match(slider_name_re_exp)[1];

        //             var errline_str = exparr[experr_line-1];
        //             var errline_arrsplit = errline_str.split(slider_name)[1];
        //             var type_str = errline_arrsplit.match(/\"\)\(\"(.*)\"\)/)[1];
        //             var eff;
        //             if(type_str == "Slider"){
        //                 eff = secL[0].Effects.addProperty("ADBE Slider Control");
        //                 eff.name = slider_name;
        //             }else if(type_str == "Point"){
        //                 eff = secL[0].Effects.addProperty("ADBE Point Control");
        //                 eff.name = slider_name;
        //             }else if(type_str == "3D Point"){
        //                 eff = secL[0].Effects.addProperty("ADBE Point3D Control");
        //                 eff.name = slider_name;
        //             }else if(type_str == "Angle"){
        //                 eff = secL[0].Effects.addProperty("ADBE Angle Control");
        //                 eff.name = slider_name;
        //             }else if(type_str == "Checkbox"){
        //                 eff = secL[0].Effects.addProperty("ADBE Checkbox Control");
        //                 eff.name = slider_name;
        //             }
        //         }
        //     }
        // }
        app.endUndoGroup;
    }
    onlysc_createBtn.onClick = function () 
    {
        app.beginUndoGroup(scriptName);
        var thisComp = app.project.activeItem;
        var secP = thisComp.selectedProperties;
        var secL = thisComp.selectedLayers;
    
        thisLayerEt.text ='';
        otherLayerEt.text ='';

        if(secP.length != 0){//有选择属性
            for(var j=0;j<secP.length;j++)
            {
                var valuewidth = 1;
                cursecL = findPropertyLayer(secP[j]);
                if(secP[j].canSetExpression){
                    if(secP[j].value.length!=undefined){
                        valuewidth = secP[j].value.length;
                    }
                    var eff;
                    for(var k = 0;k<sc_sliderCount;k++){
                        eff = cursecL.Effects.addProperty(sc_typeArr[sc_slidertype]);
                        try{
                            if(sc_nameBox == 0){
                                eff.name = secP[j].name;//改名
                            }else{eff.name = sc_sliderName;}
                        }catch(e){}
                        eff.name += " " + parseInt(k+1).toString();
                        //创建滑块维度相等则给滑块赋值
                        if(sc_slidertype == valuewidth || (valuewidth == 1 && sc_slidertype == 4)){
                            eff(1).setValue(secP[j].value);//给滑块赋值
                        }
                        //Et表达式中新加滑块的路径
                        thisLayerEt.text += 'effect("' + eff.name + '")("' + eff(1).name + '");\n';
                        otherLayerEt.text += 'thisComp.layer("' + cursecL.name + '").effect("' + eff.name + '")("' + eff(1).name + '");\n';
                    }
                }
            }
        }else{//没有选择属性只选择层
            for(var i=0;i<secL.length;i++)
            {
                for(var k = 0;k<sc_sliderCount;k++){
                    var eff = secL[i].Effects.addProperty(sc_typeArr[sc_slidertype]);
                    if(sc_nameBox == 1){eff.name = sc_sliderName;}
                    eff.name += " " + parseInt(k+1).toString();
                    thisLayerEt.text += 'effect("' + eff.name + '")("' + eff(1).name + '");\n';
                    otherLayerEt.text += 'thisComp.layer("' + secL[i].name + '").effect("' + eff.name + '")("' + eff(1).name + '");\n';
                }
            }
        }
        //删掉最后的\n
        thisLayerEt.text = thisLayerEt.text.slice(0,-1);
        otherLayerEt.text = otherLayerEt.text.slice(0,-1);

        app.endUndoGroup;
    };

    // slider
    sc_typeSlider.onChange = sc_typeSlider.onChanging = function () 
    {
        this.value = Math.round(this.value);
        this.parent.sc_typeSt.text = sc_typeArr[this.value].toString().slice(5);
        this.parent.sc_typeEt.text = this.value + 1;
        sc_slidertype = this.value;
    };

    sc_countSlider.onChange = sc_countSlider.onChanging = function () 
    {
        this.value = Math.round(this.value);
        this.parent.sc_countEt.text = this.value;
        sc_sliderCount = this.value;
    };

    // Et
    sc_typeEt.onChange =  function () 
    {
        this.text = eval(this.text);
        if (isNaN(this.text))
        {
            this.text = 1;
        }
        this.parent.sc_typeSlider.value = parseInt(this.text)-1;  
        this.parent.sc_typeSt.text = sc_typeArr[parseInt(this.text)-1].toString().slice(5);
        sc_slidertype = parseInt(this.text)-1;
    };

    sc_countEt.onChange =  function () 
    {
        this.text = eval(this.text);
        if (isNaN(this.text))
        {
            this.text = 1;
        }
        this.parent.sc_countSlider.value = parseInt(this.text);  
        sc_sliderCount = parseInt(this.text);
    };

    sc_sliderNameEt.onChange =  function () 
    {
        sc_sliderName = this.text;
    };

    // box
    sc_oneBox_.onClick = function () 
    {
        sc_oneBox = this.value;
    }

    sc_nameBox_.onClick = function () 
    {
        sc_nameBox = this.value;
    }

    sc_allBox_.onClick = function () 
    {
        sc_allBox = this.value;
    }

    // Tab8 Property Tracer 

    var grid_tab = tpanel1.add("tab", undefined, undefined, {name: "grid_tab"}); 
    grid_tab.text = "Grid"; 
    grid_tab.orientation = "column";
    grid_tab.alignChildren = ["left","top"]; 
    grid_tab.spacing = 10;
    tpanel1_tab_array.push(grid_tab);

    var grid_columns = 5;
    var grid_column,grid_row;
    var grid_gap = [150,150]
    var grid_gapX = grid_gap[0];
    var grid_gapY = grid_gap[1];
    var grid_count = 10;
    var grid_expbox = 1;

    // resource specifications
    var grid_res =
    "group { orientation:'column', alignment:['left','top'], alignChildren:['left','center'], \
        gr1: Group { \
            countSt: StaticText { text:'Counts' ,preferredSize:[50,17]}    \
            countSlider: Slider { alignment:['left','center'], preferredSize:[100,17],minvalue:0 ,maxvalue:100,value:" + grid_columns + " } \
            countEt: EditText { text:" + grid_count + ",alignment:['left','center'], preferredSize:[40,17] } \
            copyBtn: Button { text:'Copy',alignment:['left','top'],preferredSize:[70,17] } \
            expBox: Checkbox { text:'Exp',preferredSize:[60,17],value:1}    \
        }, \
        gr2: Group { \
            columnsSt: StaticText { text:'Columns' ,preferredSize:[50,17]}    \
            columnsSlider: Slider { alignment:['left','center'], preferredSize:[100,17],minvalue:0 ,maxvalue:20,value:" + grid_columns + " } \
            columnsEt: EditText { text:" + grid_columns + ",alignment:['left','center'], preferredSize:[40,17] } \
            alignBtn: Button { text:'Align',alignment:['left','top'],preferredSize:[70,17] } \
        }, \
        gr3: Group { orientation:'row', alignment:['fill','fill'], \
            gapXSt: StaticText { text:'GapX',preferredSize:[50,17] }    \
            gapXSlider: Slider { alignment:['left','center'], preferredSize:[60,17],minvalue:0 ,maxvalue:200,value:" + grid_gapX + " } \
            gapXEt: EditText { text:" + grid_gapX + ",alignment:['left','center'], preferredSize:[40,17] } \
            gapYSt: StaticText { text:'GapY',preferredSize:[50,17] }    \
            gapYSlider: Slider { alignment:['left','center'], preferredSize:[60,17],minvalue:0 ,maxvalue:200,value:" + grid_gapY + " } \
            gapYEt: EditText { text:" + grid_gapY + ",alignment:['left','center'], preferredSize:[40,17] } \
        }, \
    }"; 

    grid_tab.gr = grid_tab.add(grid_res);

    var grid_countSlider = grid_tab.gr.gr1.countSlider;
    var grid_countEt = grid_tab.gr.gr1.countEt;
    var grid_columnsSlider = grid_tab.gr.gr2.columnsSlider;
    var grid_columnsEt = grid_tab.gr.gr2.columnsEt;
    var grid_copyBtn = grid_tab.gr.gr1.copyBtn;
    var grid_gapXSlider = grid_tab.gr.gr3.gapXSlider;
    var grid_gapXEt = grid_tab.gr.gr3.gapXEt;
    var grid_alignBtn = grid_tab.gr.gr2.alignBtn;
    var grid_gapYSlider = grid_tab.gr.gr3.gapYSlider;
    var grid_gapYEt = grid_tab.gr.gr3.gapYEt;
    var grid_expBoxUI = grid_tab.gr.gr1.expBox;

    function align(){
        var thisComp = app.project.activeItem;
        var secL = thisComp.selectedLayers;
        if(secL.length == 1){
            return;
        }
        var indexContinuity = 1;

        // check the continueity
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

        // add slider
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

        // align layers
        for(var i = 0;i<secL.length-1;i++){
            // align layers
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

    // event callbacks
    pal.onResizing = pal.onResize = function () 
    {
        this.layout.resize();
    }

    // countEt
    grid_countEt.onChange = function () 
    {
        this.text = parseInt(eval(this.text));
        if (isNaN(this.text))
        {
            this.text = 0;
        }
        this.parent.countSlider.value = parseInt(this.text);
        grid_count = parseInt(this.text);
    }

    grid_countSlider.onChange = grid_countSlider.onChanging = function () 
    {
        this.value = Math.round(this.value);
        this.parent.countEt.text = this.value;
        grid_count = Math.round(this.value);
    }

        // columnsEt
    grid_columnsEt.onChange = function () 
    {
        this.text = parseInt(eval(this.text));
        if (isNaN(this.text))
        {
            this.text = 0;
        }
        this.parent.columnsSlider.value = parseInt(this.text);
        grid_columns = parseInt(this.text);
        
        var thisComp = app.project.activeItem;
        var secL = thisComp.selectedLayers;
        if(secL.length>1){
            align();
        }
    }

    grid_columnsSlider.onChange = grid_columnsSlider.onChanging = function () 
    {
        this.value = Math.round(this.value);
        this.parent.columnsEt.text = this.value;
        grid_columns = Math.round(this.value);

        var thisComp = app.project.activeItem;
        var secL = thisComp.selectedLayers;
        if(secL.length>1){
            align();
        }
    }

        // gapX
    grid_gapXEt.onChange = function () 
    {
        this.text = eval(this.text);
        if (isNaN(this.text))
        {
            this.text = 0;
        }
        this.parent.gapXSlider.value = Math.round(this.text);
        grid_gap[0] = parseFloat(this.text);
        grid_gapX = parseFloat(this.text);

        var thisComp = app.project.activeItem;
        var secL = thisComp.selectedLayers;
        if(secL.length>1){
            align();
        }
    }

    grid_gapXSlider.onChange = grid_gapXSlider.onChanging = function () 
    {
        this.value = Math.round(this.value);
        this.parent.gapXEt.text = this.value;  
        grid_gap[0] = this.value;
        grid_gapX = this.value;

        var thisComp = app.project.activeItem;
        var secL = thisComp.selectedLayers;
        if(secL.length>1){
            align();
        }
    }

        // gapY
    grid_gapYEt.onChange = function () 
    {
        this.text = eval(this.text);
        if (isNaN(this.text))
        {
            this.text = 0;
        }
        this.parent.gapYSlider.value = Math.round(this.text);
        grid_gap[1] = parseFloat(this.text);
        grid_gapY = parseFloat(this.text);

        var thisComp = app.project.activeItem;
        var secL = thisComp.selectedLayers;
        if(secL.length>1){
            align();
        }
    }

    grid_gapYSlider.onChange = grid_gapYSlider.onChanging = function () 
    {
        this.value = Math.round(this.value);
        this.parent.gapYEt.text = this.value;  
        grid_gap[1] = this.value;
        grid_gapY = this.value;

        var thisComp = app.project.activeItem;
        var secL = thisComp.selectedLayers;
        if(secL.length>1){
            align();
        }
    }

        // expBoxUI
    grid_expBoxUI.onClick = function () 
    {
        grid_expbox = this.value;
    }

        // copyBtn
    grid_copyBtn.onClick = function () 
    {
        app.beginUndoGroup(scriptName);
        var thisComp = app.project.activeItem;
        var secL = thisComp.selectedLayers;

        // add slider
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

        // copy layers
        for(var i = 0;i<grid_count-1;i++){
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
            grid_column = (i+1)%grid_columns;
            grid_row = Math.floor((i+1)/grid_columns);
            newlayer.position.setValue(secL[secL.length-1].position.value + [grid_column * grid_gap[0],grid_row * grid_gap[1]]);
            // set expression
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
        app.endUndoGroup;
    
    }

    grid_alignBtn.onClick = function () 
    {

        app.beginUndoGroup(scriptName);
        align();
        app.endUndoGroup;
    
    }

    // Tab10 end

    // top slider move
    panel_slider.maxvalue = tpanel1_tab_array.length-1;
    panel_slider.onChange = panel_slider.onChanging = function (){
        tpanel1.selection = (tpanel1_tab_array[this.value]);
        dalimao_index_st.text = this.value;
        dalimao_st2.text = (tpanel1_tab_array[this.value].text);
    }

    // TPANEL1
    // =======
    tpanel1.selection = keyframeEase_tab; 

    // button
    // button1.onClick = function(){
    //     objprint(tpanel1);
    // }
    // button2.onClick = function(){
    //     objprint(tpanel1);
    // }

    // tpanel1.onChange = function(){
        
    // }
    pal.onResizing = pal.onResize = function () 
    {
        this.layout.resize();
    };

    pal.layout.layout(true);
    pal.layout.resize();
    pal.onResizing = pal.onResize = function () { this.layout.resize(); }
    if ( pal instanceof Window ) pal.show();

    return pal;
}());
