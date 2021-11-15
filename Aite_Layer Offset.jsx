function main() {
    ///// info
    var scriptName = "大狸猫box";
    var alertTitle = "大狸猫提示你：";
    this.scriptTitle = "KeyframeEase by 大狸猫";
    // var curComp = app.project.activeItem;
    // var time = app.project.activeItem.time;
    // var fps = 1/app.project.activeItem.frameDuration;
    // var selectedLayers = app.project.activeItem.selectedLayers;

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

    this.buildUI = function (thisObj)
    {
        // dockable panel or palette
        var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", this.scriptTitle, undefined, {resizeable:true});
        
        // resource specifications
        var res =
        "group { orientation:'column', alignment:['left','top'], alignChildren:['left','center'], \
            gr1: Group { \
                frameSt: StaticText { text:'Frame' ,preferredSize:[50,17]}    \
                minEt: EditText { text:'0',alignment:['left','center'], preferredSize:[30,17] } \
                frameSlider: Slider { alignment:['left','center'], preferredSize:[64,17],minvalue:0 ,maxvalue:30,value:0 } \
                maxEt: EditText { text:'30',alignment:['left','center'], preferredSize:[30,17] } \
                snapBox: Checkbox { text:'[',value:1,alignment:['left','top']}    \
                frameEt: EditText { text:'0',alignment:['left','center'], preferredSize:[45,17] } \
            }, \
        }";
        pal.gr = pal.add(res);

        // event callbacks
        pal.onResizing = pal.onResize = function () 
        {
            this.layout.resize();
        };
            //frame
        pal.gr.gr3.frameEt.onChange = function () 
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
        pal.gr.gr3.minEt.onChange = function () 
        {
            this.text = eval(this.text);
            if (isNaN(this.text))
            {
                this.text = 0;
            }
            this.parent.frameSlider.minvalue = Math.round(this.text);
        }

            // frameSlider max
        pal.gr.gr3.maxEt.onChange = function () 
        {
            this.text = eval(this.text);
            if (isNaN(this.text))
            {
                this.text = 0;
            }
            this.parent.frameSlider.maxvalue = Math.round(this.text);
        }


        pal.gr.gr3.frameSlider.onChange = pal.gr.gr3.frameSlider.onChanging = function () 
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

        pal.gr.gr3.snapBox.onClick = function () 
        {
            snapBox = this.value;
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
