package lab.ds.dtos.mappers;

import lab.ds.controllers.handlers.requests.AccountData;
import lab.ds.dtos.AccountDTO;
import lab.ds.model.entities.Account;
import lab.ds.model.entities.UserRole;

public class AccountMapper implements Mapper<Account, AccountData, AccountDTO> {
    @Override
    public Account mapToEntity(AccountData data) {
        return Account.builder()
                .username(data.getUsername())
                .password(data.getPassword())
                .name(data.getName())
                .role(UserRole.valueOf(data.getRole()))
                .build();
    }

    @Override
    public Account mapDtoToEntity(AccountDTO dto) {
        return Account.builder()
                .username(dto.getUsername())
                .password(dto.getPassword())
                .name(dto.getName())
                .role(UserRole.valueOf(dto.getRole()))
                .build();
    }

    @Override
    public AccountDTO mapToDto(Account entity) {
        return AccountDTO.builder()
                .id(entity.getId().toString())
                .name(entity.getName())
                .username(entity.getUsername())
                .role(entity.getRole().toString())
                .build();
    }
}
