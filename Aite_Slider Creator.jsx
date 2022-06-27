function main() {
    ///// info
    var scriptName = "Slider Creator by 大狸猫";
    var alertTitle = "大狸猫提示你：";
    this.scriptTitle = "Slider Creator by 大狸猫";

    var sliderCount = 1;
    var oneBox = 0;
    var slidertype = 0;
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
            gr4: Group { orientation:'row', alignment:['fill','fill'], \
                thisLayerSt: StaticText { text:'thisLayer',alignment:['left','top'],preferredSize:[60,20] }    \
                thisLayerEt: EditText { text:'effect',alignment:['fill','fill'] ,preferredSize:[300,20] ,properties: { multiline: true }} \
            }, \
            gr5: Group { orientation:'row', alignment:['fill','fill'], \
                otherLayerSt: StaticText { text:'otherLayer',alignment:['left','top'],preferredSize:[60,20] }    \
                otherLayerEt: EditText { text:'thisComp.layer',alignment:['fill','fill'] ,preferredSize:[300,20] ,properties: { multiline: true }} \
            }, \
        }"; 
        pal.gr = pal.add(res);

        var createBtn = pal.gr.gr1.createBtn;
        var oneBox_ = pal.gr.gr1.oneBox;
        var typeSlider = pal.gr.gr2.typeSlider;
        var countSlider = pal.gr.gr2.countSlider;
        var onlyCreateBtn = pal.gr.gr2.onlyCreateBtn;
        var typeEt = pal.gr.gr2.typeEt;
        var countEt = pal.gr.gr2.countEt;
        var typeSt = pal.gr.gr2.typeSt;
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

                        if(oneBox_ == 1){//只加一个滑块
                            eff = cursecL.Effects.addProperty(typeArr[0]);
                            eff.name = secP[j].name;//改名
                            eff(1).setValue(secP[j].value[0]);
                            secP[j].expression = 'sld = effect("' + eff.name + '")("' + eff(1).name + '");';
                            if(valuewidth == 1){
                                secP[j].expression += '';
                            }else if(valuewidth == 2){
                                secP[j].expression += '\nx = sld;\ny = 0;\n[x,y]';
                            }else if(valuewidth == 3){
                                secP[j].expression += '\nx = sld;\ny = 0;z = 0;\n[x,y,z]';
                            }else if(valuewidth == 4){
                                secP[j].expression += '\nx = sld;\nyg = 0;b = 0;\na = 1;\n[r,g,b,a]';
                            }
                            thisLayerEt.text += 'effect("' + eff.name + '")("' + eff(1).name + '");\n';
                            otherLayerEt.text += 'thisComp.layer("' + cursecL.name + '").effect("' + eff.name + '")("' + eff(1).name + '");\n';
                        }else{
                            eff = cursecL.Effects.addProperty(typeArr[valuewidth-1]);
                            try{
                                eff.name = secP[j].name;//改名
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
                            eff.name = secP[j].name;//改名
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

        // box
        oneBox_.onClick = function () 
        {
            oneBox_ = this.value;
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