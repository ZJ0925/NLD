document.addEventListener("DOMContentLoaded", function() {
    // 取得 DOM 元素
    let dropdown = document.getElementById("input_36"); // 固定類
    let dropdown1 = document.getElementById("input_39"); // 活動類
    let dropdown2 = document.getElementById("input_40"); // 矯正&植牙類
    
    
    // 固定類選項
    let FixedCheckboxes = [
        document.getElementById("id_84"), // 星鑽、貝鑽、珍鑽、白玉
        document.getElementById("id_85"), // 玉瓷冠、透瓷冠、彩瓷冠、白瓷冠
        document.getElementById("id_50"), // 客製支台
        document.getElementById("id_119"), // 系統
        document.getElementById("id_113"), // 拆卸珠、拆卸溝
        document.getElementById("id_93"), // 矽晶、水晶
        document.getElementById("id_56"), // 數位生物合金
        document.getElementById("id_114"), // 純鈦金屬冠、數位生物合金
        document.getElementById("id_81") // 薄殼、全冠、Other
    ];

    // 活動類選項
    let actCheckboxes = [
        document.getElementById("id_115"), // 數位活動臨時牙
        document.getElementById("id_118"), // 需要 打洞
        document.getElementById("id_78"), // 需要 金屬列印牙架
        document.getElementById("id_54") // 列印工作模型(半口)、列印工作模型(全口)
    ];

// 矯正&植牙類選項
    let tooCheckboxes = [
        document.getElementById("id_91"), // 上顎、下顎
        document.getElementById("id_79"), // 評估報告、Check Point
        document.getElementById("id_80") // 硬式咬合板、軟式咬合板
    ];

    // 控制 actCheckbox3（固定類和活動類的交互影響）
    let x = false, y = false;
    let actCheckbox3 = actCheckboxes[3]; // 列印工作模型

    // 用來統一隱藏所有 checkbox 的函數
    function hideAllCheckboxes(checkboxArray) {
        checkboxArray.forEach(checkbox => checkbox.style.display = "none");
    }

    // 固定類選擇對應的 checkbox 顯示
    const fixedDisplayMapping = {
        "全瓷牙": [0, 2, 3, 4],
        "全鋯冠": [1, 2, 3, 4],
        "金屬瓷牙": [2, 3, 4, 6],
        "金屬冠": [4, 7],
        "客製支台": [2],
        "Inlay & Onlay": [5],
        "臨時牙": [8]
    };

    // 活動類選擇對應的 checkbox 顯示
    const actDisplayMapping = {
        "臨時牙": [0],
        "個人牙托": [1],
        "一般床": [2, 3],
        "彈性床": [3]
    };

    // 矯正&植牙類選擇對應的 checkbox 顯示
    const tooDisplayMapping = {
        "U-Teeth隱形矯正": [1],
        "硬式咬合板": [2],
        "透明維持器": [0],
        "漂白牙托": [0]
    };

    // 監聽固定類的變化
    dropdown.addEventListener("change", function () {
        hideAllCheckboxes(FixedCheckboxes);

        if (fixedDisplayMapping[dropdown.value]) {
            fixedDisplayMapping[dropdown.value].forEach(index => {
                if (FixedCheckboxes[index]) FixedCheckboxes[index].style.display = "block";
            });
        }

        // 更新 x 狀態
        x = (dropdown.value === "金屬瓷牙");

        // 更新 actCheckbox3 的顯示狀態
        actCheckbox3.style.display = (x || y) ? "block" : "none";
    });

    // 監聽活動類的變化
    dropdown1.addEventListener("change", function () {
        hideAllCheckboxes(actCheckboxes);

        if (actDisplayMapping[dropdown1.value]) {
            actDisplayMapping[dropdown1.value].forEach(index => {
                if (actCheckboxes[index]) actCheckboxes[index].style.display = "block";
            });
        }

        // 更新 y 狀態
        y = (dropdown1.value === "一般床" || dropdown1.value === "彈性床");

        // 更新 actCheckbox3 的顯示狀態
        actCheckbox3.style.display = (x || y) ? "block" : "none";
    });

    // 監聽矯正&植牙類的變化
    dropdown2.addEventListener("change", function () {
        hideAllCheckboxes(tooCheckboxes);

        if (tooDisplayMapping[dropdown2.value]) {
            tooDisplayMapping[dropdown2.value].forEach(index => {
                if (tooCheckboxes[index]) tooCheckboxes[index].style.display = "block";
            });
        }
    });

});




