
import React, { useCallback, useState } from "react";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
}

export function FileUpload({
  onFileSelected,
  accept = "image/*",
  maxSizeMB = 5,
  label = "Upload a file",
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  
  const validateFile = (file: File): boolean => {
    setFileError(null);
    
    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setFileError(`File size exceeds ${maxSizeMB}MB limit.`);
      return false;
    }
    
    // Check file type if accept is specified
    if (accept !== "*") {
      const fileType = file.type;
      const acceptTypes = accept.split(",").map(type => type.trim());
      
      // Handle wildcards like "image/*"
      const isAccepted = acceptTypes.some(type => {
        if (type.endsWith("/*")) {
          const category = type.split("/")[0];
          return fileType.startsWith(`${category}/`);
        }
        return type === fileType;
      });
      
      if (!isAccepted) {
        setFileError("File type not supported.");
        return false;
      }
    }
    
    return true;
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setFileName(file.name);
        onFileSelected(file);
      }
    }
  };
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setFileName(file.name);
        onFileSelected(file);
      }
    }
  }, [onFileSelected]);
  
  return (
    <div className="space-y-2">
      <div
        className={`file-drop-area ${dragActive ? "active" : ""}`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <Input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label={label}
        />
        
        <Upload className="h-10 w-10 text-muted-foreground" />
        
        {fileName ? (
          <div className="text-center">
            <p className="text-sm font-medium">{fileName}</p>
            <p className="text-xs text-muted-foreground mt-1">Click or drag to change file</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="font-medium">{label}</p>
            <p className="text-sm text-muted-foreground mt-1">
              Drag and drop or click to upload
            </p>
          </div>
        )}
      </div>
      
      {fileError && (
        <p className="text-sm text-destructive">{fileError}</p>
      )}
    </div>
  );
}
