package com.zj.nld.Controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.HttpHeaders;
import org.springframework.http.CacheControl;

import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.regex.Pattern;
import java.util.concurrent.TimeUnit;

@RestController
@RequestMapping("/api/scaner")
@CrossOrigin(origins = "*", allowedHeaders = "*") // ✅ 加入 CORS 支援
public class ImageScannerController {

    private static final String SCANNER_ROOT = "\\\\192.168.26.199\\scaner";

    private static final String Z_DRIVE_ROOT = "Z:\\";

    @GetMapping(value = "/{workOrderNum}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getWorkOrderImages(@PathVariable("workOrderNum") String workOrderNum) {
        try {
            if (workOrderNum == null || workOrderNum.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Invalid work order number");
            }

            List<String> imageUrls = new ArrayList<>();

            // 1️⃣ 嘗試子資料夾模式
            File folder = new File(SCANNER_ROOT, workOrderNum);
            if (folder.exists() && folder.isDirectory()) {
                File[] files = folder.listFiles(this::isImageFile);
                if (files != null) {
                    for (File file : files) {
                        String fileName = URLEncoder.encode(file.getName(), StandardCharsets.UTF_8);
                        imageUrls.add("/api/scaner/image/" + workOrderNum + "/" + fileName);
                    }
                }
            }
            // 2️⃣ 根目錄模式 - 精準比對
            else {
                File rootDir = new File(SCANNER_ROOT);
                Pattern pattern = Pattern.compile("^" + Pattern.quote(workOrderNum) + "(_\\d+)?\\.(jpg|jpeg|png|gif)$", Pattern.CASE_INSENSITIVE);

                File[] matchingFiles = rootDir.listFiles((dir, name) -> pattern.matcher(name).matches());
                if (matchingFiles != null) {
                    Arrays.sort(matchingFiles, Comparator.comparing(File::getName));
                    for (File file : matchingFiles) {
                        String fileName = URLEncoder.encode(file.getName(), StandardCharsets.UTF_8);
                        imageUrls.add("/api/scaner/image/single/" + fileName);
                    }
                }
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*") // ✅ 額外加入 CORS header
                    .body(imageUrls);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error reading images: " + e.getMessage());
        }
    }

    // ✅ 資料夾圖片 - 加入快取和 CORS
    @GetMapping("/image/{workOrderNum}/{fileName}")
    public ResponseEntity<?> serveImageFromFolder(@PathVariable String workOrderNum,
                                                  @PathVariable String fileName) {
        try {
            File file = new File(SCANNER_ROOT + File.separator + workOrderNum, fileName);
            if (!file.exists() || !file.isFile()) {
                return ResponseEntity.notFound().build();
            }
            byte[] bytes = java.nio.file.Files.readAllBytes(file.toPath());

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(guessMimeType(fileName)))
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*") // ✅ CORS
                    .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS)) // ✅ 快取 1 小時
                    .body(bytes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error loading image: " + e.getMessage());
        }
    }

    // ✅ 根目錄圖片 - 加入快取和 CORS
    @GetMapping("/image/single/{fileName}")
    public ResponseEntity<?> serveSingleImage(@PathVariable String fileName) {
        try {
            File file = new File(SCANNER_ROOT, fileName);
            if (!file.exists() || !file.isFile()) {
                return ResponseEntity.notFound().build();
            }
            byte[] bytes = java.nio.file.Files.readAllBytes(file.toPath());

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(guessMimeType(fileName)))
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*") // ✅ CORS
                    .cacheControl(CacheControl.maxAge(1, TimeUnit.HOURS)) // ✅ 快取 1 小時
                    .body(bytes);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error loading image: " + e.getMessage());
        }
    }

    private boolean isImageFile(File dir, String name) {
        String lower = name.toLowerCase();
        return lower.endsWith(".jpg") || lower.endsWith(".jpeg")
                || lower.endsWith(".png") || lower.endsWith(".gif");
    }

    private String guessMimeType(String fileName) {
        String lower = fileName.toLowerCase();
        if (lower.endsWith(".png")) return "image/png";
        if (lower.endsWith(".gif")) return "image/gif";
        return "image/jpeg";
    }

    // ✅ 新增：圖片上傳 API - 修改版（儲存到根目錄）
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadImage(
            @RequestParam("image") MultipartFile image,
            @RequestParam("workOrderNum") String workOrderNum) {
        System.out.println("=== Upload Debug ===");
        System.out.println("workOrderNum = " + workOrderNum);
        System.out.println("image = " + (image != null));
        System.out.println("image size = " + (image != null ? image.getSize() : "null"));
        System.out.println("image contentType = " + (image != null ? image.getContentType() : "null"));

        try {
            // 驗證參數
            if (image == null || image.isEmpty()) {
                return ResponseEntity.badRequest().body("No image file provided");
            }

            if (workOrderNum == null || workOrderNum.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Work order number is required");
            }

            // 驗證檔案類型
            String contentType = image.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest().body("Only image files are allowed");
            }

            // 驗證檔案大小 (限制 20MB)
            if (image.getSize() > 20 * 1024 * 1024) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("success", false);
                errorResponse.put("message", "檔案大小超過 20MB 限制");
                return ResponseEntity.badRequest().body(errorResponse);
            }

            // ✅ 修改：直接儲存到根目錄，不建立子資料夾
            File rootDir = new File(SCANNER_ROOT);
            if (!rootDir.exists()) {
                rootDir.mkdirs();
            }

            // ✅ 生成檔名 (工單號.jpg 或 工單號_001.jpg)
            String fileName = generateFileNameInRoot(rootDir, workOrderNum);
            File targetFile = new File(rootDir, fileName);

            // 儲存檔案
            Path targetPath = targetFile.toPath();
            Files.copy(image.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
            System.out.println("✅ File saved to: " + targetPath);

            // 回傳成功訊息
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Image uploaded successfully");
            response.put("fileName", fileName);
            response.put("workOrderNum", workOrderNum);
            response.put("filePath", targetFile.getAbsolutePath());

            return ResponseEntity.ok()
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                    .body(response);

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error uploading image: " + e.getMessage());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Unexpected error: " + e.getMessage());
        }
    }

    // ✅ 新增：在根目錄生成檔名的方法
    private String generateFileNameInRoot(File rootDirectory, String workOrderNum) {
        // 檢查是否存在 工單號.jpg
        File baseFile = new File(rootDirectory, workOrderNum + ".jpg");
        if (!baseFile.exists()) {
            // 如果不存在，直接使用 工單號.jpg
            return workOrderNum + ".jpg";
        }

        // 如果存在，找出最大的序號
        Pattern pattern = Pattern.compile(
                Pattern.quote(workOrderNum) + "_(\\d{3})\\.(jpg|jpeg|png)",
                Pattern.CASE_INSENSITIVE
        );

        File[] existingFiles = rootDirectory.listFiles((dir, name) ->
                pattern.matcher(name).matches()
        );

        int maxNumber = 0;
        if (existingFiles != null && existingFiles.length > 0) {
            for (File file : existingFiles) {
                java.util.regex.Matcher matcher = pattern.matcher(file.getName());
                if (matcher.matches()) {
                    int num = Integer.parseInt(matcher.group(1));
                    maxNumber = Math.max(maxNumber, num);
                }
            }
        }

        // 新檔案序號 = 最大序號 + 1，格式化為 3 位數
        int newNumber = maxNumber + 1;
        return String.format("%s_%03d.jpg", workOrderNum, newNumber);
    }


}