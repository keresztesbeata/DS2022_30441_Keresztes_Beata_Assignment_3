package lab.ds.model.exceptions;

public class EntityNotFoundException extends Exception{
    public EntityNotFoundException() {
    }

    public EntityNotFoundException(String message) {
        super(message);
    }
}
