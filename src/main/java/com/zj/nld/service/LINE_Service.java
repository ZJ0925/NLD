package  com.zj.nld.service;

public interface LINE_Service {
    void responseTOuser(String replyToken, String messageText);
    String processWebhook(String requestBody);
}
