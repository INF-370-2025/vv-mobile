
export class employeeWarning {
  employee_warning_id!:number;
  reason!:string;
  employee_warning_type_id!:number;
  employee_id!:number;
  is_disputed!:boolean;
  //employee?:employee;
}

export class employeePayslip {
  employee_pay_slip_id!:number;
  employee_id!:number;
  salary!:number;
  created_at!:Date;
  payslip_url!:string;
}