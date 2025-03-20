package com.zj.nld.controller;

import com.zj.nld.service.LINE_Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/line")
public class LINE_Controller {
    @Autowired
    private LINE_Service lineService;


    public static void main(String[] args) {
        // TODO Auto-generated method stub
    }

    @PostMapping("/callwebback")
    public String callwebback(@RequestBody String requestBody) {
        System.out.println("🔹 收到 LINE Webhook: " + requestBody);
        return lineService.processWebhook(requestBody);

    }



}
