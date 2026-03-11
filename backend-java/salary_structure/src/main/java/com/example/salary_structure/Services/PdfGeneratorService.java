package com.example.salary_structure.Services;

import com.example.salary_structure.Entity.SalaryStructure;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;

@Service
public class PdfGeneratorService {

    public ByteArrayInputStream generatePayslip(SalaryStructure s) {

        if (s == null) {
            throw new RuntimeException("Salary data is null");
        }

        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            Font titleFont = new Font(Font.HELVETICA, 18, Font.BOLD);
            Paragraph title = new Paragraph("PAYSLIP", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            document.add(new Paragraph("Month: " + s.getMonth() + " " + s.getYear()));
            document.add(new Paragraph("Employee ID: " + s.getEmployeeId()));
            document.add(new Paragraph("Basic Pay: " + s.getBasicPay()));
            document.add(new Paragraph("HRA: " + s.getHra()));
            document.add(new Paragraph("Gross Salary: " + s.getGrossSalary()));
            document.add(new Paragraph("Net Salary: " + s.getNetSalary()));

            document.close();

        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed: " + e.getMessage());
        }

        return new ByteArrayInputStream(out.toByteArray());
    }
}