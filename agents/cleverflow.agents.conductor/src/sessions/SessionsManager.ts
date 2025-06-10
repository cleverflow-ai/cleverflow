
import Session from "./Session";
import _ from 'lodash';

class SessionsManager {

    private sessions: Session[] = [];

    constructor() {
    }

    addSession(session: Session) {
        this.sessions.push(session);
    }

    getSession(sessionId: string) {
        return _.find(this.sessions, (session: Session) => {
            return session.id === sessionId;
        });
    }
}

const sessionsManager = new SessionsManager();

export default sessionsManager;