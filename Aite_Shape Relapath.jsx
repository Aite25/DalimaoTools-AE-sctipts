function main() {
    ///// info
    var scriptName = "Shape relapath by 大狸猫";
    this.scriptTitle = "Shape relapath by 大狸猫";
    var panelGlobal = this;
    var revBox = 0;
    var lastExp = '';
    var expReverseInvert = 0;

    // DIALOG
    // ======
    var dialog = (panelGlobal instanceof Panel) ? panelGlobal : new Window("palette"); 
        if ( !(panelGlobal instanceof Panel) ) dialog.text = "Shape relapath by 大狸猫"; 
        dialog.orientation = "row"; 
        dialog.alignChildren = ["left","top"]; 
        dialog.spacing = 10; 
        dialog.margins = 16; 
    
    // GR1
    // ===
    var gr1 = dialog.add("group", undefined, {name: "gr1"}); 
        gr1.orientation = "column"; 
        gr1.alignChildren = ["fill","top"]; 
        gr1.spacing = 10; 
        gr1.margins = 0; 
    
    // PANEL1
    // ======
    var panel1 = gr1.add("panel", undefined, undefined, {name: "panel1"}); 
        panel1.text = "Shape_relapath"; 
        panel1.preferredSize.height = 25; 
        panel1.orientation = "row"; 
        panel1.alignChildren = ["left","top"]; 
        panel1.spacing = 10; 
        panel1.margins = 10; 
    
    var reverseBox = panel1.add("checkbox", undefined, undefined, {name: "reverseBox"}); 
        reverseBox.text = "↑↓"; 
        reverseBox.alignment = ["left","center"]; 
        reverseBox.value = revBox;
    
    var expPlus = panel1.add("button", undefined, undefined, {name: "expPlus"}); 
        expPlus.text = "Exp +="; 
        expPlus.preferredSize.width = 40;
        expPlus.preferredSize.height = 20;
    
    var expCover = panel1.add("button", undefined, undefined, {name: "expCover"}); 
        expCover.text = "Exp ="; 
        expCover.preferredSize.width = 45;
        expCover.preferredSize.height = 20;

    var expReverse = panel1.add("button", undefined, undefined, {name: "expReverse"}); 
        expReverse.text = "Exp ↑↓"; 
        expReverse.preferredSize.width = 45;
        expReverse.preferredSize.height = 20;
    
    dialog.layout.layout(true);
    dialog.layout.resize();
    dialog.onResizing = dialog.onResize = function () { this.layout.resize(); }
    
    if ( dialog instanceof Window ) dialog.show();
    
    function expslice(exp,cutpointword){
        return exp.slice(0,exp.search(cutpointword)+1);
    }

    function relaPathExp(bool,cover){
        var thisComp = app.project.activeItem;
        var secP = thisComp.selectedProperties;
    
        var propPathArr0 = [];
        var propPathArr1 = [];

        var curP0 = secP[0];
        var curP1 = secP[1];

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
                if(propPathArr0[i].name == "Contents" && propPathArr1[i].name == "Contents"){
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
            if(propPathArr1[i].name == "Contents"){
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
    }

    expPlus.onClick = function () 
    {
        app.beginUndoGroup(scriptName);
        relaPathExp(revBox,0);
        app.endUndoGroup;
    }

    expCover.onClick = function () 
    {
        app.beginUndoGroup(scriptName);
        relaPathExp(revBox,1);
        app.endUndoGroup;
    }

    expReverse.onClick = function () 
    {
        app.beginUndoGroup(scriptName);
        var thisComp = app.project.activeItem;
        var secP = thisComp.selectedProperties;

        secP[revBox^expReverseInvert].expression = expslice(secP[revBox^expReverseInvert].expression,lastExp);
        relaPathExp(!revBox^expReverseInvert,1);

        expReverseInvert = !expReverseInvert;

        app.endUndoGroup;
    }

    reverseBox.onClick = function () 
    {
        revBox = this.value;
    }
}

new main();
