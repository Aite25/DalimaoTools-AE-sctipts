function main() {
    ///// info
    var scriptName = "PropertyTracer by 大狸猫";
    var alertTitle = "大狸猫提示你：";
    this.scriptTitle = "PropertyTracer by 大狸猫";

    var propPath = '(\"ADBE Text Opacity\")';
    var val = 0;
    var exp = "'value'";
    var expBox = 0;
    var keyBox = 0;
    var valueBox = 1;
    var matchBox = 1;

    this.buildUI = function (thisObj)
    {
        // dockable panel or palette
        var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", this.scriptTitle, undefined, {resizeable:true});
        
        // resource specifications
        var res =
        "group { orientation:'column', alignment:['fill','fill'], alignChildren:['left','top'], \
            gr1: Group { alignment:['fill','top'],\
                matchBox: Checkbox { text:'Match',preferredSize:[59,17],value:1 }, \
                pathEt: EditText { text:'(\"ADBE Root Vectors Group\")',alignment:['fill','fill'], preferredSize:[190,20],properties: { multiline: true } } \
            }, \
            gr2: Group { alignment:['fill','top'], \
                valueBox: Checkbox { text:'Value', value:1 , preferredSize:[59,17] }, \
                valueEt: EditText { text:'0',alignment:['left','center'], preferredSize:[190,20],alignment:['fill','fill'] } \
            }, \
            gr3: Group { alignment:['fill','top'], \
                expBox: Checkbox { text:'Expression',value:0,alignment:['left','top']}    \
                keyBox: Checkbox { text:'key',value:0,alignment:['left','top']}    \
                ApplyBtn: Button { text:'Apply', preferredSize:[60,20],alignment:['right','top'] } \
                SelectBtn: Button { text:'Select', preferredSize:[60,20],alignment:['right','top'] } \
                ExtractBtn: Button { text:'Extract', preferredSize:[60,20],alignment:['right','top'] } \
            }, \
            gr4: Group { orientation:'row', alignment:['fill','fill'], \
                expEt: EditText { text:'value',alignment:['fill','fill'] ,preferredSize:[300,300] ,properties: { multiline: true }} \
            }, \
            gr5: Group { alignment:['left','bottom'], \
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

            eval(
                'for(var i = 0;i<slayers.length;i++){ \
                    if(slayers[i] ' + propPath + '.canSetExpression){ \
                        if(valueBox == 1){ \
                            if(keyBox == 0){ \
                                slayers[i]  ' + propPath + ' .setValue(  ' + nval + '  ) ; \
                            }else{\
                                slayers[i]  ' + propPath + ' .setValueAtTime( ' + cut + ' ,' + nval + '  ) ;\
                            } \
                        } \
                        if(expBox == 1){ \
                            slayers[i] ' + propPath + ' .expression = ' + exp + '; \
                        } \
                    } \
                }'
            );
            app.endUndoGroup;
        };

        // Select
        pal.gr.gr3.SelectBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            var slayers = app.project.activeItem.selectedLayers;
            eval(
                'for(var i = 0;i<slayers.length;i++){ \
                    slayers[i]' + propPath + '.selected = 1; \
                }'
            );
            app.endUndoGroup;
        };

        // Extract
        pal.gr.gr3.ExtractBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            var curLayer = app.project.activeItem.selectedLayers[0];
            cut = app.project.activeItem.time;
            var layerTypeArr = ["ADBE Text Layer","ADBE Vector Layer","ADBE AV Layer"];
            propPath = "";
            var curPros = app.project.activeItem.selectedLayers[0].selectedProperties;

            if(matchBox == 1){

                if(curPros.length>1){
                    for(var i = 1;i<curPros.length;i++){
                        propPath += "('" + curPros[i].matchName + "')";
                    }
                }
                
                var curPro = curPros[0];
                while(layerTypeArr.indexOf(curPro.matchName) == -1){
                    propPath = "('" + curPro.matchName + "')" + propPath;
                    curPro = curPro.parentProperty;
                    if(curPro.parentProperty == null){break;}
                }

            }else{
                if(curPros.length>1){
                    for(var i = 1;i<curPros.length;i++){
                        propPath += "." + curPros[i].name;
                    }
                }

                var curPro = curPros[0];
                while(layerTypeArr.indexOf(curPro.matchName) == -1){
                    propPath = "." + curPro.name  + propPath;
                    curPro = curPro.parentProperty;
                    if(curPro.parentProperty == null){break;}
                }
            }
            pal.gr.gr1.pathEt.text = propPath;
            if(curPros.length>1){
                if(curPros[1].canSetExpression){val = curPros[1].value;}
            }else{
                if(curPros[0].canSetExpression){val = curPros[0].value;}
            }
            pal.gr.gr2.valueEt.text = val;
            for(var i = 0; i<curPros.length;i++){
                if(curPros[i].canSetExpression && curPros[i].expression != "" ){
                    pal.gr.gr4.expEt.text = curPros[i].expression;
                    exp = "'" + curPros[i].expression + "'"
                    break;
                }
            }
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
                val = this.text.split(",")
            }else{
                this.text = eval(this.text);
                val = parseFloat(this.text);
            }
        }

        pal.gr.gr4.expEt.onChange = function () 
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

        pal.gr.gr3.expBox.onClick = function () 
        {
            expBox = this.value;
        }

        pal.gr.gr3.keyBox.onClick = function () 
        {
            keyBox = this.value;
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
