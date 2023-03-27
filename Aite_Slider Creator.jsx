function main() {
    ///// info
    var scriptName = "Slider Creator by 大狸猫";
    var alertTitle = "大狸猫提示你：";
    this.scriptTitle = "Slider Creator by 大狸猫";

    var sliderCount = 1;
    var oneBox = 0;
    var allBox = 1;
    var nameBox = 0;
    var slidertype = 0;
    var sliderName = 'Dalimao';
    var typeArr = ["ADBE Slider Control","ADBE Point Control","ADBE Point3D Control","ADBE Color Control","ADBE Angle Control","ADBE Checkbox Control","ADBE Layer Control"];

    Property.prototype.contaningLayer = function(){
        return this.propertyGroup(this.propertyDepth);
    }
    function findPropertyLayer (prop){
        return prop.propertyGroup(prop.propertyDepth);
    }

    this.buildUI = function (thisObj)
    {
        // dockable panel or palette
        var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", this.scriptTitle, undefined, {resizeable:true});
        
        // resource specifications
        var res =
        "group { orientation:'column', alignment:['fill','fill'], alignChildren:['left','top'], \
            gr1: Group { \
                createBtn: Button { text:'Create & Exp',alignment:['left','top'], preferredSize:[80,20] } \
                oneBox: Checkbox { text:'1 width',preferredSize:[60,17],value:"+oneBox+"}    \
                allBox: Checkbox { text:'x y z = a',preferredSize:[80,17],value:"+allBox+"}    \
                addaptBtn: Button { text:'Adapt Exp',alignment:['left','top'], preferredSize:[80,20] } \
            }, \
            gr2: Group {  alignment:['fill','top'],\
                onlyCreateBtn: Button { text:'Only Create',alignment:['left','top'], preferredSize:[80,20] } \
                typeSlider: Slider { alignment:['fill','center'], preferredSize:[20,17],minvalue:0 ,maxvalue:6,value:" + slidertype + " } \
                typeEt:EditText { text:'" + parseInt(slidertype+1) + "',alignment:['right','top'] ,preferredSize:[25,20]} \
                typeSt: StaticText { text:'" + typeArr[0].toString().slice(5) + "',alignment:['left','top'], preferredSize:[95,17] } \
                crossSt: StaticText { text:'×',alignment:['left','top'], preferredSize:[17,17] } \
                countSlider: Slider { alignment:['fill','top'], preferredSize:[20,17],minvalue:1 ,maxvalue:10,value:" + sliderCount + " } \
                countEt:EditText { text:'" + sliderCount + "',alignment:['right','top'] ,preferredSize:[25,20]} \
            }, \
            gr3: Group { orientation:'row', alignment:['fill','top'], \
                nameBox: Checkbox { text:'Rename',preferredSize:[70,17],value:"+ nameBox +"}    \
                sliderNameEt: EditText { text:'" + sliderName + "',alignment:['fill','center'] ,preferredSize:[300,20] ,properties: { multiline: false }} \
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
        pal.gr = pal.add(res);

        //gr1
        var createBtn = pal.gr.gr1.createBtn;
        var oneBox_ = pal.gr.gr1.oneBox;
        var allBox_ = pal.gr.gr1.allBox;
        var addaptBtn = pal.gr.gr1.addaptBtn;
        //gr2
        var typeSlider = pal.gr.gr2.typeSlider;
        var onlyCreateBtn = pal.gr.gr2.onlyCreateBtn;
        var typeEt = pal.gr.gr2.typeEt;
        var typeSt = pal.gr.gr2.typeSt;
        var countSlider = pal.gr.gr2.countSlider;
        var countEt = pal.gr.gr2.countEt;
        //gr3
        var nameBox_ = pal.gr.gr3.nameBox;
        var sliderNameEt = pal.gr.gr3.sliderNameEt;
        //gr4&5
        var thisLayerEt = pal.gr.gr4.thisLayerEt;
        var otherLayerEt = pal.gr.gr5.otherLayerEt;
        
        // event callbacks
        pal.onResizing = pal.onResize = function () 
        {
            this.layout.resize();
        };

        createBtn.onClick = function () 
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
                    var eff = secL[i].Effects.addProperty(typeArr[0]);
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

                        if(oneBox == 1){//只加一个滑块
                            eff = cursecL.Effects.addProperty(typeArr[0]);
                            try{
                                if(nameBox == 0){
                                    eff.name = secP[j].name;//改名
                                }else{eff.name = sliderName;}
                            }catch(e){}
                            eff(1).setValue(secP[j].value[0]);
                            secP[j].expression = 'sld = effect("' + eff.name + '")("' + eff(1).name + '");';
                            if(allBox == 0){
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
                            eff = cursecL.Effects.addProperty(typeArr[valuewidth-1]);
                            try{
                                if(nameBox == 0){
                                    eff.name = secP[j].name;//改名
                                }else{eff.name = sliderName;}
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

        addaptBtn.onClick = function ()
        {
            var thisComp = app.project.activeItem;
            var secP = thisComp.selectedProperties;
            var secL = thisComp.selectedLayers;
            for(var i=0;i<secP.length;i++)
            {
                if(secP[i].canSetExpression){
                    if(secP[i].expressionError != ""){
                        var experr = secP[i].expressionError;
                        var exp = secP[i].expression;
                        var line_re_exp = /Error at line (\d+)/;
                        var exparr = exp.split("\n");
                        var experr_line = experr.match(line_re_exp)[1];
                        
                        var slider_name_re_exp = /effect named ‘(.*)’ is missing/;
                        var slider_name = experr.match(slider_name_re_exp)[1];

                        var errline_str = exparr[experr_line-1];
                        var errline_arrsplit = errline_str.split(slider_name)[1];
                        var type_str = errline_arrsplit.match(/\"\)\(\"(.*)\"\)/)[1];
                        var eff;
                        if(type_str == "Slider"){
                            eff = secL[0].Effects.addProperty("ADBE Slider Control");
                            eff.name = slider_name;
                        }else if(type_str == "Point"){
                            eff = secL[0].Effects.addProperty("ADBE Point Control");
                            eff.name = slider_name;
                        }else if(type_str == "3D Point"){
                            eff = secL[0].Effects.addProperty("ADBE Point3D Control");
                            eff.name = slider_name;
                        }else if(type_str == "Angle"){
                            eff = secL[0].Effects.addProperty("ADBE Angle Control");
                            eff.name = slider_name;
                        }else if(type_str == "Checkbox"){
                            eff = secL[0].Effects.addProperty("ADBE Checkbox Control");
                            eff.name = slider_name;
                        }
                    }
                }
            }
        }
        onlyCreateBtn.onClick = function () 
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
                        for(var k = 0;k<sliderCount;k++){
                            eff = cursecL.Effects.addProperty(typeArr[slidertype]);
                            try{
                                if(nameBox == 0){
                                    eff.name = secP[j].name;//改名
                                }else{eff.name = sliderName;}
                            }catch(e){}
                            eff.name += " " + parseInt(k+1).toString();
                            //创建滑块维度相等则给滑块赋值
                            if(slidertype == valuewidth || (valuewidth == 1 && slidertype == 4)){
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
                    for(var k = 0;k<sliderCount;k++){
                        var eff = secL[i].Effects.addProperty(typeArr[slidertype]);
                        if(nameBox == 1){eff.name = sliderName;}
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
        typeSlider.onChange = typeSlider.onChanging = function () 
        {
            this.value = Math.round(this.value);
            this.parent.typeSt.text = typeArr[this.value].toString().slice(5);
            this.parent.typeEt.text = this.value + 1;
            slidertype = this.value;
        };

        countSlider.onChange = countSlider.onChanging = function () 
        {
            this.value = Math.round(this.value);
            this.parent.countEt.text = this.value;
            sliderCount = this.value;
        };

        // Et
        typeEt.onChange =  function () 
        {
            this.text = eval(this.text);
            if (isNaN(this.text))
            {
                this.text = 1;
            }
            this.parent.typeSlider.value = parseInt(this.text)-1;  
            this.parent.typeSt.text = typeArr[parseInt(this.text)-1].toString().slice(5);
            slidertype = parseInt(this.text)-1;
        };

        countEt.onChange =  function () 
        {
            this.text = eval(this.text);
            if (isNaN(this.text))
            {
                this.text = 1;
            }
            this.parent.countSlider.value = parseInt(this.text);  
            sliderCount = parseInt(this.text);
        };

        sliderNameEt.onChange =  function () 
        {
            sliderName = this.text;
        };

        // box
        oneBox_.onClick = function () 
        {
            oneBox = this.value;
        }

        nameBox_.onClick = function () 
        {
            nameBox = this.value;
        }

        allBox_.onClick = function () 
        {
            allBox = this.value;
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
