var alertTitle = "大狸猫提示你"; 
var framePlus = 0;
function keysOutput() {
    
    var spaceBox = 1;
    // Script infos
    this.scriptName = "keysOutput by 大狸猫";    
    this.scriptTitle = "keysOutput by 大狸猫";
    
    // UI strings and default settings
    this.extractBtnName = "提取关键帧";

    // Internal data
    this.m_xAlign = false;
    this.m_xAlignVal = this.xAlignDflt;

    this.buildUI = function (thisObj)
    {
        // dockable panel or palette
        var pal = (thisObj instanceof Panel) ? thisObj : new Window("palette", this.scriptTitle, undefined, {resizeable:true});
        
        // resource specifications
        var res =
        "group { orientation:'column', alignment:['fill','fill'], alignChildren:['left','top'], \
            gr1: Group { \
                extractBtn: Button { text:'" + this.extractBtnName + "',alignment:['fill','bottom'], preferredSize:[150,25] } \
                curFramebox: Checkbox { text: '-当前帧',value: 0 }, \
                spaceBox: Checkbox { text: '图层空行',value: 1 }, \
                plusExtract: Button { text:'增量提取',alignment:['fill','bottom'], preferredSize:[100,25] } \
            }, \
            gr2: Group { orientation:'row', alignment:['fill','fill'], \
                textArea: EditText { preferredSize:[300,300], alignment:['fill','fill'],properties: { multiline: true } } \
            } \
            gr3: Group { orientation:'row', alignment:['left','bottom'], \
                st: StaticText { text:'帧增加:' }, \
                framePlusEt: EditText { text:" + framePlus + " , characters:5 }, \
                frameZeroBtn: Button { text:'清零',alignment:['left','center'], preferredSize:[40,25] }, \
                curFrameBtn: Button { text:'-当前帧',alignment:['left','center'], preferredSize:[60,25] }, \
                unityFormat: Checkbox { text: 'Unity转换' ,value:1}, \
                white: Checkbox { text: '白填充' }, \
            } \
        }"; 
        pal.gr = pal.add(res);
        
        // event callbacks
        pal.onResizing = pal.onResize = function () 
        {
            this.layout.resize();
        };

        pal.gr.gr1.extractBtn.onClick = function () 
        {
            var curFramebox = pal.gr.gr1.curFramebox.value;
            var whiteBox = pal.gr.gr3.white.value;
            var unityBox = pal.gr.gr3.unityFormat.value;
            if(curFramebox == 1){
                var fps = 1/app.project.activeItem.frameDuration
                framePlus = -app.project.activeItem.time*fps;
            }else{framePlus = parseInt(pal.gr.gr3.framePlusEt.text);}
            pal.gr.gr2.textArea.text = main(framePlus,unityBox,whiteBox);
        };
        
        pal.gr.gr1.curFramebox.onClick = function ()
        {
            pal.gr.gr3.framePlusEt.enabled = !this.value;
        }

        pal.gr.gr1.spaceBox.onClick = function ()
        {
            spaceBox = this.value;
        }

        pal.gr.gr1.plusExtract.onClick = function () 
        {
            var whiteBox = pal.gr.gr3.white.value;
            var unityBox = pal.gr.gr3.unityFormat.value;
            framePlus = parseInt(pal.gr.gr3.framePlusEt.text);
            pal.gr.gr2.textArea.text = pal.gr.gr2.textArea.text + main(framePlus,unityBox,whiteBox);
        };

        pal.gr.gr3.framePlusEt.onChange = function ()
        {
            this.text = eval(this.text);
            if (isNaN(this.text))
            {
                this.text = 0;
            }
        }

        pal.gr.gr3.frameZeroBtn.onClick = function () 
        { 
            framePlus = 0;
            pal.gr.gr3.framePlusEt.text = framePlus;
        };

        pal.gr.gr3.curFrameBtn.onClick = function () 
        { 
            var fps = 1/app.project.activeItem.frameDuration
            framePlus = -app.project.activeItem.time*fps;
            pal.gr.gr3.framePlusEt.text = framePlus;
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

    ///// info
    this.alertTitle = "大狸猫提示你";  

    function float2type(num){
        return num%1 === 0 ?num: parseFloat(num.toFixed(2));
    }
    
    function arrCul(val,c,val2){
        if(val.length != undefined){
            output = [];
            for(var p = 0;p<val.length;p++){
                if(c == "+"){output.push(float2type(val[p] + val2[p]));}
                if(c == "-"){output.push(float2type(val[p] - val2[p]));}
                if(c == "*"){output.push(float2type(val[p] * val2[p]));}
                if(c == "/"){output.push(float2type(val[p] / val2[p]));}
            }
        }
        else{
            if(c == "+"){output = float2type(val + val2);}
            if(c == "-"){output = float2type(val - val2);}
            if(c == "*"){output = float2type(val * val2);}
            if(c == "/"){output = float2type(val / val2);}
        }
        return output;
    }

    function getSize (avLayer)
    {
        var w, h;
        if (!(avLayer instanceof TextLayer))
        {
            w = avLayer.width;
            h = avLayer.height;
        }
        else if(avLayer instanceof AVLayer)
        {
            var bb = avLayer.rectAtTime(app.project.activeItem.time, true);
            w = bb.width;
            h = bb.height;
        }else{
            w = 0;
            h = 0;
        }
        return [w,h];
    }; 

    function keyframeSave (obj,hasparent,framePlus,unityBox,whiteBox){
        var fps = 1/app.project.activeItem.frameDuration;
        frameArr = [];
        valueArr = [];
        varietyArr = [];
        outputArr = [];
        varSave = 0;
        if(obj.numKeys == 0){//属性没有关键帧
            frameArr.push("");
            valueArr.push(obj.value);
            if(obj.value.length != undefined){
                for(var i = 0;i<obj.value.length;i++){
                    valueArr[0][i] = float2type(valueArr[0][i]);
                }
            }else{
                valueArr[0] = float2type(valueArr[0]);
            }
        }else{//属性有关键帧
            for(var j = 1;j<obj.numKeys+1;j++){
                if(obj.keySelected(j)){
                    frameArr.push(float2type(obj.keyTime(j)*fps)+framePlus);
                    valueArr.push(obj.valueAtTime(obj.keyTime(j),0));
                }
            }
            if(valueArr[0].length!= undefined){//小数处理
                for(var t = 0;t<valueArr.length;t++){
                    for(var m = 0;m<valueArr[0].length;m++){
                        valueArr[t][m] = float2type(valueArr[t][m]);
                    }
                }
            }else{
                for(var i = 0;i<valueArr.length;i++){
                    valueArr[i] = float2type(valueArr[i]);
                }
            }
        }
        //特别情况，计算前
        if(obj.name == "Position"|"位置" && obj.value.length == 3){//位置
            if(unityBox == 1){
                if(hasparent==1){
                    for(var o = 0;o<valueArr.length;o++){
                        valueArr[o] = [float2type(valueArr[o][0]),float2type(-valueArr[o][1]),float2type(-valueArr[o][2])];
                    }
                }else{
                    for(var o = 0;o<valueArr.length;o++){
                        valueArr[o] = [float2type(valueArr[o][0]-960),float2type(-valueArr[o][1]+540),float2type(-valueArr[o][2])];
                    }
                }
            }
        }

        if(obj.name == "Position"|"位置" && obj.value.length == 2){//位置
            if(unityBox == 1){
                for(var o = 0;o<valueArr.length;o++){
                    valueArr[o] = [float2type(valueArr[o][0]),float2type(-valueArr[o][1])];
                }
            }
        }



        if(obj.name == "Y Rotation"|"Y 轴旋转"){//Y 轴旋转
            if(unityBox == 1){
                for(var o = 0;o<valueArr.length;o++){
                    valueArr[o] = -valueArr[o];
                }
            }
        }
        if(obj.name == "Z Rotation"|"Z 轴旋转"){//Z 轴旋转
            if(unityBox == 1){
                for(var o = 0;o<valueArr.length;o++){
                    valueArr[o] = -valueArr[o];
                }
            }
        }
        //生成v数组，需计算
        if(valueArr.length>1){
            for(var j = 0;j<valueArr.length;j++){
                if(j!=valueArr.length-1){
                    varSave = arrCul(valueArr[j],"-",valueArr[valueArr.length-1]);
                    varietyArr.push(varSave);
                }
                else{
                    varietyArr.push("End");
                }
            }
        }else{
            varietyArr.push("")
        }
        //特别情况，计算后处理
        if(obj.name == "Opacity"|"不透明度"){//不透明度
            for(var i = 0;i<valueArr.length;i++){
                varietyArr[i] = parseInt(valueArr[i]*2.55);
                valueArr[i] = valueArr[i]+"%";
            }
        }
        function singleSixteenConvert(arr,whiteBox){
            var arr2 = Math.round((1*whiteBox + arr*(!whiteBox*2-1))*255);
            arr3 = arr2.toString(16);
            arr3 = arr3 + "";
            if(arr3.length<2){
                arr3 = "0" + arr3;
            }
            arr3 = arr3.toUpperCase();
            arr3 = arr3 + arr3 + arr3;
            return arr3;
        }
        if(obj.name == "Blend With Original"){//渐变填充
            for(var i = 0;i<valueArr.length;i++){
                valueArr[i] = singleSixteenConvert(valueArr[i],whiteBox);
            }
        }
        function matrixSixteenConvert(arr){
            var newArr = [];
            for(var i = 0;i<arr.length;i++){
                if(i != arr.length-1){
                    arr[i] = Math.round(arr[i]*255);
                    arr[i] = arr[i].toString(16);
                    arr[i] = arr[i].toString();
                    if(arr[i].length<2){
                        arr[i] = "0" + arr[i];
                    }
                    arr[i] = arr[i].toUpperCase();
                }else{
                    arr[i] = arr[i];
                }
            }
            newArr.push(arr[0]+arr[1]+arr[2],arr[3]);
            return newArr;
        }
        if(obj.name == "Color"|"颜色"){//颜色
            for(var o = 0;o<valueArr.length;o++){
                valueArr[o] = matrixSixteenConvert(valueArr[o]);
            }
        }
        outputArr.push(frameArr,valueArr,varietyArr);
        return outputArr;
    }
    
    function arr2str (arr){
        str = "";
        for(var i = 0;i<arr.length;i++){
            str += arr[i].toString() + " → ";
            if(i == arr.length-1){
                str = str.slice(0,-3);
            }
        }
        return str;
    }
    
    function main(framePlus,unityBox,whiteBox) {
        var fps = 1/app.project.activeItem.frameDuration;
        str = "";
        keyArr = [];
        selectedLayers = app.project.activeItem.selectedLayers;
        for(var n = 0;n<selectedLayers.length;n++){
            curLayer = app.project.activeItem.selectedLayers[n];
            var hasparent = 0;
            //输出图层名
            str += "-------------------------------------------------------------------------- \n"
            str += curLayer.index + "    " + curLayer.name ; 
            //提取父级名;
            if(curLayer.parent != null){
                str += "\tParent: " + curLayer.parent.index + "    " + curLayer.parent.name;
                hasparent = 1;
            }
            str += "\n";
            var curLayerSize = getSize(curLayer);
            var curLayerAnchor = curLayer.anchorPoint.value;
            //图层大小
            str += "Size: " + curLayerSize[0] + "*" + curLayerSize[1] + "\t";
            if(unityBox == 1){
                var u = float2type(curLayerAnchor[0]/curLayerSize[0]);
                var v = float2type(curLayerAnchor[1]/curLayerSize[1]);
                //uv
                str +="Anchor uv: " + "[" + u +","+ v +"]"
            }else if(unityBox == 0){
                //锚点
                str += "Anchor: " +"[" + curLayerAnchor.toString() + "]";
            }
            //图层进出点以及持续时间
            var inP = curLayer.inPoint;
            var outP = curLayer.outPoint;
            var spaceLine = "";
            spaceBox == 1 ? spaceLine = "\n" :spaceLine = "";
            str += " " + parseInt(inP*fps + framePlus) + "f~" + parseInt(outP*fps + framePlus-1) + "f " + parseInt((outP-inP)*fps) + "f";
            str += "\n-------------------------------------------------------------------------- \n" + spaceLine;

            curProperties = app.project.activeItem.selectedLayers[n].selectedProperties;
            for(var i = 0;i<curProperties.length;i++){
                if(curProperties[i].canSetExpression){
                    keyArr = keyframeSave(curProperties[i],hasparent,framePlus,unityBox,whiteBox);
                    if(curProperties[i].numKeys == 0){
                        str += curProperties[i].name + ":\t" + arr2str(keyArr[1]) + "\n\n"
                        continue;
                    }
                    str += "Frame:\t" + arr2str(keyArr[0]) + "\n";
                    str += curProperties[i].name + ":\t" + arr2str(keyArr[1]) + "\n"
                    str += "v:\t" + arr2str(keyArr[2]) + "\n\n";
                }else{
                    str += curProperties[i].name + "\n";
                }
            }
        }
        return str;
    }
    ///

    this.run = function (thisObj) 
    {
            this.buildUI(thisObj);
    };

}

new keysOutput().run(this);