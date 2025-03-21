package  com.zj.nld.service;

public interface LineService {
    //回覆訊息
    void responseTOuser(String replyToken, String messageText);
    //取得訊息
    String processWebhook(String requestBody);
    //取得群組所有成員ID
    void getGroupUsersId(String membershipId);

}
