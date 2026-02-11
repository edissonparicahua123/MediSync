import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const exportToExcel = (data: any[], fileName: string, sheetName: string = 'Data') => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, `${fileName}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
};

export const exportHRAttendanceToPDF = (attendance: any[]) => {
    const doc = new jsPDF() as any;

    // Header
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text('REPORTE DE ASISTENCIA - EDICAREX', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generado el: ${format(new Date(), 'PPP', { locale: es })}`, 14, 30);

    const tableData = attendance.map(a => [
        a.employee?.name || '---',
        format(new Date(a.checkIn), 'dd/MM/yyyy'),
        format(new Date(a.checkIn), 'HH:mm:ss'),
        a.checkOut ? format(new Date(a.checkOut), 'HH:mm:ss') : '---',
        (a.hoursWorked || 0).toFixed(2),
        a.status
    ]);

    doc.autoTable({
        head: [['Empleado', 'Fecha', 'Entrada', 'Salida', 'Hrs', 'Estado']],
        body: tableData,
        startY: 40,
        theme: 'grid',
        headStyles: { fillStyle: [59, 130, 246] }, // Blue primary
        styles: { fontSize: 8 }
    });

    doc.save(`Asistencia_EdiCarex_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};

export const exportPayrollToPDF = (payroll: any[]) => {
    const doc = new jsPDF() as any;

    doc.setFontSize(22);
    doc.text('REPORTE DE NÓMINA - EDICAREX', 14, 22);

    const tableData = payroll.map(p => [
        p.employee?.name || '---',
        `S/ ${Number(p.baseSalary).toLocaleString()}`,
        `S/ ${Number(p.deductions).toLocaleString()}`,
        `S/ ${Number(p.bonuses).toLocaleString()}`,
        `S/ ${Number(p.netSalary).toLocaleString()}`,
        p.status === 'PAID' ? 'PAGADO' : 'PENDIENTE'
    ]);

    doc.autoTable({
        head: [['Empleado', 'Básico', 'Dctos', 'Bonos', 'Neto', 'Estado']],
        body: tableData,
        startY: 40,
        theme: 'striped',
        headStyles: { fillStyle: [16, 185, 129] } // Green
    });

    doc.save(`Nomina_EdiCarex_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
};
