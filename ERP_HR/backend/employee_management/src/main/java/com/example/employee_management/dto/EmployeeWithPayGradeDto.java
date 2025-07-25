package com.example.employee_management.dto;

import com.example.employee_management.entity.HrEmployee;
import lombok.Data;

@Data
public class EmployeeWithPayGradeDto {
    private String empId;
    private String firstName;
    private String lastName;
    private String salary;
    private String payGradeSalary;
    private String payGradeStep;

    public EmployeeWithPayGradeDto(HrEmployee employee) {
        this.empId = employee.getEmpId();
        this.firstName = employee.getFirstName();
        this.lastName = employee.getLastName();
        this.salary = employee.getSalary();

        if (employee.getPayGrade() != null) {
            this.payGradeSalary = String.valueOf(employee.getPayGrade().getSalary());
            this.payGradeStep = String.valueOf(employee.getPayGrade().getStepNo());
        }
    }
}