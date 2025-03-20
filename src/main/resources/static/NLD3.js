//口內攝影上傳--------------------------------------------------------------------
document.addEventListener("DOMContentLoaded", function() {
    const choseUpload = document.getElementById("input_62_2");


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

