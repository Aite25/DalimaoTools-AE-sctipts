; DalimaoTools 快捷键脚本 (AHK v2)
; 在 After Effects 中通过 COM 接口直接执行 JSX 脚本
; 支持: Move InPoint, Move OutPoint

#Requires AutoHotkey v2.0
#SingleInstance Force

scriptDir := "E:\adobe\Adobe After Effects 2024\Support Files\Scripts\ScriptUI Panels\Modularized_Scripts\Shortcuts\"

; 通过 AE 的 COM 接口执行 JSX 脚本
RunAEScript(scriptFile) {
    global scriptDir
    fullPath := scriptDir . scriptFile
    
    try {
        ; 方法1: 使用 AE 的 COM 接口 (app object)
        ae := ComObject("AfterEffects.Application")
        ae.ExecuteScript(fullPath)
    } catch {
        ; 方法2: 如果 COM 不可用，模拟菜单操作
        try {
            ; 激活 AE 窗口
            if WinExist("ahk_exe AfterFX.exe") {
                WinActivate
                Sleep 200
                ; 通过 AE 的 File > Scripts > Run Script File
                ; 先打开脚本面板，然后执行
                Send "^+!{F12}"  ; 尝试触发脚本
                Sleep 300
            }
        }
    }
}

; F12 测试
F12:: {
    MsgBox "AHK Dalimao Hotkeys is running!"
}

#HotIf WinActive("ahk_exe AfterFX.exe")

; Move InPoint
3:: {
    RunAEScript("InOuts_MoveInpoint.jsx")
}

; Move OutPoint  
4:: {
    RunAEScript("InOuts_MoveOutpoint.jsx")
}

#HotIf