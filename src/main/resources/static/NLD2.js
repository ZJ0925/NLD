//齒色>詳細說明--------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function() {
    const Dcheckbox = document.getElementById("input_62_1");
    const choose = document.getElementsByClassName("Distribution");

    const color = document.getElementById("input_88");
    const neck = document.getElementById("input_89");
    const incisor = document.getElementById("input_90");

    const color1 = document.getElementById("cid_88_1");
    const neck1 = document.getElementById("cid_89_1");
    const incisor1 = document.getElementById("cid_90_1");
    const incisor2 = document.getElementById("cid_90_2");

    // 初始載入時檢查狀態
    toggleDisplay();
    // 監聽 Dcheckbox 的狀態變化
    Dcheckbox.addEventListener("change", toggleDisplay);
    color.addEventListener("change", colorCheck)
    neck.addEventListener("change", neckCheck)
    incisor.addEventListener("change", incisorCheck)

    function toggleDisplay() {
        for (let element of choose) {
            element.style.display = Dcheckbox.checked ? "block" : "none";
        }
    }

    //齒色
    function colorCheck() {
        if (["A_88", "B_88", "C_88", "D_88"].includes(color.value)) {
            color1.style.setProperty("display", "block", "important");
        } else {
            color1.style.setProperty("display", "none", "important");
        }
    }
    
    //齒頸
    function neckCheck() {
        if (["A_89", "B_89", "C_89", "D_89"].includes(neck.value)) {
            neck1.style.setProperty("display", "block", "important");
        } else {
            neck.style.setProperty("display", "none", "important");
        }
    }
    
    
    
    //切端
    function incisorCheck() {
        if (incisor.value === "透明度"){
            incisor1.style.setProperty("display", "block", "important");
            incisor2.style.setProperty("display", "none", "important");
            incisor2.value="";
        }else if (["A_90", "B_90", "C_90", "D_90"].includes(incisor.value)) {
            incisor1.style.setProperty("display", "none", "important");
            incisor2.style.setProperty("display", "block", "important");
            incisor1.value="";
        } else {
            incisor1.style.setProperty("display", "none", "important");
            incisor2.style.setProperty("display", "none", "important");
        }
    }
    
    



    
   






});



//-------------------------------------------------------------------------------