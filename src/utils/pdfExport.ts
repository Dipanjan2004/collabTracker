import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const exportToPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('Element not found');
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
  }
};

export const generateTaskReport = async (
  tasks: any[],
  progressLogs: any[],
  dateRange: { start: Date; end: Date }
) => {
  const reportElement = document.createElement('div');
  reportElement.id = 'pdf-report';
  reportElement.style.cssText = `
    padding: 40px;
    background: white;
    color: black;
    font-family: Arial, sans-serif;
  `;

  reportElement.innerHTML = `
    <h1 style="margin-bottom: 20px;">CollabTrack Progress Report</h1>
    <p><strong>Period:</strong> ${dateRange.start.toLocaleDateString()} - ${dateRange.end.toLocaleDateString()}</p>
    <hr style="margin: 20px 0;" />
    <h2>Tasks Summary</h2>
    <p>Total Tasks: ${tasks.length}</p>
    <p>Total Progress Entries: ${progressLogs.length}</p>
    <p>Total Hours: ${progressLogs.reduce((sum, p) => sum + p.hoursSpent, 0)}</p>
    <hr style="margin: 20px 0;" />
    ${tasks
      .map(
        (task) => `
      <div style="margin: 20px 0;">
        <h3>${task.title}</h3>
        <p><strong>Status:</strong> ${task.status}</p>
        <p><strong>Assigned To:</strong> ${task.assignedTo.length} members</p>
        <p><strong>Deadline:</strong> ${new Date(task.deadline).toLocaleDateString()}</p>
      </div>
    `
      )
      .join('')}
  `;

  document.body.appendChild(reportElement);

  await exportToPDF('pdf-report', `collabtrack-report-${Date.now()}.pdf`);

  document.body.removeChild(reportElement);
};

export const exportTaskReport = async (element: HTMLElement, filename: string) => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
