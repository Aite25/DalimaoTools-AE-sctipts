/*
 * 模块名称: CompID
 * 功能描述: 查找合成ID - 项目窗口选中合成ID & 当前激活合成ID
 * 版本: 1.0.0
 * 作者: Dalimao Tools
 */

var CompIDModule = (function() {
    var moduleObj = {
        name: "CompID",
        displayName: "Comp ID",
        version: "1.0.0",

        buildUI: function(container) {
            var scriptName = this.displayName;

            var ui_res =
                "group { orientation:'column', alignment:['fill','fill'], alignChildren:['left','top'], " +
                    "gr1: Group { " +
                        "selectedBtn: Button { text:'选中合成 ID', preferredSize:[120,25] } " +
                        "selectedEt: EditText { text:'—', preferredSize:[200,25], properties:{readonly:true} } " +
                    "}, " +
                    "gr2: Group { " +
                        "activeBtn: Button { text:'激活合成 ID', preferredSize:[120,25] } " +
                        "activeEt: EditText { text:'—', preferredSize:[200,25], properties:{readonly:true} } " +
                    "}, " +
                    "gr3: Group { " +
                        "allBtn: Button { text:'全部查询', preferredSize:[120,25] } " +
                        "infoEt: EditText { text:'点击按钮查询 ID', preferredSize:[200,80], properties:{multiline:true, readonly:true, scrolling:true} } " +
                    "}, " +
                "}";

            var grp = container.add(ui_res);

            var selectedBtn = grp.gr1.selectedBtn;
            var selectedEt = grp.gr1.selectedEt;
            var activeBtn = grp.gr2.activeBtn;
            var activeEt = grp.gr2.activeEt;
            var allBtn = grp.gr3.allBtn;
            var infoEt = grp.gr3.infoEt;

            // 获取项目窗口中选中的合成
            function getSelectedCompIDs() {
                var sel = app.project.selection;
                var comps = [];
                for (var i = 0; i < sel.length; i++) {
                    if (sel[i] instanceof CompItem) {
                        comps.push({ name: sel[i].name, id: sel[i].id });
                    }
                }
                return comps;
            }

            // 获取当前激活合成
            function getActiveCompID() {
                var comp = app.project.activeItem;
                if (comp instanceof CompItem) {
                    return { name: comp.name, id: comp.id };
                }
                return null;
            }

            selectedBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                try {
                    var comps = getSelectedCompIDs();
                    if (comps.length === 0) {
                        selectedEt.text = "未选中合成";
                        infoEt.text = "请在项目窗口中选中至少一个合成";
                    } else if (comps.length === 1) {
                        selectedEt.text = "" + comps[0].id;
                        infoEt.text = "「" + comps[0].name + "」\nID = " + comps[0].id;
                    } else {
                        var ids = [];
                        var lines = "";
                        for (var i = 0; i < comps.length; i++) {
                            ids.push(comps[i].id);
                            lines += "「" + comps[i].name + "」ID = " + comps[i].id;
                            if (i < comps.length - 1) lines += "\n";
                        }
                        selectedEt.text = ids.join(", ");
                        infoEt.text = lines;
                    }
                } catch(e) {
                    alert("错误: " + e.toString());
                }
                app.endUndoGroup();
            };

            activeBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                try {
                    var comp = getActiveCompID();
                    if (comp) {
                        activeEt.text = "" + comp.id;
                        infoEt.text = "「" + comp.name + "」\nID = " + comp.id;
                    } else {
                        activeEt.text = "无激活合成";
                        infoEt.text = "请先打开一个合成";
                    }
                } catch(e) {
                    alert("错误: " + e.toString());
                }
                app.endUndoGroup();
            };

            allBtn.onClick = function() {
                app.beginUndoGroup(scriptName);
                try {
                    var lines = "";
                    var active = getActiveCompID();
                    var selected = getSelectedCompIDs();

                    if (active) {
                        lines += "[激活] 「" + active.name + "」ID = " + active.id;
                    } else {
                        lines += "[激活] 无";
                    }

                    if (selected.length > 0) {
                        for (var i = 0; i < selected.length; i++) {
                            lines += "\n[选中] 「" + selected[i].name + "」ID = " + selected[i].id;
                        }
                    } else {
                        lines += "\n[选中] 无";
                    }

                    infoEt.text = lines;

                    // 同步更新短显示
                    activeEt.text = active ? "" + active.id : "无";
                    if (selected.length === 1) {
                        selectedEt.text = "" + selected[0].id;
                    } else if (selected.length > 1) {
                        var ids = [];
                        for (var j = 0; j < selected.length; j++) ids.push(selected[j].id);
                        selectedEt.text = ids.join(", ");
                    } else {
                        selectedEt.text = "无";
                    }
                } catch(e) {
                    alert("错误: " + e.toString());
                }
                app.endUndoGroup();
            };

            return grp;
        }
    };

    return moduleObj;
})();

// ==== 独立运行 / 启动器两种模式 ====
if ($.global.DALIMAO_LOADER_ACTIVE) {
    $.global.DALIMAO_REGISTER(CompIDModule);
} else {
    (function() {
        var win = new Window("palette", "Comp ID by 大狸猫", undefined, {resizeable:true});
        win.alignChildren = ["fill","top"];
        win.spacing = 10;
        win.margins = 10;

        CompIDModule.buildUI(win);

        win.layout.layout(true);
        win.layout.resize();
        win.onResizing = win.onResize = function () { this.layout.resize(); }

        if (win instanceof Window) {
            win.center();
            win.show();
        }
    })();
}