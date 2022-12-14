package lab.ds.controllers;

import lab.ds.services.measurements.MessageConsumer;
import lab.ds.services.measurements.NotificationDispatcher;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

import static lab.ds.services.measurements.Constants.STOMP_ENDPOINT;

@Controller
@Slf4j
@CrossOrigin
public class NotificationsController {

    @Autowired
    private MessageConsumer messageConsumer;
    @Autowired
    private NotificationDispatcher dispatcher;

    @EventListener(ApplicationReadyEvent.class)
    public void doSomethingAfterStartup() {
        messageConsumer.connectToMessageQueue();
    }

    @EventListener
    public void sessionSubscriptionHandler(SessionSubscribeEvent event) {
        final StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        final String sessionId = headerAccessor.getSessionId();
        final String username = headerAccessor.getSubscriptionId();
        dispatcher.addListener(username, sessionId);
        log.debug("Client {} with session ID {} has subscribed to socket endpoint {}", username, sessionId, STOMP_ENDPOINT);
    }

    @EventListener
    public void sessionDisconnectionHandler(SessionDisconnectEvent event) {
        final String sessionId = event.getSessionId();
        dispatcher.removeListener(sessionId);
        log.debug("Client with session ID has been {} disconnected!", sessionId);
    }
}
