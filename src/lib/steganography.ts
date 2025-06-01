
import CryptoJS from 'crypto-js';

export interface EncryptOptions {
  imageData: Uint8Array;
  message: string;
  password: string;
  imageType: string;
}

export interface DecryptOptions {
  imageData: Uint8Array;
  password: string;
}

// AES encryption for the message
function encryptMessage(message: string, password: string): string {
  return CryptoJS.AES.encrypt(message, password).toString();
}

// AES decryption for the message with improved error handling
function decryptMessage(encryptedMessage: string, password: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, password);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    
    if (!decrypted) {
      throw new Error("Incorrect password");
    }
    
    return decrypted;
  } catch (error) {
    throw new Error("Incorrect password");
  }
}

// Convert text to binary
function textToBinary(text: string): string {
  return text
    .split('')
    .map(char => char.charCodeAt(0).toString(2).padStart(8, '0'))
    .join('');
}

// Convert binary to text
function binaryToText(binary: string): string {
  const bytes = binary.match(/.{1,8}/g);
  if (!bytes) return '';
  
  return bytes
    .map(byte => String.fromCharCode(parseInt(byte, 2)))
    .join('');
}

// Calculate if the image has enough capacity for the data
function calculateCapacity(imageDataLength: number, binaryDataLength: number): boolean {
  const availableBits = Math.floor(imageDataLength * 0.75) - 128 - 32;
  return availableBits >= binaryDataLength;
}

// Convert image data to canvas and get image dimensions
function createCanvasFromImageData(imageData: Uint8Array, imageType: string): Promise<{ canvas: HTMLCanvasElement, width: number, height: number }> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([imageData], { type: imageType });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      URL.revokeObjectURL(url);
      resolve({ canvas, width: img.width, height: img.height });
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}

// Embed binary data into canvas image data
function embedDataInCanvas(canvas: HTMLCanvasElement, binaryData: string): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  const prefix = textToBinary("STEG:");
  const binaryToEmbed = prefix + binaryData;
  
  // Verify we have enough space - fix the type issue by passing data.length
  if (!calculateCapacity(data.length, binaryToEmbed.length)) {
    throw new Error("The image is too small to store this message. Please use a larger image or reduce your message size.");
  }
  
  // Embed the length of the message (32 bits) in the first 32 pixels
  const length = binaryToEmbed.length;
  const lengthBinary = length.toString(2).padStart(32, '0');
  
  for (let i = 0; i < 32; i++) {
    const pixelIndex = i * 4; // RGBA format
    if (pixelIndex < data.length) {
      // Use red channel for length data
      data[pixelIndex] = (data[pixelIndex] & 0xFE) | parseInt(lengthBinary[i]);
    }
  }
  
  // Embed the actual data starting from pixel 32
  const dataStartOffset = 32 * 4; // Start after length data
  for (let i = 0; i < binaryToEmbed.length; i++) {
    // Use RGB channels (skip alpha), cycling through them
    const pixelIndex = dataStartOffset + Math.floor(i / 3) * 4;
    const channelOffset = i % 3; // 0=R, 1=G, 2=B
    const byteIndex = pixelIndex + channelOffset;
    
    if (byteIndex < data.length) {
      data[byteIndex] = (data[byteIndex] & 0xFE) | parseInt(binaryToEmbed[i]);
    } else {
      throw new Error("Not enough space in the image to store the message");
    }
  }
  
  // Put the modified image data back to canvas
  ctx.putImageData(imageData, 0, 0);
}

// Extract binary data from canvas image data
function extractDataFromCanvas(canvas: HTMLCanvasElement): string {
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get canvas context');
  }
  
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  
  // Extract the length first (32 bits from first 32 pixels)
  let lengthBinary = '';
  for (let i = 0; i < 32; i++) {
    const pixelIndex = i * 4;
    if (pixelIndex < data.length) {
      lengthBinary += (data[pixelIndex] & 1).toString();
    }
  }
  
  const length = parseInt(lengthBinary, 2);
  if (isNaN(length) || length <= 0 || length > 1000000) {
    throw new Error("Invalid or no steganographic data found");
  }
  
  // Extract the data bits
  const dataStartOffset = 32 * 4;
  let extractedBinary = '';
  for (let i = 0; i < length; i++) {
    const pixelIndex = dataStartOffset + Math.floor(i / 3) * 4;
    const channelOffset = i % 3;
    const byteIndex = pixelIndex + channelOffset;
    
    if (byteIndex < data.length) {
      extractedBinary += (data[byteIndex] & 1).toString();
    }
  }
  
  // Check for our prefix
  const prefix = textToBinary("STEG:");
  if (!extractedBinary.startsWith(prefix)) {
    throw new Error("No steganographic data found in this image");
  }
  
  return extractedBinary.slice(prefix.length);
}

