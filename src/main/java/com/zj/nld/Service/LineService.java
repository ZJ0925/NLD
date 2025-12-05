package  com.zj.nld.Service;

import java.util.Map;

public interface LineService {

    //取得訊息
    String processWebhook(String requestBody);

    /**
     * 從 LINE API 取得群組名稱
     */
    String getGroupName(String groupId);

    /**
     * 同步單一群組名稱
     */
    boolean syncGroupName(String groupId);

    /**
     * 批量同步所有群組名稱
     */
    Map<String, Object> syncAllGroupNames();

    /**
     * 同步群組成員資料
     * @param groupId 群組 ID
     * @return 同步結果（包含新增、更新、停用的成員數量）
     */
    Map<String, Object> syncGroupMembers(String groupId);
}
