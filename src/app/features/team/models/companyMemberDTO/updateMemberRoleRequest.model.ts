import { CompanyRole } from "../../../../core/model/enums/companyRole.enum.model";

export interface UpdateMemberRoleRequest {
  userId: number;
  companyId: number;
  companyRole: CompanyRole;
}
