// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private employee_time_logs_ep = 'employee_time_logs';
  private users_ep = 'users';
  private employees_ep = 'employees';

  constructor(private http: HttpClient) {}

  //#region Time Logs (yours)
  get_time_logs(): Observable<any> {
    return this.http.get<any>(`${environment.api_url}${this.employee_time_logs_ep}/get_time_logs`);
  }
  get_monthly_hours_worked(year: number): Observable<any> {
    return this.http.get<any>(`${environment.api_url}${this.employee_time_logs_ep}/monthly_hours_worked?year=${year}`);
  }
  generateClockCode(type: 'clock_in' | 'clock_out'): Observable<{ code: number; expires_at: string }> {
    return this.http.post<{ code: number; expires_at: string }>(
      `${environment.api_url}${this.employee_time_logs_ep}/generate-clock-code`,
      { type }
    );
  }
  clock_in(employee_id: number): Observable<any> {
    return this.http.get<any>(`${environment.api_url}${this.employee_time_logs_ep}/clock_in/${employee_id}`);
  }
  clock_out(employee_id: number): Observable<any> {
    return this.http.get<any>(`${environment.api_url}${this.employee_time_logs_ep}/clock_out/${employee_id}`);
  }
  verifyClockCode(code: number, type: 'clock_in' | 'clock_out', employeeId: number): Observable<any> {
    return this.http.post<any>(`${environment.api_url}${this.employee_time_logs_ep}/verify-clock-code`, {
      code,
      type,
      employee_id: employeeId,
    });
  }
  getEmployeeByPhone(phone: string): Observable<any> {
    const url = `${environment.api_url}${this.employee_time_logs_ep}/employees/get-by-phone/${phone}`;
    return this.http.get<any>(url);
  }
  get_employee_time_logs_by_id(employee_id: number): Observable<any> {
    return this.http.get<any>(`${environment.api_url}${this.employee_time_logs_ep}/get_employee_time_logs_by_id/${employee_id}`);
  }
  //#endregion

  //#region Users/Profile (added fallbacks)
  get_user_by_uuid(uuid: string): Observable<any> {
    return this.http.get<any>(`${environment.api_url}${this.users_ep}/get_user_by_uuid/${uuid}`);
  }
  get_user(user_id: number): Observable<any> {
    return this.http.get<any>(`${environment.api_url}${this.users_ep}/get_user/${user_id}`);
  }
  get_user_by_email(email: string): Observable<any> {
    return this.http.get<any>(`${environment.api_url}${this.users_ep}/get_user_by_email/${encodeURIComponent(email)}`);
  }
  get_user_by_phone(phone: string): Observable<any> {
    return this.http.get<any>(`${environment.api_url}${this.users_ep}/get_user_by_phone/${encodeURIComponent(phone)}`);
  }
  update_user(user_id: number, user: any): Observable<any> {
    return this.http.put<any>(`${environment.api_url}${this.users_ep}/update_user/${user_id}`, user);
  }

  // Optional employee helpers (used only if you want the joined view)
  get_employee(employee_id: number): Observable<any> {
    return this.http.get<any>(`${environment.api_url}${this.employees_ep}/get_employee/${employee_id}`);
  }
  get_profile_employee(user_id: number): Observable<any> {
    return this.http.get<any>(`${environment.api_url}${this.users_ep}/get_user_employee/${user_id}`);
  }
  update_employee(employee_id: number, employee: any): Observable<any> {
    return this.http.put<any>(`${environment.api_url}${this.employees_ep}/update_employee/${employee_id}`, employee);
  }

   get_employee_warnings() {
    return this.http.get<any>(environment.api_url + this.employees_ep + `/get_employee_warnings`);
  }

  get_employee_payslips() {
    return this.http.get<any>(environment.api_url + this.employees_ep + `/get_pay_slips`);
  }
  //#endregion
}
