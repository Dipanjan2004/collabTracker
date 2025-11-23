import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FileText, Download, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportTaskReport } from '@/utils/pdfExport';

export default function Reports() {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: 'Error',
        description: 'Please select both start and end dates.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Create a mock report element
      const reportElement = document.createElement('div');
      reportElement.innerHTML = `
        <div style="padding: 40px; font-family: Arial, sans-serif;">
          <h1 style="color: #0f172a; margin-bottom: 20px;">Task Progress Report</h1>
          <p style="color: #64748b; margin-bottom: 30px;">Period: ${startDate} to ${endDate}</p>
          
          <div style="margin-bottom: 30px;">
            <h2 style="color: #0f172a; margin-bottom: 15px;">Summary</h2>
            <p style="color: #334155;">This report contains task progress data for the specified period.</p>
          </div>
          
          <div style="margin-bottom: 30px;">
            <h2 style="color: #0f172a; margin-bottom: 15px;">Key Metrics</h2>
            <ul style="color: #334155; line-height: 1.8;">
              <li>Total Tasks: 12</li>
              <li>Completed Tasks: 8</li>
              <li>In Progress: 3</li>
              <li>Blocked: 1</li>
              <li>Total Hours Logged: 96h</li>
            </ul>
          </div>
          
          <div>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 40px;">Generated on ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `;
      
      await exportTaskReport(reportElement, `task-report-${startDate}-${endDate}`);
      
      toast({
        title: 'Report generated',
        description: 'Your report has been downloaded successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate report.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold mb-2">Reports</h1>
          <p className="text-muted-foreground">Generate and export task progress reports</p>
        </div>

        <Card className="glass-card p-6 max-w-2xl">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-8 w-8 text-primary" />
              <div>
                <h2 className="text-xl font-semibold">Generate Task Report</h2>
                <p className="text-sm text-muted-foreground">Export a PDF report of task progress</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>

            <Button 
              onClick={handleGenerateReport} 
              disabled={isGenerating}
              className="w-full gap-2"
            >
              <Download className="h-4 w-4" />
              {isGenerating ? 'Generating Report...' : 'Generate & Download PDF'}
            </Button>
          </div>
        </Card>

        {/* Saved Reports Section */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Recent Reports</h2>
          <Card className="glass-card p-8 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No saved reports yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Generated reports will appear here for quick access.
            </p>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
