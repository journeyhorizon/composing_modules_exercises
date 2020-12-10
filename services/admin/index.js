import company from "./company";
import { addFinalizeResponseFnc } from "../utils";

const AdminSdk = {
  company,
};

const finalizedAdminSdk = addFinalizeResponseFnc(AdminSdk);

export default finalizedAdminSdk;