// Convert canvas to file with proper format
function canvasToFile(canvas: HTMLCanvasElement, fileName: string, outputFormat: string = 'image/png'): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Failed to convert canvas to blob'));
        return;
      }
      
      // Determine file extension
      const extension = outputFormat === 'image/jpeg' ? '.jpg' : '.png';
      const finalFileName = fileName.replace(/\.[^/.]+$/, '') + extension;
      
      const file = new File([blob], finalFileName, { type: outputFormat });
      resolve(file);
    }, outputFormat, 0.9); // High quality for JPEG
  });
}

// Hide message in an image
export async function hideMessage(options: EncryptOptions): Promise<Uint8Array> {
  const { imageData, message, password, imageType } = options;
  
  // Encrypt the message
  const encryptedMessage = encryptMessage(message, password);
  const binaryData = textToBinary(encryptedMessage);
  
  // Create canvas from image data
  const { canvas } = await createCanvasFromImageData(imageData, imageType);
  
  // Embed data in canvas
  embedDataInCanvas(canvas, binaryData);
  
  // Convert canvas back to file data
  const outputFormat = imageType.includes('jpeg') || imageType.includes('jpg') ? 'image/jpeg' : 'image/png';
  const resultFile = await canvasToFile(canvas, 'encrypted_image', outputFormat);
  
  // Convert file to Uint8Array
  const arrayBuffer = await fileToArrayBuffer(resultFile);
  return new Uint8Array(arrayBuffer);
}

// Reveal message from an image
export async function revealMessage(options: DecryptOptions): Promise<string> {
  const { imageData, password } = options;
  
  try {
    // Create canvas from image data
    const { canvas } = await createCanvasFromImageData(imageData, 'image/png');
    
    // Extract binary data from canvas
    const extractedBinary = extractDataFromCanvas(canvas);
    
    // Convert binary to text and decrypt
    const encryptedMessage = binaryToText(extractedBinary);
    return decryptMessage(encryptedMessage, password);
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to extract hidden message");
  }
}

// Helper function to convert file to array buffer
export function fileToArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result instanceof ArrayBuffer) {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read file as ArrayBuffer"));
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

// Helper function to convert array buffer to file with proper format
export function arrayBufferToFile(
  buffer: ArrayBuffer,
  fileName: string,
  fileType: string
): File {
  // Ensure proper file extension
  let finalFileName = fileName;
  const extension = fileType.includes('jpeg') || fileType.includes('jpg') ? '.jpg' : '.png';
  
  if (!finalFileName.endsWith(extension)) {
    finalFileName = finalFileName.replace(/\.[^/.]+$/, '') + extension;
  }
  
  return new File([buffer], finalFileName, { type: fileType });
}

// Enhanced download function with proper MIME type handling
export function downloadFile(file: File): void {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  a.style.display = 'none';
  
  document.body.appendChild(a);
  a.click();
  
  // Clean up
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

// Function to generate a unique filename
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  
  const extension = originalName.split('.').pop() || '';
  const baseName = originalName.split('.').slice(0, -1).join('.');
  
  return `hidden_message_${timestamp}_${randomStr}.${extension}`;
}

// Function to upload file to Supabase storage and get public URL
export async function uploadToSupabase(file: File): Promise<string> {
  const { supabase } = await import('@/integrations/supabase/client');
  const uniqueFileName = generateUniqueFileName(file.name);
  
  const { data, error } = await supabase.storage
    .from('encrypted_files')
    .upload(uniqueFileName, file, {
      cacheControl: '3600',
      upsert: false
    });
    
  if (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
  
  const { data: publicUrlData } = supabase.storage
    .from('encrypted_files')
    .getPublicUrl(uniqueFileName);
    
  return publicUrlData.publicUrl;
}
