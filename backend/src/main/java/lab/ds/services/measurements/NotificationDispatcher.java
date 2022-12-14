package lab.ds.services.measurements;

import lab.ds.model.exceptions.EntityNotFoundException;
import lab.ds.services.api.AccountService;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.collections4.BidiMap;
import org.apache.commons.collections4.bidimap.DualHashBidiMap;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessageType;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import static lab.ds.services.measurements.Constants.NOTIFICATIONS_ENDPOINT;

@Slf4j
@Component
public class NotificationDispatcher {
    @Getter
    @Autowired
    private SimpMessagingTemplate template;
    private BidiMap<String, String> listeners = new DualHashBidiMap<>();
    @Autowired
    private AccountService accountService;

    public void notifyUser(String userId, Notification notification) {
        try {
            final String username = accountService.findAccountById(userId).getUsername();
            log.debug("Sending notification to client {}", username);
            final String sessionId = listeners.get(username);

            // check if the client has been disconnected and return (don't send notifications)
            if (sessionId == null) {
                log.debug("The client has been disconnected! No notifications will be sent.");
                return;
            }

            // add the session id of the client to the header
            SimpMessageHeaderAccessor headerAccessor = SimpMessageHeaderAccessor.create(SimpMessageType.MESSAGE);
            headerAccessor.setSessionId(sessionId);
            headerAccessor.setLeaveMutable(true);
            template.convertAndSendToUser(sessionId, NOTIFICATIONS_ENDPOINT, notification, headerAccessor.getMessageHeaders());
        } catch (EntityNotFoundException e) {
            log.error("Cannot notify user, no logged in user! {}", e.getMessage());
        }
    }

    public void addListener(String username, String sessionId) {
        listeners.put(username, sessionId);
    }

    public void removeListener(String sessionId) {
        listeners.removeValue(sessionId);
    }

}
