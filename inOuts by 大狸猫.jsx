
function main() {
    ///// info
    var scriptName = "inOuts by 大狸猫";
    var alertTitle = "大狸猫提示你：";
    this.scriptTitle = "inOuts by 大狸猫";

    function inOutsRelatoKeys(){
        var thisComp = app.project.activeItem;
        var secL = thisComp.selectedLayers;
        var secP = thisComp.selectedProperties;
    
        var secLlenArr = [];
        var singleLayer = [];
        singleLayer.length = 3;
        secLlenArr.length = secL.length;
        var laySelInd;
    
        for(var i=0;i<secP.length;i++)
        {
            if(secP[i].canSetExpression != 1){continue;}
            var curLayer = secP[i].propertyGroup(secP[i].propertyDepth);
            for(var j=0;j<secL.length;j++){
                if(curLayer == secL[j]){laySelInd = j;break;}
            }
            var inP = secP[i].keyTime(1);
            var ouP = secP[i].keyTime(secP[i].numKeys)+thisComp.frameDuration;
    
            if(secLlenArr[laySelInd] == undefined){
                secLlenArr[laySelInd] = [curLayer,inP,ouP];
                continue;
            }
    
            if(secLlenArr[laySelInd][1]>inP){secLlenArr[laySelInd][1] = inP;}
            if(secLlenArr[laySelInd][2]<inP){secLlenArr[laySelInd][2] = ouP;}
    
        }
    
        for(var i=0;i<secLlenArr.length;i++){
            
            secLlenArr[i][0].inPoint = secLlenArr[i][1];
            secLlenArr[i][0].outPoint = secLlenArr[i][2];
        }
    }

    function layerCut (inType){
        var curComp = app.project.activeItem;
        var fps = 1/app.project.activeItem.frameDuration;
        var time = app.project.activeItem.time;
        var selectedLayers = app.project.activeItem.selectedLayers;
        if(inType == 0){
            for(var i = 0;i<selectedLayers.length;i++){
                if(selectedLayers[i].inPoint<time&&selectedLayers[i].outPoint>time){
                    var outPointSave = selectedLayers[i].outPoint;
                    selectedLayers[i].inPoint = time;
                    selectedLayers[i].outPoint = outPointSave;
                }
            }
        }else if(inType == 1){
            for(var i = 0;i<selectedLayers.length;i++){
                if(selectedLayers[i].inPoint<time&&selectedLayers[i].outPoint>time){
                    selectedLayers[i].outPoint = time+app.project.activeItem.frameDuration;
                }
            }
        }
    }

    function layerMove (inType){
        var curComp = app.project.activeItem;
        var fps = 1/app.project.activeItem.frameDuration;
        var time = app.project.activeItem.time;
        var selectedLayers = app.project.activeItem.selectedLayers;
        if(inType == 0){
            var a = 'inPoint';
        }else if(inType == 1){
            var a = 'outPoint';
        }
        var minIn = selectedLayers[0][a];
        for(var i = 0;i<selectedLayers.length;i++){
            if(inType^(minIn>selectedLayers[i][a])){minIn = selectedLayers[i][a];}
        }
        for(var i = 0;i<selectedLayers.length;i++){
            selectedLayers[i].startTime = selectedLayers[i].startTime + time - minIn;
        }
    }

    function keyMove (inType){
        var curComp = app.project.activeItem;
        var fps = 1/app.project.activeItem.frameDuration;
        var time = app.project.activeItem.time;
        var selectedLayers = app.project.activeItem.selectedLayers;

        var keyTimes = [];
        for(var i = 0;i<selectedLayers.length;i++){
            for(var j = 0;j<selectedLayers[i].selectedProperties.length;j++){
                var curProperties = selectedLayers[i].selectedProperties[i];
                if(selectedLayers[i].selectedProperties[j].canSetExpression){
                    for(var k = 0;k<selectedLayers[i].selectedProperties[j].selectedKeys.length;k++){
                        var curKeys = selectedLayers[i].selectedProperties[j].selectedKeys;
                        keyTimes.push(curKeys[k]);
                    }
                }
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
                leftMoveBtn: Button { text:'[',alignment:['left','top'], preferredSize:[20,20] } \
                rightMoveBtn: Button { text:']',alignment:['left','top'], preferredSize:[20,20] } \
                leftCutBtn: Button { text:'[/=]',alignment:['left','top'], preferredSize:[30,20] } \
                rightCutBtn: Button { text:'[=/]',alignment:['left','top'], preferredSize:[30,20] } \
                leftKeyMoveBtn: Button { text:'|←◆',alignment:['left','top'], preferredSize:[30,20] } \
                rightKeyMoveBtn: Button { text:'◆→|',alignment:['left','top'], preferredSize:[30,20] } \
                inOutsRelatoKeysBtn: Button { text:'|←◆→|',alignment:['left','top'], preferredSize:[45,20] } \
            }, \
        }"; 
        pal.gr = pal.add(res);
        
        // event callbacks
        pal.onResizing = pal.onResize = function () 
        {
            this.layout.resize();
        };

        pal.gr.gr1.leftMoveBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            layerMove(0);
            app.endUndoGroup;
        };

        pal.gr.gr1.rightMoveBtn.onClick = function () 
        {
            app.beginUndoGroup(scriptName);
            layerMove(1);
            printObj(app.project.activeItem.selectedLayers[0].selectedProperties[0]);
            app.endUndoGroup;
        };

        pal.gr.gr1.leftCutBtn.onClick = function () 
        { 
            app.beginUndoGroup(scriptName);
            layerCut(0);
            alert(000,000)
            app.endUndoGroup;
        };
        pal.gr.gr1.rightCutBtn.onClick = function () 
        { 
            app.beginUndoGroup(scriptName);
            layerCut(1);
            app.endUndoGroup;
        };

        pal.gr.gr1.leftKeyMoveBtn.onClick = function () 
        { 
            app.beginUndoGroup(scriptName);
            keyMove(0);
            app.endUndoGroup;
        };

        pal.gr.gr1.rightKeyMoveBtn.onClick = function () 
        { 
            app.beginUndoGroup(scriptName);
            keyMove(1);
            app.endUndoGroup;
        };

        pal.gr.gr1.inOutsRelatoKeysBtn.onClick = function () 
        { 
            app.beginUndoGroup(scriptName);
            inOutsRelatoKeys();
            app.endUndoGroup;
        };

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
