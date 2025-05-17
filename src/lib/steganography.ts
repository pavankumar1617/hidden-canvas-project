// This is a simplified steganography implementation
// In a real application, you'd want to use a more robust algorithm

import CryptoJS from 'crypto-js';

export interface EncryptOptions {
  imageData: Uint8Array;
  message: string;
  password: string;
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
    
    // Check if decryption resulted in a valid UTF-8 string
    if (!decrypted) {
      throw new Error("Incorrect password");
    }
    
    return decrypted;
  } catch (error) {
    // Capture any decryption errors and standardize the error message
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

// Embed binary data into the LSB of an image
function embedDataInImage(imageData: Uint8Array, binaryData: string): Uint8Array {
  // Create a copy of the image data to avoid modifying the original
  const newImageData = new Uint8Array(imageData);
  const prefix = textToBinary("STEG:"); // Prefix to identify steganography
  const binaryToEmbed = prefix + binaryData;
  
  // We use RGB channels (skipping alpha) in every 4th byte
  let dataIndex = 0;
  
  // First, embed the length of the message (32 bits)
  const length = binaryToEmbed.length;
  const lengthBinary = length.toString(2).padStart(32, '0');
  
  for (let i = 0; i < 32; i++) {
    // Use only the R channel for length
    const byte = 4 * i;
    if (byte < newImageData.length) {
      // Clear the LSB and set it to the bit from the length
      newImageData[byte] = (newImageData[byte] & 0xFE) | parseInt(lengthBinary[i]);
    }
  }
  
  // Then, embed the actual data
  for (let i = 0; i < binaryToEmbed.length; i++) {
    // Skip alpha channel (every 4th byte)
    const pixelIndex = 128 + Math.floor(i / 3) * 4;
    const channelOffset = i % 3;
    const byteIndex = pixelIndex + channelOffset;
    
    if (byteIndex < newImageData.length) {
      // Clear the LSB and set it to the data bit
      newImageData[byteIndex] = (newImageData[byteIndex] & 0xFE) | parseInt(binaryToEmbed[i]);
    } else {
      console.warn("Not enough space in the image to store the message");
      break;
    }
  }
  
  return newImageData;
}

// Extract binary data from the LSB of an image
function extractDataFromImage(imageData: Uint8Array): string {
  // Extract the length first (32 bits)
  let lengthBinary = '';
  for (let i = 0; i < 32; i++) {
    const byte = 4 * i;
    if (byte < imageData.length) {
      lengthBinary += (imageData[byte] & 1).toString();
    }
  }
  
  const length = parseInt(lengthBinary, 2);
  if (isNaN(length) || length <= 0 || length > 1000000) {
    throw new Error("Invalid or no steganographic data found");
  }
  
  // Extract the data bits
  let extractedBinary = '';
  for (let i = 0; i < length; i++) {
    const pixelIndex = 128 + Math.floor(i / 3) * 4;
    const channelOffset = i % 3;
    const byteIndex = pixelIndex + channelOffset;
    
    if (byteIndex < imageData.length) {
      extractedBinary += (imageData[byteIndex] & 1).toString();
    }
  }
  
  // Check for our prefix
  const prefix = textToBinary("STEG:");
  if (!extractedBinary.startsWith(prefix)) {
    throw new Error("No steganographic data found in this image");
  }
  
  return extractedBinary.slice(prefix.length);
}

// Hide message in an image
export async function hideMessage(options: EncryptOptions): Promise<Uint8Array> {
  const { imageData, message, password } = options;
  
  // Encrypt the message with the password using AES
  const encryptedMessage = encryptMessage(message, password);
  
  // Convert the encrypted message to binary
  const binaryData = textToBinary(encryptedMessage);
  
  // Embed the binary data in the image
  return embedDataInImage(imageData, binaryData);
}

// Reveal message from an image
export async function revealMessage(options: DecryptOptions): Promise<string> {
  const { imageData, password } = options;
  
  try {
    // Extract binary data from the image
    const extractedBinary = extractDataFromImage(imageData);
    
    // Convert binary to text
    const encryptedMessage = binaryToText(extractedBinary);
    
    // Decrypt the message with the password
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

// Helper function to convert array buffer to file
export function arrayBufferToFile(
  buffer: ArrayBuffer,
  fileName: string,
  fileType: string
): File {
  return new File([buffer], fileName, { type: fileType });
}

// Helper function to download a file
export function downloadFile(file: File): void {
  const url = URL.createObjectURL(file);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Function to generate a unique filename
export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  
  // Extract file extension
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
  
  // Get public URL
  const { data: publicUrlData } = supabase.storage
    .from('encrypted_files')
    .getPublicUrl(uniqueFileName);
    
  return publicUrlData.publicUrl;
}
