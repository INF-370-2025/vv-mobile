// auth.service.ts
import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private employeeSubject = new BehaviorSubject<any>(null);

  constructor() {
    console.log('[AuthService] Initializing auth service');
    this.loadEmployeeData();
  }

async setEmployee(employee: any) {
  console.log('[AuthService] Setting employee:', employee);
  try {
    await Preferences.set({
      key: 'employee',
      value: JSON.stringify(employee)
    });
    console.log('[AuthService] Employee data saved to storage');
    this.employeeSubject.next(employee);
  } catch (error) {
    console.error('[AuthService] Error saving employee data:', error);
  }
}

private async loadEmployeeData() {
  console.log('[AuthService] Loading employee data from storage');
  try {
    const { value } = await Preferences.get({ key: 'employee' });
    console.log('[AuthService] Raw storage value:', value);

    if (value) {
      const employee = JSON.parse(value);
      console.log('[AuthService] Parsed employee data:', employee);
      this.employeeSubject.next(employee);
    } else {
      console.log('[AuthService] No employee data found in storage');
    }
  } catch (error) {
    console.error('[AuthService] Error loading employee data:', error);
  }
}

  getEmployee() {
    console.log('[AuthService] Getting employee observable');
    return this.employeeSubject.asObservable();
  }

// auth.service.ts
getEmployeeId(): number {
  const employee = this.employeeSubject.value;
  if (!employee || !employee.employee_id) {
    console.error('[AuthService] No valid employee ID found');
    return 0; // Default to 0 if not found
  }
  console.log('[AuthService] Getting employee ID:', employee.employee_id);
  return employee.employee_id;
}

  async clear() {
    console.log('[AuthService] Clearing employee data');
    try {
      await Preferences.remove({ key: 'employee' });
      this.employeeSubject.next(null);
      console.log('[AuthService] Employee data cleared');
    } catch (error) {
      console.error('[AuthService] Error clearing employee data:', error);
    }
  }
}
