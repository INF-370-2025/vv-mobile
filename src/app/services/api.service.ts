// src/app/services/api.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private employee_time_logs_ep = 'employee_time_logs';

  constructor(private http: HttpClient) { }

  get_time_logs(): Observable<any> {
    return this.http.get<any>(
      `${environment.api_url}${this.employee_time_logs_ep}/get_time_logs`
    );
  }

  get_monthly_hours_worked(year: number): Observable<any> {
    return this.http.get<any>(
      environment.api_url + this.employee_time_logs_ep + `/monthly_hours_worked?year=${year}`
    );
  }

  generateClockCode(type: 'clock_in' | 'clock_out'): Observable<{ code: number, expires_at: string }> {
    return this.http.post<{ code: number, expires_at: string }>(
      environment.api_url + this.employee_time_logs_ep + '/generate-clock-code',
      { type }
    );
  }

  clock_in(employee_id: number): Observable<any> {
    return this.http.get<any>(
      environment.api_url + this.employee_time_logs_ep + `/clock_in/${employee_id}`
    );
  }

  clock_out(employee_id: number): Observable<any> {
    return this.http.get<any>(
      environment.api_url + this.employee_time_logs_ep + `/clock_out/${employee_id}`
    );
  }

  verifyClockCode(
    code: number,
    type: 'clock_in' | 'clock_out',
    employeeId: number
  ): Observable<any> {
    return this.http.post<any>(
      environment.api_url + this.employee_time_logs_ep + '/verify-clock-code',
      { code, type, employee_id: employeeId }
    );
  }



// api.service.ts
// api.service.ts
getEmployeeByPhone(phone: string): Observable<any> {
  // Correctly structured URL
  const url = `${environment.api_url}${this.employee_time_logs_ep}/employees/get-by-phone/${phone}`;
  console.log('API URL:', url); // For debugging
  return this.http.get<any>(url);
}

  get_employee_time_logs_by_id(employee_id: number): Observable<any> {
    return this.http.get<any>(
      environment.api_url + 'employee_time_logs/get_employee_time_logs_by_id/' + employee_id
    );
  }
}
