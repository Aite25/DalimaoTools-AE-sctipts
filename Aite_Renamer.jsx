function main() {
    ///// info
    var scriptName = "Renamer by 大狸猫";
    var alertTitle = "大狸猫提示你：";
    this.scriptTitle = "Renamer by 大狸猫";

    var na = "大狸猫图层";
    var la = 1;
    var labelbox = 1;
    var regexp = 0;
    var zeroBox = 0;
    var startnum = 0;

    function printObj (obj){
        var str = "";
        for(var i in obj){
            str += i + ":\t" + obj[i] + "\n"
        }
        alert(str,"大狸猫obj检测机");
    }

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

    this.buildUI = function (thisObj)
    {
        // dockable panel or palette
        var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", this.scriptTitle, undefined, {resizeable:true});
        
        // resource specifications
        var res =
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
                SelectPropBtn: Button { text:'P_Select',alignment:['left','top'], preferredSize:[90,20] } \
                ExtractPropNameBtn: Button { text:'P_Extract',alignment:['left','top'], preferredSize:[80,20] } \
            }, \
        }"; 
        pal.gr = pal.add(res);
        var ApplyPropBtn = pal.gr.gr4.ApplyPropBtn;
        var SelectPropBtn = pal.gr.gr4.SelectPropBtn;
        var ExtractPropNameBtn = pal.gr.gr4.ExtractPropNameBtn;
        
        // event callbacks
        pal.onResizing = pal.onResize = function () 
        {
            this.layout.resize();
        };

        // Apply
        pal.gr.gr3.ApplyBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            rename();
            app.endUndoGroup;
        };

        // Select
        pal.gr.gr3.SelectBtn.onClick = function () 
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
        pal.gr.gr3.revSelectBtn.onClick = function () 
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
        pal.gr.gr3.ExtractNameBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            var lays = app.project.activeItem.selectedLayers;
            na = lays[0].name.replace(/(\s*\d+)$/,"");
            la = lays[0].label;
            pal.gr.gr1.nameEt.text = na;
            pal.gr.gr2.labelEt.text = la;
            pal.gr.gr2.labelSlider.value = la;

            app.endUndoGroup;
        };

        //Porp apply
        ApplyPropBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            var thisComp = app.project.activeItem;
            var secP = thisComp.selectedProperties;


            for(var i=0;i<secP.length;i++)
            {
                if(!zeroBox){
                    try{
                        secP[i].name = pal.gr.gr1.nameEt.text + " " + (i+1).toString();
                    }catch(e){continue;}
                }else{
                    try{
                        secP[i].name = pal.gr.gr1.nameEt.text + " " + (i+startnum).toString();
                    }catch(e){continue;}
                }

            }

            app.endUndoGroup;
        };

        //Prop_selctect
        SelectPropBtn.onClick = function () 
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
        ExtractPropNameBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            var thisComp = app.project.activeItem;
            var secP = thisComp.selectedProperties;
            na = secP[0].name.replace(/(\s*\d+)$/,"");
            pal.gr.gr1.nameEt.text = na;

            app.endUndoGroup;
        };

        // edit text
        pal.gr.gr1.nameEt.onChange = function () 
        {
            na = this.text;
        }

        pal.gr.gr2.labelEt.onChange = function () 
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

        pal.gr.gr1.startnumEt.onChange = function () 
        {
            this.text = eval(this.text);
            if (isNaN(this.text))
            {
                this.text = 0;
            }
            startnum = parseInt(this.text);
        }

        // slider
        pal.gr.gr2.labelSlider.onChange = pal.gr.gr2.labelSlider.onChanging = function () 
        {
            this.value = Math.round(this.value);
            this.parent.labelEt.text = this.value;
            la = this.value;
        };

        // box
        pal.gr.gr1.zeroBox.onClick = function () 
        {
            zeroBox = this.value;
        }

        pal.gr.gr1.RegExpBox.onClick = function () 
        {
            if(this.value == 1){
                pal.gr.gr1.nameEt.text = '^'+pal.gr.gr1.nameEt.text+'.*(\\d+)*$';
            }else if(this.value == 0){
                pal.gr.gr1.nameEt.text = pal.gr.gr1.nameEt.text.replace(".*(\\d+)*$","");
                pal.gr.gr1.nameEt.text = pal.gr.gr1.nameEt.text.replace("^","");
            }
            na = pal.gr.gr1.nameEt.text;
            regexp = this.value;
        }

        pal.gr.gr2.labelBox.onClick = function () 
        {
            labelbox = this.value;
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
