function main() {
    ///// info
    var scriptName = "PropertyTracer by 大狸猫";
    var alertTitle = "大狸猫提示你：";
    this.scriptTitle = "PropertyTracer by 大狸猫";
    var propPath = '("Transform")("Opacity")';
    var val = 0;
    var exp = "'value'";
    var expBox = 1;
    var valueBox = 1;
    var matchBox = 0;

    var lastExp = '';
    var expReverseInvert = 0;

    function expslice(exp,cutpointword){
        return exp.slice(0,exp.search(cutpointword)+1);
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
        exp = lastExp;
    }
    this.buildUI = function (thisObj)
    {
        // dockable panel or palette
        var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", this.scriptTitle, undefined, {resizeable:true});
        
        // resource specifications
        var res =
        "group { orientation:'column', alignment:['fill','fill'], alignChildren:['left','top'], \
            gr1: Group { alignment:['fill','top'],\
                matchBox: Checkbox { text:'Match',preferredSize:[59,17],value:"+matchBox+" }, \
                pathEt: EditText { text:'"+propPath+"',alignment:['fill','fill'], preferredSize:[190,20],properties: { multiline: true } } \
            }, \
            gr2: Group { alignment:['fill','top'], \
                valueBox: Checkbox { text:'Value', value:"+valueBox+" , preferredSize:[59,17] }, \
                valueEt: EditText { text:'"+val+"',alignment:['left','center'], preferredSize:[190,20],alignment:['fill','fill'] } \
            }, \
            gr3: Group { alignment:['fill','top'], \
                shapeExpBtn: Button { text:'ShapeRelaExp ↑↓', preferredSize:[120,20],alignment:['right','top'] } \
                ApplyBtn: Button { text:'Apply', preferredSize:[60,20],alignment:['right','top'] } \
                SelectBtn: Button { text:'Select', preferredSize:[60,20],alignment:['right','top'] } \
                ExtractBtn: Button { text:'Extract', preferredSize:[60,20],alignment:['right','top'] } \
            }, \
            gr4: Group { orientation:'row', alignment:['fill','top'], \
                expBox: Checkbox { text:'Expression',value:"+expBox+",alignment:['left','top']}    \
                propApplyBtn: Button { text:'P_Apply', preferredSize:[60,20],alignment:['right','top'] } \
                propSelectBtn: Button { text:'P_Select', preferredSize:[60,20],alignment:['right','top'] } \
                propAddBtn: Button { text:'P_Add', preferredSize:[60,20],alignment:['right','top'] } \
            }, \
            gr5: Group { orientation:'row', alignment:['fill','fill'], \
                expEt: EditText { text:'value',alignment:['fill','fill'] ,preferredSize:[300,300] ,properties: { multiline: true }} \
            }, \
        }"; 
        pal.gr = pal.add(res);
        
        // event callbacks
        pal.onResizing = pal.onResize = function () 
        {
            this.layout.resize();
        };
        // Apply
        pal.gr.gr3.ApplyBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            var slayers = app.project.activeItem.selectedLayers;
            var cut = app.project.activeItem.time;
            if(val instanceof Array){
                var nval = "[" + val.toString() + "]";  
            }else{var nval = val ;}
            // change the value
            if(valueBox == 1){
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
            if(expBox == 1){
                eval("\
                    for(var i = 0;i<slayers.length;i++){ \
                        try{\
                            slayers[i] " + propPath + " .expression = \'" + exp.toString() + "\'; \
                        }catch(e){continue;}\
                    } \
                ")
            }
            app.endUndoGroup;
        };
        // Select
        pal.gr.gr3.SelectBtn.onClick = function () 
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
        pal.gr.gr3.ExtractBtn.onClick = function () 
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
                val = thisP.value;
            }else{
                val = thisP.matchName;
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
            pal.gr.gr1.pathEt.text = pathstr;
            pal.gr.gr2.valueEt.text = val;
            pal.gr.gr5.expEt.text = thisP.expression;
            exp = "'" + thisP.expression + "'";
            app.endUndoGroup;
        };
        // Shape Exp
        pal.gr.gr3.shapeExpBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            relaPathExp(1^expReverseInvert,0);
            pal.gr.gr5.expEt.text = exp;
            expReverseInvert = !expReverseInvert;
            app.endUndoGroup;
        }

        // propApply
        pal.gr.gr4.propApplyBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            var secP = app.project.activeItem.selectedProperties;
            var cut = app.project.activeItem.time;
            if(val instanceof Array){
                var nval = "[" + val.toString() + "]";  
            }else{var nval = val ;}
            // change the value
            if(valueBox == 1){
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
            if(expBox == 1){
                eval("\
                    for(var i = 0;i<secP.length;i++){ \
                        try{ \
                            secP[i] " + propPath + " .expression = \'" + exp.toString() + "\'; \
                        }catch(e){continue;}\
                    }\
                ");
            }

        };
        // propSelect
        pal.gr.gr4.propSelectBtn.onClick = function () 
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
        pal.gr.gr4.propAddBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            var thisComp = app.project.activeItem;
            var secP = thisComp.selectedProperties;
            eval(
                "for(var i = 0;i<secP.length;i++){ \
                    try{\
                        secP[i]" + propPath + ".addProperty(\"" + val + "\"); \
                    }catch(e){continue;}\
                }"
            );
            app.endUndoGroup;
        };

        // pathEt
        pal.gr.gr1.pathEt.onChange = function () 
        {
            propPath = this.text;
        }
        // valueEt
        pal.gr.gr2.valueEt.onChange = function () 
        {
            if(/,/.test(this.text))
            {
                val = this.text.split(",");

            }else{
                this.text = eval(this.text);
                val = parseFloat(this.text);
            }
        }
        pal.gr.gr5.expEt.onChange = function () 
        {
            exp = this.text;
        }
        // pal.gr.gr2.labelSlider.onChange = pal.gr.gr2.labelSlider.onChanging = function () 
        // {
        //     this.value = Math.round(this.value);
        //     this.parent.labelEt.text = this.value;
        //     la = this.value;
        // };

        // box
        pal.gr.gr1.matchBox.onClick = function () 
        {
            matchBox = this.value;
        }
        pal.gr.gr2.valueBox.onClick = function () 
        {
            valueBox = this.value;
        }
        pal.gr.gr4.expBox.onClick = function () 
        {
            expBox = this.value;
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