//-------------------------------------------------------------------------------

//口內攝影上傳--------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function() {
    const choseUpload = document.getElementById("input_62_2");

    const allfileUpload = document.getElementById("id_72");//口內攝影拖曳區域
    let update = null; // 存放 FileUploader 物件

    choseUpload.addEventListener("change", function () {

        if(this.checked) {
            allfileUpload.style.display = "block";
            // **如果之前有 `update`，則先清空**
            // **確保之前的上傳功能被清除**
            if (update) {
                update.reset(); // **清除舊的事件監聽器**
            }
            // **初始化 `FileUploader`，並存入 `update`**
            update = setupFileUpload("drop-area", "input_72", "file-list", "upload-btn-72");


        }else{
            allfileUpload.style.display = "none";
            // **當取消 checkbox 時，清空檔案列表**
            if (update) {
                update.reset();
                update = null;
            }

        }
    })

    /*-----------------------口掃檔上傳-----------------------------------*/
    setupFileUpload("drop-area1", "input_48", "mouth-file-list", "upload-btn-48");


// 檔案上傳功能（沒有 uploadBtn）
    function setupFileUpload(dropAreaId, fileInputId, fileListId) {
        const dropArea = document.getElementById(dropAreaId); // 取得拖曳區域
        const fileInput = document.getElementById(fileInputId); // 取得檔案輸入框
        const fileList = document.getElementById(fileListId); // 取得檔案列表區域
        const duplicateFiles = new Set(); // 用 Set 來儲存已上傳的檔案名稱，避免重複

        // **內部函式：處理檔案上傳**
        function handleFiles(files) {
            for (const file of files) {
                if (duplicateFiles.has(file.name)) {
                    alert(`⚠️ 檔案「${file.name}」已經上傳過，請勿重複上傳！`);
                    continue; // **跳過這個檔案**
                }

                duplicateFiles.add(file.name); // **將檔案加入 Set，標記為已上傳**
                const listItem = document.createElement("li"); // 建立列表項目 (li)
                listItem.textContent = file.name; // 設定檔案名稱

                // 建立 "刪除" 按鈕
                const deleteBtn = document.createElement("button");
                deleteBtn.textContent = "X"; // 設定按鈕文字
                deleteBtn.classList.add("delete-btn"); // 加入 CSS 樣式

                deleteBtn.addEventListener("click", function () {
                    fileList.removeChild(listItem); // 點擊後移除該檔案列表項目
                    duplicateFiles.delete(file.name); // **從 Set 中移除該檔案名稱**
                });

                listItem.appendChild(deleteBtn); // 把刪除按鈕加到列表項目
                fileList.appendChild(listItem); // 把整個列表項目加到檔案列表
            }
        }

        // 當使用者選擇檔案時，處理並顯示檔案
        fileInput.addEventListener("change", function (event) {
            handleFiles(event.target.files); // 使用內部函式處理檔案
            fileInput.value = ""; // **重置 input[type=file]，避免相同檔案無法再次選取**
        });

        // **拖曳上傳相關監聽**
        dropArea.addEventListener("dragover", function (event) {
            event.preventDefault(); // **阻止預設行為，避免瀏覽器開啟檔案**
            dropArea.classList.add("highlight");
        });

        dropArea.addEventListener("dragleave", function () {
            dropArea.classList.remove("highlight");
        });

        dropArea.addEventListener("drop", function (event) {
            event.preventDefault(); // **阻止預設行為**
            dropArea.classList.remove("highlight");
            handleFiles(event.dataTransfer.files);
        });
        // **回傳一個物件，包含 reset() 方法**
        return {
            reset() {
                fileList.innerHTML = "";//清空檔案列表的 UI
                duplicateFiles.clear();//清空 Set 內已上傳的檔案名稱
                fileInput.removeEventListener();//移除 input[type=file] 的 change 事件監聽器
            },

        };

    }
});
