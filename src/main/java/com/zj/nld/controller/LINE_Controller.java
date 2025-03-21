package com.zj.nld.controller;

import com.zj.nld.service.LineService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/line")
public class LINE_Controller {
    @Autowired
    private LineService lineService;



    //取得用戶回覆
    @PostMapping("/callwebback")
    public String callwebback(@RequestBody String requestBody) {
        System.out.println("🔹 收到 LINE Webhook: " + requestBody);
        return lineService.processWebhook(requestBody);

    }


}
