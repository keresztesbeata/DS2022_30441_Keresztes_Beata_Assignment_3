package lab.ds.model.exceptions;

public class NoLoggedInUserException extends Exception{
    public NoLoggedInUserException() {
    }

    public NoLoggedInUserException(String message) {
        super(message);
    }
}
