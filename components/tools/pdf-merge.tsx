import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { FileInput, Download, X, Merge, Split, Upload } from 'lucide-react';
import { LoadingSpinner } from "@/components/animations/loading-spinner";
import { PDFDocument } from 'pdf-lib';

interface PdfFile {
  file: File;
  name: string;
  pages: number;
  size: number;
}

export function PdfMergeTool() {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [pdfFiles, setPdfFiles] = React.useState<PdfFile[]>([]);
  const [operation, setOperation] = React.useState("merge");
  const [splitPageNumber, setSplitPageNumber] = React.useState("");
  const [mergedPdfUrl, setMergedPdfUrl] = React.useState("");

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFiles = async (files: FileList | File[]) => {
    const pdfFilesArray = Array.from(files).filter(file => file.type === 'application/pdf');
    
    setIsLoading(true);
    const processedFiles: PdfFile[] = [];

    for (const file of pdfFilesArray) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        const pageCount = pdfDoc.getPageCount();
        
        processedFiles.push({
          file,
          name: file.name,
          pages: pageCount,
          size: file.size
        });
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
      }
    }

    setPdfFiles(prev => [...prev, ...processedFiles]);
    setIsLoading(false);
  };

  const mergePdfs = async () => {
    if (pdfFiles.length < 2) {
      alert("Please select at least 2 PDF files to merge");
      return;
    }

    setIsLoading(true);
    try {
      const mergedPdf = await PDFDocument.create();

      for (const pdfFile of pdfFiles) {
        const arrayBuffer = await pdfFile.file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedPdfUrl(url);
    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('Error merging PDFs. Please try again.');
    }
    setIsLoading(false);
  };

  const splitPdf = async () => {
    if (pdfFiles.length !== 1) {
      alert("Please select exactly one PDF file to split");
      return;
    }

    const pageNum = parseInt(splitPageNumber);
    if (isNaN(pageNum) || pageNum < 1 || pageNum >= pdfFiles[0].pages) {
      alert(`Please enter a valid page number (1-${pdfFiles[0].pages - 1})`);
      return;
    }

    setIsLoading(true);
    try {
      const arrayBuffer = await pdfFiles[0].file.arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);

      // Create first part (pages 0 to pageNum-1)
      const firstPdf = await PDFDocument.create();
      const firstPages = await firstPdf.copyPages(pdf, pdf.getPageIndices().slice(0, pageNum));
      firstPages.forEach((page) => firstPdf.addPage(page));

      // Create second part (pages pageNum to end)
      const secondPdf = await PDFDocument.create();
      const secondPages = await secondPdf.copyPages(pdf, pdf.getPageIndices().slice(pageNum));
      secondPages.forEach((page) => secondPdf.addPage(page));

      // Download both parts
      const firstPdfBytes = await firstPdf.save();
      const secondPdfBytes = await secondPdf.save();

      const firstBlob = new Blob([firstPdfBytes], { type: 'application/pdf' });
      const secondBlob = new Blob([secondPdfBytes], { type: 'application/pdf' });

      // Create download links
      const firstUrl = URL.createObjectURL(firstBlob);
      const secondUrl = URL.createObjectURL(secondBlob);

      // Download first part
      const firstLink = document.createElement('a');
      firstLink.href = firstUrl;
      firstLink.download = `${pdfFiles[0].name.replace('.pdf', '')}_part1.pdf`;
      firstLink.click();

      // Download second part (with a small delay)
      setTimeout(() => {
        const secondLink = document.createElement('a');
        secondLink.href = secondUrl;
        secondLink.download = `${pdfFiles[0].name.replace('.pdf', '')}_part2.pdf`;
        secondLink.click();
      }, 100);

    } catch (error) {
      console.error('Error splitting PDF:', error);
      alert('Error splitting PDF. Please try again.');
    }
    setIsLoading(false);
  };

  const downloadMergedPdf = () => {
    if (mergedPdfUrl) {
      const link = document.createElement('a');
      link.href = mergedPdfUrl;
      link.download = 'merged.pdf';
      link.click();
    }
  };

  const removePdf = (index: number) => {
    setPdfFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const clearAll = () => {
    setPdfFiles([]);
    setMergedPdfUrl("");
    setSplitPageNumber("");
    if (mergedPdfUrl) {
      URL.revokeObjectURL(mergedPdfUrl);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <p className="text-sm text-secondary-gray">
        Merge multiple PDF files into one document, or split a single PDF into multiple files.
      </p>

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div>
          <Label className="text-dark-gray font-medium mb-2 block">Operation</Label>
          <Select value={operation} onValueChange={setOperation}>
            <SelectTrigger className="border-gray-200 bg-gray-50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="merge">Merge PDFs</SelectItem>
              <SelectItem value="split">Split PDF</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {operation === "split" && (
          <div>
            <Label className="text-dark-gray font-medium mb-2 block">Split after page number</Label>
            <Input
              type="number"
              placeholder="e.g., 5"
              value={splitPageNumber}
              onChange={(e) => setSplitPageNumber(e.target.value)}
              className="border-gray-200 bg-gray-50"
            />
          </div>
        )}
      </motion.div>

      <motion.div
        className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-all duration-300 ${
          isDragging
            ? "border-primary-blue bg-blue-50 shadow-lg"
            : "border-gray-300 bg-gray-50 hover:border-primary-blue hover:bg-blue-50"
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <FileInput className="mb-3 h-10 w-10 text-primary-blue" />
        <p className="text-lg font-semibold text-dark-gray">Drag & Drop PDF Files Here</p>
        <p className="text-sm text-secondary-gray">
          {operation === "merge" ? "Select multiple PDFs to merge" : "Select one PDF to split"}
        </p>
        <Input
          type="file"
          multiple={operation === "merge"}
          accept=".pdf"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          onChange={(e) => {
            if (e.target.files) {
              handleFiles(e.target.files);
            }
          }}
        />
      </motion.div>

      {pdfFiles.length > 0 && (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <Label className="text-dark-gray font-medium text-lg">
              PDF Files ({pdfFiles.length})
            </Label>
            <Button
              onClick={clearAll}
              variant="outline"
              className="border-gray-200 hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pdfFiles.map((pdf, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 bg-white">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="text-sm font-medium text-dark-gray truncate">
                    {pdf.name}
                  </h4>
                  <Button
                    onClick={() => removePdf(index)}
                    size="sm"
                    variant="ghost"
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-xs text-secondary-gray space-y-1">
                  <div>Pages: {pdf.pages}</div>
                  <div>Size: {formatFileSize(pdf.size)}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 justify-center">
            {operation === "merge" ? (
              <Button
                onClick={mergePdfs}
                className="bg-primary-blue hover:bg-blue-600 text-white"
                disabled={isLoading || pdfFiles.length < 2}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size={16} />
                    <span className="ml-2">Merging...</span>
                  </>
                ) : (
                  <>
                    <Merge className="h-4 w-4 mr-2" />
                    Merge PDFs
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={splitPdf}
                className="bg-primary-blue hover:bg-blue-600 text-white"
                disabled={isLoading || pdfFiles.length !== 1 || !splitPageNumber}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size={16} />
                    <span className="ml-2">Splitting...</span>
                  </>
                ) : (
                  <>
                    <Split className="h-4 w-4 mr-2" />
                    Split PDF
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {mergedPdfUrl && (
        <motion.div
          className="border border-green-200 rounded-lg p-6 bg-green-50 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold text-green-800 mb-3">PDF Merge Complete!</h3>
          <Button
            onClick={downloadMergedPdf}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Download Merged PDF
          </Button>
        </motion.div>
      )}

      {isLoading && (
        <div className="mt-4 text-center text-primary-blue flex items-center justify-center">
          <LoadingSpinner size={20} />
          <span className="ml-2">Processing PDFs...</span>
        </div>
      )}
    </div>
  );
}
