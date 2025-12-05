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
    public ResponseEntity<?> uploadImages(
            @RequestParam("image") MultipartFile[] images,  // ← 改为数组
            @RequestParam("workOrderNum") String workOrderNum) {

        System.out.println("=== Upload Debug ===");
        System.out.println("workOrderNum = " + workOrderNum);
        System.out.println("images count = " + (images != null ? images.length : 0));

        try {
            // 验证参数
            if (images == null || images.length == 0) {
                return ResponseEntity.badRequest().body("No image files provided");
            }

            if (workOrderNum == null || workOrderNum.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Work order number is required");
            }

            // ✅ 准备根目录
            File rootDir = new File(SCANNER_ROOT);
            if (!rootDir.exists()) {
                rootDir.mkdirs();
            }

            // ✅ 用于统计上传结果
            List<Map<String, String>> uploadedFiles = new ArrayList<>();
            List<String> errorMessages = new ArrayList<>();

            // ✅ 遍历每个文件进行上传
            for (int i = 0; i < images.length; i++) {
                MultipartFile image = images[i];

                try {
                    // 跳过空文件
                    if (image.isEmpty()) {
                        continue;
                    }

                    // 验证文件类型
                    String contentType = image.getContentType();
                    if (contentType == null || !contentType.startsWith("image/")) {
                        errorMessages.add("File " + (i + 1) + ": Not an image file");
                        continue;
                    }

                    // 验证文件大小 (限制 20MB)
                    if (image.getSize() > 20 * 1024 * 1024) {
                        errorMessages.add("File " + (i + 1) + ": File size exceeds 20MB");
                        continue;
                    }

                    // ✅ 生成唯一档名
                    String fileName = generateFileNameInRoot(rootDir, workOrderNum);
                    File targetFile = new File(rootDir, fileName);

                    // 储存档案
                    Path targetPath = targetFile.toPath();
                    Files.copy(image.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

                    System.out.println("✅ File " + (i + 1) + " saved: " + fileName);

                    // 记录成功上传的文件
                    Map<String, String> fileInfo = new HashMap<>();
                    fileInfo.put("fileName", fileName);
                    fileInfo.put("originalName", image.getOriginalFilename());
                    fileInfo.put("size", String.valueOf(image.getSize()));
                    uploadedFiles.add(fileInfo);

                } catch (IOException e) {
                    System.err.println("❌ Error saving file " + (i + 1) + ": " + e.getMessage());
                    errorMessages.add("File " + (i + 1) + ": " + e.getMessage());
                }
            }

            // ✅ 构建回应
            Map<String, Object> response = new HashMap<>();
            response.put("success", uploadedFiles.size() > 0);
            response.put("workOrderNum", workOrderNum);
            response.put("totalFiles", images.length);
            response.put("uploadedCount", uploadedFiles.size());
            response.put("uploadedFiles", uploadedFiles);

            if (!errorMessages.isEmpty()) {
                response.put("errors", errorMessages);
                response.put("message", "Partial upload: " + uploadedFiles.size() + " succeeded, " + errorMessages.size() + " failed");
            } else {
                response.put("message", "All " + uploadedFiles.size() + " images uploaded successfully");
            }

            return ResponseEntity.ok()
                    .header(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "*")
                    .body(response);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Unexpected error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(errorResponse);
        }
    }

    // ✅ 修改：第一张照片就从 100 开始编号
    private String generateFileNameInRoot(File rootDirectory, String workOrderNum) {
        // ✅ 直接从 100 开始查找最大序号
        Pattern pattern = Pattern.compile(
                Pattern.quote(workOrderNum) + "_(\\d{3})\\.(jpg|jpeg|png)",
                Pattern.CASE_INSENSITIVE
        );

        File[] existingFiles = rootDirectory.listFiles((dir, name) ->
                pattern.matcher(name).matches()
        );

        int maxNumber = 99; // 设为 99，这样第一个就会是 100
        if (existingFiles != null && existingFiles.length > 0) {
            for (File file : existingFiles) {
                java.util.regex.Matcher matcher = pattern.matcher(file.getName());
                if (matcher.matches()) {
                    int num = Integer.parseInt(matcher.group(1));
                    maxNumber = Math.max(maxNumber, num);
                }
            }
        }

        // 新档案序号 = 最大序号 + 1，格式化为 3 位数
        int newNumber = maxNumber + 1;
        return String.format("%s_%03d.jpg", workOrderNum, newNumber);
    }


}