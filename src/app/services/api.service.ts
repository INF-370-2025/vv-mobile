import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private employee_time_logs_ep = 'employee_time_logs';
  private users_ep = 'users';
  private employees_ep = 'employees';
  private job_cards_ep = 'job_cards';
  private job_requests_ep = 'job_requests';   // ✅ add endpoint name

  constructor(private http: HttpClient) {}

  //#region Job Requests
  getJobRequests(): Observable<any[]> {
    return this.http.get<any[]>(
      `${environment.api_url}${this.job_requests_ep}/get_job_requests`
    );
  }

  uploadJobRequestProgress(jobRequestId: number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(
      `${environment.api_url}${this.job_requests_ep}/upload_progress_image/${jobRequestId}`,
      formData
    );
  }
  //#endregion

  //#region Time Logs
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

  //#region Users/Profile
  get_user_by_uuid(uuid: string): Observable<any> {
    return this.http.get<any>(`${environment.api_url}${this.users_ep}/get_user_by_uuid/${uuid}`);
  }
  get_user(user_id: number): Observable<any> {
    return this.http.get<any>(`${environment.api_url}${this.users_ep}/get_user/${user_id}`);
  }
  get_user_by_email(email: string): Observable<any> {
    return this.http.get<any>(`${environment.api_url}${this.users_ep}/get_user_by_email/${encodeURIComponent(email)}`);
  }

  update_user(user_id: number, user: any): Observable<any> {
    const payload = {
      email: user.email_address,
      phone: user.phone_number,
      user: {
        email_address: user.email_address,
        phone_number: user.phone_number
      },
      email_address: user.email_address,
      phone_number: user.phone_number,
      name: user.name,
      surname: user.surname
    };

    return this.http.put<any>(
      `${environment.api_url}${this.users_ep}/update_user/${user_id}`,
      payload
    );
  }

  get_employee(employee_id: number): Observable<any> {
    return this.http.get<any>(`${environment.api_url}${this.employees_ep}/get_employee/${employee_id}`);
  }
  get_profile_employee(user_id: number): Observable<any> {
    return this.http.get<any>(`${environment.api_url}${this.users_ep}/get_user_employee/${user_id}`);
  }
  get_employee_info(employee_id: number): Observable<any> {
    return this.http.get<any>(`${environment.api_url}employees/employee/info/${employee_id}`);
  }
  get_user_by_phone(phone: string): Observable<any> {
    return this.http.get<any>(`${environment.api_url}employees/get_user_by_phone/${encodeURIComponent(phone)}`);
  }
  get_employee_by_user_id(user_id: number): Observable<any> {
    return this.http.get<any>(`${environment.api_url}employees/employee/user/${user_id}`);
  }
  update_employee(employee_id: number, data: any): Observable<any> {
    return this.http.put<any>(`${environment.api_url}employees/employee/update/${employee_id}`, data);
  }
  get_employee_profile(employee_id: number): Observable<any> {
    return this.http.get<any>(`${environment.api_url}employees/employee/profile/${employee_id}`);
  }
  //#endregion

  //#region Job Cards
  getJobCardsForEmployee(employeeId: number): Observable<any> {
    return this.http.get<any>(
      `${environment.api_url}${this.job_cards_ep}/get_job_cards_employee/${employeeId}`
    );
  }

    uploadProgressImage(jobCardId: number, file: File | FormData): Observable<any> {
    let formData: FormData;

    if (file instanceof FormData) {
      formData = file;
    } else {
      formData = new FormData();
      formData.append('file', file);
    }

    return this.http.post<any>(
      `${environment.api_url}${this.job_cards_ep}/upload_progress_image/${jobCardId}`,
      formData
    );
  }

  getJobCardsForEmployeeWithDetails(employeeId: number): Observable<any> {
    return this.http.get<any>(
      `${environment.api_url}${this.job_cards_ep}/get_job_cards_employee_with_details/${employeeId}`
    );
  }

   get_employee_warnings() {
    return this.http.get<any>(environment.api_url + this.employees_ep + `/get_employee_warnings`);
  }

  update_employee_warning(employee_warning_id: number, employee_warning: any) {
    return this.http.put<any>(
      environment.api_url + this.employees_ep + `/update_employee_warning/${employee_warning_id}`,
      employee_warning
    );
  }

  get_employee_payslips() {
    return this.http.get<any>(environment.api_url + this.employees_ep + `/get_pay_slips`);
  }
  //#endregion
}
