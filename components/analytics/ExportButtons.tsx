"use client";
import { Button } from "@/components/ui/button";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";

interface ExportButtonsProps {
  data: any[];
  filename?: string;
}

export default function ExportButtons({ data, filename = "analytics" }: ExportButtonsProps) {
  const exportCSV = () => {
    const csv = [
      Object.keys(data[0]).join(","),
      ...data.map(row => Object.values(row).join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, `${filename}.csv`);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`${filename} Report`, 10, 10);
    let y = 20;
    data.forEach((row, i) => {
      doc.text(Object.values(row).join("  "), 10, y);
      y += 8;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    doc.save(`${filename}.pdf`);
  };

  return (
    <div className="flex gap-2 justify-end mt-4">
      <Button variant="outline" size="sm" onClick={exportCSV}>Export CSV</Button>
      <Button variant="secondary" size="sm" onClick={exportPDF}>Export PDF</Button>
    </div>
  );
}
