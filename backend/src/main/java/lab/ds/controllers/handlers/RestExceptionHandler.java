package lab.ds.controllers.handlers;

import lab.ds.model.exceptions.*;
import org.hibernate.validator.internal.engine.path.PathImpl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import javax.validation.ConstraintViolation;
import javax.validation.ConstraintViolationException;
import java.io.IOException;

import static org.springframework.http.HttpStatus.*;

@ControllerAdvice
public class RestExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(value = {EntityNotFoundException.class})
    public ResponseEntity<Object> handleEntityNotFoundException(EntityNotFoundException e, WebRequest request) {
        return handleExceptionInternal(
                e,
                new ErrorResponse(NOT_FOUND, e.getMessage()),
                new HttpHeaders(),
                NOT_FOUND,
                request
        );
    }

    @ExceptionHandler(value = {DuplicateDataException.class})
    public ResponseEntity<Object> handleDuplicateUsernameException(DuplicateDataException e, WebRequest request) {
        return handleExceptionInternal(
                e,
                new ErrorResponse(BAD_REQUEST, e.getMessage()),
                new HttpHeaders(),
                BAD_REQUEST,
                request
        );
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException e, HttpHeaders headers, HttpStatus status, WebRequest request) {
        final ErrorResponse errorResponse = constructFieldErrorResponse(e);

        return handleExceptionInternal(
                e,
                errorResponse,
                new HttpHeaders(),
                errorResponse.getStatus(),
                request
        );
    }

    @ExceptionHandler(value = ConstraintViolationException.class)
    ResponseEntity<Object> handleConstraintViolationException(ConstraintViolationException e, WebRequest request) {
        final ErrorResponse errorResponse = constructConstraintViolationResponse(e);

        return handleExceptionInternal(
                e,
                errorResponse,
                new HttpHeaders(),
                errorResponse.getStatus(),
                request
        );
    }

    @ExceptionHandler(value = {MethodArgumentTypeMismatchException.class})
    public ResponseEntity<Object> handleMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException e, WebRequest request) {
        final ErrorResponse errorResponse = constructMethodArgumentTypeMismatchResponse(e);

        return handleExceptionInternal(
                e,
                errorResponse,
                new HttpHeaders(),
                errorResponse.getStatus(),
                request
        );
    }

    @ExceptionHandler(value = {AuthenticationException.class})
    public ResponseEntity<Object> handleAuthenticationException(AuthenticationException e, WebRequest request) {
        return handleExceptionInternal(
                e,
                new ErrorResponse(UNAUTHORIZED, e.getMessage()),
                new HttpHeaders(),
                UNAUTHORIZED,
                request
        );
    }

    @ExceptionHandler(value = {NoLoggedInUserException.class})
    public ResponseEntity<Object> handleNoLoggedInUserException(NoLoggedInUserException e, WebRequest request) {
        return handleExceptionInternal(
                e,
                new ErrorResponse(FORBIDDEN, e.getMessage()),
                new HttpHeaders(),
                FORBIDDEN,
                request
        );
    }

    @ExceptionHandler(value = {InvalidFilterException.class})
    public ResponseEntity<Object> handleInvalidFilterException(InvalidFilterException e, WebRequest request) {
        final ErrorResponse errorResponse = constructInvalidFilterResponse(e);

        return handleExceptionInternal(
                e,
                errorResponse,
                new HttpHeaders(),
                errorResponse.getStatus(),
                request
        );
    }

    @ExceptionHandler(value = {IOException.class})
    public ResponseEntity<Object> handleIOException(IOException e, WebRequest request) {
        return handleExceptionInternal(
                e,
                new ErrorResponse(INTERNAL_SERVER_ERROR, e.getMessage()),
                new HttpHeaders(),
                INTERNAL_SERVER_ERROR,
                request
        );
    }

    @ExceptionHandler(value = {UsernameNotFoundException.class})
    public ResponseEntity<Object> handleUsernameNotFoundException(UsernameNotFoundException e, WebRequest request) {
        return handleExceptionInternal(
                e,
                new ErrorResponse(NOT_FOUND, e.getMessage()),
                new HttpHeaders(),
                NOT_FOUND,
                request
        );
    }

    @ExceptionHandler(value = {InvalidAccessException.class})
    public ResponseEntity<Object> handleInvalidAccessException(InvalidAccessException e, WebRequest request) {
        return handleExceptionInternal(
                e,
                new ErrorResponse(FORBIDDEN, e.getMessage()),
                new HttpHeaders(),
                FORBIDDEN,
                request
        );
    }

    @ExceptionHandler(value = {InvalidDataException.class})
    public ResponseEntity<Object> handleInvalidDataException(InvalidDataException e, WebRequest request) {
        return handleExceptionInternal(
                e,
                new ErrorResponse(BAD_REQUEST, e.getMessage()),
                new HttpHeaders(),
                BAD_REQUEST,
                request
        );
    }

    private ErrorResponse constructFieldErrorResponse(MethodArgumentNotValidException e) {
        ErrorResponse errorResponse = new ErrorResponse(UNPROCESSABLE_ENTITY, "Invalid request entity!");
        for (FieldError fieldError : e.getBindingResult().getFieldErrors()) {
            errorResponse.addValidationError(fieldError.getField(),
                    fieldError.getDefaultMessage());
        }
        return errorResponse;
    }

    private ErrorResponse constructConstraintViolationResponse(ConstraintViolationException e) {
        ErrorResponse errorResponse = new ErrorResponse(BAD_REQUEST, "Unsatisfied constraints!");
        for (ConstraintViolation constraintViolation : e.getConstraintViolations()) {
            errorResponse.addValidationError(((PathImpl) constraintViolation.getPropertyPath()).getLeafNode().getName(),
                    constraintViolation.getMessage());
        }
        return errorResponse;
    }

    private ErrorResponse constructMethodArgumentTypeMismatchResponse(MethodArgumentTypeMismatchException e) {
        ErrorResponse errorResponse = new ErrorResponse(BAD_REQUEST, "Method argument type mismatch!");
        errorResponse.addValidationError(e.getName(),
                e.getMessage());
        return errorResponse;
    }

    private ErrorResponse constructInvalidFilterResponse(InvalidFilterException e) {
        ErrorResponse errorResponse = new ErrorResponse(BAD_REQUEST, "Could not filter by field!");
        errorResponse.addValidationError(e.getField(),
                e.getMessage());
        return errorResponse;
    }
}
