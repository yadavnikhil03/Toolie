// Type declarations for external libraries
declare module 'qrcode' {
  interface QRCodeOptions {
    width?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    type?: 'image/png' | 'image/jpeg' | 'image/webp';
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
  }

  export function toDataURL(text: string, options?: QRCodeOptions): Promise<string>;
  export function toCanvas(canvas: HTMLCanvasElement, text: string, options?: QRCodeOptions): Promise<void>;
}

declare module 'crypto-js' {
  export function MD5(message: string): any;
  export function SHA1(message: string): any;
  export function SHA256(message: string): any;
  export function SHA512(message: string): any;
}

// Web Audio API extensions for older browsers
interface Window {
  webkitAudioContext?: typeof AudioContext;
}
