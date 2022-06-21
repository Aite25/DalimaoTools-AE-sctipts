function main() {
    ///// info
    var scriptName = "Slider Creator by 大狸猫";
    var alertTitle = "大狸猫提示你：";
    this.scriptTitle = "Slider Creator 大狸猫";

    var oneBox = 0;

    this.buildUI = function (thisObj)
    {
        // dockable panel or palette
        var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", this.scriptTitle, undefined, {resizeable:true});
        
        // resource specifications
        var res =
        "group { orientation:'column', alignment:['fill','fill'], alignChildren:['left','top'], \
            gr1: Group { \
                createBtn: Button { text:'Create',alignment:['left','top'], preferredSize:[50,30] } \
                oneBox: Checkbox { text:'1 width',preferredSize:[60,17],value:"+oneBox+"}    \
            }, \
        }"; 
        pal.gr = pal.add(res);

        var createBtn = pal.gr.gr1.createBtn;
        var oneBox_ = pal.gr.gr1.oneBox;

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
        
            for(var i=0;i<secL.length;i++)
            {
                for(var j=0;j<secP.length;j++)
                {
                    if(secP[j].canSetExpression){
                        var valuewidth = 1;
                        if(secP[j].value.length!=undefined){
                            valuewidth = secP[j].value.length;
                        }

                        if(oneBox_ == 1){
                            var eff = secL[i].Effects.addProperty("Slider Control");
                            eff.name = secP[j].name;
                            eff(1).setValue(secP[j].value[0]);
                            if(valuewidth == 1){
                                secP[j].expression = 'sld = effect("' + eff.name + '")("' + eff(1).name + '");';
                            }else if(valuewidth == 2){
                                secP[j].expression = 'sld = effect("' + eff.name + '")("' + eff(1).name + '");\nx = sld;\ny = 0;\n[x,y]';
                            }else if(valuewidth == 3){
                                secP[j].expression = 'sld = effect("' + eff.name + '")("' + eff(1).name + '");\nx = sld;\ny = 0;z = 0;\n[x,y,z]';
                            }
                        }else{
                            if(valuewidth == 2){
                                var eff = secL[i].Effects.addProperty("Point Control");
                            }else if(valuewidth == 3){
                                var eff = secL[i].Effects.addProperty("3D Point Control");
                            }
                            else if(valuewidth == 1){
                                var eff = secL[i].Effects.addProperty("Slider Control");
                            }
                            eff.name = secP[j].name;
                            eff(1).setValue(secP[j].value);
                            secP[j].expression = 'sld = effect("' + eff.name + '")("' + eff(1).name + '");';
                        }
                        
                    }
                }
            }
            app.endUndoGroup;
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
