"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaintenanceStatus = exports.PaymentStatus = exports.PaymentMethod = exports.AcademicLevel = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "super_admin";
    UserRole["PRESIDENT"] = "president";
    UserRole["RESPONSABLE_PEDAGOGIQUE"] = "responsable_pedagogique";
    UserRole["SECRETAIRE_PARCOURS"] = "secretaire_parcours";
    UserRole["SURVEILLANT_GENERAL"] = "surveillant_general";
    UserRole["SCOLARITE"] = "scolarite";
    UserRole["RH"] = "rh";
    UserRole["ECONOMAT"] = "economat";
    UserRole["CAISSIER"] = "caissier";
    UserRole["COMMUNICATION"] = "communication";
    UserRole["ADMIN"] = "admin";
    UserRole["RESPONSABLE_LOGISTIQUE"] = "responsable_logistique";
    UserRole["SERVICE_ENTRETIEN"] = "service_entretien";
    UserRole["ETUDIANT"] = "etudiant";
    UserRole["PARENT"] = "parent";
    UserRole["PROFESSEUR"] = "professeur";
})(UserRole || (exports.UserRole = UserRole = {}));
var AcademicLevel;
(function (AcademicLevel) {
    AcademicLevel["LICENCE"] = "licence";
    AcademicLevel["MASTER"] = "master";
    AcademicLevel["DOCTORAT"] = "doctorat";
})(AcademicLevel || (exports.AcademicLevel = AcademicLevel = {}));
var PaymentMethod;
(function (PaymentMethod) {
    PaymentMethod["CASH"] = "cash";
    PaymentMethod["TRANSFER"] = "virement";
    PaymentMethod["CARD"] = "carte";
    PaymentMethod["MOBILE"] = "mobile_money";
})(PaymentMethod || (exports.PaymentMethod = PaymentMethod = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PAID"] = "paid";
    PaymentStatus["PARTIAL"] = "partial";
    PaymentStatus["OVERDUE"] = "overdue";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var MaintenanceStatus;
(function (MaintenanceStatus) {
    MaintenanceStatus["OPEN"] = "open";
    MaintenanceStatus["IN_PROGRESS"] = "in_progress";
    MaintenanceStatus["RESOLVED"] = "resolved";
})(MaintenanceStatus || (exports.MaintenanceStatus = MaintenanceStatus = {}));
//# sourceMappingURL=roles.enum.js.map