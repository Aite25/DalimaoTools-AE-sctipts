function main() {
    ///// info
    var scriptName = "PropertyTracer by 大狸猫";
    var alertTitle = "大狸猫提示你：";
    this.scriptTitle = "PropertyTracer by 大狸猫";

    var propPath = '(\"ADBE Text Opacity\")';
    var val = 0;
    var exp = "'value'";
    var expBox = 1;
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
                matchBox: Checkbox { text:'Match',preferredSize:[59,17],value:"+matchBox+" }, \
                pathEt: EditText { text:'"+propPath+"',alignment:['fill','fill'], preferredSize:[190,20],properties: { multiline: true } } \
            }, \
            gr2: Group { alignment:['fill','top'], \
                valueBox: Checkbox { text:'Value', value:"+valueBox+" , preferredSize:[59,17] }, \
                valueEt: EditText { text:'"+val+"',alignment:['left','center'], preferredSize:[190,20],alignment:['fill','fill'] } \
            }, \
            gr3: Group { alignment:['fill','top'], \
                expBox: Checkbox { text:'Expression',value:"+expBox+",alignment:['left','top']}    \
                ApplyBtn: Button { text:'Apply', preferredSize:[60,20],alignment:['right','top'] } \
                SelectBtn: Button { text:'Select', preferredSize:[60,20],alignment:['right','top'] } \
                ExtractBtn: Button { text:'Extract', preferredSize:[60,20],alignment:['right','top'] } \
            }, \
            gr4: Group { orientation:'row', alignment:['fill','fill'], \
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

            eval(
                'for(var i = 0;i<slayers.length;i++){ \
                    if(slayers[i] ' + propPath + '.canSetExpression){ \
                        if(valueBox == 1){ \
                            if(slayers[i]  ' + propPath + '.numKeys == 0){ \
                                slayers[i]  ' + propPath + ' .setValue(  ' + nval + '  ) ; \
                            }else{\
                                slayers[i]  ' + propPath + ' .setValueAtTime( ' + cut + ' ,' + nval + '  ) ;\
                            } \
                        } \
                        if(expBox == 1){ \
                            slayers[i] ' + propPath + ' .expression = "' + exp.toString() + '"; \
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
            var thisComp = app.project.activeItem;
            var secL = thisComp.selectedLayers;
            var secP = thisComp.selectedProperties;

            if(secP.length!=0){
                for(var i = 0;i<secP.length;i++){
                    secP[i].selected = 0;
                }
            }

            eval(
                'for(var i = 0;i<secL.length;i++){ \
                try{\
                    secL[i]' + propPath + '.selected = 1; \
                    }catch(e){continue;}\
                }'
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
            val = thisP.value;
            var depth = thisP.propertyDepth;
            var curP = thisP;
            
            // 生成路径str;
            for(var i = 0;i<depth;i++){
                pathstr = "(\"" + curP.name + "\")" + pathstr;
                curP = curP.propertyGroup(1);
            }
            // pathstr = pathstr.toLowerCase();//转小写
            propPath = pathstr;
            
            var cut = app.project.activeItem.time;

            pal.gr.gr1.pathEt.text = pathstr;
            pal.gr.gr2.valueEt.text = val;

            pal.gr.gr4.expEt.text = thisP.expression;
            exp = "'" + thisP.expression + "'";

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
