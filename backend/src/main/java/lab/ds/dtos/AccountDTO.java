package lab.ds.dtos;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccountDTO {
    private String id;
    private String name;
    private String username;
    private String password;
    private String role;
}
