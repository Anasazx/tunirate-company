import { CompanyRole } from "../../../../core/model/enums/companyRole.enum.model";
import { CompanyResponse } from "../../../../core/model/dto/companyDTO/companyResponse.model";
import { UserResponse } from "../userDTO/userResponse.model";

export interface CompanyMemberResponse {
  user: UserResponse;
  company: CompanyResponse;
  companyRole: CompanyRole;
  joinedAt: string;
}
