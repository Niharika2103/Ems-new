package com.example.salary_structure.Services;


import com.example.salary_structure.Entity.SalaryStructure;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Service;

import java.awt.Color;
import com.lowagie.text.Font;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;

@Service
public class PdfGeneratorService {

    private String safe(BigDecimal v) { return v == null ? "0" : v.toPlainString(); }
    private String safe(String v) { return v == null ? "-" : v; }

    public ByteArrayInputStream generatePayslip(SalaryStructure s) {

        Document document = new Document(PageSize.A4, 40, 40, 40, 40);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            // PASSWORD PROTECTION
            String pan = s.getPanNumber();
            if (pan == null || pan.isEmpty()) {
                pan = "DEFAULT1234";
            }

            String userPassword = pan.toUpperCase();
            String ownerPassword = "ADMIN123";

            PdfWriter writer = PdfWriter.getInstance(document, out);

            writer.setEncryption(
                    userPassword.getBytes(),
                    ownerPassword.getBytes(),
                    PdfWriter.ALLOW_PRINTING,
                    PdfWriter.ENCRYPTION_AES_128
            );

            document.open();
            
            

            // TITLE
            Font titleFont = new Font(Font.HELVETICA, 20, Font.BOLD);
            Paragraph title = new Paragraph("PAYSLIP", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            Paragraph monthYr = new Paragraph(
                    safe(s.getMonth()) + " " + s.getYear(),
                    new Font(Font.HELVETICA, 12, Font.BOLD)
            );
            monthYr.setAlignment(Element.ALIGN_CENTER);
            document.add(monthYr);

            document.add(Chunk.NEWLINE);

            // EMPLOYEE DETAILS
            PdfPTable emp = new PdfPTable(2);
            emp.setWidthPercentage(100);

            emp.addCell(cell("Employee ID", true));
            emp.addCell(cell(String.valueOf(s.getEmployeeId()), false));

            emp.addCell(cell("Location", true));
            emp.addCell(cell(safe(s.getLocation()), false));

            emp.addCell(cell("PAN Number", true));
            emp.addCell(cell(safe(s.getPanNumber()), false));

            emp.addCell(cell("Aadhar Status", true));
            emp.addCell(cell(safe(s.getAadharLinkStatus()), false));

            emp.addCell(cell("Bank Name", true));
            emp.addCell(cell(safe(s.getBankName()), false));

            emp.addCell(cell("Account Number", true));
            emp.addCell(cell(safe(s.getAccountNumber()), false));

            emp.addCell(cell("Pay Group", true));
            emp.addCell(cell(safe(s.getPayGroup()), false));

            document.add(emp);
            document.add(Chunk.NEWLINE);

            // ==============================
            // 🔥 PER-DAY CALCULATION SECTION
            // ==============================
            BigDecimal daysWorked = s.getDaysWorked() == null ? BigDecimal.ZERO : s.getDaysWorked();
            BigDecimal divisor = new BigDecimal("30");

            BigDecimal perDayBasic = s.getBasicPay().divide(divisor, 2, BigDecimal.ROUND_HALF_UP);
            BigDecimal perDayHra = s.getHra().divide(divisor, 2, BigDecimal.ROUND_HALF_UP);
            BigDecimal perDayDa = s.getDa().divide(divisor, 2, BigDecimal.ROUND_HALF_UP);
            BigDecimal perDayConv = s.getConveyanceAllowance().divide(divisor, 2, BigDecimal.ROUND_HALF_UP);
            BigDecimal perDayGross = s.getGrossSalary().divide(divisor, 2, BigDecimal.ROUND_HALF_UP);

            BigDecimal earnedBasic = perDayBasic.multiply(daysWorked);
            BigDecimal earnedHra = perDayHra.multiply(daysWorked);
            BigDecimal earnedDa = perDayDa.multiply(daysWorked);
            BigDecimal earnedConv = perDayConv.multiply(daysWorked);
            BigDecimal earnedGross = perDayGross.multiply(daysWorked);

            Paragraph pdTitle = new Paragraph("PER-DAY & EARNED VALUES",
                    new Font(Font.HELVETICA, 14, Font.BOLD));
            document.add(pdTitle);

            PdfPTable pd = new PdfPTable(2);
            pd.setWidthPercentage(100);

            pd.addCell(cell("Days Worked", true));
            pd.addCell(cell(safe(daysWorked), false));

            pd.addCell(cell("Per Day Basic", true));
            pd.addCell(cell(perDayBasic.toPlainString(), false));

            pd.addCell(cell("Per Day HRA", true));
            pd.addCell(cell(perDayHra.toPlainString(), false));

            pd.addCell(cell("Per Day DA", true));
            pd.addCell(cell(perDayDa.toPlainString(), false));

            pd.addCell(cell("Per Day Conveyance", true));
            pd.addCell(cell(perDayConv.toPlainString(), false));

            pd.addCell(cell("Per Day Gross Salary", true));
            pd.addCell(cell(perDayGross.toPlainString(), false));

            pd.addCell(cell("Earned Basic", true));
            pd.addCell(cell(earnedBasic.toPlainString(), false));

            pd.addCell(cell("Earned HRA", true));
            pd.addCell(cell(earnedHra.toPlainString(), false));

            pd.addCell(cell("Earned DA", true));
            pd.addCell(cell(earnedDa.toPlainString(), false));

            pd.addCell(cell("Earned Conveyance", true));
            pd.addCell(cell(earnedConv.toPlainString(), false));

            pd.addCell(cell("Total Earned Gross", true));
            pd.addCell(cell(earnedGross.toPlainString(), false));

            document.add(pd);
            document.add(Chunk.NEWLINE);

            // EARNINGS
            Paragraph earnTitle = new Paragraph("EARNINGS", new Font(Font.HELVETICA, 14, Font.BOLD));
            document.add(earnTitle);

            PdfPTable earn = new PdfPTable(2);
            earn.setWidthPercentage(100);

            earn.addCell(cell("Basic Pay", true));
            earn.addCell(cell(safe(s.getBasicPay()), false));

            earn.addCell(cell("HRA", true));
            earn.addCell(cell(safe(s.getHra()), false));

            earn.addCell(cell("DA", true));
            earn.addCell(cell(safe(s.getDa()), false));

            earn.addCell(cell("Conveyance Allowance", true));
            earn.addCell(cell(safe(s.getConveyanceAllowance()), false));

            earn.addCell(cell("Medical Allowance", true));
            earn.addCell(cell(safe(s.getMedicalAllowance()), false));

            earn.addCell(cell("Special Allowance", true));
            earn.addCell(cell(safe(s.getSpecialAllowance()), false));

            earn.addCell(cell("Other Allowances", true));
            earn.addCell(cell(safe(s.getOtherAllowances()), false));

            earn.addCell(cell("Gross Salary", true));
            earn.addCell(cell(safe(s.getGrossSalary()), false));

            document.add(earn);
            document.add(Chunk.NEWLINE);

            // DEDUCTIONS
            Paragraph dedTitle = new Paragraph("DEDUCTIONS", new Font(Font.HELVETICA, 14, Font.BOLD));
            document.add(dedTitle);

            PdfPTable ded = new PdfPTable(2);
            ded.setWidthPercentage(100);

            ded.addCell(cell("PF (Employee)", true));
            ded.addCell(cell(safe(s.getPfEmployee()), false));

            ded.addCell(cell("PF (Employer)", true));
            ded.addCell(cell(safe(s.getPfEmployer()), false));

            ded.addCell(cell("ESI", true));
            ded.addCell(cell(safe(s.getEsi()), false));

            ded.addCell(cell("Professional Tax", true));
            ded.addCell(cell(safe(s.getProfessionalTax()), false));

            ded.addCell(cell("Income Tax", true));
            ded.addCell(cell(safe(s.getIncomeTax()), false));

            ded.addCell(cell("Loan Deduction", true));
            ded.addCell(cell(safe(s.getLoanDeduction()), false));

            ded.addCell(cell("Other Deductions", true));
            ded.addCell(cell(safe(s.getOtherDeductions()), false));

            ded.addCell(cell("Total Deductions", true));
            ded.addCell(cell(safe(s.getTotalDeductions()), false));

            document.add(ded);
            document.add(Chunk.NEWLINE);

            // NET SALARY
            PdfPTable net = new PdfPTable(1);
            PdfPCell netCell = new PdfPCell(
                    new Phrase("NET SALARY: " + safe(s.getNetSalary()),
                            new Font(Font.HELVETICA, 14, Font.BOLD))
            );
            netCell.setHorizontalAlignment(Element.ALIGN_CENTER);
            netCell.setPadding(10);
            netCell.setBackgroundColor(Color.LIGHT_GRAY);

            net.addCell(netCell);
            document.add(net);

            document.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    private PdfPCell cell(Object text, boolean bold) {
        Font font = new Font(Font.HELVETICA, 11, bold ? Font.BOLD : Font.NORMAL);
        PdfPCell cell = new PdfPCell(new Phrase(String.valueOf(text), font));
        cell.setPadding(6);
        return cell;
    }
}

